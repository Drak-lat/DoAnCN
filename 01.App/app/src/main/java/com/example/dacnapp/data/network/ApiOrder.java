package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.order.CreateOrderRequest;
import com.example.dacnapp.data.model.order.CreateOrderResponse;
import com.example.dacnapp.data.model.order.OrderResponse;
import com.example.dacnapp.data.model.order.OrderDetailResponse;
import com.example.dacnapp.data.model.order.ConfirmReceivedResponse;
import com.example.dacnapp.data.model.paypal.PaypalResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiOrder {
    @POST("customer/orders/create-direct")
    Call<CreateOrderResponse> createDirectOrder(
            @Header("Authorization") String token,
            @Body CreateOrderRequest request
    );

    @POST("customer/orders/create-from-cart")
    Call<CreateOrderResponse> createOrderFromCart(
            @Header("Authorization") String token,
            @Body CreateOrderRequest request
    );

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


    @GET("customer/create_paypal") 
    Call<PaypalResponse> createPaypalPayment(
            @Query("amount") double amount,
            @Query("platform") String platform ,
            @Query("orderId") int orderId 
    );
    
}
