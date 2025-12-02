package com.example.dacnapp.data.model.order;

public class CreateOrderResponse {
    public boolean success;
    public String message;
    public OrderData data;

    public static class OrderData {
        public int id_order;
        public String order_status;
        public double total;
        public String date_order;
    }
}
