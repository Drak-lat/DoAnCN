package com.example.dacnapp.ui.notifications;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
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
import com.example.dacnapp.data.model.message.MessageResponse;

import org.json.JSONObject;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class MessagesFragment extends Fragment {
    private static final String TAG = "MessagesFragment";
    private RecyclerView rvMessages;
    private EditText edtMessage;
    private Button btnSend;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    private MessageAdapter adapter;
    private MessagesViewModel viewModel;
    private Socket socket;
    private int currentUserId;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_notifications, container, false);

        // Initialize views
        rvMessages = root.findViewById(R.id.rvMessages);
        edtMessage = root.findViewById(R.id.edtMessage);
        btnSend = root.findViewById(R.id.btnSend);
        progressBar = root.findViewById(R.id.progressBar);
        tvEmpty = root.findViewById(R.id.tvEmpty);

        // Get current user ID
        SharedPreferences prefs = getContext().getSharedPreferences("auth", getContext().MODE_PRIVATE);
        currentUserId = prefs.getInt("id_login", 0);

        // Setup RecyclerView
        adapter = new MessageAdapter(getContext());
        rvMessages.setLayoutManager(new LinearLayoutManager(getContext()));
        rvMessages.setAdapter(adapter);

        // Setup ViewModel
        viewModel = new ViewModelProvider(this).get(MessagesViewModel.class);

        // ⭐ SETUP SOCKET.IO
        connectSocket();

        // Observe messages
        viewModel.getMessages().observe(getViewLifecycleOwner(), messages -> {
            if (messages != null && !messages.isEmpty()) {
                adapter.setMessages(messages);
                rvMessages.setVisibility(View.VISIBLE);
                tvEmpty.setVisibility(View.GONE);
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
                // Không cần reload vì socket sẽ tự update
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

    private void connectSocket() {
        try {
            socket = IO.socket("http://10.0.2.2:3000");

            socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    Log.d(TAG, "Socket connected");
                    // Đăng ký user online
                    socket.emit("user_online", currentUserId);
                }
            });

            socket.on("new_message", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    if (getActivity() != null) {
                        getActivity().runOnUiThread(() -> {
                            try {
                                JSONObject data = (JSONObject) args[0];
                                int receiverId = data.getInt("receiverId");
                                int senderId = data.getInt("senderId");

                                // Chỉ reload nếu tin nhắn liên quan đến user hiện tại
                                if (receiverId == currentUserId || senderId == currentUserId) {
                                    Log.d(TAG, "New message received, reloading...");
                                    viewModel.loadMessages();
                                }
                            } catch (Exception e) {
                                Log.e(TAG, "Error parsing message", e);
                            }
                        });
                    }
                }
            });

            socket.on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    Log.d(TAG, "Socket disconnected");
                }
            });

            socket.connect();
        } catch (URISyntaxException e) {
            Log.e(TAG, "Socket connection error", e);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (socket != null) {
            socket.disconnect();
            socket.off();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (viewModel != null) {
            viewModel.loadMessages();
        }
        if (socket != null && !socket.connected()) {
            socket.connect();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Không disconnect khi pause, chỉ disconnect khi destroy
    }
}
