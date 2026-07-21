package com.dkpilot.backend.controller;

import com.dkpilot.backend.dto.LoginRequest;
import com.dkpilot.backend.dto.LoginResponse;
import com.dkpilot.backend.entity.User;
import com.dkpilot.backend.security.JwtService;
import com.dkpilot.backend.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {

        User savedUser = userService.registerUser(user);

        User safeUser = createSafeUser(savedUser);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(safeUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(
            @RequestBody LoginRequest loginRequest) {

        User user = userService.loginUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        String token = jwtService.generateToken(user.getEmail());

        User safeUser = createSafeUser(user);

        LoginResponse loginResponse =
                new LoginResponse(token, safeUser);

        return ResponseEntity.ok(loginResponse);
    }

    private User createSafeUser(User user) {

        User safeUser = new User();

        safeUser.setId(user.getId());
        safeUser.setName(user.getName());
        safeUser.setEmail(user.getEmail());
        safeUser.setPassword(null);

        return safeUser;
    }
}