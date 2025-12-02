package com.example.dacnapp.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.ui.home.ProductAdapter;
import com.example.dacnapp.data.model.product.Product;
import com.example.dacnapp.data.repository.ProductRepository;
import com.example.dacnapp.data.model.product.HomeResponse;
import com.example.dacnapp.ui.order.OrdersActivity;  // ✅ THÊM DÒNG NÀY
import com.example.dacnapp.ui.feedback.ReviewsActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileFragment extends Fragment {
    private ProfileViewModel viewModel;
    private TextView tvWelcome;
    private LinearLayout btnViewProfile, btnOrders, btnReviews;
    private RecyclerView rvRecommended;
    private ProductAdapter productAdapter;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_profile, container, false);

        // Initialize views
        tvWelcome = root.findViewById(R.id.tvWelcome);
        btnViewProfile = root.findViewById(R.id.btnViewProfile);
        btnOrders = root.findViewById(R.id.btnOrders);
        btnReviews = root.findViewById(R.id.btnReviews);
        rvRecommended = root.findViewById(R.id.rvRecommended);

        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);

        // Setup RecyclerView for recommended products
        productAdapter = new ProductAdapter(product -> {
            Intent intent = new Intent(getActivity(), com.example.dacnapp.ui.product.ProductDetailActivity.class);
            intent.putExtra("productId", product.id_product);
            startActivity(intent);
        });
        rvRecommended.setLayoutManager(new GridLayoutManager(getContext(), 2));
        rvRecommended.setAdapter(productAdapter);
        rvRecommended.setNestedScrollingEnabled(false);

        // Load profile
        String token = getActivity().getSharedPreferences("auth", getContext().MODE_PRIVATE).getString("token", null);
        if (token != null) {
            viewModel.loadProfile(token);
        }

        // Load all products for "Bạn Có Thể Thích"
        loadRecommendedProducts();

        // Observe profile data
        viewModel.getProfileData().observe(getViewLifecycleOwner(), response -> {
            if (response != null && response.success && response.data != null) {
                tvWelcome.setText("Xin Chào " + response.data.username);
            }
        });

        // Click listener - View Profile Details
        btnViewProfile.setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), ProfileDetailActivity.class));
        });

        // Click listener - Orders
        btnOrders.setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), OrdersActivity.class));
        });

        // Click listener - Reviews
        btnReviews.setOnClickListener(v -> {
            startActivity(new Intent(getActivity(), ReviewsActivity.class));
        });

        return root;
    }

    private void loadRecommendedProducts() {
        ProductRepository repository = new ProductRepository();
        repository.getHomeData(100, 1, "id_product", new Callback<HomeResponse>() {
            @Override
            public void onResponse(Call<HomeResponse> call, Response<HomeResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    HomeResponse.Data data = response.body().data;
                    if (data != null && data.products != null && !data.products.isEmpty()) {
                        productAdapter.setProducts(data.products);
                    }
                }
            }

            @Override
            public void onFailure(Call<HomeResponse> call, Throwable t) {
                // Handle error silently or show message
            }
        });
    }
}
