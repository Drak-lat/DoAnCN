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
import com.example.dacnapp.data.model.message.AdminResponse;

import org.json.JSONObject;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class MessagesFragment extends Fragment {
    private static final String TAG = "MessagesFragment";
    private RecyclerView rvMessages, rvAdmins;
    private EditText edtMessage;
    private Button btnSend;
    private ProgressBar progressBar;
    private TextView tvEmpty, tvSelectAdmin;
    private MessageAdapter messageAdapter;
    private AdminAdapter adminAdapter;
    private MessagesViewModel viewModel;
    private Socket socket;
    private int currentUserId;
    private Integer selectedAdminId = null;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_notifications, container, false);

        // Initialize views
        rvMessages = root.findViewById(R.id.rvMessages);
        rvAdmins = root.findViewById(R.id.rvAdmins);
        edtMessage = root.findViewById(R.id.edtMessage);
        btnSend = root.findViewById(R.id.btnSend);
        progressBar = root.findViewById(R.id.progressBar);
        tvEmpty = root.findViewById(R.id.tvEmpty);
        tvSelectAdmin = root.findViewById(R.id.tvSelectAdmin);

        // Get current user ID
        SharedPreferences prefs = getContext().getSharedPreferences("auth", getContext().MODE_PRIVATE);
        currentUserId = prefs.getInt("id_login", 0);

        // Setup Admin RecyclerView
        adminAdapter = new AdminAdapter((admin, position) -> {
            selectedAdminId = admin.id_login;
            viewModel.loadMessages(selectedAdminId);
            tvSelectAdmin.setVisibility(View.GONE);
        });
        rvAdmins.setLayoutManager(new LinearLayoutManager(getContext(), LinearLayoutManager.HORIZONTAL, false));
        rvAdmins.setAdapter(adminAdapter);

        // Setup Message RecyclerView
        messageAdapter = new MessageAdapter(getContext());
        rvMessages.setLayoutManager(new LinearLayoutManager(getContext()));
        rvMessages.setAdapter(messageAdapter);

        // Setup ViewModel
        viewModel = new ViewModelProvider(this).get(MessagesViewModel.class);

        // Setup Socket
        connectSocket();

        // Observe admins
        viewModel.getAdmins().observe(getViewLifecycleOwner(), admins -> {
            if (admins != null && !admins.isEmpty()) {
                adminAdapter.setAdmins(admins);
            }
        });

        // Observe messages
        viewModel.getMessages().observe(getViewLifecycleOwner(), messages -> {
            if (messages != null && !messages.isEmpty()) {
                messageAdapter.setMessages(messages);
                rvMessages.setVisibility(View.VISIBLE);
                tvEmpty.setVisibility(View.GONE);
                rvMessages.scrollToPosition(messages.size() - 1);
            } else {
                if (selectedAdminId != null) {
                    rvMessages.setVisibility(View.GONE);
                    tvEmpty.setVisibility(View.VISIBLE);
                }
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
            }
        });

        // Send button
        btnSend.setOnClickListener(v -> {
            if (selectedAdminId == null) {
                Toast.makeText(getContext(), "Vui lòng chọn admin", Toast.LENGTH_SHORT).show();
                return;
            }

            String content = edtMessage.getText().toString().trim();
            if (!content.isEmpty()) {
                viewModel.sendMessage(content, selectedAdminId);
            } else {
                Toast.makeText(getContext(), "Vui lòng nhập nội dung", Toast.LENGTH_SHORT).show();
            }
        });

        // Load admins
        viewModel.loadAdmins();

        return root;
    }

    private void connectSocket() {
        try {
            socket = IO.socket("http://10.0.2.2:3000");

            socket.on(Socket.EVENT_CONNECT, args -> {
                Log.d(TAG, "Socket connected");
                socket.emit("user_online", currentUserId);
            });

            socket.on("new_message", args -> {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        try {
                            JSONObject data = (JSONObject) args[0];
                            int receiverId = data.getInt("receiverId");
                            int senderId = data.getInt("senderId");

                            if ((receiverId == currentUserId && senderId == selectedAdminId) ||
                                (senderId == currentUserId && receiverId == selectedAdminId)) {
                                Log.d(TAG, "New message received, reloading...");
                                viewModel.loadMessages(selectedAdminId);
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Error parsing message", e);
                        }
                    });
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
}
