package dev.dhkim.swish.interceptor;

import dev.dhkim.swish.entities.user.UserEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class DormCheckInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        HttpSession session = request.getSession(false);
        if (session == null) return true;

        UserEntity user = (UserEntity) session.getAttribute("sessionUser");

        if (user != null && user.getDormId() == null) {
            response.sendRedirect("/user/dorm");
            return false;
        }
        return true;
    }
}
