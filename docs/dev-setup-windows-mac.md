# Development Setup For Windows And Mac

## 목적

이 문서는 팀원이 GitHub에서 최신 프로젝트를 받은 뒤 Windows 또는 Mac 환경에서 로컬 실행을 위해 필요한 최소 세팅을 정리한 문서입니다.

## 공통 준비 사항

### 1. 프로젝트 받기

```bash
git clone <repository-url>
cd AIBE5-Project2_Team13
```

이미 프로젝트를 받은 상태라면 최신 코드로 갱신합니다.

```bash
git checkout develop
git pull origin develop
```

### 2. 필수 도구

- Java 17 JDK
- Node.js + npm
- Git
- IntelliJ IDEA 또는 VS Code

주의:

- JRE만 있으면 테스트/빌드가 되지 않습니다.
- 반드시 JDK가 설치되어 있어야 합니다.

### 3. 확인할 설정 파일

백엔드는 아래 설정을 사용합니다.

- `src/main/resources/application.properties`
- `src/main/resources/application-secret.properties`
- `src/main/resources/application-test.properties`

팀 내에서 민감정보 관리 정책상 `application-secret.properties` 내용을 별도로 전달받아야 하는 경우, 최신 내용을 팀 저장소 또는 팀장이 공유한 값으로 맞춰야 합니다.

## Windows 설정

### 1. JDK 확인

PowerShell:

```powershell
java -version
javac -version
```

`javac`가 정상 출력되어야 합니다.

### 2. 백엔드 파일 저장 폴더 생성

현재 기본 설정은 Windows 경로 기준입니다.

```properties
file.upload.path=D:\\fileDownLoadServer\\
```

따라서 로컬 PC에 아래 폴더를 생성합니다.

```powershell
mkdir D:\fileDownLoadServer
```

### 3. 백엔드 실행

PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

테스트 실행:

```powershell
.\mvnw.cmd test
```

### 4. 프론트엔드 실행

```powershell
cd frontend
npm install
npm run dev
```

## Mac 설정

### 1. JDK 확인

Terminal:

```bash
java -version
javac -version
```

`javac`가 없으면 JDK를 다시 설치해야 합니다.

### 2. 파일 저장 경로 수정

현재 기본값은 Windows 경로라서 Mac에서는 그대로 사용할 수 없습니다.

Mac 사용자는 로컬 실행 전에 `file.upload.path`를 Mac 경로로 바꿔야 합니다.

예시:

```properties
file.upload.path=/Users/{mac-user}/fileDownLoadServer/
```

또는 프로젝트 바깥 공통 폴더를 하나 정해서 사용해도 됩니다.

예:

```properties
file.upload.path=/Users/{mac-user}/dev/fileDownLoadServer/
```

### 3. Mac 로컬 폴더 생성

```bash
mkdir -p /Users/{mac-user}/fileDownLoadServer
```

### 4. 권장 방식

Mac 사용자는 `application-secret.properties`를 직접 수정하기보다, 로컬 환경 전용 설정 파일이나 실행 환경 변수로 오버라이드하는 방식을 권장합니다.

예:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--file.upload.path=/Users/{mac-user}/fileDownLoadServer/"
```

또는 IntelliJ 실행 구성에서 아래 VM 옵션 또는 프로그램 인자를 추가합니다.

```text
--file.upload.path=/Users/{mac-user}/fileDownLoadServer/
```

### 5. 백엔드 실행

```bash
./mvnw spring-boot:run
```

테스트 실행:

```bash
./mvnw test
```

### 6. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

## 파일 업로드 모듈 관련 환경 체크

Windows와 Mac 모두 아래를 꼭 확인합니다.

### 1. 업로드 폴더가 실제로 존재하는지

`file.upload.path`에 지정한 폴더가 실제로 있어야 합니다.

### 2. 서버가 해당 경로에 쓰기 가능한지

업로드는 서버가 파일을 직접 저장하므로 쓰기 권한이 있어야 합니다.

### 3. 응답의 `fileUrl` 의미

응답 `fileUrl`은 디스크 경로가 아니라 다운로드 API 경로입니다.

예:

```text
/api/files/download/uuid-file-name.png
```

즉, 프론트는 `fileUrl`을 그대로 사용하면 되고, 실제 저장은 `file.upload.path` 아래에서 처리됩니다.

## 문제 발생 시 우선 점검 항목

### `No compiler is provided in this environment`

- 원인: JRE만 설치됨
- 해결: JDK 17 설치 후 `javac -version` 확인

### 업로드는 되는데 파일이 안 보임

- `fileUrl`을 화면에서 제대로 사용했는지 확인
- `/api/files/download/{savedFileName}` 호출이 가능한지 확인
- `file.upload.path` 폴더에 실제 파일이 생성됐는지 확인

### Mac에서 업로드가 안 됨

- Windows 경로가 그대로 남아 있는지 확인
- `/Users/...` 형태로 `file.upload.path`를 수정했는지 확인
- 해당 폴더에 쓰기 권한이 있는지 확인

## 팀원 공유용 짧은 안내문

```md
GitHub 최신 코드 받은 뒤 아래만 확인해주세요.

- Java는 JDK 17이어야 합니다. `javac -version` 확인
- Windows는 `D:\fileDownLoadServer` 폴더 생성
- Mac은 `file.upload.path`를 본인 Mac 경로로 변경
- 프론트 실행 전 `frontend`에서 `npm install`
- 백엔드 실행은 루트에서 `mvnw` 또는 `mvnw.cmd` 사용
```
