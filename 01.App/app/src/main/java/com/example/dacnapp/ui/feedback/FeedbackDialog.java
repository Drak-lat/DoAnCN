package com.example.dacnapp.ui.feedback;

import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.RatingBar;
import android.widget.TextView;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.product.Product;
import com.squareup.picasso.Picasso;
import com.example.dacnapp.ui.product.ProductDetailActivity;
import android.content.Intent;

public class FeedbackDialog extends Dialog {
    private Product product;
    private int orderId;
    private OnFeedbackSubmitListener listener;
    
    private ImageView imgProduct;
    private TextView tvProductName;
    private RatingBar ratingBar;
    private EditText edtComment;
    private Button btnCancel, btnSubmit;

    public interface OnFeedbackSubmitListener {
        void onSubmit(int rating, String comment);
    }

    public FeedbackDialog(Context context, Product product, int orderId, OnFeedbackSubmitListener listener) {
        super(context);
        this.product = product;
        this.orderId = orderId;
        this.listener = listener;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dialog_feedback);

        // Initialize views
        imgProduct = findViewById(R.id.imgProduct);
        tvProductName = findViewById(R.id.tvProductName);
        ratingBar = findViewById(R.id.ratingBar);
        edtComment = findViewById(R.id.edtComment);
        btnCancel = findViewById(R.id.btnCancel);
        btnSubmit = findViewById(R.id.btnSubmit);

        // Display product info
        if (product != null) {
            tvProductName.setText(product.name_product);
            
            // Make product clickable
            View.OnClickListener productClickListener = v -> {
                Intent intent = new Intent(getContext(), ProductDetailActivity.class);
                intent.putExtra("productId", product.id_product);
                getContext().startActivity(intent);
            };
            
            imgProduct.setOnClickListener(productClickListener);
            tvProductName.setOnClickListener(productClickListener);
            
            if (product.image_product != null && !product.image_product.isEmpty()) {
                String imageUrl = "http://10.0.2.2:3000/uploads/products/" + product.image_product;
                Picasso.get()
                        .load(imageUrl)
                        .placeholder(R.drawable.placeholder_book)
                        .error(R.drawable.placeholder_book)
                        .into(imgProduct);
            } else {
                imgProduct.setImageResource(R.drawable.placeholder_book);
            }
        }

        // Set default rating
        ratingBar.setRating(5);

        // Button listeners
        btnCancel.setOnClickListener(v -> dismiss());

        btnSubmit.setOnClickListener(v -> {
            String comment = edtComment.getText().toString().trim();
            if (comment.isEmpty()) {
                edtComment.setError("Vui lòng nhập nhận xét");
                return;
            }

            int rating = (int) ratingBar.getRating();
            if (listener != null) {
                listener.onSubmit(rating, comment);
            }
            dismiss();
        });
    }
}
