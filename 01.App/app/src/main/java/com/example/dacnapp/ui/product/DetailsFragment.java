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

public class DetailsFragment extends Fragment {

    public static DetailsFragment newInstance(String publisher, int pages, String size, int publisherYear) {
        DetailsFragment fragment = new DetailsFragment();
        Bundle args = new Bundle();
        args.putString("publisher", publisher);
        args.putInt("pages", pages);
        args.putString("size", size);
        args.putInt("publisherYear", publisherYear);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_details, container, false);
        
        TextView tvPublisher = view.findViewById(R.id.tvPublisher);
        TextView tvPages = view.findViewById(R.id.tvPages);
        TextView tvSize = view.findViewById(R.id.tvSize);
        TextView tvPublisherYear = view.findViewById(R.id.tvPublisherYear);
        
        if (getArguments() != null) {
            String publisher = getArguments().getString("publisher");
            int pages = getArguments().getInt("pages");
            String size = getArguments().getString("size");
            int publisherYear = getArguments().getInt("publisherYear");
            
            tvPublisher.setText("Nhà xuất bản: " + (publisher != null ? publisher : "Không rõ"));
            tvPages.setText("Số trang: " + (pages > 0 ? pages + " trang" : "Không rõ"));
            tvSize.setText("Kích thước: " + (size != null ? size : "Không rõ"));
            tvPublisherYear.setText("Năm xuất bản: " + (publisherYear > 0 ? publisherYear : "Không rõ"));
        }
        
        return view;
    }
}
