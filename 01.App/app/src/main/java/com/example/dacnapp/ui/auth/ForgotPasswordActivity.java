package com.example.dacnapp.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import com.example.dacnapp.R;

public class ForgotPasswordActivity extends AppCompatActivity {
    private EditText edtIdentifier, edtOTP, edtNewPassword, edtConfirmPassword;
    private Button btnSendOTP, btnResetPassword;
    private TextView tvMsg, tvOTPDisplay, btnBackToLogin;
    private LinearLayout layoutStep1, layoutStep2;
    private ForgotPasswordViewModel viewModel;

    private int currentStep = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        edtIdentifier = findViewById(R.id.edtIdentifier);
        edtOTP = findViewById(R.id.edtOTP);
        edtNewPassword = findViewById(R.id.edtNewPassword);
        edtConfirmPassword = findViewById(R.id.edtConfirmPassword);
        btnSendOTP = findViewById(R.id.btnSendOTP);
        btnResetPassword = findViewById(R.id.btnResetPassword);
        tvMsg = findViewById(R.id.tvMsg);
        tvOTPDisplay = findViewById(R.id.tvOTPDisplay);
        btnBackToLogin = findViewById(R.id.btnBackToLogin);
        layoutStep1 = findViewById(R.id.layoutStep1);
        layoutStep2 = findViewById(R.id.layoutStep2);

        viewModel = new ViewModelProvider(this).get(ForgotPasswordViewModel.class);

        showStep1();

        // Gửi OTP
        btnSendOTP.setOnClickListener(v -> {
            String identifier = edtIdentifier.getText().toString().trim();
            if (TextUtils.isEmpty(identifier)) {
                tvMsg.setText("Vui lòng nhập số điện thoại hoặc email!");
                tvMsg.setVisibility(View.VISIBLE);
                return;
            }
            tvMsg.setVisibility(View.GONE);
            viewModel.sendOTP(identifier);
        });

        // Đổi mật khẩu
        btnResetPassword.setOnClickListener(v -> {
            String identifier = edtIdentifier.getText().toString().trim();
            String otp = edtOTP.getText().toString().trim();
            String password = edtNewPassword.getText().toString().trim();
            String confirm = edtConfirmPassword.getText().toString().trim();

            if (TextUtils.isEmpty(otp)) {
                tvMsg.setText("Vui lòng nhập mã OTP!");
                tvMsg.setVisibility(View.VISIBLE);
                return;
            }

            if (TextUtils.isEmpty(password)) {
                tvMsg.setText("Vui lòng nhập mật khẩu mới!");
                tvMsg.setVisibility(View.VISIBLE);
                return;
            }

            if (password.length() < 10) {
                tvMsg.setText("Mật khẩu phải có ít nhất 10 ký tự!");
                tvMsg.setVisibility(View.VISIBLE);
                return;
            }

            if (!password.matches(".*[A-Za-z].*") || !password.matches(".*[0-9].*")) {
                tvMsg.setText("Mật khẩu phải có cả chữ và số!");
                tvMsg.setVisibility(View.VISIBLE);
                return;
            }

            if (!password.equals(confirm)) {
                tvMsg.setText("Mật khẩu xác nhận không khớp!");
                tvMsg.setVisibility(View.VISIBLE);
                return;
            }

            tvMsg.setVisibility(View.GONE);
            viewModel.resetPassword(identifier, password, otp);
        });

        // Quay lại login
        btnBackToLogin.setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        // Observe kết quả
        viewModel.getResult().observe(this, response -> {
            if (response != null && response.success) {
                tvMsg.setText(response.msg);
                tvMsg.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
                tvMsg.setVisibility(View.VISIBLE);

                if (currentStep == 1) {
                    // Hiển thị OTP
                    if (response.otp != null) {
                        tvOTPDisplay.setText("🔐 Mã OTP: " + response.otp);
                        tvOTPDisplay.setVisibility(View.VISIBLE);
                    }
                    showStep2();
                } else {
                    // Đổi mật khẩu thành công
                    tvMsg.postDelayed(() -> {
                        startActivity(new Intent(this, LoginActivity.class));
                        finish();
                    }, 2000);
                }
            } else if (response != null) {
                tvMsg.setText(response.msg);
                tvMsg.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
                tvMsg.setVisibility(View.VISIBLE);
            }
        });
    }

    private void showStep1() {
        currentStep = 1;
        layoutStep1.setVisibility(View.VISIBLE);
        layoutStep2.setVisibility(View.GONE);
        tvOTPDisplay.setVisibility(View.GONE);
        tvMsg.setVisibility(View.GONE);
    }

    private void showStep2() {
        currentStep = 2;
        layoutStep1.setVisibility(View.GONE);
        layoutStep2.setVisibility(View.VISIBLE);
    }
}
