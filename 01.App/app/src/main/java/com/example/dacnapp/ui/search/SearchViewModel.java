package com.example.dacnapp.ui.search;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.product.Product;
import com.example.dacnapp.data.model.product.HomeResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiProduct;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class SearchViewModel extends ViewModel {
    private ApiProduct apiProduct = ApiClient.getClient().create(ApiProduct.class);
    private MutableLiveData<List<Product>> products = new MutableLiveData<>();
    private MutableLiveData<Boolean> loading = new MutableLiveData<>();

    public LiveData<List<Product>> getProducts() {
        return products;
    }

    public LiveData<Boolean> getLoading() {
        return loading;
    }

    public void searchProducts(String query, int page, int limit, String sort) {
        loading.setValue(true);
        
        // Tạo map params để search
        apiProduct.getProducts(limit, page, null, query, sort).enqueue(new Callback<HomeResponse>() {
            @Override
            public void onResponse(Call<HomeResponse> call, Response<HomeResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success && response.body().data != null) {
                        products.setValue(response.body().data.products);
                    }
                }
            }

            @Override
            public void onFailure(Call<HomeResponse> call, Throwable t) {
                loading.setValue(false);
            }
        });
    }
}
