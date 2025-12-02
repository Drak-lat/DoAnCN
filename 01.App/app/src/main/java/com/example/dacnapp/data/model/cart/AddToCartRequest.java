package com.example.dacnapp.data.model.cart;

public class AddToCartRequest {
    public int id_product;
    public int quantity;

    public AddToCartRequest(int id_product, int quantity) {
        this.id_product = id_product;
        this.quantity = quantity;
    }
}