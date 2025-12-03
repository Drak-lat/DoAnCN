package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.message.AdminResponse;
import com.example.dacnapp.data.model.message.MessageResponse;
import com.example.dacnapp.data.model.message.SendMessageRequest;
import com.example.dacnapp.data.model.message.SendMessageResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface ApiMessage {
    // ✅ THÊM: Lấy danh sách admin
    @GET("customer/admins")
    Call<AdminResponse> getAvailableAdmins(
            @Header("Authorization") String token
    );

    // ✅ SỬA: Thêm query param adminId
    @GET("customer/messages")
    Call<MessageResponse> getMyMessages(
            @Header("Authorization") String token,
            @Query("adminId") Integer adminId
    );

    @POST("customer/messages")
    Call<SendMessageResponse> sendMessageToAdmin(
            @Header("Authorization") String token,
            @Body SendMessageRequest request
    );
}