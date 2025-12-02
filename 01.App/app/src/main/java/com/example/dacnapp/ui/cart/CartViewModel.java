package com.example.dacnapp.ui.cart;

import android.app.Application;
import android.content.SharedPreferences;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.example.dacnapp.data.model.cart.CartResponse;
import com.example.dacnapp.data.model.cart.AddToCartRequest;
import com.example.dacnapp.data.model.cart.AddToCartResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiCart;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CartViewModel extends AndroidViewModel {
    private ApiCart apiCart = ApiClient.getClient().create(ApiCart.class);
    private MutableLiveData<CartResponse> cart = new MutableLiveData<>();
    private MutableLiveData<Boolean> loading = new MutableLiveData<>();
    private MutableLiveData<String> message = new MutableLiveData<>();
    private String token;

    public CartViewModel(@NonNull Application application) {
        super(application);
        SharedPreferences prefs = application.getSharedPreferences("auth", 0);
        token = "Bearer " + prefs.getString("token", "");
    }

    public LiveData<CartResponse> getCart() {
        return cart;
    }

    public LiveData<Boolean> getLoading() {
        return loading;
    }

    public LiveData<String> getMessage() {
        return message;
    }

    public void loadCart() {
        loading.setValue(true);
        apiCart.getCart(token).enqueue(new Callback<CartResponse>() {
            @Override
            public void onResponse(Call<CartResponse> call, Response<CartResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success) {
                        cart.setValue(response.body());
                    }
                }
            }

            @Override
            public void onFailure(Call<CartResponse> call, Throwable t) {
                loading.setValue(false);
                message.setValue("Lỗi: " + t.getMessage());
            }
        });
    }

    public void updateCartItem(int id_cartdetail, int quantity) {
        loading.setValue(true);
        AddToCartRequest request = new AddToCartRequest(0, quantity);
        
        apiCart.updateCartItem(token, id_cartdetail, request).enqueue(new Callback<AddToCartResponse>() {
            @Override
            public void onResponse(Call<AddToCartResponse> call, Response<AddToCartResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success) {
                        loadCart(); // Reload cart
                    } else {
                        message.setValue(response.body().message);
                    }
                }
            }

            @Override
            public void onFailure(Call<AddToCartResponse> call, Throwable t) {
                loading.setValue(false);
                message.setValue("Lỗi: " + t.getMessage());
            }
        });
    }

    public void removeFromCart(int id_cartdetail) {
        loading.setValue(true);
        apiCart.removeFromCart(token, id_cartdetail).enqueue(new Callback<AddToCartResponse>() {
            @Override
            public void onResponse(Call<AddToCartResponse> call, Response<AddToCartResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success) {
                        message.setValue("Đã xóa sản phẩm");
                        loadCart(); // Reload cart
                    }
                }
            }

            @Override
            public void onFailure(Call<AddToCartResponse> call, Throwable t) {
                loading.setValue(false);
                message.setValue("Lỗi: " + t.getMessage());
            }
        });
    }
}
