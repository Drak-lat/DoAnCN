package com.example.dacnapp.ui.auth;

import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.example.dacnapp.R;

public class ForgotPasswordActivity3 extends AppCompatActivity {
        EditText etNewPass, etConfirm;
        Button btnSubmit;

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_forgot_password_3);

            etNewPass = findViewById(R.id.et_new_password);
            etConfirm = findViewById(R.id.et_confirm_password);
            btnSubmit = findViewById(R.id.btn_submit_password);

            btnSubmit.setOnClickListener(v -> {
                String newPass = etNewPass.getText().toString().trim();
                String confirm = etConfirm.getText().toString().trim();

                if (TextUtils.isEmpty(newPass) || TextUtils.isEmpty(confirm)) {
                    Toast.makeText(this, "Vui lòng nhập đầy đủ", Toast.LENGTH_SHORT).show();
                    return;
                }
                if (!newPass.equals(confirm)) {
                    Toast.makeText(this, "Mật khẩu xác nhận không khớp", Toast.LENGTH_SHORT).show();
                    return;
                }

                // TODO: Gọi API backend để cập nhật mật khẩu
                Toast.makeText(this, "Đổi mật khẩu thành công", Toast.LENGTH_SHORT).show();
                finish(); // về login hoặc trang trước
            });
        }
    }