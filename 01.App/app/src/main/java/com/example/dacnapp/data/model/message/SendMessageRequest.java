package com.example.dacnapp.data.model.message;

public class SendMessageRequest {
    private String content;
    private int adminId; // ✅ THÊM adminId

    public SendMessageRequest(String content, int adminId) {
        this.content = content;
        this.adminId = adminId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getAdminId() {
        return adminId;
    }

    public void setAdminId(int adminId) {
        this.adminId = adminId;
    }
}
