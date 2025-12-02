package com.example.dacnapp.data.repository;

import com.example.dacnapp.data.model.feedback.FeedbackResponse;
import com.example.dacnapp.data.model.feedback.CreateFeedbackRequest;
import com.example.dacnapp.data.model.feedback.CreateFeedbackResponse;
import com.example.dacnapp.data.network.ApiClient;
import com.example.dacnapp.data.network.ApiFeedback;
import retrofit2.Callback;

public class FeedbackRepository {
    private ApiFeedback apiFeedback;

    public FeedbackRepository() {
        apiFeedback = ApiClient.getClient().create(ApiFeedback.class);
    }

    public void getMyOrdersForFeedback(String token, Callback<FeedbackResponse> callback) {
        String authToken = "Bearer " + token;
        apiFeedback.getMyOrdersForFeedback(authToken).enqueue(callback);
    }

    public void createFeedback(String token, CreateFeedbackRequest request, Callback<CreateFeedbackResponse> callback) {
        String authToken = "Bearer " + token;
        apiFeedback.createFeedback(authToken, request).enqueue(callback);
    }
}
