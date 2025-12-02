package com.example.dacnapp.ui.notifications;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.dacnapp.R;

public class MessagesFragment extends Fragment {
    private RecyclerView rvMessages;
    private EditText edtMessage;
    private Button btnSend;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private MessageAdapter adapter;
    private MessagesViewModel viewModel;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_notifications, container, false);

        // Initialize views
        rvMessages = root.findViewById(R.id.rvMessages);
        edtMessage = root.findViewById(R.id.edtMessage);
        btnSend = root.findViewById(R.id.btnSend);
        progressBar = root.findViewById(R.id.progressBar);
        tvEmpty = root.findViewById(R.id.tvEmpty);

        // Setup RecyclerView
        adapter = new MessageAdapter(getContext());
        rvMessages.setLayoutManager(new LinearLayoutManager(getContext()));
        rvMessages.setAdapter(adapter);


        // Setup ViewModel
        viewModel = new ViewModelProvider(this).get(MessagesViewModel.class);

        // Observe messages
        viewModel.getMessages().observe(getViewLifecycleOwner(), messages -> {
            if (messages != null && !messages.isEmpty()) {
                adapter.setMessages(messages);
                rvMessages.setVisibility(View.VISIBLE);
                tvEmpty.setVisibility(View.GONE);
                // Scroll to bottom
                rvMessages.scrollToPosition(messages.size() - 1);
            } else {
                rvMessages.setVisibility(View.GONE);
                tvEmpty.setVisibility(View.VISIBLE);
            }
        });

        viewModel.getLoading().observe(getViewLifecycleOwner(), loading -> {
            progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        });

        viewModel.getError().observe(getViewLifecycleOwner(), error -> {
            if (error != null) {
                Toast.makeText(getContext(), error, Toast.LENGTH_SHORT).show();
            }
        });

        viewModel.getSendSuccess().observe(getViewLifecycleOwner(), success -> {
            if (success) {
                edtMessage.setText("");
                // Reload messages after sending
                viewModel.loadMessages();
            }
        });

        // Send button
        btnSend.setOnClickListener(v -> {
            String content = edtMessage.getText().toString().trim();
            if (!content.isEmpty()) {
                viewModel.sendMessage(content);
            } else {
                Toast.makeText(getContext(), "Vui lòng nhập nội dung", Toast.LENGTH_SHORT).show();
            }
        });

        // Load messages
        viewModel.loadMessages();

        return root;
    }

    @Override
    public void onResume() {
        super.onResume();
        if (viewModel != null) {
            viewModel.loadMessages();
        }
    }
}
