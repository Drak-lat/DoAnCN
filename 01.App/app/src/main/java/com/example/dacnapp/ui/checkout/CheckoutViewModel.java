package com.example.dacnapp.ui.checkout;

import android.app.Application;
import android.content.SharedPreferences;

import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.dacnapp.data.model.order.CreateOrderRequest;
import com.example.dacnapp.data.model.order.CreateOrderResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiOrder;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CheckoutViewModel extends AndroidViewModel {
    private ApiOrder apiOrder;
    private MutableLiveData<CreateOrderResponse> orderResult = new MutableLiveData<>();
    private MutableLiveData<Boolean> loading = new MutableLiveData<>();

    public CheckoutViewModel(Application application) {
        super(application);
        apiOrder = ApiClient.getClient().create(ApiOrder.class);
    }

    public LiveData<CreateOrderResponse> getOrderResult() { return orderResult; }
    public LiveData<Boolean> getLoading() { return loading; }

    public void createDirectOrder(String receiverName, String receiverPhone, String receiverAddress,
                                   String paymentMethod, String note, List<CheckoutItem> items, double total) {
        loading.setValue(true);
        
        // Convert items to API format
        List<CreateOrderRequest.OrderItem> orderItems = new ArrayList<>();
        for (CheckoutItem item : items) {
            orderItems.add(new CreateOrderRequest.OrderItem(
                item.getId_product(),
                item.getQuantity(),
                item.getPrice()
            ));
        }
        
        CreateOrderRequest request = new CreateOrderRequest();
        request.setReceiver_name(receiverName);
        request.setReceiver_phone(receiverPhone);
        request.setReceiver_address(receiverAddress);
        request.setPayment_method(paymentMethod);
        request.setNote(note);
        request.setItems(orderItems);
        request.setTotal(total);
        
        String token = getToken();
        apiOrder.createDirectOrder("Bearer " + token, request).enqueue(new Callback<CreateOrderResponse>() {
            @Override
            public void onResponse(Call<CreateOrderResponse> call, Response<CreateOrderResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful()) {
                    orderResult.setValue(response.body());
                } else {
                    CreateOrderResponse errorResponse = new CreateOrderResponse();
                    errorResponse.success = false;
                    errorResponse.message = "Đặt hàng thất bại";
                    orderResult.setValue(errorResponse);
                }
            }

            @Override
            public void onFailure(Call<CreateOrderResponse> call, Throwable t) {
                loading.setValue(false);
                CreateOrderResponse errorResponse = new CreateOrderResponse();
                errorResponse.success = false;
                errorResponse.message = "Lỗi kết nối: " + t.getMessage();
                orderResult.setValue(errorResponse);
            }
        });
    }

    public void createOrderFromCart(String receiverName, String receiverPhone, String receiverAddress,
                                     String paymentMethod, String note, List<Integer> cartItemIds) {
        loading.setValue(true);
        
        CreateOrderRequest request = new CreateOrderRequest();
        request.setReceiver_name(receiverName);
        request.setReceiver_phone(receiverPhone);
        request.setReceiver_address(receiverAddress);
        request.setPayment_method(paymentMethod);
        request.setNote(note);
        request.setCart_item_ids(cartItemIds);
        
        String token = getToken();
        apiOrder.createOrderFromCart("Bearer " + token, request).enqueue(new Callback<CreateOrderResponse>() {
            @Override
            public void onResponse(Call<CreateOrderResponse> call, Response<CreateOrderResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful()) {
                    orderResult.setValue(response.body());
                } else {
                    CreateOrderResponse errorResponse = new CreateOrderResponse();
                    errorResponse.success = false;
                    errorResponse.message = "Đặt hàng thất bại";
                    orderResult.setValue(errorResponse);
                }
            }

            @Override
            public void onFailure(Call<CreateOrderResponse> call, Throwable t) {
                loading.setValue(false);
                CreateOrderResponse errorResponse = new CreateOrderResponse();
                errorResponse.success = false;
                errorResponse.message = "Lỗi kết nối: " + t.getMessage();
                orderResult.setValue(errorResponse);
            }
        });
    }

    private String getToken() {
        SharedPreferences prefs = getApplication().getSharedPreferences("auth", 0);
        return prefs.getString("token", "");
    }
}
