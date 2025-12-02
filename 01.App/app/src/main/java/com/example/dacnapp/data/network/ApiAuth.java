package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.auth.LoginResponse;
import com.example.dacnapp.data.model.auth.RegisterResponse;
import com.example.dacnapp.data.model.auth.ForgotPasswordResponse;
import retrofit2.Call;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.POST;

public interface ApiAuth {
    @FormUrlEncoded
    @POST("/api/customer/register")
    Call<RegisterResponse> register(
            @Field("username") String username,
            @Field("password") String password,
            @Field("phone") String phone,
            @Field("email") String email
    );

    @FormUrlEncoded
    @POST("/api/auth/login")
    Call<LoginResponse> login(
            @Field("identifier") String identifier,
            @Field("password") String password
    );

    // ✅ THÊM: Forgot Password
    @FormUrlEncoded
    @POST("/api/auth/forgot-password")
    Call<ForgotPasswordResponse> forgotPassword(
            @Field("identifier") String identifier,
            @Field("password") String password,
            @Field("verificationCode") String verificationCode
    );
}