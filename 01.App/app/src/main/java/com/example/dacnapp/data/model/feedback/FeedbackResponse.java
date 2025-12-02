package com.example.dacnapp.data.model.feedback;

import com.example.dacnapp.data.model.product.Product;
import java.util.List;

public class FeedbackResponse {
    public boolean success;
    public String message;
    public Data data;

    public static class Data {
        public List<OrderForFeedback> orders;
    }

    public static class OrderForFeedback {
        public int id_order;
        public int id_login;
        public String receiver_name;
        public float total;
        public String date_order;
        public String order_status;
        public List<OrderDetailForFeedback> OrderDetails;
    }

    public static class OrderDetailForFeedback {
        public int id_detail;
        public int id_order;
        public int id_product;
        public int quantity_detail;
        public float price_detail;
        public boolean hasFeedback;
        public Product Product;
    }
}
