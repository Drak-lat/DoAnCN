package com.example.dacnapp.ui.profile;

import android.util.Log;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.example.dacnapp.R;
import com.example.dacnapp.network.ApiResponse;
import com.example.dacnapp.network.ApiService;
import com.example.dacnapp.network.ChangePasswordRequest;
import com.example.dacnapp.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ChangePasswordActivity extends AppCompatActivity {

    EditText oldPassword, newPassword, confirmPassword;
    Button btnConfirmChange;
    SessionManager session;
    ApiService api;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_change_password);

        session = new SessionManager(this);

        oldPassword = findViewById(R.id.oldPassword);
        newPassword = findViewById(R.id.newPassword);
        confirmPassword = findViewById(R.id.confirmPassword);
        btnConfirmChange = findViewById(R.id.btnConfirmChange);

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://10.0.2.2:3000/") // emulator -> host dev; thay nếu cần
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        api = retrofit.create(ApiService.class);

        btnConfirmChange.setOnClickListener(v -> {
            String oldPass = oldPassword.getText().toString().trim();
            String newPass = newPassword.getText().toString().trim();
            String confirmPass = confirmPassword.getText().toString().trim();

            if (oldPass.isEmpty() || newPass.isEmpty() || confirmPass.isEmpty()) {
                Toast.makeText(this, "Vui lòng nhập đầy đủ thông tin", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!newPass.equals(confirmPass)) {
                Toast.makeText(this, "Mật khẩu mới không khớp", Toast.LENGTH_SHORT).show();
                return;
            }

            performChangePassword(oldPass, newPass);
        });
    }

    private void performChangePassword(String oldPass, String newPass) {
        btnConfirmChange.setEnabled(false);
        String token = session.getToken();
        Log.d("AUTH_DEBUG", "token before changePassword: " + token);
        if (token == null || token.isEmpty()) {
            Toast.makeText(this, "Bạn chưa đăng nhập", Toast.LENGTH_SHORT).show();
            btnConfirmChange.setEnabled(true);
            return;
        }

        ChangePasswordRequest req = new ChangePasswordRequest(oldPass, newPass);
        Call<ApiResponse> call = api.changePassword("Bearer " + token, req);
        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                btnConfirmChange.setEnabled(true);
                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse body = response.body();
                    Toast.makeText(ChangePasswordActivity.this, body.getMessage() != null ? body.getMessage() : "Đổi mật khẩu thành công", Toast.LENGTH_LONG).show();
                    if (body.isSuccess()) finish();
                } else {
                    String msg = "Đổi mật khẩu thất bại";
                    try {
                        if (response.errorBody() != null) msg = response.errorBody().string();
                    } catch (Exception e) {
                        Log.w("AUTH_DEBUG", "errorBody read fail: " + e.getMessage());
                    }
                    Toast.makeText(ChangePasswordActivity.this, msg, Toast.LENGTH_LONG).show();
                    Log.w("AUTH_DEBUG", "changePassword failed, code=" + response.code());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                btnConfirmChange.setEnabled(true);
                Toast.makeText(ChangePasswordActivity.this, "Lỗi kết nối: " + t.getMessage(), Toast.LENGTH_LONG).show();
                Log.e("AUTH_DEBUG", "changePassword onFailure: " + t.getMessage());
            }
        });
    }
}