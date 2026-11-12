package com.verse.backend.service;

import com.verse.backend.dto.AuthenticationRequest;
import com.verse.backend.dto.AuthenticationResponse;
import com.verse.backend.dto.RegisterRequest;
import com.verse.backend.entity.User;
import com.verse.backend.repository.UserRepository;
import com.verse.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        if(repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already taken");
        }
        var user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();
        repository.save(user);

        org.springframework.security.core.userdetails.UserDetails userDetails = 
                new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPasswordHash(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );

        Map<String, Object> claims = Map.of(
                "role", user.getRole().name(),
                "username", user.getUsername() != null ? user.getUsername() : user.getEmail()
        );
        var jwtToken = jwtUtil.generateToken(claims, userDetails);
        var refreshToken = jwtUtil.generateRefreshToken(claims, userDetails);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
                
        org.springframework.security.core.userdetails.UserDetails userDetails = 
                new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPasswordHash(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );

        Map<String, Object> claims = Map.of(
                "role", user.getRole().name(),
                "username", user.getUsername() != null ? user.getUsername() : user.getEmail()
        );
        var jwtToken = jwtUtil.generateToken(claims, userDetails);
        var refreshToken = jwtUtil.generateRefreshToken(claims, userDetails);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }
}
