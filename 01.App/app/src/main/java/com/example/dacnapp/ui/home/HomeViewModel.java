package com.example.dacnapp.ui.home;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.product.HomeResponse;
import com.example.dacnapp.data.repository.ProductRepository;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeViewModel extends ViewModel {
    private ProductRepository repository = new ProductRepository();
    private MutableLiveData<HomeResponse> homeData = new MutableLiveData<>();
    private MutableLiveData<String> errorMessage = new MutableLiveData<>();

    public LiveData<HomeResponse> getHomeData() {
        return homeData;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public void loadHomeData(int limit, int page, String sort) {
        repository.getHomeData(limit, page, sort, new Callback<HomeResponse>() {
            @Override
            public void onResponse(Call<HomeResponse> call, Response<HomeResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    homeData.postValue(response.body());
                } else {
                    errorMessage.postValue("Không thể tải dữ liệu!");
                }
            }

            @Override
            public void onFailure(Call<HomeResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }
}