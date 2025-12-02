package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.feedback.FeedbackResponse;
import com.example.dacnapp.data.model.feedback.CreateFeedbackRequest;
import com.example.dacnapp.data.model.feedback.CreateFeedbackResponse;
import com.example.dacnapp.data.model.feedback.ProductFeedbackResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiFeedback {
    @GET("customer/my-orders-feedback")
    Call<FeedbackResponse> getMyOrdersForFeedback(
            @Header("Authorization") String token
    );

    @POST("customer/feedbacks")
    Call<CreateFeedbackResponse> createFeedback(
            @Header("Authorization") String token,
            @Body CreateFeedbackRequest request
    );

    @GET("customer/products/{productId}/feedbacks")
    Call<ProductFeedbackResponse> getProductFeedbacks(
            @Path("productId") int productId,
            @Query("page") int page,
            @Query("limit") int limit
    );
}
