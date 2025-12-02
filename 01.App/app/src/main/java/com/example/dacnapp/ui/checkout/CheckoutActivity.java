package com.example.dacnapp.ui.checkout;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
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

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class CheckoutActivity extends AppCompatActivity {
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
        
        // Get data from intent
        checkoutType = getIntent().getStringExtra("type");
        items = (List<CheckoutItem>) getIntent().getSerializableExtra("items");
        
        if (items == null || items.isEmpty()) {
            Toast.makeText(this, "Không có sản phẩm nào", Toast.LENGTH_SHORT).show();
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
        
        // Validation
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
            edtPhone.setError("Số điện thoại không hợp lệ");
            edtPhone.requestFocus();
            return;
        }
        
        if (TextUtils.isEmpty(address)) {
            edtAddress.setError("Vui lòng nhập địa chỉ");
            edtAddress.requestFocus();
            return;
        }
        
        // Get payment method
        int selectedId = rgPaymentMethod.getCheckedRadioButtonId();
        String paymentMethod = "COD"; // Mặc định

        if (selectedId == R.id.rbCOD) {
            paymentMethod = "COD";
        } else if (selectedId == R.id.rbBankTransfer) {
            paymentMethod = "Chuyển khoản";
        }
        
        // Save user info for next time
        SharedPreferences.Editor editor = getSharedPreferences("user_info", MODE_PRIVATE).edit();
        editor.putString("name", name);
        editor.putString("phone", phone);
        editor.putString("address", address);
        editor.apply();
        
        // Place order
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

    private void setupObservers() {
        viewModel.getOrderResult().observe(this, response -> {
            progressBar.setVisibility(View.GONE);
            btnPlaceOrder.setEnabled(true);
            
            if (response != null && response.success) {
                Toast.makeText(this, "Đặt hàng thành công!", Toast.LENGTH_SHORT).show();
                
                // Navigate to success screen
                Intent intent = new Intent(this, OrderSuccessActivity.class);
                intent.putExtra("orderId", response.data.id_order);
                intent.putExtra("orderStatus", response.data.order_status);
                intent.putExtra("total", response.data.total);
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
