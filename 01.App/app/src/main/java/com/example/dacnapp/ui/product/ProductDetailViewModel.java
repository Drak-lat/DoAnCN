package com.example.dacnapp.ui.product;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import com.example.dacnapp.data.model.product.ProductDetailResponse;
import com.example.dacnapp.data.model.product.Product;
import com.example.dacnapp.data.model.feedback.ProductFeedbackResponse;
import com.example.dacnapp.data.repository.ProductRepository;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiFeedback;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class ProductDetailViewModel extends ViewModel {
    private ProductRepository repository = new ProductRepository();
    private ApiFeedback apiFeedback = ApiClient.getClient().create(ApiFeedback.class);
    
    private MutableLiveData<ProductDetailResponse.ProductDetail> productData = new MutableLiveData<>();
    private MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private MutableLiveData<List<Product>> relatedProducts = new MutableLiveData<>();
    private MutableLiveData<ProductFeedbackResponse> productFeedbacks = new MutableLiveData<>();

    public LiveData<ProductDetailResponse.ProductDetail> getProductData() {
        return productData;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<List<Product>> getRelatedProducts() {
        return relatedProducts;
    }

    public LiveData<ProductFeedbackResponse> getProductFeedbacks() {
        return productFeedbacks;
    }

    public void loadProductDetail(String token, int productId) {
        repository.getProductDetail(token, productId, new Callback<ProductDetailResponse>() {
            @Override
            public void onResponse(Call<ProductDetailResponse> call, Response<ProductDetailResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    if (response.body().success && response.body().data != null) {
                        productData.postValue(response.body().data.product);
                        if (response.body().data.relatedProducts != null) {
                            relatedProducts.postValue(response.body().data.relatedProducts);
                        }
                    } else {
                        errorMessage.postValue(response.body().message);
                    }
                } else {
                    errorMessage.postValue("Không thể tải thông tin sản phẩm");
                }
            }

            @Override
            public void onFailure(Call<ProductDetailResponse> call, Throwable t) {
                errorMessage.postValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    public void loadProductFeedbacks(int productId, int page, int limit) {
        apiFeedback.getProductFeedbacks(productId, page, limit).enqueue(new Callback<ProductFeedbackResponse>() {
            @Override
            public void onResponse(Call<ProductFeedbackResponse> call, Response<ProductFeedbackResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().success) {
                    productFeedbacks.postValue(response.body());
                }
            }

            @Override
            public void onFailure(Call<ProductFeedbackResponse> call, Throwable t) {
                // Silent fail
            }
        });
    }
}
