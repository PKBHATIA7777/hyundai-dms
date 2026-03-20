package com.example.demo.util;

import com.example.demo.config.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${hyundai.dms.jwtSecret}")
    private String jwtSecret;

    @Value("${hyundai.dms.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        
        // Header: Base64 encoded {"alg":"HS256","typ":"JWT"}
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        
        // Payload: Base64 encoded {"sub":"username","iat":timestamp,"exp":timestamp}
        long now = System.currentTimeMillis();
        String payloadJson = String.format("{\"sub\":\"%s\",\"iat\":%d,\"exp\":%d}", 
                            userPrincipal.getUsername(), now / 1000, (now + jwtExpirationMs) / 1000);
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        
        // Signature
        String signature = createSignature(header + "." + payload);
        
        return header + "." + payload + "." + signature;
    }

    private String createSignature(String data) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            logger.error("Error creating JWT signature", e);
            return null;
        }
    }

    public String getUserNameFromJwtToken(String token) {
        try {
            String[] parts = token.split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            return payload.split("\"sub\":\"")[1].split("\"")[0];
        } catch (Exception e) {
            return null;
        }
    }

 public boolean validateJwtToken(String authToken) {
    try {
        String[] parts = authToken.split("\\.");
        if (parts.length != 3) return false;
        
        // Verify signature
        String expectedSign = createSignature(parts[0] + "." + parts[1]);
        if (!expectedSign.equals(parts[2])) return false;
        
        // Check expiry
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        String expStr = payload.split("\"exp\":")[1].split("[,}]")[0].trim();
        long exp = Long.parseLong(expStr);
        return System.currentTimeMillis() / 1000 < exp;
        
    } catch (Exception e) {
        logger.error("JWT validation error: {}", e.getMessage());
        return false;
    }
}
}