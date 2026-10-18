package com.medora.security;

import com.medora.dao.UserDao;
import com.medora.model.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

/**
 * Intercepts every request once. If a valid JWT is present in the Authorization header,
 * sets the authenticated user in the Spring Security context so that downstream
 * controllers and security rules can inspect the caller's identity and role.
 *
 * If the token is missing or invalid, the request proceeds anonymously —
 * this preserves backwards compatibility with demo mode (fake tokens).
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDao userDao;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtUtil.isTokenValid(token)) {
                    String email = jwtUtil.extractEmail(token);
                    Optional<User> userOpt = userDao.findByEmail(email);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        user,
                                        null,
                                        Collections.singletonList(
                                                new SimpleGrantedAuthority("ROLE_" + user.getRole())
                                        )
                                );
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
                // If token is invalid (e.g. demo token) — proceed anonymously, no exception thrown
            } catch (Exception ignored) {
                // Invalid / expired token — proceed anonymously
            }
        }

        chain.doFilter(request, response);
    }
}
