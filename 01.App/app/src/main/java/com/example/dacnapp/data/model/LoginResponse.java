package com.example.dacnapp.data.model;

public class LoginResponse {
    public boolean success;
    public String msg;
    public String token;
    public User user;

    public static class User {
        public int id_login;
        public String username;
        public int id_level;
    }
}