package com.example.dacnapp.ui.feedback;

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
import com.example.dacnapp.data.model.product.Product;

public class ReviewsActivity extends AppCompatActivity {
    private ImageView ivBack;
    private RecyclerView rvReviews;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private FeedbackViewModel viewModel;
    private ReviewAdapter reviewAdapter;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reviews);

        // Initialize views
        ivBack = findViewById(R.id.ivBack);
        rvReviews = findViewById(R.id.rvReviews);
        progressBar = findViewById(R.id.progressBar);
        tvEmpty = findViewById(R.id.tvEmpty);

        viewModel = new ViewModelProvider(this).get(FeedbackViewModel.class);

        // Get token
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        token = prefs.getString("token", null);

        // Setup RecyclerView
        reviewAdapter = new ReviewAdapter((product, orderId) -> {
            // Show feedback dialog
            showFeedbackDialog(product, orderId);
        });
        rvReviews.setLayoutManager(new LinearLayoutManager(this));
        rvReviews.setAdapter(reviewAdapter);

        // Load orders
        loadOrders();

        // Observe data
        viewModel.getOrdersData().observe(this, response -> {
            progressBar.setVisibility(View.GONE);
            if (response != null && response.success && response.data != null) {
                if (response.data.orders != null && !response.data.orders.isEmpty()) {
                    tvEmpty.setVisibility(View.GONE);
                    rvReviews.setVisibility(View.VISIBLE);
                    reviewAdapter.setOrders(response.data.orders);
                } else {
                    tvEmpty.setVisibility(View.VISIBLE);
                    rvReviews.setVisibility(View.GONE);
                }
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
                loadOrders(); // Reload
            }
        });

        // Back button
        ivBack.setOnClickListener(v -> finish());
    }

    private void loadOrders() {
        progressBar.setVisibility(View.VISIBLE);
        if (token != null) {
            viewModel.loadOrdersForFeedback(token);
        }
    }

    private void showFeedbackDialog(Product product, int orderId) {
        FeedbackDialog dialog = new FeedbackDialog(this, product, orderId, (rating, comment) -> {
            if (token != null) {
                viewModel.createFeedback(token, product.id_product, orderId, rating, comment);
            }
        });
        dialog.show();
    }
}
