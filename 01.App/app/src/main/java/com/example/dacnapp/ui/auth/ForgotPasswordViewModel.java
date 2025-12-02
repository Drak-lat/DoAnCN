package com.example.dacnapp.ui.auth;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.auth.ForgotPasswordResponse;
import com.example.dacnapp.data.repository.AuthRepository;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ForgotPasswordViewModel extends ViewModel {
    private AuthRepository repository = new AuthRepository();
    private MutableLiveData<ForgotPasswordResponse> result = new MutableLiveData<>();

    public LiveData<ForgotPasswordResponse> getResult() { 
        return result; 
    }

    // Bước 1: Gửi OTP
    public void sendOTP(String identifier) {
        repository.forgotPassword(identifier, null, null, new Callback<ForgotPasswordResponse>() {
            @Override
            public void onResponse(Call<ForgotPasswordResponse> call, Response<ForgotPasswordResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(response.body());
                } else {
                    ForgotPasswordResponse errorRes = new ForgotPasswordResponse();
                    errorRes.success = false;
                    try {
                        String errorJson = response.errorBody().string();
                        org.json.JSONObject obj = new org.json.JSONObject(errorJson);
                        errorRes.msg = obj.optString("msg", "Có lỗi xảy ra!");
                    } catch (Exception e) {
                        errorRes.msg = "Có lỗi xảy ra!";
                    }
                    result.postValue(errorRes);
                }
            }

            @Override
            public void onFailure(Call<ForgotPasswordResponse> call, Throwable t) {
                ForgotPasswordResponse errorRes = new ForgotPasswordResponse();
                errorRes.success = false;
                errorRes.msg = "Lỗi kết nối server!";
                result.postValue(errorRes);
            }
        });
    }

    // Bước 2: Đổi mật khẩu
    public void resetPassword(String identifier, String password, String verificationCode) {
        repository.forgotPassword(identifier, password, verificationCode, new Callback<ForgotPasswordResponse>() {
            @Override
            public void onResponse(Call<ForgotPasswordResponse> call, Response<ForgotPasswordResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    result.postValue(response.body());
                } else {
                    ForgotPasswordResponse errorRes = new ForgotPasswordResponse();
                    errorRes.success = false;
                    try {
                        String errorJson = response.errorBody().string();
                        org.json.JSONObject obj = new org.json.JSONObject(errorJson);
                        errorRes.msg = obj.optString("msg", "Có lỗi xảy ra!");
                    } catch (Exception e) {
                        errorRes.msg = "Có lỗi xảy ra!";
                    }
                    result.postValue(errorRes);
                }
            }

            @Override
            public void onFailure(Call<ForgotPasswordResponse> call, Throwable t) {
                ForgotPasswordResponse errorRes = new ForgotPasswordResponse();
                errorRes.success = false;
                errorRes.msg = "Lỗi kết nối server!";
                result.postValue(errorRes);
            }
        });
    }
}
