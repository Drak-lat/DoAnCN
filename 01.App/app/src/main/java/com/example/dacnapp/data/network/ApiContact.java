package com.example.dacnapp.data.network;

import com.example.dacnapp.data.model.contact.ContactRequest;
import com.example.dacnapp.data.model.contact.ContactResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface ApiContact {
    @POST("customer/contact")
    Call<ContactResponse> createContact(@Body ContactRequest request);
}