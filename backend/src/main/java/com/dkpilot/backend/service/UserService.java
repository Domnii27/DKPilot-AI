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

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        return userRepository.save(user);
    }

    // Login User
    public User loginUser(
            String email,
            String password
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (
                user != null &&
                passwordEncoder.matches(
                        password,
                        user.getPassword()
                )
        ) {
            return user;
        }

        return null;
    }

    // Change Password
    public String changePassword(
            String email,
            String currentPassword,
            String newPassword
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return "User not found";
        }

        boolean currentPasswordCorrect =
                passwordEncoder.matches(
                        currentPassword,
                        user.getPassword()
                );

        if (!currentPasswordCorrect) {
            return "Current password is incorrect";
        }

        if (
                newPassword == null ||
                newPassword.trim().length() < 6
        ) {
            return "New password must contain at least 6 characters";
        }

        boolean samePassword =
                passwordEncoder.matches(
                        newPassword,
                        user.getPassword()
                );

        if (samePassword) {
            return "New password must be different from current password";
        }

        user.setPassword(
                passwordEncoder.encode(
                        newPassword.trim()
                )
        );

        userRepository.save(user);

        return "Password updated successfully";
    }
}