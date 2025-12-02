package com.example.dacnapp.data.model.feedback;

public class CreateFeedbackRequest {
    public int id_product;
    public int id_order;
    public int rating;
    public String comment;

    public CreateFeedbackRequest(int id_product, int id_order, int rating, String comment) {
        this.id_product = id_product;
        this.id_order = id_order;
        this.rating = rating;
        this.comment = comment;
    }
}
