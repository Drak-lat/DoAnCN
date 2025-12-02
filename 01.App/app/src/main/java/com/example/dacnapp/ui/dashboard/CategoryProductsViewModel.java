package com.example.dacnapp.ui.dashboard;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.product.Product;
import com.example.dacnapp.data.model.category.CategoryProductsResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiCategory;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class CategoryProductsViewModel extends ViewModel {
    private ApiCategory apiCategory = ApiClient.getClient().create(ApiCategory.class);
    private MutableLiveData<List<Product>> products = new MutableLiveData<>();
    private MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private MutableLiveData<Boolean> loading = new MutableLiveData<>();

    public LiveData<List<Product>> getProducts() {
        return products;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<Boolean> getLoading() {
        return loading;
    }

    public void loadProductsByCategory(int categoryId, int page, int limit, String sort) {
        loading.setValue(true);
        apiCategory.getProductsByCategory(categoryId, page, limit, sort).enqueue(new Callback<CategoryProductsResponse>() {
            @Override
            public void onResponse(Call<CategoryProductsResponse> call, Response<CategoryProductsResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success && response.body().data != null) {
                        products.setValue(response.body().data.products);
                    } else {
                        errorMessage.setValue(response.body().message);
                    }
                } else {
                    errorMessage.setValue("Không thể tải sản phẩm");
                }
            }

            @Override
            public void onFailure(Call<CategoryProductsResponse> call, Throwable t) {
                loading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }
}
