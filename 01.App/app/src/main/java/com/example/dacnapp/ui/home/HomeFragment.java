package com.example.dacnapp.ui.home;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.bumptech.glide.Glide;
import com.example.dacnapp.data.model.Product;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiProduct;
import com.example.dacnapp.databinding.FragmentHomeBinding;
import com.example.dacnapp.ui.products.adapter.ProductAdapter;

import java.util.List;
import java.util.Random;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeFragment extends Fragment {

    private FragmentHomeBinding binding;
    private ApiProduct apiProduct;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container,
                             Bundle savedInstanceState) {

        binding = FragmentHomeBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        // --- Thiết lập layout cho 2 danh sách trượt ngang ---
        LinearLayoutManager layoutDeCu = new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false);
        LinearLayoutManager layoutBanChay = new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false);

        binding.rcvDeCu.setLayoutManager(layoutDeCu);
        binding.rcvBanChay.setLayoutManager(layoutBanChay);

        // --- Layout cho Bộ Sưu Tập: 2 hàng trượt ngang ---
        GridLayoutManager layoutBoSuuTap = new GridLayoutManager(getContext(), 2, GridLayoutManager.HORIZONTAL, false);
        binding.rcvBoSuuTap.setLayoutManager(layoutBoSuuTap);

        // --- Khởi tạo API ---
        apiProduct = ApiClient.getClient().create(ApiProduct.class);

        // --- Load dữ liệu ---
        loadProducts();

        return root;
    }

    private void loadProducts() {
        apiProduct.getAllProducts().enqueue(new Callback<List<Product>>() {
            @Override
            public void onResponse(@NonNull Call<List<Product>> call, @NonNull Response<List<Product>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Product> products = response.body();

                    // --- Gán dữ liệu cho RecyclerView ---
                    ProductAdapter adapterDeCu = new ProductAdapter(getContext(), products);
                    ProductAdapter adapterBanChay = new ProductAdapter(getContext(), products);
                    ProductAdapter adapterBoSuuTap = new ProductAdapter(getContext(), products);

                    binding.rcvDeCu.setAdapter(adapterDeCu);
                    binding.rcvBanChay.setAdapter(adapterBanChay);
                    binding.rcvBoSuuTap.setAdapter(adapterBoSuuTap);

                    // --- Hiển thị banner ---
                    showRandomBanner(products);

                } else {
                    Toast.makeText(getContext(), "Không có sản phẩm nào!", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Product>> call, @NonNull Throwable t) {
                Toast.makeText(getContext(), "Lỗi kết nối server: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void showRandomBanner(List<Product> products) {
        if (products == null || products.isEmpty()) return;

        // --- Chọn ngẫu nhiên 1 sản phẩm để hiển thị lên banner ---
        Random random = new Random();
        Product randomProduct = products.get(random.nextInt(products.size()));

        binding.txtBannerTitle.setText(randomProduct.getName_product());
        binding.txtBannerDesc.setText(randomProduct.getText_product());

        // --- Load ảnh banner ---
        Glide.with(this)
                .load(randomProduct.getImage_product())
                .placeholder(android.R.drawable.ic_menu_gallery)
                .error(android.R.drawable.ic_dialog_alert)
                .into(binding.imgBanner);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
