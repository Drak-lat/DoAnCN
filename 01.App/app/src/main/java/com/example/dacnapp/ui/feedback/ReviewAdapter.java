package com.example.dacnapp.ui.feedback;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.feedback.FeedbackResponse;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ReviewAdapter extends RecyclerView.Adapter<ReviewAdapter.ViewHolder> {
    private List<FeedbackResponse.OrderForFeedback> orders = new ArrayList<>();
    private OnReviewClickListener listener;

    public interface OnReviewClickListener {
        void onReviewClick(com.example.dacnapp.data.model.product.Product product, int orderId);
    }

    public ReviewAdapter(OnReviewClickListener listener) {
        this.listener = listener;
    }

    public void setOrders(List<FeedbackResponse.OrderForFeedback> orders) {
        this.orders = orders;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_review_order, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        FeedbackResponse.OrderForFeedback order = orders.get(position);
        holder.bind(order, listener);
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrderId, tvOrderDate;
        RecyclerView rvProducts;
        ReviewProductAdapter productAdapter;

        ViewHolder(View itemView) {
            super(itemView);
            tvOrderId = itemView.findViewById(R.id.tvOrderId);
            tvOrderDate = itemView.findViewById(R.id.tvOrderDate);
            rvProducts = itemView.findViewById(R.id.rvProducts);
            
            rvProducts.setLayoutManager(new LinearLayoutManager(itemView.getContext()));
            rvProducts.setNestedScrollingEnabled(false);
        }

        void bind(FeedbackResponse.OrderForFeedback order, OnReviewClickListener listener) {
            tvOrderId.setText("Đơn hàng #" + order.id_order);
            
            // Format date
            try {
                SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
                SimpleDateFormat outputFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
                tvOrderDate.setText(outputFormat.format(inputFormat.parse(order.date_order)));
            } catch (Exception e) {
                tvOrderDate.setText(order.date_order);
            }

            // Setup products adapter
            productAdapter = new ReviewProductAdapter(order.id_order, listener);
            rvProducts.setAdapter(productAdapter);
            if (order.OrderDetails != null) {
                productAdapter.setProducts(order.OrderDetails);
            }
        }
    }
}
