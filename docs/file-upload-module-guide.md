# File Upload Module Guide

## 목적

이 문서는 팀원들이 공통 파일 업로드 모듈을 중복 구현 없이 바로 사용할 수 있도록 정리한 가이드입니다.

이 모듈은 다음 대상의 첨부파일을 공통 처리합니다.

- `CLASS`
- `MEMBER`
- `FREELANCER`

각 도메인에서 파일 저장 로직을 별도로 만들지 말고, 반드시 공통 `FileService` 또는 `/api/files` API를 사용합니다.

## 공통 규칙

### 1. 필수 파라미터

업로드/수정 시 아래 두 값은 반드시 함께 전달합니다.

- `targetType`: `CLASS` | `MEMBER` | `FREELANCER`
- `targetId`: 각 대상 엔티티의 PK

예시:

- `CLASS` -> 클래스 ID
- `MEMBER` -> 회원 ID
- `FREELANCER` -> 프리랜서 프로필 ID

### 2. 반환값 의미

업로드 응답의 `fileUrl`은 로컬 디스크 경로가 아닙니다.

`fileUrl`은 프론트에서 바로 접근 가능한 다운로드 API 경로입니다.

예:

```json
{
  "fileId": 15,
  "originalFileName": "thumbnail.png",
  "fileUrl": "/api/files/download/550e8400-e29b-41d4-a716-446655440000.png",
  "fileSize": 32145
}
```

### 3. 실제 저장 위치

실제 파일은 서버 로컬 경로인 `file.upload.path` 아래에 저장됩니다.

현재 기본 설정 예시:

```properties
file.upload.path=D:\\fileDownLoadServer\\
```

다운로드 API는 위 경로에 저장된 실제 파일을 읽어서 내려줍니다.

삭제 API는 DB 레코드 삭제 후 해당 실제 파일도 함께 삭제합니다.

## API 목록

### 단건 업로드

- Method: `POST`
- URL: `/api/files/upload`

폼데이터:

- `file`
- `targetType`
- `targetId`

### 다건 업로드

- Method: `POST`
- URL: `/api/files/upload/multiple`

폼데이터:

- `files`
- `targetType`
- `targetId`

### 파일 수정

- Method: `PUT`
- URL: `/api/files/{fileId}`

폼데이터:

- `file`
- `targetType`
- `targetId`

### 파일 삭제

- Method: `DELETE`
- URL: `/api/files/{fileId}`

쿼리 파라미터:

- `targetType`

### 파일 다운로드

- Method: `GET`
- URL: `/api/files/download/{savedFileName}`

## 백엔드에서 직접 사용하는 방법

다른 서비스에서 파일 업로드가 필요하면 `FileService`를 주입받아 사용합니다.

```java
private final FileService fileService;
```

### 단건 업로드 예시

```java
FileUploadResponse response =
        fileService.upload(file, FileTargetType.CLASS, classId);
```

### 다건 업로드 예시

```java
List<FileUploadResponse> responseList =
        fileService.uploadMultiple(files, FileTargetType.CLASS, classId);
```

### 응답 활용 예시

```java
FileUploadResponse response =
        fileService.upload(file, FileTargetType.MEMBER, memberId);

String imageUrl = response.getFileUrl();
Long fileId = response.getFileId();
```

## 프론트엔드 사용 예시

```javascript
const formData = new FormData();
formData.append("file", file);

const response = await axios.post(
  "/api/files/upload?targetType=MEMBER&targetId=1",
  formData
);

const { fileId, fileUrl } = response.data;
```

이미지 출력 예시:

```javascript
<img src={fileUrl} alt="profile" />
```

## 사용 시 주의사항

- 각 도메인에서 `MultipartFile.transferTo()`를 직접 호출하지 않습니다.
- 각 도메인에서 임의의 로컬 경로에 파일을 저장하지 않습니다.
- 업로드 후에는 응답의 `fileUrl`을 화면 표시용으로 사용합니다.
- 삭제는 소프트 삭제가 아니라 실제 DB 레코드 삭제 + 물리 파일 삭제입니다.
- 다건 업로드는 일부 파일 실패 시 실패한 파일만 건너뛰고 나머지를 계속 처리합니다.

## 팀 공지용 짧은 안내문

아래 문구를 팀 채팅방이나 PR 설명에 그대로 공유해도 됩니다.

```md
파일 업로드는 공통 모듈만 사용해주세요.

- API 경로: `/api/files/**`
- 필수값: `targetType`, `targetId`
- 응답 `fileUrl`은 프론트에서 바로 사용할 수 있는 다운로드 API 경로입니다
- 각 도메인에서 개별 파일 저장 로직은 추가하지 않습니다
- 삭제는 DB 레코드 + 실제 파일이 함께 삭제됩니다
```
