package com.example.dacnapp.ui.search;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.ui.product.ProductDetailActivity;
import com.example.dacnapp.ui.home.ProductAdapter;

public class SearchActivity extends AppCompatActivity {
    private ImageView ivBack, ivClear;
    private EditText etSearch;
    private RecyclerView rvResults;
    private ProgressBar progressBar;
    private TextView tvEmpty, tvResultCount;
    private SearchViewModel viewModel;
    private ProductAdapter adapter;
    private String currentQuery = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_search);

        // Initialize views
        ivBack = findViewById(R.id.ivBack);
        ivClear = findViewById(R.id.ivClear);
        etSearch = findViewById(R.id.etSearch);
        rvResults = findViewById(R.id.rvResults);
        progressBar = findViewById(R.id.progressBar);
        tvEmpty = findViewById(R.id.tvEmpty);
        tvResultCount = findViewById(R.id.tvResultCount);

        // Setup RecyclerView
        adapter = new ProductAdapter(product -> {
            Intent intent = new Intent(this, ProductDetailActivity.class);
            intent.putExtra("productId", product.id_product);
            startActivity(intent);
        });
        rvResults.setLayoutManager(new GridLayoutManager(this, 2));
        rvResults.setAdapter(adapter);

        // Setup ViewModel
        viewModel = new ViewModelProvider(this).get(SearchViewModel.class);

        // Observe data
        viewModel.getProducts().observe(this, products -> {
            if (products != null && !products.isEmpty()) {
                adapter.setProducts(products);
                rvResults.setVisibility(View.VISIBLE);
                tvEmpty.setVisibility(View.GONE);
                tvResultCount.setText("Tìm thấy " + products.size() + " sản phẩm");
                tvResultCount.setVisibility(View.VISIBLE);
            } else {
                if (!currentQuery.isEmpty()) {
                    rvResults.setVisibility(View.GONE);
                    tvEmpty.setVisibility(View.VISIBLE);
                    tvResultCount.setVisibility(View.GONE);
                } else {
                    rvResults.setVisibility(View.GONE);
                    tvEmpty.setVisibility(View.GONE);
                    tvResultCount.setVisibility(View.GONE);
                }
            }
        });

        viewModel.getLoading().observe(this, loading -> {
            progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        });

        // Search text watcher
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentQuery = s.toString().trim();
                ivClear.setVisibility(currentQuery.isEmpty() ? View.GONE : View.VISIBLE);
                
                if (currentQuery.length() >= 2) {
                    viewModel.searchProducts(currentQuery, 1, 20, "newest");
                } else if (currentQuery.isEmpty()) {
                    adapter.setProducts(null);
                    tvResultCount.setVisibility(View.GONE);
                    tvEmpty.setVisibility(View.GONE);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Back button
        ivBack.setOnClickListener(v -> finish());

        // Clear button
        ivClear.setOnClickListener(v -> {
            etSearch.setText("");
            etSearch.requestFocus();
        });

        // Auto focus on search input
        etSearch.requestFocus();
    }
}
