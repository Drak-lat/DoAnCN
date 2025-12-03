package com.example.dacnapp.ui.notifications;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.dacnapp.R;
import com.example.dacnapp.data.model.message.AdminResponse;

import java.util.ArrayList;
import java.util.List;

public class AdminAdapter extends RecyclerView.Adapter<AdminAdapter.ViewHolder> {
    private List<AdminResponse.AdminData> admins = new ArrayList<>();
    private int selectedPosition = -1;
    private OnAdminSelectedListener listener;

    public interface OnAdminSelectedListener {
        void onAdminSelected(AdminResponse.AdminData admin, int position);
    }

    public AdminAdapter(OnAdminSelectedListener listener) {
        this.listener = listener;
    }

    public void setAdmins(List<AdminResponse.AdminData> admins) {
        this.admins = admins;
        notifyDataSetChanged();
    }

    public void setSelectedPosition(int position) {
        int previousPosition = selectedPosition;
        selectedPosition = position;
        notifyItemChanged(previousPosition);
        notifyItemChanged(selectedPosition);
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_admin, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        AdminResponse.AdminData admin = admins.get(position);
        holder.tvAdminName.setText("Admin " + (position + 1));
        holder.tvAdminNumber.setText(String.valueOf(position + 1));

        // Highlight selected admin
        if (position == selectedPosition) {
            holder.itemView.setBackgroundResource(R.drawable.admin_item_selected);
        } else {
            holder.itemView.setBackgroundResource(R.drawable.admin_item_normal);
        }

        holder.itemView.setOnClickListener(v -> {
            setSelectedPosition(position);
            if (listener != null) {
                listener.onAdminSelected(admin, position);
            }
        });
    }

    @Override
    public int getItemCount() {
        return admins.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvAdminName, tvAdminNumber;

        ViewHolder(View itemView) {
            super(itemView);
            tvAdminName = itemView.findViewById(R.id.tvAdminName);
            tvAdminNumber = itemView.findViewById(R.id.tvAdminNumber);
        }
    }
}
