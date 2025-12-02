package com.example.dacnapp.data.repository;

import com.example.dacnapp.data.model.order.OrderResponse;
import com.example.dacnapp.data.model.order.OrderDetailResponse;
import com.example.dacnapp.data.model.order.ConfirmReceivedResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiOrder;
import retrofit2.Callback;

public class OrderRepository {
    private ApiOrder apiOrder;

    public OrderRepository() {
        apiOrder = ApiClient.getClient().create(ApiOrder.class);
    }

    public void getUserOrders(String token, int page, int limit, String status, String sort, Callback<OrderResponse> callback) {
        String authToken = "Bearer " + token;
        apiOrder.getUserOrders(authToken, page, limit, status, sort).enqueue(callback);
    }

    public void getOrderDetail(String token, int orderId, Callback<OrderDetailResponse> callback) {
        String authToken = "Bearer " + token;
        apiOrder.getOrderDetail(authToken, orderId).enqueue(callback);
    }

    public void confirmReceived(String token, int orderId, Callback<ConfirmReceivedResponse> callback) {
        String authToken = "Bearer " + token;
        apiOrder.confirmReceived(authToken, orderId).enqueue(callback);
    }
}
