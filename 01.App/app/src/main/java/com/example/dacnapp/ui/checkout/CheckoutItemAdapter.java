package com.example.dacnapp.ui.checkout;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.dacnapp.R;
import com.squareup.picasso.Picasso;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

public class CheckoutItemAdapter extends RecyclerView.Adapter<CheckoutItemAdapter.ViewHolder> {
    private List<CheckoutItem> items;
    private NumberFormat formatter;

    public CheckoutItemAdapter(List<CheckoutItem> items) {
        this.items = items;
        this.formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_checkout, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        CheckoutItem item = items.get(position);
        
        holder.tvProductName.setText(item.getName_product());
        holder.tvAuthor.setText(item.getAuthor());
        holder.tvPrice.setText(formatter.format(item.getPrice()) + " đ");
        holder.tvQuantity.setText("x" + item.getQuantity());
        
        double subtotal = item.getPrice() * item.getQuantity();
        holder.tvSubtotal.setText(formatter.format(subtotal) + " đ");
        
        // Load image - FIX: Đường dẫn đúng
        if (item.getImage_product() != null && !item.getImage_product().isEmpty()) {
            String imageUrl = "http://10.0.2.2:3000/uploads/products/" + item.getImage_product();
            Picasso.get()
                    .load(imageUrl)
                    .placeholder(R.drawable.placeholder_book)
                    .error(R.drawable.placeholder_book)
                    .into(holder.imgProduct);
        } else {
            holder.imgProduct.setImageResource(R.drawable.placeholder_book);
        }
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imgProduct;
        TextView tvProductName, tvAuthor, tvPrice, tvQuantity, tvSubtotal;

        ViewHolder(View itemView) {
            super(itemView);
            imgProduct = itemView.findViewById(R.id.imgProduct);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvAuthor = itemView.findViewById(R.id.tvAuthor);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvQuantity = itemView.findViewById(R.id.tvQuantity);
            tvSubtotal = itemView.findViewById(R.id.tvSubtotal);
        }
    }
}
