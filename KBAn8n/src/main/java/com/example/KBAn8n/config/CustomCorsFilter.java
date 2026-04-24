package com.example.KBAn8n.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // Bắt buộc Filter này phải chạy ĐẦU TIÊN, trước mọi thứ
public class CustomCorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        String origin = request.getHeader("Origin");
        if (origin != null && (origin.equals("http://180.93.138.111") || origin.equals("http://localhost:5173"))) {
            // Giữ lại localhost:5173 để sau này bạn vẫn có thể debug dưới máy cá nhân nếu muốn            response.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Mặc định
        }

        // 2. Gắn cứng các Header cho phép
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "authorization, content-type, accept, origin, x-requested-with");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // 3. Xử lý "tiêu diệt" OPTIONS ngay tại cổng
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return; // Dừng ngay, không cho đi vào Spring Boot nữa
        }

        chain.doFilter(req, res);
    }
}