package com.example.dacnapp.data.model.order;

import java.util.List;

public class CreateOrderRequest {
    private String receiver_name;
    private String receiver_phone;
    private String receiver_address;
    private String payment_method;
    private String note;
    private List<OrderItem> items;
    private Double total;
    private List<Integer> cart_item_ids;

    public static class OrderItem {
        private int id_product;
        private int quantity;
        private double price;

        public OrderItem(int id_product, int quantity, double price) {
            this.id_product = id_product;
            this.quantity = quantity;
            this.price = price;
        }

        // Getters and Setters
        public int getId_product() { return id_product; }
        public void setId_product(int id_product) { this.id_product = id_product; }
        
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
    }

    // Getters and Setters
    public String getReceiver_name() { return receiver_name; }
    public void setReceiver_name(String receiver_name) { this.receiver_name = receiver_name; }

    public String getReceiver_phone() { return receiver_phone; }
    public void setReceiver_phone(String receiver_phone) { this.receiver_phone = receiver_phone; }

    public String getReceiver_address() { return receiver_address; }
    public void setReceiver_address(String receiver_address) { this.receiver_address = receiver_address; }

    public String getPayment_method() { return payment_method; }
    public void setPayment_method(String payment_method) { this.payment_method = payment_method; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public List<Integer> getCart_item_ids() { return cart_item_ids; }
    public void setCart_item_ids(List<Integer> cart_item_ids) { this.cart_item_ids = cart_item_ids; }
}
