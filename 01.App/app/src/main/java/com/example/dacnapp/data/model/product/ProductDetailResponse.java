package com.example.dacnapp.data.model.product;

import java.util.List;

public class ProductDetailResponse {
    public boolean success;
    public String message;
    public Data data;

    public static class Data {
        public ProductDetail product;
        public List<Product> relatedProducts;
    }

    public static class ProductDetail {
        public int id_product;
        public String name_product;
        public double price;
        public String image_product;
        public int quantity;
        public String dimension;
        public String manufacturer;
        public int page;
        public String author;
        public String publisher;
        public int publisher_year;
        public String text_product;
        public String size;
        public int id_category;
        public Category Category;
        public SalesStats salesStats;
    }

    public static class Category {
        public int id_category;
        public String name_category;
    }

    public static class SalesStats {
        public int orderCount;
        public int totalSold;
    }
}
