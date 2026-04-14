package com.ilsamcheonri.hobby;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootTest
public class ConnectionTest {

    @Autowired
    DataSource dataSource;

    @Test
    @DisplayName("AWS RDS(MySQL) DB 연결 테스트")
    void testConnection() {
        // SpringBootTest가 로드되면서 DataSource 설정에 따라 DB 연결을 시도합니다.
        // 연결 실패 시 컨텍스트 로드 단계에서 예외가 발생합니다.
        try (Connection connection = dataSource.getConnection()){
            System.out.println("========================================");
            System.out.println("🎉 일삼천리 DB 연결 성공! 🎉");
            System.out.println("사용 중인 DB URL: " + connection.getMetaData().getURL());
            System.out.println("사용 중인 DB 계정: " + connection.getMetaData().getUserName());
            System.out.println("========================================");
        } catch (Exception e){
            System.out.println("DB 연결 실패 : " + e.getMessage());
        }
    }

}
