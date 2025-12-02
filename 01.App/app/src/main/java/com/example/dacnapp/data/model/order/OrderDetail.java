package com.example.dacnapp.data.model.order;
import com.example.dacnapp.data.model.product.Product;

public class OrderDetail {
    public int id_detail;
    public int id_order;
    public int id_product;
    public int quantity_detail;
    public float price_detail;
    public Product Product;
}
