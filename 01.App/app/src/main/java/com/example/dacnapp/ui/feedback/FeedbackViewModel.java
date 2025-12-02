package com.example.dacnapp.ui.feedback;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.feedback.FeedbackResponse;
import com.example.dacnapp.data.model.feedback.CreateFeedbackRequest;
import com.example.dacnapp.data.model.feedback.CreateFeedbackResponse;
import com.example.dacnapp.data.repository.FeedbackRepository;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FeedbackViewModel extends ViewModel {
    private FeedbackRepository repository = new FeedbackRepository();
    private MutableLiveData<FeedbackResponse> ordersData = new MutableLiveData<>();
    private MutableLiveData<CreateFeedbackResponse> createResult = new MutableLiveData<>();
    private MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private MutableLiveData<String> successMessage = new MutableLiveData<>();

    public LiveData<FeedbackResponse> getOrdersData() {
        return ordersData;
    }

    public LiveData<CreateFeedbackResponse> getCreateResult() {
        return createResult;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<String> getSuccessMessage() {
        return successMessage;
    }

    public void loadOrdersForFeedback(String token) {
        repository.getMyOrdersForFeedback(token, new Callback<FeedbackResponse>() {
            @Override
            public void onResponse(Call<FeedbackResponse> call, Response<FeedbackResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ordersData.postValue(response.body());
                } else {
                    errorMessage.postValue("Không thể tải danh sách đơn hàng");
                }
            }

            @Override
            public void onFailure(Call<FeedbackResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    public void createFeedback(String token, int productId, int orderId, int rating, String comment) {
        CreateFeedbackRequest request = new CreateFeedbackRequest(productId, orderId, rating, comment);
        repository.createFeedback(token, request, new Callback<CreateFeedbackResponse>() {
            @Override
            public void onResponse(Call<CreateFeedbackResponse> call, Response<CreateFeedbackResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    createResult.postValue(response.body());
                    if (response.body().success) {
                        successMessage.postValue("Đánh giá thành công!");
                    } else {
                        errorMessage.postValue(response.body().message);
                    }
                } else {
                    errorMessage.postValue("Không thể gửi đánh giá");
                }
            }

            @Override
            public void onFailure(Call<CreateFeedbackResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }
}
