package com.example.dacnapp.ui.order;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.order.OrderDetail;
import com.example.dacnapp.data.model.product.Product;
import com.squareup.picasso.Picasso;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class OrderDetailItemAdapter extends RecyclerView.Adapter<OrderDetailItemAdapter.ViewHolder> {
    private List<OrderDetail> items = new ArrayList<>();

    public void setItems(List<OrderDetail> items) {
        this.items = items;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_order_detail, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        OrderDetail item = items.get(position);
        holder.bind(item);
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imgProduct;
        TextView tvProductName, tvAuthor, tvQuantity, tvPrice, tvSubtotal;

        ViewHolder(View itemView) {
            super(itemView);
            imgProduct = itemView.findViewById(R.id.imgProduct);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvAuthor = itemView.findViewById(R.id.tvAuthor);
            tvQuantity = itemView.findViewById(R.id.tvQuantity);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvSubtotal = itemView.findViewById(R.id.tvSubtotal);
        }

        void bind(OrderDetail item) {
            NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

            if (item.Product != null) {
                tvProductName.setText(item.Product.name_product);
                tvAuthor.setText(item.Product.author != null ? item.Product.author : "");

                // Load image
                if (item.Product.image_product != null && !item.Product.image_product.isEmpty()) {
                    String imageUrl = "http://10.0.2.2:3000/uploads/products/" + item.Product.image_product;
                    Picasso.get()
                            .load(imageUrl)
                            .placeholder(R.drawable.placeholder_book)
                            .error(R.drawable.placeholder_book)
                            .into(imgProduct);
                } else {
                    imgProduct.setImageResource(R.drawable.placeholder_book);
                }
            }

            tvQuantity.setText("x" + item.quantity_detail);
            tvPrice.setText(formatter.format(item.price_detail));
            tvSubtotal.setText(formatter.format(item.price_detail * item.quantity_detail));
        }
    }
}
