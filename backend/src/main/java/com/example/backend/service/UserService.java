package com.example.backend.service;

import com.example.backend.dto.common.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private Map<String, UserDTO> pendingRegistrations = new HashMap<>();

    // Các hàm quản lý user (get, update, delete, ...)
}
