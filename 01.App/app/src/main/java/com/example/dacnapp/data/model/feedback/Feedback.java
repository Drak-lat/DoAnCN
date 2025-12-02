package com.example.dacnapp.data.model.feedback;
import com.example.dacnapp.data.model.product.Product;
public class Feedback {
    public int id_feedback;
    public int id_product;
    public int id_login;
    public int id_order;
    public int rating;
    public String comment;
    public String created_at;
    public String admin_reply;
    public String reply_at;
    public Product Product;
}
