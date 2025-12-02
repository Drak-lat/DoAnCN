package com.example.dacnapp.data.model.cart;

public class CartResponse {
    public boolean success;
    public String message;
    public Data data;

    public static class Data {
        public Cart cart;
        public double totalAmount;
        public int totalItems;
    }
}