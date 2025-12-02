package com.example.dacnapp.ui.profile;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.dacnapp.R;
import com.example.dacnapp.ui.auth.LoginActivity;

public class ProfileDetailActivity extends AppCompatActivity {
    private ImageView ivBack, ivAvatar;
    private TextView tvUsername, tvName, tvPhone, tvEmail, tvDateOfBirth;
    private LinearLayout btnEditProfile, btnChangePassword;
    private Button btnLogout;
    private ProfileViewModel viewModel;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile_detail);

        // Initialize views
        ivBack = findViewById(R.id.ivBack);
        ivAvatar = findViewById(R.id.ivAvatar);
        tvUsername = findViewById(R.id.tvUsername);
        tvName = findViewById(R.id.tvName);
        tvPhone = findViewById(R.id.tvPhone);
        tvEmail = findViewById(R.id.tvEmail);
        tvDateOfBirth = findViewById(R.id.tvDateOfBirth);
        btnEditProfile = findViewById(R.id.btnEditProfile);
        btnChangePassword = findViewById(R.id.btnChangePassword);
        btnLogout = findViewById(R.id.btnLogout);

        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);

        // Get token
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        token = prefs.getString("token", null);

        // Load profile data
        if (token != null) {
            viewModel.loadProfile(token);
        }

        // Observe profile data
        viewModel.getProfileData().observe(this, response -> {
            if (response != null && response.success && response.data != null) {
                tvUsername.setText(response.data.username);
                if (response.data.information != null) {
                    tvName.setText(response.data.information.name_information != null ? 
                        response.data.information.name_information : "Chưa cập nhật");
                    tvPhone.setText(response.data.information.phone_information != null ? 
                        response.data.information.phone_information : "Chưa cập nhật");
                    tvEmail.setText(response.data.information.email != null ? 
                        response.data.information.email : "Chưa cập nhật");
                    tvDateOfBirth.setText(response.data.information.date_of_birth != null ? 
                        response.data.information.date_of_birth : "Chưa cập nhật");
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

        // Edit profile button
        btnEditProfile.setOnClickListener(v -> {
            startActivity(new Intent(this, EditProfileActivity.class));
        });

        // Change password button
        btnChangePassword.setOnClickListener(v -> {
            startActivity(new Intent(this, ChangePasswordActivity.class));
        });

        // Logout button
        btnLogout.setOnClickListener(v -> {
            getSharedPreferences("auth", MODE_PRIVATE).edit().clear().apply();
            Intent intent = new Intent(this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Reload profile when returning from edit screen
        if (token != null) {
            viewModel.loadProfile(token);
        }
    }
}
