package com.example.dacnapp.ui.product;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.example.dacnapp.R;

public class DescriptionFragment extends Fragment {
    private String description;

    public static DescriptionFragment newInstance(String description) {
        DescriptionFragment fragment = new DescriptionFragment();
        Bundle args = new Bundle();
        args.putString("description", description);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_description, container, false);
        
        TextView tvDescription = view.findViewById(R.id.tvDescription);
        
        if (getArguments() != null) {
            description = getArguments().getString("description");
            tvDescription.setText(description != null ? description : "Chưa có mô tả");
        }
        
        return view;
    }
}
