package com.example.dacnapp.data.repository;

import com.example.dacnapp.data.model.auth.RegisterResponse;
import com.example.dacnapp.data.model.auth.LoginResponse;
import com.example.dacnapp.data.model.auth.ForgotPasswordResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiAuth;
import retrofit2.Call;
import retrofit2.Callback;

public class AuthRepository {
    private ApiAuth apiAuth;

    public AuthRepository() {
        apiAuth = ApiClient.getClient().create(ApiAuth.class);
    }

    public void register(String username, String password, String phone, String email, Callback<RegisterResponse> callback) {
        Call<RegisterResponse> call = apiAuth.register(username, password, phone, email);
        call.enqueue(callback);
    }

    public void login(String identifier, String password, Callback<LoginResponse> callback) {
        Call<LoginResponse> call = apiAuth.login(identifier, password);
        call.enqueue(callback);
    }

    // ✅ THÊM: Forgot Password
    public void forgotPassword(String identifier, String password, String verificationCode, Callback<ForgotPasswordResponse> callback) {
        Call<ForgotPasswordResponse> call = apiAuth.forgotPassword(identifier, password, verificationCode);
        call.enqueue(callback);
    }
}