package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.profile.ProfileResponse;
import com.example.dacnapp.data.model.profile.UpdateProfileResponse;
import retrofit2.Call;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PUT;

public interface ApiProfile {
    @GET("/api/auth/profile")
    Call<ProfileResponse> getProfile(
            @Header("Authorization") String token
    );

    @FormUrlEncoded
    @PUT("/api/auth/profile")
    Call<UpdateProfileResponse> updateProfile(
            @Header("Authorization") String token,
            @Field("name_information") String name,
            @Field("phone_information") String phone,
            @Field("email") String email,
            @Field("date_of_birth") String dateOfBirth
    );

    @FormUrlEncoded
    @PUT("/api/auth/change-password")
    Call<UpdateProfileResponse> changePassword(
            @Header("Authorization") String token,
            @Field("currentPassword") String currentPassword,
            @Field("newPassword") String newPassword
    );
}
