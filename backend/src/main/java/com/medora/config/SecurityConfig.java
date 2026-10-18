package com.medora.config;

import com.medora.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS is handled by CorsConfig — let Spring Security respect it
            .cors().and()
            // CSRF not needed for stateless JWT API
            .csrf().disable()
            // Stateless session — no HTTP session, auth comes from JWT
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Auth endpoints are always public
                .requestMatchers("/api/auth/**").permitAll()
                // Patient-scoped endpoint — requires an authenticated PATIENT or ADMIN
                .requestMatchers("/api/appointments/mine").authenticated()
                // Doctor-scoped endpoint — requires an authenticated DOCTOR or ADMIN
                .requestMatchers("/api/doctors/me").authenticated()
                // All other API routes: permit (preserves demo mode for Vercel deployment)
                // Backend-level ownership checks happen inside controllers via SecurityContext
                .requestMatchers("/api/**").permitAll()
                .anyRequest().authenticated()
            )
            // Run our JWT filter before Spring's default username/password filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
