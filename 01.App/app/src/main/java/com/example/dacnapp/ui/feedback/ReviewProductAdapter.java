package com.example.dacnapp.ui.feedback;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.feedback.FeedbackResponse;
import com.example.dacnapp.data.model.product.Product;
import com.squareup.picasso.Picasso;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ReviewProductAdapter extends RecyclerView.Adapter<ReviewProductAdapter.ViewHolder> {
    private List<FeedbackResponse.OrderDetailForFeedback> products = new ArrayList<>();
    private int orderId;
    private ReviewAdapter.OnReviewClickListener listener;

    public ReviewProductAdapter(int orderId, ReviewAdapter.OnReviewClickListener listener) {
        this.orderId = orderId;
        this.listener = listener;
    }

    public void setProducts(List<FeedbackResponse.OrderDetailForFeedback> products) {
        this.products = products;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_review_product, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        FeedbackResponse.OrderDetailForFeedback product = products.get(position);
        holder.bind(product, orderId, listener);
    }

    @Override
    public int getItemCount() {
        return products.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imgProduct;
        TextView tvProductName, tvPrice, tvReviewed;
        Button btnReview;

        ViewHolder(View itemView) {
            super(itemView);
            imgProduct = itemView.findViewById(R.id.imgProduct);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvReviewed = itemView.findViewById(R.id.tvReviewed);
            btnReview = itemView.findViewById(R.id.btnReview);
        }

        void bind(FeedbackResponse.OrderDetailForFeedback detail, int orderId, ReviewAdapter.OnReviewClickListener listener) {
            if (detail.Product != null) {
                tvProductName.setText(detail.Product.name_product);
                
                NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
                tvPrice.setText(formatter.format(detail.price_detail));

                // Load image
                if (detail.Product.image_product != null && !detail.Product.image_product.isEmpty()) {
                    String imageUrl = "http://10.0.2.2:3000/uploads/products/" + detail.Product.image_product;
                    Picasso.get()
                            .load(imageUrl)
                            .placeholder(R.drawable.placeholder_book)
                            .error(R.drawable.placeholder_book)
                            .into(imgProduct);
                } else {
                    imgProduct.setImageResource(R.drawable.placeholder_book);
                }
            }

            // Show/hide review button
            if (detail.hasFeedback) {
                btnReview.setVisibility(View.GONE);
                tvReviewed.setVisibility(View.VISIBLE);
            } else {
                btnReview.setVisibility(View.VISIBLE);
                tvReviewed.setVisibility(View.GONE);
                
                btnReview.setOnClickListener(v -> {
                    if (listener != null && detail.Product != null) {
                        listener.onReviewClick(detail.Product, orderId);
                    }
                });
            }
        }
    }
}
