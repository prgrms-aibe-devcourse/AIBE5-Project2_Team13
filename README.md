# AIBE5-Project2_Team13
# 🚀 일삼천리(Il-sam-cheon-ri) 프로젝트 협업 가이드

본 문서는 팀 프로젝트의 코드 품질 유지와 안전한 병합(Merge)을 위한 가이드라인입니다. 모든 팀원은 작업 시작 전 이 내용을 반드시 숙지합니다.

---

## 📂 1. 저장소 구조 (Monorepo)
하나의 저장소에서 프론트엔드와 백엔드를 관리합니다.
- `/frontend`: React 소스 코드
- `이외`: Spring Boot 소스 코드
- **주의**: 폴더 밖(Root) 공간에 개인 파일을 생성하지 마세요.

## 🌿 2. 브랜치 전략
우리는 **GitHub Flow**를 기반으로 운영합니다.
- `main`: 최종 배포 브랜치 (관리자만 병합 가능)
- `develop`: 개발 통합 브랜치 (기본 작업 및 테스트 공간)
- `feature/(도메인이름) - 기능`: 각 기능별 작업 공간
  - 예: `feature/로그인 - login 기능 개발`, `feature/#클래스 - 클래스 등록 기능`

## 🏷 3. 커밋 및 네이밍 규칙
### 커밋 메시지 태그
- `[feat]`: 새로운 기능 추가
- `[fix]`: 버그 수정
- `[docs]`: 문서 수정 (README.md 등)
- `[refactor]`: 코드 리팩토링 (기능 변경 없음)
- `[style]`: 코드 포맷팅, 세미콜론 누락 수정 (로직 변경 없음)

### 메시지 형식
`[태그] #이슈번호: 요약 내용`
> 예: `[feat] #5: 회원가입 API 유효성 검사 로직 추가`

---

## 💻 4. 표준 작업 프로세스
작업 시 아래 명령어를 순서대로 실행하세요.

### ① 작업 시작 전 (환경 최신화)

```
git checkout develop
git pull origin develop
```

### ② 기능 브랜치 생성 및 이동

```
git checkout -b feature/#이슈번호-기능명
```

### ③ 코드 수정 후 커밋

```
git add .
git commit -m "[feat] #이슈번호: 작업내용"
```

### ④ 원격 저장소에 Push (PR 준비)

```
git push origin feature/#이슈번호-기능명
```

### ⑤ Pull Request (PR) 및 검토
GitHub에서 develop 브랜치를 대상으로 PR 생성

Reviewer에 팀원 1명 지정

리뷰어가 승인(Approve)하면 작성자가 직접 Merge 실행

## 🚨 5. 충돌(Conflict) 발생 시 대처법
당황하지 마세요! 충돌은 개발의 일부입니다.

현재 내 브랜치에서 최신 develop을 가져와 합칩니다.

Bash
git pull origin develop
IDE(VS Code, IntelliJ 등)에서 충돌 부위를 확인하고 팀원과 상의하여 코드를 선택합니다.

수정 완료 후 다시 add -> commit -> push 하세요
