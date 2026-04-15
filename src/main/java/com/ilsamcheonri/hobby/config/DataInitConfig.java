package com.ilsamcheonri.hobby.config;

import com.ilsamcheonri.hobby.entity.RoleCode;
import com.ilsamcheonri.hobby.repository.RoleCodeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitConfig {

    @Bean
    CommandLineRunner init(RoleCodeRepository repo) {
        return args -> {
            if (repo.findByRoleCode("U").isEmpty()) {
                RoleCode role = RoleCode.create("U", "일반 사용자");
                repo.save(role);
            }
        };
    }
}
