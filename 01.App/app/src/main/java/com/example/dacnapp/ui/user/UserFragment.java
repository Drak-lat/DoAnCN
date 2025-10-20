package com.example.dacnapp.ui.user;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.example.dacnapp.R;
import com.example.dacnapp.ui.profile.UserProfileActivity;

public class UserFragment extends Fragment {

    ImageView imgArrow;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_user, container, false);

        // Ánh xạ
        imgArrow = view.findViewById(R.id.img_arrow);

        // Xử lý sự kiện nhấn vào mũi tên ">"
        imgArrow.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), UserProfileActivity.class);
            startActivity(intent);
        });

        return view;
    }
}
