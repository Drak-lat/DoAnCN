package com.example.dacnapp.data.model.product;

import java.util.List;

public class HomeResponse {
    public boolean success;
    public String message;
    public Data data;

    public static class Data {
        public List<Product> products;
        public List<Product> featuredProducts;
        public List<Product> newProducts;
        public List<Product> bestSellerProducts;
        public int totalProducts;
        public Pagination pagination;
    }

    public static class Pagination {
        public int currentPage;
        public int totalPages;
        public int totalProducts;
        public int limit;
        public boolean hasNextPage;
        public boolean hasPrevPage;
    }
}
