package com.example.dacnapp.data.model.category;

import com.example.dacnapp.data.model.product.Product;
import java.util.List;

public class CategoryProductsResponse {
    public boolean success;
    public String message;
    public Data data;

    public static class Data {
        public Category category;
        public List<Product> products;
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