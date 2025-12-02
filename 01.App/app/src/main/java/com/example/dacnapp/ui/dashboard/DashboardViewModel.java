package com.example.dacnapp.ui.dashboard;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.category.Category;
import com.example.dacnapp.data.model.category.CategoryResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiCategory;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class DashboardViewModel extends ViewModel {
    private ApiCategory apiCategory = ApiClient.getClient().create(ApiCategory.class);
    private MutableLiveData<List<Category>> categories = new MutableLiveData<>();
    private MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private MutableLiveData<Boolean> loading = new MutableLiveData<>();

    public LiveData<List<Category>> getCategories() {
        return categories;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<Boolean> getLoading() {
        return loading;
    }

    public void loadCategories() {
        loading.setValue(true);
        apiCategory.getCategories().enqueue(new Callback<CategoryResponse>() {
            @Override
            public void onResponse(Call<CategoryResponse> call, Response<CategoryResponse> response) {
                loading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success && response.body().data != null) {
                        categories.setValue(response.body().data);
                    } else {
                        errorMessage.setValue(response.body().message);
                    }
                } else {
                    errorMessage.setValue("Không thể tải danh mục");
                }
            }

            @Override
            public void onFailure(Call<CategoryResponse> call, Throwable t) {
                loading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }
}