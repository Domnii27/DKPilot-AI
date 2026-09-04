package com.dkpilot.backend.controller;

import com.dkpilot.backend.entity.User;
import com.dkpilot.backend.repository.UserRepository;
import com.dkpilot.backend.security.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:5173")
public class SettingsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private String extractEmailFromHeader(
            String authorizationHeader
    ) {
        if (
                authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")
        ) {
            throw new RuntimeException(
                    "Authorization token missing"
            );
        }

        String token =
                authorizationHeader.substring(7);

        return jwtService.extractEmail(token);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @RequestHeader("Authorization")
            String authorizationHeader
    ) {
        try {
            String email =
                    extractEmailFromHeader(
                            authorizationHeader
                    );

            Optional<User> optionalUser =
                    userRepository.findByEmail(email);

            if (optionalUser.isEmpty()) {
                return ResponseEntity
                        .status(404)
                        .body(
                                Map.of(
                                        "message",
                                        "User not found"
                                )
                        );
            }

            User user = optionalUser.get();

            Map<String, Object> response =
                    new HashMap<>();

            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put(
                    "companyName",
                    user.getCompanyName() != null
                            ? user.getCompanyName()
                            : ""
            );
            response.put(
                    "phone",
                    user.getPhone() != null
                            ? user.getPhone()
                            : ""
            );
            response.put(
                    "address",
                    user.getAddress() != null
                            ? user.getAddress()
                            : ""
            );
            response.put(
                    "website",
                    user.getWebsite() != null
                            ? user.getWebsite()
                            : ""
            );
            response.put(
                    "theme",
                    user.getTheme() != null
                            ? user.getTheme()
                            : "Light"
            );
            response.put(
                    "notifications",
                    user.getNotifications() != null
                            ? user.getNotifications()
                            : true
            );
            response.put(
                    "profileImage",
                    user.getProfileImage() != null
                            ? user.getProfileImage()
                            : ""
            );

            return ResponseEntity.ok(response);

        } catch (Exception exception) {
            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid or expired token"
                            )
                    );
        }
    }

    @PutMapping(
            value = "/profile",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization")
            String authorizationHeader,

            @RequestParam("name")
            String name,

            @RequestParam("email")
            String email,

            @RequestParam(
                    value = "companyName",
                    required = false
            )
            String companyName,

            @RequestParam(
                    value = "phone",
                    required = false
            )
            String phone,

            @RequestParam(
                    value = "address",
                    required = false
            )
            String address,

            @RequestParam(
                    value = "website",
                    required = false
            )
            String website,

            @RequestParam(
                    value = "theme",
                    required = false
            )
            String theme,

            @RequestParam(
                    value = "notifications",
                    required = false
            )
            Boolean notifications,

            @RequestParam(
                    value = "profileImage",
                    required = false
            )
            MultipartFile profileImage
    ) {
        try {
            String currentEmail =
                    extractEmailFromHeader(
                            authorizationHeader
                    );

            Optional<User> optionalUser =
                    userRepository.findByEmail(
                            currentEmail
                    );

            if (optionalUser.isEmpty()) {
                return ResponseEntity
                        .status(404)
                        .body(
                                Map.of(
                                        "message",
                                        "User not found"
                                )
                        );
            }

            User user = optionalUser.get();

            String cleanedName =
                    name != null
                            ? name.trim()
                            : "";

            String cleanedEmail =
                    email != null
                            ? email.trim()
                            : "";

            if (cleanedName.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Name is required"
                                )
                        );
            }

            if (
                    cleanedEmail.isEmpty() ||
                    !cleanedEmail.contains("@")
            ) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Valid email is required"
                                )
                        );
            }

            if (
                    !cleanedEmail.equalsIgnoreCase(
                            currentEmail
                    )
            ) {
                Optional<User> existingUser =
                        userRepository.findByEmail(
                                cleanedEmail
                        );

                if (
                        existingUser.isPresent() &&
                        !existingUser.get()
                                .getId()
                                .equals(user.getId())
                ) {
                    return ResponseEntity
                            .badRequest()
                            .body(
                                    Map.of(
                                            "message",
                                            "Email already registered"
                                    )
                            );
                }
            }

            user.setName(cleanedName);
            user.setEmail(cleanedEmail);
            user.setCompanyName(
                    companyName != null
                            ? companyName.trim()
                            : ""
            );
            user.setPhone(
                    phone != null
                            ? phone.trim()
                            : ""
            );
            user.setAddress(
                    address != null
                            ? address.trim()
                            : ""
            );
            user.setWebsite(
                    website != null
                            ? website.trim()
                            : ""
            );
            user.setTheme(
                    theme != null &&
                    !theme.trim().isEmpty()
                            ? theme.trim()
                            : "Light"
            );
            user.setNotifications(
                    notifications != null
                            ? notifications
                            : true
            );

            if (
                    profileImage != null &&
                    !profileImage.isEmpty()
            ) {
                String contentType =
                        profileImage.getContentType();

                if (
                        contentType == null ||
                        !contentType.startsWith("image/")
                ) {
                    return ResponseEntity
                            .badRequest()
                            .body(
                                    Map.of(
                                            "message",
                                            "Only image files are allowed"
                                    )
                            );
                }

                if (
                        profileImage.getSize() >
                        5 * 1024 * 1024
                ) {
                    return ResponseEntity
                            .badRequest()
                            .body(
                                    Map.of(
                                            "message",
                                            "Profile image must be below 5 MB"
                                    )
                            );
                }

                String base64Image =
                        Base64.getEncoder()
                                .encodeToString(
                                        profileImage.getBytes()
                                );

                String imageData =
                        "data:" +
                        contentType +
                        ";base64," +
                        base64Image;

                user.setProfileImage(imageData);
            }

            User savedUser =
                    userRepository.save(user);

            Map<String, Object> response =
                    new HashMap<>();

            response.put("id", savedUser.getId());
            response.put("name", savedUser.getName());
            response.put("email", savedUser.getEmail());
            response.put(
                    "companyName",
                    savedUser.getCompanyName() != null
                            ? savedUser.getCompanyName()
                            : ""
            );
            response.put(
                    "phone",
                    savedUser.getPhone() != null
                            ? savedUser.getPhone()
                            : ""
            );
            response.put(
                    "address",
                    savedUser.getAddress() != null
                            ? savedUser.getAddress()
                            : ""
            );
            response.put(
                    "website",
                    savedUser.getWebsite() != null
                            ? savedUser.getWebsite()
                            : ""
            );
            response.put(
                    "theme",
                    savedUser.getTheme() != null
                            ? savedUser.getTheme()
                            : "Light"
            );
            response.put(
                    "notifications",
                    savedUser.getNotifications() != null
                            ? savedUser.getNotifications()
                            : true
            );
            response.put(
                    "profileImage",
                    savedUser.getProfileImage() != null
                            ? savedUser.getProfileImage()
                            : ""
            );

            return ResponseEntity.ok(response);

        } catch (IOException exception) {
            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Profile image processing failed"
                            )
                    );

        } catch (Exception exception) {
            exception.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Profile update failed"
                            )
                    );
        }
    }
}