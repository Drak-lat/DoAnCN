package com.example.dacnapp.data.repository;

import com.example.dacnapp.data.model.product.HomeResponse;
import com.example.dacnapp.data.model.product.ProductDetailResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiProduct;
import retrofit2.Callback;

public class ProductRepository {
    private ApiProduct apiProduct;

    public ProductRepository() {
        apiProduct = ApiClient.getClient().create(ApiProduct.class);
    }

    public void getHomeData(int limit, int page, String sort, Callback<HomeResponse> callback) {
        apiProduct.getHomeData(limit, page, sort).enqueue(callback);
    }

    public void getProductDetail(String token, int productId, Callback<ProductDetailResponse> callback) {
        String authToken = "Bearer " + token;
        apiProduct.getProductDetail(authToken, productId).enqueue(callback);
    }
}
