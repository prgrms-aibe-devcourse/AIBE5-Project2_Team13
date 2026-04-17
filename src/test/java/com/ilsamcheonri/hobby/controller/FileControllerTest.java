package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.HobbyMatchingApplication;
import com.ilsamcheonri.hobby.dto.file.FileUploadResponse;
import com.ilsamcheonri.hobby.enums.FileTargetType;
import com.ilsamcheonri.hobby.service.FileService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = HobbyMatchingApplication.class)
@AutoConfigureMockMvc
@TestPropertySource(
        locations = "classpath:application-test.properties",
        properties = "jwt.secret=IlsamcheonriTeamHobbyMatchingProjectSecretKey2026!@#"
)
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FileService fileService;

    @Test
    @DisplayName("파일 단건 업로드 성공 시 201과 응답 DTO를 반환한다.")
    @WithMockUser(username = "tester")
    void upload_success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "profile.png",
                MediaType.IMAGE_PNG_VALUE,
                "image-content".getBytes(StandardCharsets.UTF_8)
        );

        FileUploadResponse response = FileUploadResponse.builder()
                .fileId(1L)
                .originalFileName("profile.png")
                .fileUrl("/api/files/download/test-image.png")
                .fileSize(13L)
                .build();

        when(fileService.upload(any(), eq(FileTargetType.MEMBER), eq(10L))).thenReturn(response);

        mockMvc.perform(multipart("/api/files/upload")
                        .file(file)
                        .param("targetType", "MEMBER")
                        .param("targetId", "10"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileId").value(1L))
                .andExpect(jsonPath("$.originalFileName").value("profile.png"))
                .andExpect(jsonPath("$.fileUrl").value("/api/files/download/test-image.png"))
                .andExpect(jsonPath("$.fileSize").value(13L));
    }

    @Test
    @DisplayName("파일 다건 업로드 성공 시 201과 목록을 반환한다.")
    @WithMockUser(username = "tester")
    void uploadMultiple_success() throws Exception {
        MockMultipartFile file1 = new MockMultipartFile(
                "files",
                "a.png",
                MediaType.IMAGE_PNG_VALUE,
                "a".getBytes(StandardCharsets.UTF_8)
        );
        MockMultipartFile file2 = new MockMultipartFile(
                "files",
                "b.png",
                MediaType.IMAGE_PNG_VALUE,
                "b".getBytes(StandardCharsets.UTF_8)
        );

        List<FileUploadResponse> response = List.of(
                FileUploadResponse.builder()
                        .fileId(1L)
                        .originalFileName("a.png")
                        .fileUrl("/api/files/download/a-saved.png")
                        .fileSize(1L)
                        .build(),
                FileUploadResponse.builder()
                        .fileId(2L)
                        .originalFileName("b.png")
                        .fileUrl("/api/files/download/b-saved.png")
                        .fileSize(1L)
                        .build()
        );

        when(fileService.uploadMultiple(any(), eq(FileTargetType.CLASS), eq(3L))).thenReturn(response);

        mockMvc.perform(multipart("/api/files/upload/multiple")
                        .file(file1)
                        .file(file2)
                        .param("targetType", "CLASS")
                        .param("targetId", "3"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].fileId").value(1L))
                .andExpect(jsonPath("$[0].fileUrl").value("/api/files/download/a-saved.png"))
                .andExpect(jsonPath("$[1].fileId").value(2L))
                .andExpect(jsonPath("$[1].fileUrl").value("/api/files/download/b-saved.png"));
    }

    @Test
    @DisplayName("파일 수정 성공 시 200과 새 파일 정보를 반환한다.")
    @WithMockUser(username = "tester")
    void update_success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "changed.png",
                MediaType.IMAGE_PNG_VALUE,
                "changed".getBytes(StandardCharsets.UTF_8)
        );

        FileUploadResponse response = FileUploadResponse.builder()
                .fileId(9L)
                .originalFileName("changed.png")
                .fileUrl("/api/files/download/changed-saved.png")
                .fileSize(7L)
                .build();

        when(fileService.update(eq(7L), any(), eq(FileTargetType.FREELANCER), eq(2L))).thenReturn(response);

        mockMvc.perform(multipart("/api/files/7")
                        .file(file)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .param("targetType", "FREELANCER")
                        .param("targetId", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileId").value(9L))
                .andExpect(jsonPath("$.fileUrl").value("/api/files/download/changed-saved.png"));
    }

    @Test
    @DisplayName("파일 단건 삭제 성공 시 204를 반환한다.")
    @WithMockUser(username = "tester")
    void delete_success() throws Exception {
        doNothing().when(fileService).delete(5L, FileTargetType.CLASS);

        mockMvc.perform(delete("/api/files/5")
                        .param("targetType", "CLASS"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("파일 다운로드 성공 시 200과 파일 바디를 반환한다.")
    void download_success() throws Exception {
        ByteArrayResource resource = new ByteArrayResource("hello-file".getBytes(StandardCharsets.UTF_8)) {
            @Override
            public boolean exists() {
                return true;
            }
        };

        when(fileService.download("sample.png")).thenReturn(resource);

        mockMvc.perform(get("/api/files/download/sample.png"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"sample.png\""))
                .andExpect(content().bytes("hello-file".getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    @DisplayName("파일이 없으면 다운로드 API는 404를 반환한다.")
    void download_notFound() throws Exception {
        doThrow(new IllegalArgumentException("파일 없음"))
                .when(fileService).download("missing.png");

        mockMvc.perform(get("/api/files/download/missing.png"))
                .andExpect(status().isNotFound());
    }
}
