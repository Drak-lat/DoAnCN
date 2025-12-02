package com.example.dacnapp.data.model.order;


import java.util.List;

public class OrderDetailResponse {
    public boolean success;
    public String message;
    public OrderData data;

    public static class OrderData {
        public int id_order;
        public int id_login;
        public String receiver_name;
        public String receiver_phone;
        public String receiver_address;
        public float total;
        public String date_order;
        public String payment_status;
        public String payment_method;
        public String order_status;
        public String note;
        public List<OrderDetail> OrderDetails;
    }
}
