package com.example.dacnapp.ui.contact;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.dacnapp.R;
import com.example.dacnapp.data.model.contact.ContactRequest;
import com.example.dacnapp.data.model.contact.ContactResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiContact;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ContactActivity extends AppCompatActivity {
    private EditText edtName, edtPhone, edtMessage;
    private Button btnSend;
    private TextView tvResult;
    private ImageView btnBack;
    private ProgressBar progressBar;
    private ApiContact apiContact;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contact);

        // Init views
        edtName = findViewById(R.id.edtContactName);
        edtPhone = findViewById(R.id.edtContactPhone);
        edtMessage = findViewById(R.id.edtContactMessage);
        btnSend = findViewById(R.id.btnSendContact);
        tvResult = findViewById(R.id.tvContactResult);
        btnBack = findViewById(R.id.btnBackContact);
        progressBar = findViewById(R.id.progressBarContact);

        // Init API
        apiContact = ApiClient.getClient().create(ApiContact.class);

        // Back button
        btnBack.setOnClickListener(v -> finish());

        // Send button
        btnSend.setOnClickListener(v -> sendContact());
    }

    private void sendContact() {
        String name = edtName.getText().toString().trim();
        String phone = edtPhone.getText().toString().trim();
        String message = edtMessage.getText().toString().trim();

        // Validation
        if (TextUtils.isEmpty(name)) {
            tvResult.setText("Vui lòng nhập tên");
            tvResult.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
            return;
        }

        if (TextUtils.isEmpty(phone)) {
            tvResult.setText("Vui lòng nhập số điện thoại");
            tvResult.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
            return;
        }

        if (!phone.matches("^[0-9]{10,11}$")) {
            tvResult.setText("Số điện thoại không hợp lệ (10-11 số)");
            tvResult.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
            return;
        }

        if (TextUtils.isEmpty(message)) {
            tvResult.setText("Vui lòng nhập nội dung");
            tvResult.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
            return;
        }

        if (message.length() < 10) {
            tvResult.setText("Nội dung phải có ít nhất 10 ký tự");
            tvResult.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
            return;
        }

        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        btnSend.setEnabled(false);
        tvResult.setText("");

        // Create request
        ContactRequest request = new ContactRequest(name, phone, message);

        // Call API
        apiContact.createContact(request).enqueue(new Callback<ContactResponse>() {
            @Override
            public void onResponse(Call<ContactResponse> call, Response<ContactResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnSend.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    ContactResponse result = response.body();
                    if (result.success) {
                        tvResult.setText(result.message != null ? result.message : "Gửi liên hệ thành công!");
                        tvResult.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
                        
                        // Clear form
                        edtName.setText("");
                        edtPhone.setText("");
                        edtMessage.setText("");

                        Toast.makeText(ContactActivity.this, "Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm.", Toast.LENGTH_LONG).show();
                    } else {
                        tvResult.setText(result.message != null ? result.message : "Gửi thất bại");
                        tvResult.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
                    }
                } else {
                    tvResult.setText("Lỗi kết nối: " + response.code());
                    tvResult.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
                }
            }

            @Override
            public void onFailure(Call<ContactResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnSend.setEnabled(true);
                tvResult.setText("Lỗi kết nối: " + t.getMessage());
                tvResult.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
            }
        });
    }
}
