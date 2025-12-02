package com.example.dacnapp.ui.notifications;

import android.app.Application;
import android.content.SharedPreferences;

import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

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
    private MutableLiveData<List<MessageResponse.MessageData>> messages = new MutableLiveData<>();
    private MutableLiveData<Boolean> loading = new MutableLiveData<>();
    private MutableLiveData<String> error = new MutableLiveData<>();
    private MutableLiveData<Boolean> sendSuccess = new MutableLiveData<>();

    public MessagesViewModel(Application application) {
        super(application);
        apiMessage = ApiClient.getClient().create(ApiMessage.class);
    }

    public LiveData<List<MessageResponse.MessageData>> getMessages() { return messages; }
    public LiveData<Boolean> getLoading() { return loading; }
    public LiveData<String> getError() { return error; }
    public LiveData<Boolean> getSendSuccess() { return sendSuccess; }

    public void loadMessages() {
        loading.setValue(true);
        String token = getToken();

        apiMessage.getMyMessages("Bearer " + token).enqueue(new Callback<MessageResponse>() {
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

    public void sendMessage(String content) {
        loading.setValue(true);
        String token = getToken();
        SendMessageRequest request = new SendMessageRequest(content);

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

    private int getCurrentUserId() {
        SharedPreferences prefs = getApplication().getSharedPreferences("auth", 0);
        return prefs.getInt("id_login", 0);
    }
}
