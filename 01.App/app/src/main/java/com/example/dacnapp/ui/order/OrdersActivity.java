package com.example.dacnapp.ui.order;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;

public class OrdersActivity extends AppCompatActivity {
    private ImageView ivBack;
    private ChipGroup chipGroupStatus;
    private RecyclerView rvOrders;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private OrderViewModel viewModel;
    private OrderAdapter orderAdapter;
    private String token;
    private String currentStatus = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_orders);

        // Initialize views
        ivBack = findViewById(R.id.ivBack);
        chipGroupStatus = findViewById(R.id.chipGroupStatus);
        rvOrders = findViewById(R.id.rvOrders);
        progressBar = findViewById(R.id.progressBar);
        tvEmpty = findViewById(R.id.tvEmpty);

        viewModel = new ViewModelProvider(this).get(OrderViewModel.class);

        // Get token
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        token = prefs.getString("token", null);

        // Setup RecyclerView
        orderAdapter = new OrderAdapter(order -> {
            Intent intent = new Intent(OrdersActivity.this, OrderDetailActivity.class);
            intent.putExtra("orderId", order.id_order);
            startActivity(intent);
        });
        rvOrders.setLayoutManager(new LinearLayoutManager(this));
        rvOrders.setAdapter(orderAdapter);

        // Load orders
        loadOrders();

        // Observe data
        viewModel.getOrdersData().observe(this, response -> {
            progressBar.setVisibility(View.GONE);
            if (response != null && response.success && response.data != null) {
                if (response.data.orders != null && !response.data.orders.isEmpty()) {
                    tvEmpty.setVisibility(View.GONE);
                    rvOrders.setVisibility(View.VISIBLE);
                    orderAdapter.setOrders(response.data.orders);
                } else {
                    tvEmpty.setVisibility(View.VISIBLE);
                    rvOrders.setVisibility(View.GONE);
                }
            }
        });

        viewModel.getErrorMessage().observe(this, error -> {
            progressBar.setVisibility(View.GONE);
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
            }
        });

        // Back button
        ivBack.setOnClickListener(v -> finish());

        // Status filter chips
        chipGroupStatus.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) {
                currentStatus = "";
            } else {
                int checkedId = checkedIds.get(0);
                Chip chip = findViewById(checkedId);
                if (chip != null) {
                    String status = chip.getText().toString();
                    currentStatus = status.equals("Tất cả") ? "" : status;
                }
            }
            loadOrders();
        });
    }

    private void loadOrders() {
        progressBar.setVisibility(View.VISIBLE);
        if (token != null) {
            viewModel.loadOrders(token, 1, currentStatus, "newest");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadOrders();
    }
}
