package com.dkpilot.backend.service;

import com.dkpilot.backend.entity.User;
import com.dkpilot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register User
    public User registerUser(User user) {

        // Password encrypt pannuvom
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    // Login User
    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null &&
                passwordEncoder.matches(password, user.getPassword())) {

            return user;
        }

        return null;
    }
}