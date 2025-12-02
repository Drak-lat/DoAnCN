package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.order.OrderResponse;
import com.example.dacnapp.data.model.order.OrderDetailResponse;
import com.example.dacnapp.data.model.order.ConfirmReceivedResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PATCH;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiOrder {
    @GET("customer/orders")
    Call<OrderResponse> getUserOrders(
            @Header("Authorization") String token,
            @Query("page") int page,
            @Query("limit") int limit,
            @Query("status") String status,
            @Query("sort") String sort
    );

    @GET("customer/orders/{orderId}")
    Call<OrderDetailResponse> getOrderDetail(
            @Header("Authorization") String token,
            @Path("orderId") int orderId
    );

    @PATCH("customer/orders/{orderId}/confirm-received")
    Call<ConfirmReceivedResponse> confirmReceived(
            @Header("Authorization") String token,
            @Path("orderId") int orderId
    );
}
