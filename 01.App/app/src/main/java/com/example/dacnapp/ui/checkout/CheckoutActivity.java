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
import com.example.dacnapp.ui.checkout.OrderSuccessActivity; // Đảm bảo import đúng

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CheckoutActivity extends AppCompatActivity {
    private static final String TAG = "CheckoutActivity";

    // ... (Khai báo biến View giữ nguyên) ...
    private RecyclerView rvItems;
    private EditText edtName, edtPhone, edtAddress, edtNote;
    private RadioGroup rgPaymentMethod;
    private TextView tvTotalAmount, tvItemCount;
    private Button btnPlaceOrder;
    private ProgressBar progressBar;

    private CheckoutViewModel viewModel;
    private CheckoutItemAdapter adapter;

    private String checkoutType;
    private List<CheckoutItem> items;
    private double totalAmount;
    
    // ✅ Thêm biến để lưu phương thức thanh toán hiện tại
    private String currentPaymentMethod = "COD"; 

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_checkout);

        initViews();
        viewModel = new ViewModelProvider(this).get(CheckoutViewModel.class);

        Intent intent = getIntent();
        checkoutType = intent.getStringExtra("type");
        items = (List<CheckoutItem>) intent.getSerializableExtra("items");

        if (items == null || items.isEmpty()) {
            Toast.makeText(this, "Không có sản phẩm", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        setupRecyclerView();
        loadUserInfo();
        calculateTotal();
        setupObservers(); // <-- Quan trọng

        btnPlaceOrder.setOnClickListener(v -> placeOrder());
        findViewById(R.id.btnBack).setOnClickListener(v -> finish());
    }

    // ... (Các hàm initViews, setupRecyclerView, loadUserInfo, calculateTotal giữ nguyên) ...
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

    // ✅ SỬA LOGIC HÀM NÀY
    private void placeOrder() {
        String name = edtName.getText().toString().trim();
        String phone = edtPhone.getText().toString().trim();
        String address = edtAddress.getText().toString().trim();
        String note = edtNote.getText().toString().trim();

        // 1. Validation
        if (TextUtils.isEmpty(name)) { edtName.setError("Nhập tên"); return; }
        if (TextUtils.isEmpty(phone)) { edtPhone.setError("Nhập SĐT"); return; }
        if (TextUtils.isEmpty(address)) { edtAddress.setError("Nhập địa chỉ"); return; }

        // 2. Lấy phương thức thanh toán
        int selectedId = rgPaymentMethod.getCheckedRadioButtonId();
        currentPaymentMethod = "COD"; // Reset mặc định
        if (selectedId == R.id.rbPaypal) {
            currentPaymentMethod = "PAYPAL";
        }
        // Lưu ý: Nếu có VNPAY thì thêm: else if (selectedId == R.id.rbVnpay) currentPaymentMethod = "VNPAY";

        // 3. Luôn luôn TẠO ĐƠN HÀNG trước (Dù là COD hay PayPal)
        // ViewModel sẽ gọi API createOrder, kết quả trả về ở setupObservers
        if ("direct".equals(checkoutType)) {
            viewModel.createDirectOrder(name, phone, address, currentPaymentMethod, note, items, totalAmount);
        } else {
            List<Integer> cartItemIds = new ArrayList<>();
            for (CheckoutItem item : items) {
                if (item.getCartDetailId() != null) cartItemIds.add(item.getCartDetailId());
            }
            viewModel.createOrderFromCart(name, phone, address, currentPaymentMethod, note, cartItemIds);
        }
        
        // Hiển thị loading trong khi chờ tạo đơn
        progressBar.setVisibility(View.VISIBLE);
        btnPlaceOrder.setEnabled(false);
    }

    // ✅ SỬA LOGIC OBSERVER ĐỂ XỬ LÝ TIẾP THEO
    private void setupObservers() {
        viewModel.getOrderResult().observe(this, response -> {
            // Lưu ý: Đừng tắt loading vội nếu là PayPal, vì còn phải gọi API tiếp
            
            if (response != null && response.success) {
                int newOrderId = response.data.id_order; // Lấy ID đơn hàng vừa tạo
                Log.d(TAG, "✅ Tạo đơn thành công. ID=" + newOrderId + ", Method=" + currentPaymentMethod);

                if ("PAYPAL".equals(currentPaymentMethod)) {
                    // Nếu là PayPal -> Lấy ID đó đi gọi API lấy link
                    handlePaypalPayment(newOrderId); 
                } else {
                    // Nếu là COD -> Xong luôn -> Chuyển màn hình
                    progressBar.setVisibility(View.GONE);
                    btnPlaceOrder.setEnabled(true);
                    goToSuccessScreen(newOrderId, response.data.total, response.data.order_status);
                }
            } else {
                progressBar.setVisibility(View.GONE);
                btnPlaceOrder.setEnabled(true);
                String errorMsg = response != null ? response.message : "Đặt hàng thất bại";
                Toast.makeText(this, errorMsg, Toast.LENGTH_LONG).show();
            }
        });

        // Observer loading của ViewModel (Optional)
        // viewModel.getLoading().observe(...) 
    }

    // ✅ SỬA: Nhận thêm orderId
    private void handlePaypalPayment(int orderId) {
        Log.d(TAG, "Bắt đầu lấy link PayPal cho OrderID: " + orderId);

        ApiOrder apiOrder = ApiClient.getClient().create(ApiOrder.class);
        
        // Gọi API create_paypal, truyền thêm orderId
        apiOrder.createPaypalPayment(totalAmount, "app", orderId).enqueue(new Callback<PaypalResponse>() {
            @Override
            public void onResponse(Call<PaypalResponse> call, Response<PaypalResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnPlaceOrder.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    String paymentUrl = response.body().getPaymentUrl();
                    if (paymentUrl != null) {
                        Log.d(TAG, "🔗 Mở trình duyệt: " + paymentUrl);
                        Intent intent = new Intent(Intent.ACTION_VIEW);
                        intent.setData(Uri.parse(paymentUrl));
                        startActivity(intent);
                        // App sẽ pause ở đây, User qua trình duyệt thanh toán
                    } else {
                        Toast.makeText(CheckoutActivity.this, "Link lỗi", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Log.e(TAG, "❌ Lỗi API PayPal: " + response.message());
                    Toast.makeText(CheckoutActivity.this, "Lỗi tạo thanh toán", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<PaypalResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnPlaceOrder.setEnabled(true);
                Log.e(TAG, "❌ Lỗi mạng: " + t.getMessage());
                Toast.makeText(CheckoutActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void goToSuccessScreen(int orderId, double total, String status) {
        Toast.makeText(this, "Đặt hàng thành công!", Toast.LENGTH_SHORT).show();
        Intent intent = new Intent(this, OrderSuccessActivity.class); // Đảm bảo bạn có Activity này
        intent.putExtra("orderId", orderId);
        intent.putExtra("orderStatus", status);
        intent.putExtra("total", total);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}