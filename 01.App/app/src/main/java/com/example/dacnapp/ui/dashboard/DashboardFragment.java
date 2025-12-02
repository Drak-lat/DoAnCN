package com.example.dacnapp.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.dacnapp.R;

public class DashboardFragment extends Fragment {
    private RecyclerView rvCategories;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private DashboardViewModel viewModel;
    private CategoryAdapter adapter;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_dashboard, container, false);

        // Initialize views
        rvCategories = root.findViewById(R.id.rvCategories);
        progressBar = root.findViewById(R.id.progressBar);
        tvEmpty = root.findViewById(R.id.tvEmpty);

        // Setup RecyclerView
        adapter = new CategoryAdapter(category -> {
            Intent intent = new Intent(getActivity(), CategoryProductsActivity.class);
            intent.putExtra("categoryId", category.id_category);
            intent.putExtra("categoryName", category.name_category);
            startActivity(intent);
        });

        rvCategories.setLayoutManager(new GridLayoutManager(getContext(), 2));
        rvCategories.setAdapter(adapter);

        // Setup ViewModel
        viewModel = new ViewModelProvider(this).get(DashboardViewModel.class);

        // Observe data
        viewModel.getCategories().observe(getViewLifecycleOwner(), categories -> {
            if (categories != null && !categories.isEmpty()) {
                adapter.setCategories(categories);
                rvCategories.setVisibility(View.VISIBLE);
                tvEmpty.setVisibility(View.GONE);
            } else {
                rvCategories.setVisibility(View.GONE);
                tvEmpty.setVisibility(View.VISIBLE);
            }
        });

        viewModel.getLoading().observe(getViewLifecycleOwner(), loading -> {
            progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), error -> {
            if (error != null) {
                Toast.makeText(getContext(), error, Toast.LENGTH_SHORT).show();
            }
        });

        // Load categories
        viewModel.loadCategories();

        return root;
    }
}