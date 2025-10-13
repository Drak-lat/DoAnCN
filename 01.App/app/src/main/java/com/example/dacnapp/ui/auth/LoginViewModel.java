package com.example.dacnapp.ui.auth;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.LoginResponse;
import com.example.dacnapp.data.repository.AuthRepository;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginViewModel extends ViewModel {
    private AuthRepository repository = new AuthRepository();
    private MutableLiveData<LoginResponse> loginResult = new MutableLiveData<>();

    public LiveData<LoginResponse> getLoginResult() { return loginResult; }

    public void login(String identifier, String password) {
        repository.login(identifier, password, new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    loginResult.postValue(response.body());
                } else {
                    LoginResponse errorRes = new LoginResponse();
                    errorRes.success = false;
                    try {
                        String errorJson = response.errorBody().string();
                        org.json.JSONObject obj = new org.json.JSONObject(errorJson);
                        errorRes.msg = obj.optString("msg", "Đăng nhập thất bại!");
                    } catch (Exception e) {
                        errorRes.msg = "Đăng nhập thất bại!";
                    }
                    loginResult.postValue(errorRes);
                }
            }
            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                LoginResponse errorRes = new LoginResponse();
                errorRes.success = false;
                errorRes.msg = "Lỗi kết nối server!";
                loginResult.postValue(errorRes);
            }
        });
    }
}