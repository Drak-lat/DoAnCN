package com.example.dacnapp.ui.products.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.MotionEvent; // ⚠️ Quan trọng: import MotionEvent để tránh lỗi
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.Product;

import java.util.List;

public class ProductAdapter extends RecyclerView.Adapter<ProductAdapter.ViewHolder> {

    private final List<Product> list;
    private final Context context;

    public ProductAdapter(Context context, List<Product> list) {
        this.context = context;
        this.list = list;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_product, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Product p = list.get(position);

        // --- Hiển thị dữ liệu ---
        holder.txtName.setText(p.getName_product());
        holder.txtAuthor.setText(p.getAuthor());
        holder.txtPrice.setText(p.getPrice() + "đ");

        // --- Load ảnh bằng Glide ---
        Glide.with(context)
                .load(p.getImage_product())
                .placeholder(R.drawable.love2)
                .into(holder.imgProduct);

        // --- Hiệu ứng nhấn phóng to nhẹ ---
        holder.itemView.setOnTouchListener((v, event) -> {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    v.animate().scaleX(1.05f).scaleY(1.05f).setDuration(150).start();
                    break;
                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL:
                    v.animate().scaleX(1f).scaleY(1f).setDuration(150).start();
                    break;
            }
            return false;
        });
    }

    @Override
    public int getItemCount() {
        return list != null ? list.size() : 0;
    }

    // --- ViewHolder ---
    public static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imgProduct;
        TextView txtName, txtAuthor, txtPrice;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            imgProduct = itemView.findViewById(R.id.imgProduct);
            txtName = itemView.findViewById(R.id.txtName);
            txtAuthor = itemView.findViewById(R.id.txtAuthor);
            txtPrice = itemView.findViewById(R.id.txtPrice);
        }
    }
}
