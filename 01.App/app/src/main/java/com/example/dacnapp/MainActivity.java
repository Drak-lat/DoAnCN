package com.example.dacnapp;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.Toast;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Kiểm tra đăng nhập
        String token = getSharedPreferences("auth", MODE_PRIVATE).getString("token", null);
        if (token == null) {
            startActivity(new Intent(this, com.example.dacnapp.ui.auth.LoginActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.activity_main);
        
        BottomNavigationView navView = findViewById(R.id.nav_view);
        AppBarConfiguration appBarConfiguration = new AppBarConfiguration.Builder(
                R.id.navigation_home, 
                R.id.navigation_dashboard, 
                R.id.navigation_notifications,
                R.id.navigation_cart,        // ✅ THÊM
                R.id.navigation_account)     // ✅ THÊM
                .build();
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_activity_main);
        NavigationUI.setupWithNavController(navView, navController);
        
        // ✅ THÊM: Xử lý nút Search
        ImageView btnSearch = findViewById(R.id.btnSearch);
        btnSearch.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, com.example.dacnapp.ui.search.SearchActivity.class);
            startActivity(intent);
        });
    }
}