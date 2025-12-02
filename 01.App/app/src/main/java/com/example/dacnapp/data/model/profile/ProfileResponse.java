package com.example.dacnapp.data.model.profile;

public class ProfileResponse {
    public boolean success;
    public String msg;
    public Data data;

    public static class Data {
        public int id_login;
        public String username;
        public int id_level;
        public String date_register;
        public Information information;
    }

    public static class Information {
        public int id_information;
        public String name_information;
        public String phone_information;
        public String email;
        public String date_of_birth;
        public String avatar;
    }
}
