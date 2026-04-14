// src/main/java/com/ilsamcheonri/hobby/controller/TestController.java
package com.ilsamcheonri.hobby.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public String test() {
        return "Hello from Spring Boot!";
    }
}