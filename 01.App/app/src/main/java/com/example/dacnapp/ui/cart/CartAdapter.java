package com.example.dacnapp.ui.cart;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.cart.CartDetail;
import com.squareup.picasso.Picasso;
import java.util.ArrayList;
import java.util.List;

public class CartAdapter extends RecyclerView.Adapter<CartAdapter.ViewHolder> {
    private List<CartDetail> cartItems = new ArrayList<>();
    private OnQuantityChangeListener quantityChangeListener;
    private OnRemoveListener removeListener;

    public interface OnQuantityChangeListener {
        void onQuantityChange(CartDetail cartDetail, int newQuantity);
    }

    public interface OnRemoveListener {
        void onRemove(CartDetail cartDetail);
    }

    public CartAdapter(OnQuantityChangeListener quantityChangeListener, OnRemoveListener removeListener) {
        this.quantityChangeListener = quantityChangeListener;
        this.removeListener = removeListener;
    }

    public void setCartItems(List<CartDetail> items) {
        this.cartItems = items != null ? items : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_cart, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        CartDetail item = cartItems.get(position);
        
        if (item.Product != null) {
            holder.tvProductName.setText(item.Product.name_product);
            holder.tvAuthor.setText(item.Product.author);
            holder.tvPrice.setText(String.format("%,.0f đ", item.Product.price));
            holder.tvQuantity.setText(String.valueOf(item.quantitycart_detail));
            holder.tvSubtotal.setText(String.format("%,.0f đ", 
                item.Product.price * item.quantitycart_detail));

            // Load image
            if (item.Product.image_product != null && !item.Product.image_product.isEmpty()) {
                String imageUrl = "http://10.0.2.2:3000/uploads/products/" + item.Product.image_product;
                Picasso.get()
                    .load(imageUrl)
                    .placeholder(R.drawable.placeholder_book)
                    .error(R.drawable.placeholder_book)
                    .into(holder.imgProduct);
            }
        }

        // Minus button
        holder.btnMinus.setOnClickListener(v -> {
            if (item.quantitycart_detail > 1) {
                quantityChangeListener.onQuantityChange(item, item.quantitycart_detail - 1);
            }
        });

        // Plus button
        holder.btnPlus.setOnClickListener(v -> {
            if (item.Product != null && item.quantitycart_detail < item.Product.quantity) {
                quantityChangeListener.onQuantityChange(item, item.quantitycart_detail + 1);
            }
        });

        // Remove button
        holder.btnRemove.setOnClickListener(v -> {
            removeListener.onRemove(item);
        });
    }

    @Override
    public int getItemCount() {
        return cartItems.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imgProduct, btnMinus, btnPlus, btnRemove;
        TextView tvProductName, tvAuthor, tvPrice, tvQuantity, tvSubtotal;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            imgProduct = itemView.findViewById(R.id.imgProduct);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvAuthor = itemView.findViewById(R.id.tvAuthor);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvQuantity = itemView.findViewById(R.id.tvQuantity);
            tvSubtotal = itemView.findViewById(R.id.tvSubtotal);
            btnMinus = itemView.findViewById(R.id.btnMinus);
            btnPlus = itemView.findViewById(R.id.btnPlus);
            btnRemove = itemView.findViewById(R.id.btnRemove);
        }
    }
}
