package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.product.HomeResponse;
import com.example.dacnapp.data.model.product.ProductDetailResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiProduct {
    @GET("customer/products")
    Call<HomeResponse> getHomeData(
            @Query("limit") int limit,
            @Query("page") int page,
            @Query("sort") String sort
    );

    @GET("customer/products/{id}")
    Call<ProductDetailResponse> getProductDetail(
            @Header("Authorization") String token,
            @Path("id") int productId
    );

    @GET("customer/products")
    Call<HomeResponse> getProducts(
            @Query("limit") int limit,
            @Query("page") int page,
            @Query("category") String category,
            @Query("search") String search,
            @Query("sort") String sort
    );
}
