package com.example.dacnapp.data.model.feedback;

import java.util.List;

public class ProductFeedbackResponse {
    public boolean success;
    public String message;
    public Data data;

    public static class Data {
        public List<ProductFeedback> feedbacks;
        public String avgRating;
        public int totalFeedbacks;
        public Pagination pagination;
    }

    public static class Pagination {
        public int currentPage;
        public int totalPages;
        public int limit;
    }
}
