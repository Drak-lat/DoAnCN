package com.example.dacnapp.network;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;

public interface ApiService {
    @POST("/api/auth/logout")
    Call<Void> logout(@Header("Authorization") String bearerToken);

    @PUT("/api/user/change-password")
    Call<ApiResponse> changePassword(@Header("Authorization") String bearerToken, @Body ChangePasswordRequest body);
}