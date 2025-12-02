package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.category.CategoryResponse;
import com.example.dacnapp.data.model.category.CategoryProductsResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiCategory {
    @GET("customer/categories")
    Call<CategoryResponse> getCategories();

    @GET("customer/categories/{categoryId}/products")
    Call<CategoryProductsResponse> getProductsByCategory(
            @Path("categoryId") int categoryId,
            @Query("page") int page,
            @Query("limit") int limit,
            @Query("sort") String sort
    );
}
