package com.example.dacnapp.ui.profile;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.dacnapp.R;

import java.util.regex.Pattern;

public class ChangePasswordActivity extends AppCompatActivity {
    private ImageView ivBack;
    private EditText edtCurrentPassword, edtNewPassword, edtConfirmPassword;
    private Button btnChangePassword;
    private ProfileViewModel viewModel;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_change_password);

        // Initialize views
        ivBack = findViewById(R.id.ivBack);
        edtCurrentPassword = findViewById(R.id.edtCurrentPassword);
        edtNewPassword = findViewById(R.id.edtNewPassword);
        edtConfirmPassword = findViewById(R.id.edtConfirmPassword);
        btnChangePassword = findViewById(R.id.btnChangePassword);

        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);

        // Get token
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        token = prefs.getString("token", null);

        // Observe update result
        viewModel.getUpdateResult().observe(this, response -> {
            if (response != null) {
                if (response.success) {
                    Toast.makeText(this, "Đổi mật khẩu thành công!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(this, response.msg, Toast.LENGTH_SHORT).show();
                }
            }
        });

        // Observe errors
        viewModel.getErrorMessage().observe(this, error -> {
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
            }
        });

        // Back button
        ivBack.setOnClickListener(v -> finish());

        // Change password button
        btnChangePassword.setOnClickListener(v -> {
            if (validateInput()) {
                String currentPassword = edtCurrentPassword.getText().toString().trim();
                String newPassword = edtNewPassword.getText().toString().trim();
                viewModel.changePassword(token, currentPassword, newPassword);
            }
        });
    }

    private boolean validateInput() {
        String currentPassword = edtCurrentPassword.getText().toString().trim();
        String newPassword = edtNewPassword.getText().toString().trim();
        String confirmPassword = edtConfirmPassword.getText().toString().trim();

        if (TextUtils.isEmpty(currentPassword)) {
            Toast.makeText(this, "Vui lòng nhập mật khẩu hiện tại!", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (TextUtils.isEmpty(newPassword)) {
            Toast.makeText(this, "Vui lòng nhập mật khẩu mới!", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (newPassword.length() < 10) {
            Toast.makeText(this, "Mật khẩu phải có ít nhất 10 ký tự!", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (!Pattern.compile("[A-Za-z]").matcher(newPassword).find()) {
            Toast.makeText(this, "Mật khẩu phải chứa chữ cái!", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (!Pattern.compile("[0-9]").matcher(newPassword).find()) {
            Toast.makeText(this, "Mật khẩu phải chứa số!", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (TextUtils.isEmpty(confirmPassword)) {
            Toast.makeText(this, "Vui lòng xác nhận mật khẩu mới!", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (!newPassword.equals(confirmPassword)) {
            Toast.makeText(this, "Mật khẩu xác nhận không khớp!", Toast.LENGTH_SHORT).show();
            return false;
        }

        return true;
    }
}
