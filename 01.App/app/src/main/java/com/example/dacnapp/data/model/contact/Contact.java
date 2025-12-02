package com.example.dacnapp.data.model;

public class Contact {
    private int id_contact;
    private String name_contact;
    private String phone_contact;
    private String text_contact;
    private String date_contact;

    // Getters and Setters
    public int getId_contact() {
        return id_contact;
    }

    public void setId_contact(int id_contact) {
        this.id_contact = id_contact;
    }

    public String getName_contact() {
        return name_contact;
    }

    public void setName_contact(String name_contact) {
        this.name_contact = name_contact;
    }

    public String getPhone_contact() {
        return phone_contact;
    }

    public void setPhone_contact(String phone_contact) {
        this.phone_contact = phone_contact;
    }

    public String getText_contact() {
        return text_contact;
    }

    public void setText_contact(String text_contact) {
        this.text_contact = text_contact;
    }

    public String getDate_contact() {
        return date_contact;
    }

    public void setDate_contact(String date_contact) {
        this.date_contact = date_contact;
    }
}
