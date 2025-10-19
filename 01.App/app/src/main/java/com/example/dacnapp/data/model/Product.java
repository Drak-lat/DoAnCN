package com.example.dacnapp.data.model;

public class Product {
    private int id_product;
    private String name_product;
    private double price;
    private String image_product;
    private int quantity;
    private String dimension;
    private String manufacturer;
    private int page;
    private String author;
    private String publisher;
    private int publisher_year;
    private String text_product;
    private String size;
    private int id_category;

    // === Constructor đầy đủ ===
    public Product(int id_product, String name_product, double price, String image_product,
                   int quantity, String dimension, String manufacturer, int page,
                   String author, String publisher, int publisher_year,
                   String text_product, String size, int id_category) {
        this.id_product = id_product;
        this.name_product = name_product;
        this.price = price;
        this.image_product = image_product;
        this.quantity = quantity;
        this.dimension = dimension;
        this.manufacturer = manufacturer;
        this.page = page;
        this.author = author;
        this.publisher = publisher;
        this.publisher_year = publisher_year;
        this.text_product = text_product;
        this.size = size;
        this.id_category = id_category;
    }

    // === Getter ===
    public int getId_product() {
        return id_product;
    }

    public String getName_product() {
        return name_product;
    }

    public double getPrice() {
        return price;
    }

    public String getImage_product() {
        return image_product;
    }

    public int getQuantity() {
        return quantity;
    }

    public String getDimension() {
        return dimension;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public int getPage() {
        return page;
    }

    public String getAuthor() {
        return author;
    }

    public String getPublisher() {
        return publisher;
    }

    public int getPublisher_year() {
        return publisher_year;
    }

    public String getText_product() {
        return text_product;
    }

    public String getSize() {
        return size;
    }

    public int getId_category() {
        return id_category;
    }

    // === Setter (nếu cần chỉnh sửa từ code) ===
    public void setId_product(int id_product) {
        this.id_product = id_product;
    }

    public void setName_product(String name_product) {
        this.name_product = name_product;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setImage_product(String image_product) {
        this.image_product = image_product;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setDimension(String dimension) {
        this.dimension = dimension;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public void setPublisher_year(int publisher_year) {
        this.publisher_year = publisher_year;
    }

    public void setText_product(String text_product) {
        this.text_product = text_product;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public void setId_category(int id_category) {
        this.id_category = id_category;
    }
}
