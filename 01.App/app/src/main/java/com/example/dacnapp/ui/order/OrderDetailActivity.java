package com.example.dacnapp.ui.order;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.order.OrderDetailResponse;
import com.example.dacnapp.data.model.order.OrderDetail;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;

public class OrderDetailActivity extends AppCompatActivity {
    private ImageView ivBack;
    private TextView tvOrderId, tvOrderDate, tvOrderStatus, tvPaymentStatus, tvPaymentMethod;
    private TextView tvReceiverName, tvReceiverPhone, tvReceiverAddress;
    private TextView tvSubtotal, tvShippingFee, tvTotal, tvNote;
    private RecyclerView rvOrderItems;
    private ProgressBar progressBar;
    private LinearLayout layoutNote;
    private Button btnConfirmReceived;
    private OrderViewModel viewModel;
    private OrderDetailItemAdapter itemAdapter;
    private String token;
    private int orderId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_detail);

        // Get orderId from intent
        orderId = getIntent().getIntExtra("orderId", 0);

        // Initialize views
        ivBack = findViewById(R.id.ivBack);
        tvOrderId = findViewById(R.id.tvOrderId);
        tvOrderDate = findViewById(R.id.tvOrderDate);
        tvOrderStatus = findViewById(R.id.tvOrderStatus);
        tvPaymentStatus = findViewById(R.id.tvPaymentStatus);
        tvPaymentMethod = findViewById(R.id.tvPaymentMethod);
        tvReceiverName = findViewById(R.id.tvReceiverName);
        tvReceiverPhone = findViewById(R.id.tvReceiverPhone);
        tvReceiverAddress = findViewById(R.id.tvReceiverAddress);
        tvSubtotal = findViewById(R.id.tvSubtotal);
        tvShippingFee = findViewById(R.id.tvShippingFee);
        tvTotal = findViewById(R.id.tvTotal);
        tvNote = findViewById(R.id.tvNote);
        layoutNote = findViewById(R.id.layoutNote);
        rvOrderItems = findViewById(R.id.rvOrderItems);
        progressBar = findViewById(R.id.progressBar);
        btnConfirmReceived = findViewById(R.id.btnConfirmReceived);

        viewModel = new ViewModelProvider(this).get(OrderViewModel.class);

        // Get token
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        token = prefs.getString("token", null);

        // Setup RecyclerView
        itemAdapter = new OrderDetailItemAdapter();
        rvOrderItems.setLayoutManager(new LinearLayoutManager(this));
        rvOrderItems.setAdapter(itemAdapter);
        rvOrderItems.setNestedScrollingEnabled(false);

        // Load order detail
        loadOrderDetail();

        // Observe data
        viewModel.getOrderDetailData().observe(this, orderData -> {
            progressBar.setVisibility(View.GONE);
            if (orderData != null) {
                displayOrderDetail(orderData);
            }
        });

        viewModel.getErrorMessage().observe(this, error -> {
            progressBar.setVisibility(View.GONE);
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
            }
        });

        viewModel.getSuccessMessage().observe(this, message -> {
            if (message != null) {
                Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
                // Reload order detail
                loadOrderDetail();
            }
        });

        // Back button
        ivBack.setOnClickListener(v -> finish());

        // Confirm received button
        btnConfirmReceived.setOnClickListener(v -> showConfirmDialog());
    }

    private void loadOrderDetail() {
        progressBar.setVisibility(View.VISIBLE);
        if (token != null && orderId > 0) {
            viewModel.loadOrderDetail(token, orderId);
        }
    }

    private void showConfirmDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Xác nhận đã nhận hàng")
                .setMessage("Bạn đã nhận được hàng? Hành động này không thể hoàn tác.")
                .setPositiveButton("Đã nhận", (dialog, which) -> {
                    if (token != null) {
                        viewModel.confirmReceived(token, orderId);
                    }
                })
                .setNegativeButton("Hủy", null)
                .show();
    }

    private void displayOrderDetail(OrderDetailResponse.OrderData order) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        // Order info
        tvOrderId.setText("Đơn hàng #" + order.id_order);
        
        // Format date
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
            tvOrderDate.setText(outputFormat.format(inputFormat.parse(order.date_order)));
        } catch (Exception e) {
            tvOrderDate.setText(order.date_order);
        }

        tvOrderStatus.setText(order.order_status);
        setStatusColor(tvOrderStatus, order.order_status);

        tvPaymentStatus.setText(order.payment_status);
        tvPaymentMethod.setText(order.payment_method != null ? order.payment_method : "COD");

        // Show/hide confirm received button
        if ("Đã giao".equals(order.order_status)) {
            btnConfirmReceived.setVisibility(View.VISIBLE);
        } else {
            btnConfirmReceived.setVisibility(View.GONE);
        }

        // Receiver info
        tvReceiverName.setText(order.receiver_name);
        tvReceiverPhone.setText(order.receiver_phone);
        tvReceiverAddress.setText(order.receiver_address);

        // Order items
        if (order.OrderDetails != null) {
            itemAdapter.setItems(order.OrderDetails);
        }

        // Pricing
        tvSubtotal.setText(formatter.format(order.total));
        tvShippingFee.setText(formatter.format(0)); // Assuming free shipping
        tvTotal.setText(formatter.format(order.total));

        // Note
        if (order.note != null && !order.note.isEmpty()) {
            layoutNote.setVisibility(View.VISIBLE);
            tvNote.setText(order.note);
        } else {
            layoutNote.setVisibility(View.GONE);
        }
    }

    private void setStatusColor(TextView tv, String status) {
        int color;
        switch (status) {
            case "Chờ xác nhận":
                color = 0xFFFF8800;
                break;
            case "Đã xác nhận":
                color = 0xFF2196F3;
                break;
            case "Đang giao":
                color = 0xFF9C27B0;
                break;
            case "Đã giao":
                color = 0xFF4CAF50;
                break;
            case "Đã nhận":
                color = 0xFF00897B;
                break;
            case "Đã hủy":
                color = 0xFFD32F2F;
                break;
            default:
                color = 0xFF666666;
        }
        tv.setTextColor(color);
    }
}
