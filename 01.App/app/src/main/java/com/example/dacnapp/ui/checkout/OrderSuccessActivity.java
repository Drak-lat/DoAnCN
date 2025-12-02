package com.example.dacnapp.ui.checkout;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

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

        tvOrderId = findViewById(R.id.tvOrderId);
        tvOrderStatus = findViewById(R.id.tvOrderStatus);
        tvTotal = findViewById(R.id.tvTotal);
        btnViewOrders = findViewById(R.id.btnViewOrders);
        btnContinueShopping = findViewById(R.id.btnContinueShopping);

        // Get data from intent
        int orderId = getIntent().getIntExtra("orderId", 0);
        String orderStatus = getIntent().getStringExtra("orderStatus");
        double total = getIntent().getDoubleExtra("total", 0);

        // Display data
        tvOrderId.setText("Mã đơn hàng: #" + orderId);
        tvOrderStatus.setText("Trạng thái: " + orderStatus);
        
        NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        tvTotal.setText("Tổng tiền: " + formatter.format(total) + " đ");

        // Button actions
        btnViewOrders.setOnClickListener(v -> {
            Intent intent = new Intent(this, OrdersActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        });

        btnContinueShopping.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        });
    }

    @Override
    public void onBackPressed() {
        // Prevent going back
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
        finish();
    }
}
