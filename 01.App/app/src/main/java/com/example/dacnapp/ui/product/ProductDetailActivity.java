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
import com.example.dacnapp.data.model.cart.AddToCartRequest;
import com.example.dacnapp.data.model.cart.AddToCartResponse;
import com.example.dacnapp.data.model.product.ProductDetailResponse;
import com.example.dacnapp.data.network.ApiCart;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.ui.checkout.CheckoutActivity;
import com.example.dacnapp.ui.checkout.CheckoutItem;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import androidx.viewpager2.widget.ViewPager2;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.squareup.picasso.Picasso;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

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
            showQuantityDialog();
        });

        // Buy now button
        btnBuyNow.setOnClickListener(v -> {
            if (viewModel.getProductData().getValue() != null) {
                ProductDetailResponse.ProductDetail product = viewModel.getProductData().getValue();
                
                // Tạo CheckoutItem
                CheckoutItem item = new CheckoutItem(
                    product.id_product,
                    product.name_product,
                    product.author != null ? product.author : "Không rõ",
                    product.image_product,
                    product.price,
                    1 // Mặc định số lượng 1
                );
                
                // Mở CheckoutActivity
                Intent intent = new Intent(ProductDetailActivity.this, com.example.dacnapp.ui.checkout.CheckoutActivity.class);
                intent.putExtra("type", "direct");
                
                java.util.ArrayList<CheckoutItem> items = new java.util.ArrayList<>();
                items.add(item);
                intent.putExtra("items", items);
                
                startActivity(intent);
            }
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

    private void showQuantityDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_quantity, null);
        builder.setView(dialogView);

        TextView tvProductName = dialogView.findViewById(R.id.tvProductName);
        TextView tvQuantity = dialogView.findViewById(R.id.tvQuantity);
        ImageView btnMinus = dialogView.findViewById(R.id.btnMinus);
        ImageView btnPlus = dialogView.findViewById(R.id.btnPlus);
        Button btnCancel = dialogView.findViewById(R.id.btnCancel);
        Button btnConfirm = dialogView.findViewById(R.id.btnConfirm);

        android.app.AlertDialog dialog = builder.create();
        dialog.getWindow().setBackgroundDrawableResource(R.drawable.dialog_bg);

        final int[] quantity = {1};
        final int maxQuantity = viewModel.getProductData().getValue() != null ? 
                viewModel.getProductData().getValue().quantity : 1;

        tvProductName.setText(tvProductName.getText());
        tvQuantity.setText(String.valueOf(quantity[0]));

        btnMinus.setOnClickListener(v -> {
            if (quantity[0] > 1) {
                quantity[0]--;
                tvQuantity.setText(String.valueOf(quantity[0]));
            }
        });

        btnPlus.setOnClickListener(v -> {
            if (quantity[0] < maxQuantity) {
                quantity[0]++;
                tvQuantity.setText(String.valueOf(quantity[0]));
            } else {
                Toast.makeText(this, "Chỉ còn " + maxQuantity + " sản phẩm", Toast.LENGTH_SHORT).show();
            }
        });

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnConfirm.setOnClickListener(v -> {
            dialog.dismiss();
            addToCart(productId, quantity[0]);
        });

        dialog.show();
    }

    private void addToCart(int productId, int quantity) {
        ApiCart apiCart = ApiClient.getClient().create(ApiCart.class);
        AddToCartRequest request = new AddToCartRequest(productId, quantity);

        apiCart.addToCart("Bearer " + token, request).enqueue(new Callback<AddToCartResponse>() {
            @Override
            public void onResponse(Call<AddToCartResponse> call, Response<AddToCartResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success) {
                        Toast.makeText(ProductDetailActivity.this, "Đã thêm vào giỏ hàng", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(ProductDetailActivity.this, response.body().message, Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(Call<AddToCartResponse> call, Throwable t) {
                Toast.makeText(ProductDetailActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
