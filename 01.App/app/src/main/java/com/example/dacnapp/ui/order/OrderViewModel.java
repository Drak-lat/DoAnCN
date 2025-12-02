package com.example.dacnapp.ui.order;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.order.OrderResponse;
import com.example.dacnapp.data.model.order.OrderDetailResponse;
import com.example.dacnapp.data.model.order.ConfirmReceivedResponse;
import com.example.dacnapp.data.repository.OrderRepository;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class OrderViewModel extends ViewModel {
    private OrderRepository repository = new OrderRepository();
    private MutableLiveData<OrderResponse> ordersData = new MutableLiveData<>();
    private MutableLiveData<OrderDetailResponse.OrderData> orderDetailData = new MutableLiveData<>();
    private MutableLiveData<ConfirmReceivedResponse> confirmReceivedResult = new MutableLiveData<>();
    private MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private MutableLiveData<String> successMessage = new MutableLiveData<>();

    public LiveData<OrderResponse> getOrdersData() {
        return ordersData;
    }

    public LiveData<OrderDetailResponse.OrderData> getOrderDetailData() {
        return orderDetailData;
    }

    public LiveData<ConfirmReceivedResponse> getConfirmReceivedResult() {
        return confirmReceivedResult;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<String> getSuccessMessage() {
        return successMessage;
    }

    public void loadOrders(String token, int page, String status, String sort) {
        repository.getUserOrders(token, page, 10, status, sort, new Callback<OrderResponse>() {
            @Override
            public void onResponse(Call<OrderResponse> call, Response<OrderResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ordersData.postValue(response.body());
                } else {
                    errorMessage.postValue("Không thể tải danh sách đơn hàng");
                }
            }

            @Override
            public void onFailure(Call<OrderResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    public void loadOrderDetail(String token, int orderId) {
        repository.getOrderDetail(token, orderId, new Callback<OrderDetailResponse>() {
            @Override
            public void onResponse(Call<OrderDetailResponse> call, Response<OrderDetailResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    orderDetailData.postValue(response.body().data);
                } else {
                    errorMessage.postValue("Không thể tải chi tiết đơn hàng");
                }
            }

            @Override
            public void onFailure(Call<OrderDetailResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    public void confirmReceived(String token, int orderId) {
        repository.confirmReceived(token, orderId, new Callback<ConfirmReceivedResponse>() {
            @Override
            public void onResponse(Call<ConfirmReceivedResponse> call, Response<ConfirmReceivedResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    confirmReceivedResult.postValue(response.body());
                    if (response.body().success) {
                        successMessage.postValue("Xác nhận đã nhận hàng thành công!");
                    } else {
                        errorMessage.postValue(response.body().message);
                    }
                } else {
                    errorMessage.postValue("Không thể xác nhận đơn hàng");
                }
            }

            @Override
            public void onFailure(Call<ConfirmReceivedResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }
}
