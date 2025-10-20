package com.example.dacnapp.ui.auth;

import android.util.Log;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.LoginResponse;
import com.example.dacnapp.utils.SessionManager;

public class LoginActivity extends AppCompatActivity {
    private EditText edtPhone, edtEmail, edtPassword;
    private Button btnLogin;
    private TextView tvMsg, btnGoToRegister, tvLoginTypeNote;
    private LoginViewModel viewModel;
    // trạng thái loginType: true = phone, false = email
    private boolean isPhoneLogin = true;

    private SessionManager session;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // init session manager
        session = new SessionManager(this);

        edtPhone = findViewById(R.id.edtPhone);
        edtEmail = findViewById(R.id.edtEmail);
        edtPassword = findViewById(R.id.edtPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvMsg = findViewById(R.id.tvMsg);
        btnGoToRegister = findViewById(R.id.btnGoToRegister);
        tvLoginTypeNote = findViewById(R.id.tvLoginTypeNote);

        viewModel = new ViewModelProvider(this).get(LoginViewModel.class);

        // Mặc định là SĐT, hiện nút hỏi đăng nhập bằng email
        isPhoneLogin = true;
        edtPhone.setVisibility(View.VISIBLE);
        edtEmail.setVisibility(View.GONE);
        tvLoginTypeNote.setText("Đăng nhập bằng Email?");

        tvLoginTypeNote.setOnClickListener(v -> {
            if (isPhoneLogin) {
                // Chuyển sang email
                isPhoneLogin = false;
                edtPhone.setVisibility(View.GONE);
                edtEmail.setVisibility(View.VISIBLE);
                tvLoginTypeNote.setText("Đăng nhập bằng SĐT?");
            } else {
                // Chuyển sang SĐT
                isPhoneLogin = true;
                edtPhone.setVisibility(View.VISIBLE);
                edtEmail.setVisibility(View.GONE);
                tvLoginTypeNote.setText("Đăng nhập bằng Email?");
            }
        });

        btnLogin.setOnClickListener(v -> {
            String identifier;
            if (isPhoneLogin) {
                identifier = edtPhone.getText().toString().trim();
            } else {
                identifier = edtEmail.getText().toString().trim();
            }
            String password = edtPassword.getText().toString().trim();

            if (TextUtils.isEmpty(identifier)) {
                tvMsg.setText(isPhoneLogin ? "Vui lòng nhập SĐT" : "Vui lòng nhập Email");
                return;
            }
            if (TextUtils.isEmpty(password)) {
                tvMsg.setText("Vui lòng nhập mật khẩu");
                return;
            }

            btnLogin.setEnabled(false);
            tvMsg.setText("");
            viewModel.login(identifier, password);
        });

        viewModel.getLoginResult().observe(this, response -> {
            btnLogin.setEnabled(true);
            Log.d("AUTH_DEBUG", "login response: " + String.valueOf(response));
            if (response != null && response.success) {
                // lưu token nếu có
                String token = null;
                try {
                    token = response.token;
                } catch (Exception ignored) {}

                if (token == null || token.isEmpty()) {
                    // fallback: try other places (if your model differs)
                    // (extend here if server returns different field)
                }

                if (token != null && !token.isEmpty()) {
                    session.saveToken(token);
                    Log.d("AUTH_DEBUG", "saved token from login: " + token);
                    Log.d("AUTH_DEBUG", "read back token (SessionManager): " + session.getToken());
                } else {
                    Log.w("AUTH_DEBUG", "No token found in login response");
                }

                if (response.user != null && response.user.id_level == 2) {
                    tvMsg.setText("Đăng nhập thành công!");
                    startActivity(new Intent(this, com.example.dacnapp.MainActivity.class));
                    finish();
                } else {
                    tvMsg.setText("Chỉ khách hàng mới được đăng nhập ứng dụng!");
                }
            } else if (response != null) {
                tvMsg.setText(response.msg != null ? response.msg : "Đăng nhập thất bại!");
            } else {
                tvMsg.setText("Lỗi kết nối server!");
            }
        });

        btnGoToRegister.setOnClickListener(v -> {
            startActivity(new Intent(this, RegisterActivity.class));
        });
    }
}