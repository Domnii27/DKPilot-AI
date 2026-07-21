package com.dkpilot.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "DKPilotAI-Super-Secret-JWT-Key-2026-123456789";

    private static final long EXPIRATION_TIME =
            24 * 60 * 60 * 1000;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String email) {
        Date currentDate = new Date();

        Date expiryDate = new Date(
                currentDate.getTime() + EXPIRATION_TIME
        );

        return Jwts.builder()
                .subject(email)
                .issuedAt(currentDate)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String email) {
        String tokenEmail = extractEmail(token);

        return tokenEmail.equals(email)
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Date expirationDate =
                extractAllClaims(token).getExpiration();

        return expirationDate.before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}