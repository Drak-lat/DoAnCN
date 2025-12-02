package com.example.dacnapp.ui.notifications;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.dacnapp.R;
import com.example.dacnapp.data.model.message.MessageResponse;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MessageAdapter extends RecyclerView.Adapter<MessageAdapter.ViewHolder> {
    private static final String TAG = "MessageAdapter";
    private List<MessageResponse.MessageData> messages = new ArrayList<>();
    private int currentUserId;
    private Context context;

    public MessageAdapter(Context context) {
        this.context = context;
        // Lấy user ID từ SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences("auth", Context.MODE_PRIVATE);
        this.currentUserId = prefs.getInt("id_login", 0);
        
        Log.d(TAG, "Current User ID from SharedPreferences: " + currentUserId);
    }

    public void setMessages(List<MessageResponse.MessageData> messages) {
        this.messages = messages;
        Log.d(TAG, "Total messages: " + messages.size());
        notifyDataSetChanged();
    }

    @Override
    public int getItemViewType(int position) {
        MessageResponse.MessageData message = messages.get(position);
        
        Log.d(TAG, "Message #" + position + 
            " - id_sender: " + message.id_sender + 
            " - currentUserId: " + currentUserId +
            " - isSent: " + (message.id_sender == currentUserId));
        
        // 1 = sent (bên phải), 0 = received (bên trái)
        return message.id_sender == currentUserId ? 1 : 0;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        int layoutId = viewType == 1 ? R.layout.item_message_sent : R.layout.item_message_received;
        Log.d(TAG, "Creating ViewHolder - viewType: " + viewType + " (1=sent, 0=received)");
        View view = LayoutInflater.from(parent.getContext()).inflate(layoutId, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        MessageResponse.MessageData message = messages.get(position);
        holder.tvContent.setText(message.content);
        holder.tvTime.setText(formatTime(message.created_at));
        
        // Chỉ hiển thị "Admin" cho tin nhắn nhận được
        if (holder.tvSender != null) {
            holder.tvSender.setVisibility(View.VISIBLE);
        }
    }

    @Override
    public int getItemCount() {
        return messages.size();
    }

    private String formatTime(String dateString) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
            Date date = sdf.parse(dateString);
            
            Date now = new Date();
            long diff = now.getTime() - date.getTime();
            long diffHours = diff / (60 * 60 * 1000);
            
            if (diffHours < 24) {
                SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
                return "Hôm nay " + timeFormat.format(date);
            } else {
                SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM HH:mm", Locale.getDefault());
                return dateFormat.format(date);
            }
        } catch (Exception e) {
            return "";
        }
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvContent, tvTime, tvSender;

        ViewHolder(View itemView) {
            super(itemView);
            tvContent = itemView.findViewById(R.id.tvContent);
            tvTime = itemView.findViewById(R.id.tvTime);
            tvSender = itemView.findViewById(R.id.tvSender);
        }
    }
}
