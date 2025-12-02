package com.example.dacnapp.data.model.feedback;

public class ProductFeedback {
    public int id_feedback;
    public int id_product;
    public int id_login;
    public int rating;
    public String comment;
    public String created_at;
    public String admin_reply;
    public String reply_at;
    public LoginInfo Login;

    public static class LoginInfo {
        public String username;
        public InformationInfo Information;
    }

    public static class InformationInfo {
        public String name_information;
    }
}
