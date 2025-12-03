package com.example.dacnapp.ui.notifications;

import android.app.Application;
import android.content.SharedPreferences;

import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.dacnapp.data.model.message.AdminResponse;
import com.example.dacnapp.data.model.message.MessageResponse;
import com.example.dacnapp.data.model.message.SendMessageRequest;
import com.example.dacnapp.data.model.message.SendMessageResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiMessage;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MessagesViewModel extends AndroidViewModel {
    private ApiMessage apiMessage;
    private MutableLiveData<List<AdminResponse.AdminData>> admins = new MutableLiveData<>();
    private MutableLiveData<List<MessageResponse.MessageData>> messages = new MutableLiveData<>();
    private MutableLiveData<Boolean> loading = new MutableLiveData<>();
    private MutableLiveData<String> error = new MutableLiveData<>();
    private MutableLiveData<Boolean> sendSuccess = new MutableLiveData<>();

    public MessagesViewModel(Application application) {
        super(application);
        apiMessage = ApiClient.getClient().create(ApiMessage.class);
    }

    public LiveData<List<AdminResponse.AdminData>> getAdmins() { return admins; }
    public LiveData<List<MessageResponse.MessageData>> getMessages() { return messages; }
    public LiveData<Boolean> getLoading() { return loading; }
    public LiveData<String> getError() { return error; }
    public LiveData<Boolean> getSendSuccess() { return sendSuccess; }

    // ✅ THÊM: Load danh sách admin
    public void loadAdmins() {
        String token = getToken();

        apiMessage.getAvailableAdmins("Bearer " + token).enqueue(new Callback<AdminResponse>() {
            @Override
            public void onResponse(Call<AdminResponse> call, Response<AdminResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success && response.body().data != null) {
                        admins.setValue(response.body().data.admins);
                    }
                } else {
                    error.setValue("Không thể tải danh sách admin");
                }
            }

            @Override
            public void onFailure(Call<AdminResponse> call, Throwable t) {
                error.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    // ✅ SỬA: Thêm adminId parameter
    public void loadMessages(Integer adminId) {
        loading.setValue(true);
        String token = getToken();

        apiMessage.getMyMessages("Bearer " + token, adminId).enqueue(new Callback<MessageResponse>() {
            @Override
            public void onResponse(Call<MessageResponse> call, Response<MessageResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success && response.body().data != null) {
                        messages.setValue(response.body().data.messages);
                    }
                } else {
                    error.setValue("Không thể tải tin nhắn");
                }
            }

            @Override
            public void onFailure(Call<MessageResponse> call, Throwable t) {
                loading.setValue(false);
                error.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    // ✅ SỬA: Thêm adminId parameter
    public void sendMessage(String content, int adminId) {
        loading.setValue(true);
        String token = getToken();
        SendMessageRequest request = new SendMessageRequest(content, adminId);

        apiMessage.sendMessageToAdmin("Bearer " + token, request).enqueue(new Callback<SendMessageResponse>() {
            @Override
            public void onResponse(Call<SendMessageResponse> call, Response<SendMessageResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success) {
                        sendSuccess.setValue(true);
                    } else {
                        error.setValue(response.body().message);
                    }
                } else {
                    error.setValue("Không thể gửi tin nhắn");
                }
            }

            @Override
            public void onFailure(Call<SendMessageResponse> call, Throwable t) {
                loading.setValue(false);
                error.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    private String getToken() {
        SharedPreferences prefs = getApplication().getSharedPreferences("auth", 0);
        return prefs.getString("token", "");
    }
}
