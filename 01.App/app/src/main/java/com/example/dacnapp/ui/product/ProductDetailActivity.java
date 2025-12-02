package com.example.dacnapp.ui.product;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.RatingBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.product.ProductDetailResponse;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import androidx.viewpager2.widget.ViewPager2;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.squareup.picasso.Picasso;
import java.text.NumberFormat;
import java.util.Locale;

public class ProductDetailActivity extends AppCompatActivity {
    private ImageView ivBack, imgProduct;
    private TextView tvProductName, tvAuthor, tvPrice, tvQuantity, tvCategory;
    private Button btnAddToCart, btnBuyNow;
    private ProgressBar progressBar;
    private ProductDetailViewModel viewModel;
    private String token;
    private int productId;
    private double productPrice;
    private TabLayout tabLayout;
    private ViewPager2 viewPager;
    private RecyclerView rvRelatedProducts;
    private RatingBar ratingBar;
    private TextView tvRatingCount;
    private RelatedProductAdapter relatedAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_product_detail);

        // Get productId from intent
        productId = getIntent().getIntExtra("productId", 0);

        // Initialize views
        ivBack = findViewById(R.id.ivBack);
        imgProduct = findViewById(R.id.imgProduct);
        tvProductName = findViewById(R.id.tvProductName);
        tvAuthor = findViewById(R.id.tvAuthor);
        tvPrice = findViewById(R.id.tvPrice);
        tvQuantity = findViewById(R.id.tvQuantity);
        tvCategory = findViewById(R.id.tvCategory);
        btnAddToCart = findViewById(R.id.btnAddToCart);
        btnBuyNow = findViewById(R.id.btnBuyNow);
        progressBar = findViewById(R.id.progressBar);
        tabLayout = findViewById(R.id.tabLayout);
        viewPager = findViewById(R.id.viewPager);
        rvRelatedProducts = findViewById(R.id.rvRelatedProducts);
        ratingBar = findViewById(R.id.ratingBar);
        tvRatingCount = findViewById(R.id.tvRatingCount);

        // Setup related products
        relatedAdapter = new RelatedProductAdapter(product -> {
            Intent intent = new Intent(ProductDetailActivity.this, ProductDetailActivity.class);
            intent.putExtra("productId", product.id_product);
            startActivity(intent);
            finish();
        });
        rvRelatedProducts.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        rvRelatedProducts.setAdapter(relatedAdapter);

        viewModel = new ViewModelProvider(this).get(ProductDetailViewModel.class);

        // Get token
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        token = prefs.getString("token", null);

        // Load product detail and feedbacks
        if (token != null && productId > 0) {
            loadProductDetail();
            loadFeedbacks();
        }

        // Observe product data
        viewModel.getProductData().observe(this, product -> {
            progressBar.setVisibility(View.GONE);
            if (product != null) {
                displayProductDetail(product);
            }
        });

        // Observe feedbacks data
        viewModel.getProductFeedbacks().observe(this, response -> {
            if (response != null && response.data != null) {
                try {
                    float avgRating = Float.parseFloat(response.data.avgRating);
                    int totalFeedbacks = response.data.totalFeedbacks;
                    
                    ratingBar.setRating(avgRating);
                    tvRatingCount.setText("(" + avgRating + " - " + totalFeedbacks + " đánh giá)");
                } catch (NumberFormatException e) {
                    ratingBar.setRating(0);
                    tvRatingCount.setText("(0 đánh giá)");
                }
            }
        });

        viewModel.getErrorMessage().observe(this, error -> {
            progressBar.setVisibility(View.GONE);
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
            }
        });

        viewModel.getRelatedProducts().observe(this, products -> {
            if (products != null && !products.isEmpty()) {
                relatedAdapter.setProducts(products);
            }
        });

        // Back button
        ivBack.setOnClickListener(v -> finish());

        // Add to cart button
        btnAddToCart.setOnClickListener(v -> {
            Toast.makeText(this, "Thêm vào giỏ hàng (chức năng đang phát triển)", Toast.LENGTH_SHORT).show();
        });

        // Buy now button
        btnBuyNow.setOnClickListener(v -> {
            Toast.makeText(this, "Mua ngay (chức năng đang phát triển)", Toast.LENGTH_SHORT).show();
        });
    }

    private void loadProductDetail() {
        progressBar.setVisibility(View.VISIBLE);
        viewModel.loadProductDetail(token, productId);
    }

    private void loadFeedbacks() {
        viewModel.loadProductFeedbacks(productId, 1, 10);
    }

    private void displayProductDetail(ProductDetailResponse.ProductDetail product) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        // Product info
        tvProductName.setText(product.name_product);
        tvAuthor.setText("Tác giả: " + (product.author != null ? product.author : "Không rõ"));
        tvPrice.setText(formatter.format(product.price));
        productPrice = product.price;

        // Category
        if (product.Category != null) {
            tvCategory.setText("Danh mục: " + product.Category.name_category);
        }

        // Quantity and stock status
        if (product.quantity > 0) {
            tvQuantity.setText("Còn hàng: " + product.quantity + " cuốn");
            tvQuantity.setTextColor(0xFF4CAF50);
            btnAddToCart.setEnabled(true);
            btnBuyNow.setEnabled(true);
        } else {
            tvQuantity.setText("Hết hàng");
            tvQuantity.setTextColor(0xFFD32F2F);
            btnAddToCart.setEnabled(false);
            btnBuyNow.setEnabled(false);
        }

        // Load image
        if (product.image_product != null && !product.image_product.isEmpty()) {
            String imageUrl = "http://10.0.2.2:3000/uploads/products/" + product.image_product;
            Picasso.get()
                    .load(imageUrl)
                    .placeholder(R.drawable.placeholder_book)
                    .error(R.drawable.placeholder_book)
                    .into(imgProduct);
        } else {
            imgProduct.setImageResource(R.drawable.placeholder_book);
        }

        // Setup ViewPager with TabLayout
        ProductPagerAdapter pagerAdapter = new ProductPagerAdapter(this, product, productId);
        viewPager.setAdapter(pagerAdapter);

        new TabLayoutMediator(tabLayout, viewPager, (tab, position) -> {
            switch (position) {
                case 0:
                    tab.setText("Mô Tả");
                    break;
                case 1:
                    tab.setText("Chi Tiết");
                    break;
                case 2:
                    tab.setText("Đánh Giá");
                    break;
            }
        }).attach();
    }
}
