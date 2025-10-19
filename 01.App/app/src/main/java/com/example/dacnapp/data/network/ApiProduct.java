package com.example.dacnapp.data.network;

import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;
import com.example.dacnapp.data.model.Product;

public interface ApiProduct {
    @GET("api/products")
    Call<List<Product>> getAllProducts();
}
