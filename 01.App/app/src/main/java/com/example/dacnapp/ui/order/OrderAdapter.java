package com.example.dacnapp.ui.order;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.data.model.order.OrderResponse;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.ViewHolder> {
    private List<OrderResponse.OrderWithDetails> orders = new ArrayList<>();
    private OnOrderClickListener listener;

    public interface OnOrderClickListener {
        void onOrderClick(OrderResponse.OrderWithDetails order);
    }

    public OrderAdapter(OnOrderClickListener listener) {
        this.listener = listener;
    }

    public void setOrders(List<OrderResponse.OrderWithDetails> orders) {
        this.orders = orders;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_order, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        OrderResponse.OrderWithDetails order = orders.get(position);
        holder.bind(order);
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrderId, tvOrderDate, tvOrderStatus, tvReceiverName, tvTotal, tvItemCount;

        ViewHolder(View itemView) {
            super(itemView);
            tvOrderId = itemView.findViewById(R.id.tvOrderId);
            tvOrderDate = itemView.findViewById(R.id.tvOrderDate);
            tvOrderStatus = itemView.findViewById(R.id.tvOrderStatus);
            tvReceiverName = itemView.findViewById(R.id.tvReceiverName);
            tvTotal = itemView.findViewById(R.id.tvTotal);
            tvItemCount = itemView.findViewById(R.id.tvItemCount);

            itemView.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && listener != null) {
                    listener.onOrderClick(orders.get(position));
                }
            });
        }

        void bind(OrderResponse.OrderWithDetails order) {
            tvOrderId.setText("Đơn hàng #" + order.id_order);
            
            // Format date
            try {
                SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
                SimpleDateFormat outputFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
                tvOrderDate.setText(outputFormat.format(inputFormat.parse(order.date_order)));
            } catch (Exception e) {
                tvOrderDate.setText(order.date_order);
            }

            tvOrderStatus.setText(order.order_status);
            setStatusColor(tvOrderStatus, order.order_status);

            tvReceiverName.setText("Người nhận: " + order.receiver_name);

            NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
            tvTotal.setText(formatter.format(order.total));

            int itemCount = order.OrderDetails != null ? order.OrderDetails.size() : 0;
            tvItemCount.setText(itemCount + " sản phẩm");
        }

        private void setStatusColor(TextView tv, String status) {
            switch (status) {
                case "Chờ xác nhận":
                    tv.setTextColor(Color.parseColor("#FF8800"));
                    break;
                case "Đã xác nhận":
                    tv.setTextColor(Color.parseColor("#2196F3"));
                    break;
                case "Đang giao":
                    tv.setTextColor(Color.parseColor("#9C27B0"));
                    break;
                case "Đã giao":
                    tv.setTextColor(Color.parseColor("#4CAF50"));
                    break;
                case "Đã nhận":
                    tv.setTextColor(Color.parseColor("#00897B"));
                    break;
                case "Đã hủy":
                    tv.setTextColor(Color.parseColor("#D32F2F"));
                    break;
                default:
                    tv.setTextColor(Color.parseColor("#666666"));
            }
        }
    }
}
