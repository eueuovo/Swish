package dev.dhkim.swish.config;

import dev.dhkim.swish.interceptor.DormCheckInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
    private DormCheckInterceptor dormCheckInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(dormCheckInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/user/login", "/user/logout", "/user/register",
                        "/user/dorm", "user/dorm/**",
                        "/assets/**", "/user/assets/**",
                        "/fragments/**"
                );
    }
}
