package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.cart.CartResponse;
import com.example.dacnapp.data.model.cart.AddToCartRequest;
import com.example.dacnapp.data.model.cart.AddToCartResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface ApiCart {
    @GET("customer/cart")
    Call<CartResponse> getCart(@Header("Authorization") String token);

    @POST("customer/cart")
    Call<AddToCartResponse> addToCart(
            @Header("Authorization") String token,
            @Body AddToCartRequest request
    );

    @PUT("customer/cart/{id_cartdetail}")
    Call<AddToCartResponse> updateCartItem(
            @Header("Authorization") String token,
            @Path("id_cartdetail") int id_cartdetail,
            @Body AddToCartRequest request
    );

    @DELETE("customer/cart/{id_cartdetail}")
    Call<AddToCartResponse> removeFromCart(
            @Header("Authorization") String token,
            @Path("id_cartdetail") int id_cartdetail
    );

    @DELETE("customer/cart")
    Call<AddToCartResponse> clearCart(@Header("Authorization") String token);
}