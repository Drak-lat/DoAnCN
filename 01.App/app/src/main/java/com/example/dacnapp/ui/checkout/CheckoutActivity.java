package com.example.dacnapp.ui.checkout;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.dacnapp.R;
import com.example.dacnapp.data.network.ApiOrder;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.model.paypal.PaypalResponse;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CheckoutActivity extends AppCompatActivity {
    private static final String TAG = "CheckoutActivity";

    private RecyclerView rvItems;
    private EditText edtName, edtPhone, edtAddress, edtNote;
    private RadioGroup rgPaymentMethod;
    private TextView tvTotalAmount, tvItemCount;
    private Button btnPlaceOrder;
    private ProgressBar progressBar;

    private CheckoutViewModel viewModel;
    private CheckoutItemAdapter adapter;

    private String checkoutType; // "direct" hoặc "cart"
    private List<CheckoutItem> items;
    private double totalAmount;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_checkout);

        initViews();
        viewModel = new ViewModelProvider(this).get(CheckoutViewModel.class);

        // Lấy dữ liệu từ màn hình trước (Cart hoặc ProductDetail)
        Intent intent = getIntent();
        checkoutType = intent.getStringExtra("type");
        items = (List<CheckoutItem>) intent.getSerializableExtra("items");

        if (items == null || items.isEmpty()) {
            Toast.makeText(this, "Không có sản phẩm nào để thanh toán", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        setupRecyclerView();
        loadUserInfo();
        calculateTotal();
        setupObservers();

        btnPlaceOrder.setOnClickListener(v -> placeOrder());
        findViewById(R.id.btnBack).setOnClickListener(v -> finish());
    }

    private void initViews() {
        rvItems = findViewById(R.id.rvCheckoutItems);
        edtName = findViewById(R.id.edtReceiverName);
        edtPhone = findViewById(R.id.edtReceiverPhone);
        edtAddress = findViewById(R.id.edtReceiverAddress);
        edtNote = findViewById(R.id.edtNote);
        rgPaymentMethod = findViewById(R.id.rgPaymentMethod);
        tvTotalAmount = findViewById(R.id.tvTotalAmount);
        tvItemCount = findViewById(R.id.tvItemCount);
        btnPlaceOrder = findViewById(R.id.btnPlaceOrder);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupRecyclerView() {
        adapter = new CheckoutItemAdapter(items);
        rvItems.setLayoutManager(new LinearLayoutManager(this));
        rvItems.setAdapter(adapter);
        tvItemCount.setText(items.size() + " sản phẩm");
    }

    private void loadUserInfo() {
        SharedPreferences prefs = getSharedPreferences("user_info", MODE_PRIVATE);
        edtName.setText(prefs.getString("name", ""));
        edtPhone.setText(prefs.getString("phone", ""));
        edtAddress.setText(prefs.getString("address", ""));
    }

    private void calculateTotal() {
        totalAmount = 0;
        for (CheckoutItem item : items) {
            totalAmount += item.getPrice() * item.getQuantity();
        }
        NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        tvTotalAmount.setText(formatter.format(totalAmount) + " đ");
    }

    private void placeOrder() {
        String name = edtName.getText().toString().trim();
        String phone = edtPhone.getText().toString().trim();
        String address = edtAddress.getText().toString().trim();
        String note = edtNote.getText().toString().trim();

        // 1. Validation (Kiểm tra dữ liệu nhập)
        if (TextUtils.isEmpty(name)) {
            edtName.setError("Vui lòng nhập tên người nhận");
            edtName.requestFocus();
            return;
        }
        if (TextUtils.isEmpty(phone)) {
            edtPhone.setError("Vui lòng nhập số điện thoại");
            edtPhone.requestFocus();
            return;
        }
        if (!phone.matches("^0\\d{9}$")) {
            edtPhone.setError("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
            edtPhone.requestFocus();
            return;
        }
        if (TextUtils.isEmpty(address)) {
            edtAddress.setError("Vui lòng nhập địa chỉ giao hàng");
            edtAddress.requestFocus();
            return;
        }

        // 2. Xác định phương thức thanh toán
        int selectedId = rgPaymentMethod.getCheckedRadioButtonId();
        String paymentMethod = "COD"; // Mặc định
        
        // Lưu ý: Đảm bảo ID trong file XML layout trùng khớp (rbCOD, rbPaypal)
        if (selectedId == R.id.rbPaypal) {
            paymentMethod = "PAYPAL";
        }

        // 3. Lưu thông tin người dùng (để lần sau tự điền)
        SharedPreferences.Editor editor = getSharedPreferences("user_info", MODE_PRIVATE).edit();
        editor.putString("name", name);
        editor.putString("phone", phone);
        editor.putString("address", address);
        editor.apply();

        // 4. XỬ LÝ THANH TOÁN PAYPAL
        if (paymentMethod.equals("PAYPAL")) {
            handlePaypalPayment();
            return; // Dừng lại, không chạy code tạo order COD ở dưới
        }

        // 5. XỬ LÝ THANH TOÁN COD (NHƯ CŨ)
        if ("direct".equals(checkoutType)) {
            viewModel.createDirectOrder(name, phone, address, paymentMethod, note, items, totalAmount);
        } else {
            List<Integer> cartItemIds = new ArrayList<>();
            for (CheckoutItem item : items) {
                if (item.getCartDetailId() != null) {
                    cartItemIds.add(item.getCartDetailId());
                }
            }
            viewModel.createOrderFromCart(name, phone, address, paymentMethod, note, cartItemIds);
        }
    }

    // Tách riêng hàm xử lý PayPal cho gọn
    private void handlePaypalPayment() {
        // Hiện loading
        progressBar.setVisibility(View.VISIBLE);
        btnPlaceOrder.setEnabled(false);

        Log.d(TAG, "Bắt đầu gọi API PayPal: Amount=" + totalAmount);

        // Gọi API
        ApiOrder apiOrder = ApiClient.getClient().create(ApiOrder.class);
        
        // Lưu ý: amount truyền vào là VND, backend sẽ tự chia cho 25000
        apiOrder.createPaypalPayment(totalAmount, "app").enqueue(new Callback<PaypalResponse>() {
            @Override
            public void onResponse(Call<PaypalResponse> call, Response<PaypalResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnPlaceOrder.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    String paymentUrl = response.body().getPaymentUrl();
                    Log.d(TAG, "✅ Đã nhận Link PayPal: " + paymentUrl);

                    if (paymentUrl != null && !paymentUrl.isEmpty()) {
                        // Mở trình duyệt Chrome hoặc mặc định
                        Intent intent = new Intent(Intent.ACTION_VIEW);
                        intent.setData(Uri.parse(paymentUrl));
                        startActivity(intent);
                        
                        // Lúc này App sẽ tạm dừng, Chrome sẽ mở lên.
                        // Khi user thanh toán xong, Deep Link sẽ gọi OrderSuccessActivity
                    } else {
                        Toast.makeText(CheckoutActivity.this, "Link thanh toán rỗng", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Log.e(TAG, "❌ Lỗi Server: Code=" + response.code());
                    Toast.makeText(CheckoutActivity.this, "Không tạo được link: " + response.message(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<PaypalResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnPlaceOrder.setEnabled(true);
                Log.e(TAG, "❌ Lỗi Kết nối: " + t.getMessage());
                
                // Hiển thị lỗi rõ ràng hơn
                String errorMsg = t.getMessage();
                if (errorMsg != null && errorMsg.contains("Failed to connect")) {
                    errorMsg = "Không thể kết nối Server (Kiểm tra lại IP 10.0.2.2)";
                }
                Toast.makeText(CheckoutActivity.this, errorMsg, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void setupObservers() {
        viewModel.getOrderResult().observe(this, response -> {
            progressBar.setVisibility(View.GONE);
            btnPlaceOrder.setEnabled(true);

            if (response != null && response.success) {
                Toast.makeText(this, "Đặt hàng thành công!", Toast.LENGTH_SHORT).show();

                // Chuyển sang màn hình thành công
                Intent intent = new Intent(this, OrderSuccessActivity.class);
                intent.putExtra("orderId", response.data.id_order);
                intent.putExtra("orderStatus", response.data.order_status);
                intent.putExtra("total", response.data.total);
                // Xóa các màn hình cũ trong stack để user không back lại được trang checkout
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            } else {
                String errorMsg = response != null ? response.message : "Đặt hàng thất bại";
                Toast.makeText(this, errorMsg, Toast.LENGTH_LONG).show();
            }
        });

        viewModel.getLoading().observe(this, isLoading -> {
            progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
            btnPlaceOrder.setEnabled(!isLoading);
        });
    }
}