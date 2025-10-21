package com.example.dacnapp.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.dacnapp.R;
import com.google.android.material.textfield.TextInputEditText;

public class ForgotPasswordActivity extends AppCompatActivity {

    EditText etEmailPhone;
    Button btnSend;
    TextView tvBackLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        etEmailPhone = findViewById(R.id.et_email_phone);
        btnSend = findViewById(R.id.btn_send);
        tvBackLogin = findViewById(R.id.tv_back_login);

        btnSend.setOnClickListener(v -> {
            String contact = etEmailPhone.getText().toString().trim();
            if (TextUtils.isEmpty(contact)) {
                Toast.makeText(this, "Vui lòng nhập Email hoặc Số điện thoại", Toast.LENGTH_SHORT).show();
                return;
            }

            // TODO: Gửi yêu cầu OTP tới backend ở đây
            // Nếu gửi thành công -> chuyển sang màn 2
            Intent it = new Intent(ForgotPasswordActivity.this, ForgotPasswordActivity2.class);
            it.putExtra("contact", contact);
            startActivity(it);
        });

        tvBackLogin.setOnClickListener(v -> finish());
    }
}
