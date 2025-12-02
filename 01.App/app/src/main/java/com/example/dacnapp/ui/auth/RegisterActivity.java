package com.example.dacnapp.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import com.example.dacnapp.R;

public class RegisterActivity extends AppCompatActivity {
    private EditText edtUsername, edtPassword, edtRePassword, edtPhone, edtEmail;
    private Button btnRegister;
    private TextView tvMsg, btnGoToLogin, tvRegisterTypeNote;
    private RegisterViewModel viewModel;
    // trạng thái đăng ký: true = phone, false = email
    private boolean isPhoneRegister = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        edtUsername = findViewById(R.id.edtUsername);
        edtPassword = findViewById(R.id.edtPassword);
        edtRePassword = findViewById(R.id.edtRePassword);
        edtPhone = findViewById(R.id.edtPhone);
        edtEmail = findViewById(R.id.edtEmail);
        btnRegister = findViewById(R.id.btnRegister);
        tvMsg = findViewById(R.id.tvMsg);
        btnGoToLogin = findViewById(R.id.btnGoToLogin);
        tvRegisterTypeNote = findViewById(R.id.tvRegisterTypeNote);

        viewModel = new ViewModelProvider(this).get(RegisterViewModel.class);

        // Mặc định đăng ký bằng SĐT
        isPhoneRegister = true;
        edtPhone.setVisibility(View.VISIBLE);
        edtEmail.setVisibility(View.GONE);
        tvRegisterTypeNote.setText("Đăng ký bằng Email?");

        tvRegisterTypeNote.setOnClickListener(v -> {
            if (isPhoneRegister) {
                // Chuyển sang email
                isPhoneRegister = false;
                edtPhone.setVisibility(View.GONE);
                edtEmail.setVisibility(View.VISIBLE);
                tvRegisterTypeNote.setText("Đăng ký bằng SĐT?");
            } else {
                // Chuyển sang SĐT
                isPhoneRegister = true;
                edtPhone.setVisibility(View.VISIBLE);
                edtEmail.setVisibility(View.GONE);
                tvRegisterTypeNote.setText("Đăng ký bằng Email?");
            }
        });

        // Support button handler  
        LinearLayout supportLayout = findViewById(R.id.supportLayout);
        if (supportLayout != null) {
            supportLayout.setOnClickListener(v -> {
                Intent intent = new Intent(RegisterActivity.this, com.example.dacnapp.ui.contact.ContactActivity.class);
                startActivity(intent);
            });
        }

        btnGoToLogin.setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        btnRegister.setOnClickListener(v -> {
            String username = edtUsername.getText().toString().trim();
            String password = edtPassword.getText().toString().trim();
            String rePassword = edtRePassword.getText().toString().trim();
            String phone = isPhoneRegister ? edtPhone.getText().toString().trim() : null;
            String email = isPhoneRegister ? null : edtEmail.getText().toString().trim();

            if (TextUtils.isEmpty(username)) {
                tvMsg.setText("Vui lòng nhập tên đăng nhập");
                return;
            }
            
            // ✅ THÊM: Validate mật khẩu
            if (TextUtils.isEmpty(password)) {
                tvMsg.setText("Vui lòng nhập mật khẩu");
                return;
            }
            if (password.length() < 10) {
                tvMsg.setText("Mật khẩu phải có ít nhất 10 ký tự!");
                return;
            }
            if (!password.matches(".*[A-Za-z].*") || !password.matches(".*[0-9].*")) {
                tvMsg.setText("Mật khẩu phải có cả chữ và số!");
                return;
            }
            
            if (TextUtils.isEmpty(rePassword) || !password.equals(rePassword)) {
                tvMsg.setText("Mật khẩu nhập lại không khớp");
                return;
            }
            
            // ✅ THÊM: Validate SĐT
            if (isPhoneRegister) {
                if (TextUtils.isEmpty(phone)) {
                    tvMsg.setText("Vui lòng nhập số điện thoại");
                    return;
                }
                if (!phone.matches("^0\\d{9}$")) {
                    tvMsg.setText("SĐT phải bắt đầu bằng 0 và có 10 số!");
                    return;
                }
            }
            
            // ✅ THÊM: Validate Email
            if (!isPhoneRegister) {
                if (TextUtils.isEmpty(email)) {
                    tvMsg.setText("Vui lòng nhập email");
                    return;
                }
                if (!email.matches("^[^\\s@]+@gmail\\.com$")) {
                    tvMsg.setText("Email phải là Gmail!");
                    return;
                }
            }

            viewModel.register(username, password, phone, email);
        });

        viewModel.getRegisterResult().observe(this, response -> {
            if (response != null && response.success) {
                tvMsg.setText(response.msg != null ? response.msg : "Đăng ký thành công!");
                startActivity(new Intent(this, LoginActivity.class));
                finish();
            } else if (response != null) {
                tvMsg.setText(response.msg != null ? response.msg : "Đăng ký thất bại!");
            } else {
                tvMsg.setText("Lỗi kết nối server!");
            }
        });
    }
}