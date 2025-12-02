package com.example.dacnapp.ui.home;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.dacnapp.R;
import com.example.dacnapp.data.model.product.Product;
import com.example.dacnapp.ui.product.ProductDetailActivity;
import com.squareup.picasso.Picasso;

public class HomeFragment extends Fragment {
    private HomeViewModel viewModel;
    private RecyclerView rvFeatured, rvNewProducts, rvBestSeller;
    private ProductAdapter featuredAdapter, newAdapter, bestSellerAdapter;
    private TextView tvError, tvHeroTitle, tvHeroDescription;
    private ImageView imgHeroBook;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_home, container, false);

        // Initialize views
        rvFeatured = root.findViewById(R.id.rvFeatured);
        rvNewProducts = root.findViewById(R.id.rvNewProducts);
        rvBestSeller = root.findViewById(R.id.rvBestSeller);
        tvError = root.findViewById(R.id.tvError);
        
        // ✅ THÊM: Hero section
        tvHeroTitle = root.findViewById(R.id.tvHeroTitle);
        tvHeroDescription = root.findViewById(R.id.tvHeroDescription);
        imgHeroBook = root.findViewById(R.id.imgHeroBook);

        // Setup RecyclerViews
        setupRecyclerViews();

        // Setup ViewModel
        viewModel = new ViewModelProvider(this).get(HomeViewModel.class);

        // Observe data
        viewModel.getHomeData().observe(getViewLifecycleOwner(), response -> {
            if (response != null && response.success && response.data != null) {
                tvError.setVisibility(View.GONE);
                
                // ✅ THÊM: Hiển thị sách nổi bật đầu tiên
                if (response.data.featuredProducts != null && !response.data.featuredProducts.isEmpty()) {
                    Product heroProduct = response.data.featuredProducts.get(0);
                    tvHeroTitle.setText(heroProduct.name_product);
                    tvHeroDescription.setText(heroProduct.text_product != null ? heroProduct.text_product : "Khám phá cuốn sách tuyệt vời này...");
                    
                    String imageUrl = "http://10.0.2.2:3000/uploads/products/" + heroProduct.image_product;
                    Picasso.get()
                            .load(imageUrl)
                            .placeholder(R.drawable.placeholder_book)
                            .error(R.drawable.placeholder_book)
                            .into(imgHeroBook);
                }
                
                featuredAdapter.setProducts(response.data.featuredProducts);
                newAdapter.setProducts(response.data.newProducts);
                bestSellerAdapter.setProducts(response.data.bestSellerProducts);
            }
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), error -> {
            if (error != null) {
                tvError.setText(error);
                tvError.setVisibility(View.VISIBLE);
                Toast.makeText(getContext(), error, Toast.LENGTH_SHORT).show();
            }
        });

        // Load data
        viewModel.loadHomeData(50, 1, "newest");

        return root;
    }

    private void setupRecyclerViews() {
        // Featured products - horizontal scroll
        featuredAdapter = new ProductAdapter(this::onProductClick);
        rvFeatured.setLayoutManager(new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false));
        rvFeatured.setAdapter(featuredAdapter);

        // New products - horizontal scroll
        newAdapter = new ProductAdapter(this::onProductClick);
        rvNewProducts.setLayoutManager(new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false));
        rvNewProducts.setAdapter(newAdapter);

        // Best sellers - horizontal scroll
        bestSellerAdapter = new ProductAdapter(this::onProductClick);
        rvBestSeller.setLayoutManager(new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false));
        rvBestSeller.setAdapter(bestSellerAdapter);
    }

    private void onProductClick(Product product) {
        Intent intent = new Intent(getActivity(), ProductDetailActivity.class);
        intent.putExtra("productId", product.id_product);
        startActivity(intent);
    }
}