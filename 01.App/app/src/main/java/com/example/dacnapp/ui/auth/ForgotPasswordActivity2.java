package com.example.dacnapp.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.example.dacnapp.R;

public class ForgotPasswordActivity2 extends AppCompatActivity {
    EditText otp1, otp2, otp3, otp4, otp5, otp6;
    Button btnConfirm;
    TextView tvResend;
    ImageButton btnBack;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password_2);

        otp1 = findViewById(R.id.otp1);
        otp2 = findViewById(R.id.otp2);
        otp3 = findViewById(R.id.otp3);
        otp4 = findViewById(R.id.otp4);
        otp5 = findViewById(R.id.otp5);
        otp6 = findViewById(R.id.otp6);
        btnConfirm = findViewById(R.id.btn_confirm);
        tvResend = findViewById(R.id.tv_resend);
        btnBack = findViewById(R.id.btn_back);

        setupOtpMove();

        btnConfirm.setOnClickListener(v -> {
            String code = otp1.getText().toString().trim() +
                    otp2.getText().toString().trim() +
                    otp3.getText().toString().trim() +
                    otp4.getText().toString().trim() +
                    otp5.getText().toString().trim() +
                    otp6.getText().toString().trim();

            if (code.length() < 6) {
                Toast.makeText(this, "Nhập đủ 6 chữ số mã xác nhận", Toast.LENGTH_SHORT).show();
                return;
            }

            // TODO: Kiểm tra mã với backend
            // Nếu hợp lệ -> chuyển sang màn 3
            Intent it = new Intent(ForgotPasswordActivity2.this, ForgotPasswordActivity3.class);
            it.putExtra("otp", code);
            startActivity(it);
        });

        tvResend.setOnClickListener(v -> {
            // TODO: gọi backend để gửi lại mã
            Toast.makeText(this, "Đã gửi lại mã", Toast.LENGTH_SHORT).show();
        });

        btnBack.setOnClickListener(v -> finish());
    }

    private void setupOtpMove() {
        otp1.addTextChangedListener(new GenericTextWatcher(otp1, otp2));
        otp2.addTextChangedListener(new GenericTextWatcher(otp2, otp3));
        otp3.addTextChangedListener(new GenericTextWatcher(otp3, otp4));
        otp4.addTextChangedListener(new GenericTextWatcher(otp4, otp5));
        otp5.addTextChangedListener(new GenericTextWatcher(otp5, otp6));
        otp6.addTextChangedListener(new GenericTextWatcher(otp6, null));
    }

    private class GenericTextWatcher implements TextWatcher {
        private EditText current;
        private EditText next;

        GenericTextWatcher(EditText current, EditText next) {
            this.current = current;
            this.next = next;
        }

        @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
        @Override public void onTextChanged(CharSequence s, int start, int before, int count) {}

        public void afterTextChanged(Editable s) {
            if (s.length() == 1 && next != null) {
                next.requestFocus();
            }
        }
    }
}