package com.example.dacnapp.data.model.message;

import java.util.List;

public class MessageResponse {
    public boolean success;
    public String message;
    public Data data;

    public static class Data {
        public List<MessageData> messages;
    }

    public static class MessageData {
        public int id_message;
        public int id_sender;
        public int id_receiver;
        public String content;
        public String created_at;
        public Sender Sender;
        public Receiver Receiver;
    }

    public static class Sender {
        public int id_login;
        public String username;
        public int id_level;
        public Information Information;
    }

    public static class Receiver {
        public int id_login;
        public String username;
        public int id_level;
        public Information Information;
    }

    public static class Information {
        public String name_information;
    }
}
