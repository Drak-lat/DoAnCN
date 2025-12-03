
package com.example.dacnapp.data.model.message;

import java.util.List;

public class AdminResponse {
    public boolean success;
    public String message;
    public Data data;

    public static class Data {
        public List<AdminData> admins;
    }

    public static class AdminData {
        public int id_login;
        public String username;
        public Information Information;
    }

    public static class Information {
        public String name_information;
        public String avatar;
    }
}
