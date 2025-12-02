package com.example.dacnapp.ui.cart;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;
import com.example.dacnapp.ui.checkout.CheckoutActivity;
import com.example.dacnapp.ui.checkout.CheckoutItem;
import java.util.ArrayList;

public class CartFragment extends Fragment {
    private RecyclerView rvCart;
    private TextView tvEmpty, tvTotalAmount;
    private Button btnCheckout;
    private ProgressBar progressBar;
    private CartViewModel viewModel;
    private CartAdapter adapter;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_cart, container, false);

        // Initialize views
        rvCart = root.findViewById(R.id.rvCart);
        tvEmpty = root.findViewById(R.id.tvEmpty);
        tvTotalAmount = root.findViewById(R.id.tvTotalAmount);
        btnCheckout = root.findViewById(R.id.btnCheckout);
        progressBar = root.findViewById(R.id.progressBar);

        // Setup RecyclerView
        adapter = new CartAdapter(
            // On quantity change
            (cartDetail, newQuantity) -> {
                viewModel.updateCartItem(cartDetail.id_cartdetail, newQuantity);
            },
            // On remove
            cartDetail -> {
                viewModel.removeFromCart(cartDetail.id_cartdetail);
            }
        );
        rvCart.setLayoutManager(new LinearLayoutManager(getContext()));
        rvCart.setAdapter(adapter);

        // Setup ViewModel
        viewModel = new ViewModelProvider(this).get(CartViewModel.class);

        // Observe data
        viewModel.getCart().observe(getViewLifecycleOwner(), response -> {
            if (response != null && response.data != null) {
                if (response.data.cart != null && response.data.cart.CartDetails != null 
                        && !response.data.cart.CartDetails.isEmpty()) {
                    adapter.setCartItems(response.data.cart.CartDetails);
                    rvCart.setVisibility(View.VISIBLE);
                    tvEmpty.setVisibility(View.GONE);
                    btnCheckout.setEnabled(true);
                    
                    // Format total amount
                    tvTotalAmount.setText(String.format("Tổng: %,.0f đ", response.data.totalAmount));
                } else {
                    rvCart.setVisibility(View.GONE);
                    tvEmpty.setVisibility(View.VISIBLE);
                    btnCheckout.setEnabled(false);
                    tvTotalAmount.setText("Tổng: 0 đ");
                }
            }
        });

        viewModel.getLoading().observe(getViewLifecycleOwner(), loading -> {
            progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        });

        viewModel.getMessage().observe(getViewLifecycleOwner(), message -> {
            if (message != null) {
                Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
            }
        });

        // Checkout button
        btnCheckout.setOnClickListener(v -> {
            if (viewModel.getCart().getValue() != null && 
                viewModel.getCart().getValue().data != null &&
                viewModel.getCart().getValue().data.cart != null &&
                viewModel.getCart().getValue().data.cart.CartDetails != null) {
                
                // Convert CartDetails to CheckoutItems
                ArrayList<CheckoutItem> items = new ArrayList<>();
                
                for (com.example.dacnapp.data.model.cart.CartDetail cartDetail : 
                     viewModel.getCart().getValue().data.cart.CartDetails) {
                    
                    if (cartDetail.Product != null) {
                        CheckoutItem item = new CheckoutItem(
                            cartDetail.Product.id_product,
                            cartDetail.Product.name_product,
                            cartDetail.Product.author != null ? cartDetail.Product.author : "Không rõ",
                            cartDetail.Product.image_product,
                            cartDetail.Product.price,
                            cartDetail.quantitycart_detail
                        );
                        item.setCartDetailId(cartDetail.id_cartdetail);
                        items.add(item);
                    }
                }
                
                if (!items.isEmpty()) {
                    Intent intent = new Intent(getContext(), CheckoutActivity.class);
                    intent.putExtra("type", "cart");
                    intent.putExtra("items", items);
                    startActivity(intent);
                }
            }
        });

        // Load cart
        viewModel.loadCart();

        return root;
    }

    @Override
    public void onResume() {
        super.onResume();
        // Reload cart when returning to this fragment
        if (viewModel != null) {
            viewModel.loadCart();
        }
    }
}
