package com.example.dacnapp.ui.checkout;

import java.io.Serializable;

public class CheckoutItem implements Serializable {
    private int id_product;
    private String name_product;
    private String author;
    private String image_product;
    private double price;
    private int quantity;
    private Integer cartDetailId; // Null nếu là direct order

    public CheckoutItem(int id_product, String name_product, String author, String image_product, double price, int quantity) {
        this.id_product = id_product;
        this.name_product = name_product;
        this.author = author;
        this.image_product = image_product;
        this.price = price;
        this.quantity = quantity;
    }

    // Getters and Setters
    public int getId_product() { return id_product; }
    public void setId_product(int id_product) { this.id_product = id_product; }
    
    public String getName_product() { return name_product; }
    public void setName_product(String name_product) { this.name_product = name_product; }
    
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public String getImage_product() { return image_product; }
    public void setImage_product(String image_product) { this.image_product = image_product; }
    
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    
    public Integer getCartDetailId() { return cartDetailId; }
    public void setCartDetailId(Integer cartDetailId) { this.cartDetailId = cartDetailId; }
}
