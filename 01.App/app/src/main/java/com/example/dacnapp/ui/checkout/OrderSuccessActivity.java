package com.example.dacnapp.ui.checkout;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.dacnapp.MainActivity;
import com.example.dacnapp.R;
import com.example.dacnapp.ui.order.OrdersActivity;

import java.text.NumberFormat;
import java.util.Locale;

public class OrderSuccessActivity extends AppCompatActivity {
    private TextView tvOrderId, tvOrderStatus, tvTotal;
    private Button btnViewOrders, btnContinueShopping;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_success);

        initViews();
        
        // Xử lý Intent khi Activity vừa được tạo
        handleIntent(getIntent());

        setupListeners();
    }

    // Hàm này được gọi khi Activity đang chạy ngầm và được gọi lại bởi Deep Link
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void initViews() {
        tvOrderId = findViewById(R.id.tvOrderId);
        tvOrderStatus = findViewById(R.id.tvOrderStatus);
        tvTotal = findViewById(R.id.tvTotal);
        btnViewOrders = findViewById(R.id.btnViewOrders);
        btnContinueShopping = findViewById(R.id.btnContinueShopping);
    }

    private void handleIntent(Intent intent) {
        String orderIdStr = "";
        String status = "";
        double total = 0;
        boolean isPaypal = false;

        Uri data = intent.getData();

        // TRƯỜNG HỢP 1: Chạy từ Deep Link (PayPal trả về)
        // Link: dacnapp://payment/success?orderId=...&total=...&status=...
        if (data != null && "dacnapp".equals(data.getScheme())) {
            orderIdStr = data.getQueryParameter("orderId");
            status = data.getQueryParameter("status");
            String totalStr = data.getQueryParameter("total");
            isPaypal = true;

            if (totalStr != null) {
                try {
                    total = Double.parseDouble(totalStr);
                } catch (NumberFormatException e) {
                    total = 0;
                }
            }
        } 
        // TRƯỜNG HỢP 2: Chạy từ App nội bộ (COD)
        else {
            int id = intent.getIntExtra("orderId", 0);
            if (id != 0) orderIdStr = String.valueOf(id);
            status = intent.getStringExtra("orderStatus");
            total = intent.getDoubleExtra("total", 0);
        }

        // Cập nhật giao diện
        displayData(orderIdStr, status, total, isPaypal);
    }

    private void displayData(String orderId, String status, double total, boolean isPaypal) {
        if ("fail".equals(status) || "cancel".equals(status)) {
            tvOrderStatus.setText("Thanh toán thất bại / Đã hủy");
            tvOrderId.setText("---");
            Toast.makeText(this, "Thanh toán chưa hoàn tất", Toast.LENGTH_LONG).show();
            return;
        }

        tvOrderId.setText("Mã đơn hàng: #" + (orderId != null ? orderId : "N/A"));
        
        if (isPaypal) {
            tvOrderStatus.setText("Trạng thái: Đã thanh toán (PayPal)");
            // PayPal trả về USD, bạn có thể để nguyên hoặc ghi chú
            tvTotal.setText("Tổng tiền: $" + total); 
        } else {
            tvOrderStatus.setText("Trạng thái: " + status);
            NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
            tvTotal.setText("Tổng tiền: " + formatter.format(total) + " đ");
        }
    }

    private void setupListeners() {
        btnViewOrders.setOnClickListener(v -> {
            Intent intent = new Intent(this, OrdersActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });

        btnContinueShopping.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });
    }

    @Override
    public void onBackPressed() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
        finish();
    }
}