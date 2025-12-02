package com.example.dacnapp.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.ui.product.ProductDetailActivity;
import com.example.dacnapp.ui.home.ProductAdapter;

public class CategoryProductsActivity extends AppCompatActivity {
    private ImageView ivBack;
    private TextView tvTitle, tvEmpty;
    private RecyclerView rvProducts;
    private ProgressBar progressBar;
    private CategoryProductsViewModel viewModel;
    private ProductAdapter adapter;
    private int categoryId;
    private String categoryName;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_category_products);

        // Get data from intent
        categoryId = getIntent().getIntExtra("categoryId", 0);
        categoryName = getIntent().getStringExtra("categoryName");

        // Initialize views
        ivBack = findViewById(R.id.ivBack);
        tvTitle = findViewById(R.id.tvTitle);
        tvEmpty = findViewById(R.id.tvEmpty);
        rvProducts = findViewById(R.id.rvProducts);
        progressBar = findViewById(R.id.progressBar);

        tvTitle.setText(categoryName != null ? categoryName : "Danh mục");

        // Setup RecyclerView
        adapter = new ProductAdapter(product -> {
            Intent intent = new Intent(this, ProductDetailActivity.class);
            intent.putExtra("productId", product.id_product);
            startActivity(intent);
        });

        rvProducts.setLayoutManager(new GridLayoutManager(this, 2));
        rvProducts.setAdapter(adapter);

        // Setup ViewModel
        viewModel = new ViewModelProvider(this).get(CategoryProductsViewModel.class);

        // Observe data
        viewModel.getProducts().observe(this, products -> {
            if (products != null && !products.isEmpty()) {
                adapter.setProducts(products);
                rvProducts.setVisibility(View.VISIBLE);
                tvEmpty.setVisibility(View.GONE);
            } else {
                rvProducts.setVisibility(View.GONE);
                tvEmpty.setVisibility(View.VISIBLE);
            }
        });

        viewModel.getLoading().observe(this, loading -> {
            progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        });

        viewModel.getErrorMessage().observe(this, error -> {
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
            }
        });

        // Load products
        if (categoryId > 0) {
            viewModel.loadProductsByCategory(categoryId, 1, 20, "newest");
        }

        // Back button
        ivBack.setOnClickListener(v -> finish());
    }
}
