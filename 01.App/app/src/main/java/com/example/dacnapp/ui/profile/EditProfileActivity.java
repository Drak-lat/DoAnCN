package com.example.dacnapp.ui.profile;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.dacnapp.R;

import java.util.regex.Pattern;

public class EditProfileActivity extends AppCompatActivity {
    private ImageView ivBack, ivAvatar;
    private TextView tvTitle;
    private EditText edtName, edtUsername, edtPhone, edtEmail, edtDateOfBirth, edtAddress;
    private Button btnSave, btnEdit;
    private ProfileViewModel viewModel;
    private boolean isViewOnly = false;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_profile);

        // Initialize views
        ivBack = findViewById(R.id.ivBack);
        ivAvatar = findViewById(R.id.ivAvatar);
        tvTitle = findViewById(R.id.tvTitle);
        edtName = findViewById(R.id.edtName);
        edtUsername = findViewById(R.id.edtUsername);
        edtPhone = findViewById(R.id.edtPhone);
        edtEmail = findViewById(R.id.edtEmail);
        edtDateOfBirth = findViewById(R.id.edtDateOfBirth);
        edtAddress = findViewById(R.id.edtAddress);
        btnSave = findViewById(R.id.btnSave);
        btnEdit = findViewById(R.id.btnEdit);

        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);

        // Get token
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        token = prefs.getString("token", null);

        // Check if view only mode
        isViewOnly = getIntent().getBooleanExtra("viewOnly", false);

        if (isViewOnly) {
            tvTitle.setText("Thông Tin Cá Nhân");
            setEditMode(false);
            btnEdit.setVisibility(View.VISIBLE);
            btnSave.setVisibility(View.GONE);
        } else {
            tvTitle.setText("Chỉnh Sửa Thông Tin");
            setEditMode(true);
            btnEdit.setVisibility(View.GONE);
            btnSave.setVisibility(View.VISIBLE);
        }

        // Username is always disabled
        edtUsername.setEnabled(false);

        // Load profile data
        if (token != null) {
            viewModel.loadProfile(token);
        }

        // Observe profile data
        viewModel.getProfileData().observe(this, response -> {
            if (response != null && response.success && response.data != null) {
                edtUsername.setText(response.data.username);
                if (response.data.information != null) {
                    edtName.setText(response.data.information.name_information);
                    edtPhone.setText(response.data.information.phone_information);
                    edtEmail.setText(response.data.information.email);
                    edtDateOfBirth.setText(response.data.information.date_of_birth);
                    // Note: address is not in the current model, keeping it empty
                }
            }
        });

        // Observe update result
        viewModel.getUpdateResult().observe(this, response -> {
            if (response != null) {
                if (response.success) {
                    Toast.makeText(this, "Cập nhật thành công!", Toast.LENGTH_SHORT).show();
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

        // Edit button (for view only mode)
        btnEdit.setOnClickListener(v -> {
            setEditMode(true);
            btnEdit.setVisibility(View.GONE);
            btnSave.setVisibility(View.VISIBLE);
            tvTitle.setText("Chỉnh Sửa Thông Tin");
        });

        // Save button
        btnSave.setOnClickListener(v -> {
            if (validateInput()) {
                String name = edtName.getText().toString().trim();
                String phone = edtPhone.getText().toString().trim();
                String email = edtEmail.getText().toString().trim();
                String dob = edtDateOfBirth.getText().toString().trim();

                viewModel.updateProfile(token, name, phone, email, dob);
            }
        });
    }

    private void setEditMode(boolean editable) {
        edtName.setEnabled(editable);
        edtPhone.setEnabled(editable);
        edtEmail.setEnabled(editable);
        edtDateOfBirth.setEnabled(editable);
        edtAddress.setEnabled(editable);
    }

    private boolean validateInput() {
        String name = edtName.getText().toString().trim();
        String phone = edtPhone.getText().toString().trim();
        String email = edtEmail.getText().toString().trim();

        if (TextUtils.isEmpty(name)) {
            Toast.makeText(this, "Vui lòng nhập họ tên!", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (TextUtils.isEmpty(phone)) {
            Toast.makeText(this, "Vui lòng nhập số điện thoại!", Toast.LENGTH_SHORT).show();
            return false;
        }

        // Validate phone format: starts with 0 and has 10 digits
        if (!Pattern.matches("^0\\d{9}$", phone)) {
            Toast.makeText(this, "Số điện thoại không hợp lệ! (Phải bắt đầu bằng 0 và có 10 chữ số)", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (TextUtils.isEmpty(email)) {
            Toast.makeText(this, "Vui lòng nhập email!", Toast.LENGTH_SHORT).show();
            return false;
        }

        // Validate email format
        if (!Pattern.matches("^[^\\s@]+@gmail\\.com$", email)) {
            Toast.makeText(this, "Email không hợp lệ! (Phải là @gmail.com)", Toast.LENGTH_SHORT).show();
            return false;
        }

        return true;
    }
}
