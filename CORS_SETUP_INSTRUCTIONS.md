# CORS Configuration for Credit Score Java API

Since the Credit Score API is a separate Java service running on port 9090, you need to configure CORS to allow requests from your Next.js frontend (localhost:3000).

## Option 1: Spring Boot Global CORS Configuration

Add this configuration class to your Java project:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Allow origins
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:8080");
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Allow all methods
        config.addAllowedMethod("*");
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

## Option 2: Controller-Level CORS

Add `@CrossOrigin` annotation to your controller:

```java
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class CreditScoreController {
    
    @PostMapping("/api/v1/credit-score")
    public ResponseEntity<?> getCreditScore(@RequestBody Map<String, String> request) {
        // Your existing code
    }
}
```

## Option 3: WebMvcConfigurer

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## After Adding CORS Configuration

1. Rebuild your Java application
2. Restart the server on port 9090
3. Test the credit score API from your Next.js frontend

The frontend code is now configured to call `http://localhost:9090/api/v1/credit-score` directly using the new `creditScoreApi` Axios instance.
