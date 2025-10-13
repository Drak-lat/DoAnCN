package com.example.dacnapp.ui.auth;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.RegisterResponse;
import com.example.dacnapp.data.repository.AuthRepository;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterViewModel extends ViewModel {
    private AuthRepository repository = new AuthRepository();
    private MutableLiveData<RegisterResponse> registerResult = new MutableLiveData<>();

    public LiveData<RegisterResponse> getRegisterResult() { return registerResult; }

    public void register(String username, String password, String phone, String email) {
        repository.register(username, password, phone, email, new Callback<RegisterResponse>() {
            @Override
            public void onResponse(Call<RegisterResponse> call, Response<RegisterResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    registerResult.postValue(response.body());
                } else {
                    RegisterResponse errorRes = new RegisterResponse();
                    errorRes.success = false;
                    try {
                        String errorJson = response.errorBody().string();
                        org.json.JSONObject obj = new org.json.JSONObject(errorJson);
                        errorRes.msg = obj.optString("msg", "Đăng ký thất bại!");
                    } catch (Exception e) {
                        errorRes.msg = "Đăng ký thất bại!";
                    }
                    registerResult.postValue(errorRes);
                }
            }
            @Override
            public void onFailure(Call<RegisterResponse> call, Throwable t) {
                RegisterResponse errorRes = new RegisterResponse();
                errorRes.success = false;
                errorRes.msg = "Lỗi kết nối server!";
                registerResult.postValue(errorRes);
            }
        });
    }
}