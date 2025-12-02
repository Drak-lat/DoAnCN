package com.example.dacnapp.ui.profile;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.profile.ProfileResponse;
import com.example.dacnapp.data.model.profile.UpdateProfileResponse;
import com.example.dacnapp.data.repository.ProfileRepository;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileViewModel extends ViewModel {
    private ProfileRepository repository = new ProfileRepository();
    private MutableLiveData<ProfileResponse> profileData = new MutableLiveData<>();
    private MutableLiveData<UpdateProfileResponse> updateResult = new MutableLiveData<>();
    private MutableLiveData<String> errorMessage = new MutableLiveData<>();

    public LiveData<ProfileResponse> getProfileData() {
        return profileData;
    }

    public LiveData<UpdateProfileResponse> getUpdateResult() {
        return updateResult;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public void loadProfile(String token) {
        repository.getProfile(token, new Callback<ProfileResponse>() {
            @Override
            public void onResponse(Call<ProfileResponse> call, Response<ProfileResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    profileData.postValue(response.body());
                } else {
                    errorMessage.postValue("Không thể tải thông tin!");
                }
            }

            @Override
            public void onFailure(Call<ProfileResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    public void updateProfile(String token, String name, String phone, String email, String dateOfBirth) {
        repository.updateProfile(token, name, phone, email, dateOfBirth, new Callback<UpdateProfileResponse>() {
            @Override
            public void onResponse(Call<UpdateProfileResponse> call, Response<UpdateProfileResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    updateResult.postValue(response.body());
                } else {
                    try {
                        String errorJson = response.errorBody().string();
                        org.json.JSONObject obj = new org.json.JSONObject(errorJson);
                        UpdateProfileResponse errorRes = new UpdateProfileResponse();
                        errorRes.success = false;
                        errorRes.msg = obj.optString("msg", "Cập nhật thất bại!");
                        updateResult.postValue(errorRes);
                    } catch (Exception e) {
                        errorMessage.postValue("Cập nhật thất bại!");
                    }
                }
            }

            @Override
            public void onFailure(Call<UpdateProfileResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối!");
            }
        });
    }

    public void changePassword(String token, String currentPassword, String newPassword) {
        repository.changePassword(token, currentPassword, newPassword, new Callback<UpdateProfileResponse>() {
            @Override
            public void onResponse(Call<UpdateProfileResponse> call, Response<UpdateProfileResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    updateResult.postValue(response.body());
                } else {
                    try {
                        String errorJson = response.errorBody().string();
                        org.json.JSONObject obj = new org.json.JSONObject(errorJson);
                        UpdateProfileResponse errorRes = new UpdateProfileResponse();
                        errorRes.success = false;
                        errorRes.msg = obj.optString("msg", "Đổi mật khẩu thất bại!");
                        updateResult.postValue(errorRes);
                    } catch (Exception e) {
                        errorMessage.postValue("Đổi mật khẩu thất bại!");
                    }
                }
            }

            @Override
            public void onFailure(Call<UpdateProfileResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối!");
            }
        });
    }
}
