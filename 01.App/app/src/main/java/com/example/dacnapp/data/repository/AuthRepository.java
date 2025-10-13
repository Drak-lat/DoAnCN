package com.example.dacnapp.data.repository;

import com.example.dacnapp.data.model.RegisterResponse;
import com.example.dacnapp.data.model.LoginResponse;
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
}