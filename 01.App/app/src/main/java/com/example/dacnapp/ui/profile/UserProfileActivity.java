package com.example.dacnapp.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.example.dacnapp.R;
import com.example.dacnapp.ui.auth.LoginActivity;
import com.example.dacnapp.utils.SessionManager;
import com.example.dacnapp.network.ApiService;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserProfileActivity extends AppCompatActivity {

    TextView fullName, username, birthday, address, phone, email;
    ImageView btnEdit, btnChangePassword, btnDeleteAccount, btnLogout;
    SessionManager session;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_profile);

        session = new SessionManager(this);

        // Ánh xạ TextView
        fullName = findViewById(R.id.fullName);
        username = findViewById(R.id.username);
        birthday = findViewById(R.id.birthday);
        address = findViewById(R.id.address);
        phone = findViewById(R.id.phone);
        email = findViewById(R.id.email);

        // Ánh xạ ImageView
        btnEdit = findViewById(R.id.btnEdit);
        btnChangePassword = findViewById(R.id.btnChangePassword);
        btnDeleteAccount = findViewById(R.id.btnDeleteAccount);
        btnLogout = findViewById(R.id.btnLogout);

        // Gán dữ liệu mẫu (thay bằng dữ liệu thực tế)
        fullName.setText("Nguyễn Văn A");
        username.setText("nguyenvana");
        birthday.setText("01/01/1990");
        address.setText("123 Đường ABC, Quận 1, TP.HCM");
        phone.setText("0909123456");
        email.setText("nguyenvana@email.com");

        btnEdit.setOnClickListener(v ->
                Toast.makeText(this, "Chỉnh sửa thông tin", Toast.LENGTH_SHORT).show()
        );

        btnChangePassword.setOnClickListener(v -> {
            // nếu có activity đổi mật khẩu, start Intent ở đây
            Toast.makeText(this, "Mở đổi mật khẩu", Toast.LENGTH_SHORT).show();
        });

        btnDeleteAccount.setOnClickListener(v ->
                Toast.makeText(this, "Xóa tài khoản", Toast.LENGTH_SHORT).show()
        );

        btnLogout.setOnClickListener(v -> confirmLogout());

        btnChangePassword.setOnClickListener(v -> {
            Intent i = new Intent(UserProfileActivity.this, ChangePasswordActivity.class);
            startActivity(i);
        });
    }

    private void confirmLogout() {
        new AlertDialog.Builder(this)
                .setTitle("Đăng xuất")
                .setMessage("Bạn có chắc muốn đăng xuất?")
                .setNegativeButton("Huỷ", null)
                .setPositiveButton("Đăng xuất", (dialog, which) -> performLogout())
                .show();
    }

    private void performLogout() {
        final String token = session.getToken();
        if (token == null) {
            finishLogout();
            return;
        }

        // Gọi API logout (best-effort). Nếu bạn không muốn gọi backend, bỏ phần này và gọi finishLogout() trực tiếp.
        try {
            Retrofit retrofit = new Retrofit.Builder()
                    .baseUrl("http://10.0.2.2:3000/") // emulator -> host dev. Thay bằng địa chỉ backend nếu cần.
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
            ApiService api = retrofit.create(ApiService.class);
            Call<Void> call = api.logout("Bearer " + token);
            call.enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    // ignore response code; proceed to clear local session
                    finishLogout();
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    // mạng lỗi -> vẫn logout local
                    finishLogout();
                }
            });
        } catch (Exception e) {
            // nếu có lỗi cấu hình mạng/retrofit -> logout local
            finishLogout();
        }
    }

    private void finishLogout() {
        session.clear();
        Intent intent = new Intent(UserProfileActivity.this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        // optional: finish this activity
        finish();
    }
}