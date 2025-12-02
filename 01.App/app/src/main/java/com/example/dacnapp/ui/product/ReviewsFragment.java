package com.example.dacnapp.ui.product;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;

public class ReviewsFragment extends Fragment {
    private int productId;

    public static ReviewsFragment newInstance(int productId) {
        ReviewsFragment fragment = new ReviewsFragment();
        Bundle args = new Bundle();
        args.putInt("productId", productId);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_reviews, container, false);
        
        RecyclerView rvReviews = view.findViewById(R.id.rvReviews);
        TextView tvEmpty = view.findViewById(R.id.tvEmpty);
        
        if (getArguments() != null) {
            productId = getArguments().getInt("productId");
        }
        
        // TODO: Load reviews from API
        // For now, show empty state
        tvEmpty.setVisibility(View.VISIBLE);
        rvReviews.setVisibility(View.GONE);
        
        return view;
    }
}
