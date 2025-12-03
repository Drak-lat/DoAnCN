package com.example.dacnapp.data.model.paypal;

import com.google.gson.annotations.SerializedName;

public class PaypalResponse {
    @SerializedName("paymentUrl")
    private String paymentUrl;

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }
}
