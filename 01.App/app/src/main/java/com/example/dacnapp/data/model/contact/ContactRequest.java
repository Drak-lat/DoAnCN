package com.example.dacnapp.data.model.contact;

public class ContactRequest {
    private String name_contact;
    private String phone_contact;
    private String text_contact;

    public ContactRequest(String name, String phone, String message) {
        this.name_contact = name;
        this.phone_contact = phone;
        this.text_contact = message;
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
}
