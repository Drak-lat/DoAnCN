package com.example.dacnapp.data.repository;

import com.example.dacnapp.data.model.profile.ProfileResponse;
import com.example.dacnapp.data.model.profile.UpdateProfileResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiProfile;
import retrofit2.Call;
import retrofit2.Callback;

public class ProfileRepository {
    private ApiProfile apiProfile;

    public ProfileRepository() {
        apiProfile = ApiClient.getClient().create(ApiProfile.class);
    }

    public void getProfile(String token, Callback<ProfileResponse> callback) {
        Call<ProfileResponse> call = apiProfile.getProfile("Bearer " + token);
        call.enqueue(callback);
    }

    public void updateProfile(String token, String name, String phone, String email, String dateOfBirth, Callback<UpdateProfileResponse> callback) {
        Call<UpdateProfileResponse> call = apiProfile.updateProfile("Bearer " + token, name, phone, email, dateOfBirth);
        call.enqueue(callback);
    }

    public void changePassword(String token, String currentPassword, String newPassword, Callback<UpdateProfileResponse> callback) {
        Call<UpdateProfileResponse> call = apiProfile.changePassword("Bearer " + token, currentPassword, newPassword);
        call.enqueue(callback);
    }
}
