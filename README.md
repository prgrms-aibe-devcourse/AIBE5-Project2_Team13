# AIBE5-Project2_Team13
🎯 1. 디렉토리 구조 규칙 (Monorepo)
하나의 저장소를 사용하므로, 프론트엔드와 백엔드 작업 공간을 완전히 분리합니다.

React 작업은 반드시 /frontend 디렉토리 내부에서만 진행합니다.

Spring Boot 작업은 반드시 /backend 디렉토리 내부에서만 진행합니다.

주의: 최상단(Root) 경로에는 README.md 외의 소스코드를 직접 작성하지 않습니다.

🌿 2. 브랜치 전략 (Branch Strategy)
우리는 main - develop - feature 3단계 브랜치 전략을 사용합니다.

main: 실제 서비스가 배포되는 절대 건드리면 안 되는 안정적인 브랜치

develop: 배포 전 기능들을 하나로 모아서 테스트하는 통합 브랜치 (기본 작업 브랜치)

feature/...: 각자 맡은 개별 기능(CRUD 등)을 개발하는 개인 브랜치

🏷 3. 명명 규칙 (Naming Convention)
브랜치 이름: 종류/이슈번호-기능요약

예시: feature/#1-user-login, fix/#3-board-error

커밋 메시지: [태그] 이슈번호: 작업내용

예시: [feat] #1: 로그인 API 연동 완료, [fix] #3: 게시글 삭제 버그 수정

태그 종류: [feat](새로운 기능), [fix](버그 수정), [docs](문서 수정), [refactor](코드 리팩토링)

💻 4. 기본 작업 흐름 (Workflow)
작업을 시작할 때부터 끝낼 때까지의 터미널 명령어 순서입니다. 그대로 따라 치시면 됩니다.

Bash
```
# 1. 작업 시작 전, 원격 저장소의 최신 상태를 받아옵니다.
git checkout develop
git pull origin develop

# 2. 새로운 기능을 개발할 개인 브랜치를 생성하고 이동합니다. (예: 5번 이슈인 회원가입)
git checkout -b feature/#5-signup

# 3. 열심히 코드를 작성합니다. (프론트/백엔드 폴더 구분 주의!)

# 4. 변경된 파일들을 장바구니(Staging Area)에 담습니다.
git add .

# 5. 커밋 규칙에 맞춰 사진을 찍습니다(커밋).
git commit -m "[feat] #5: 회원가입 폼 UI 컴포넌트 생성"

# 6. 내 브랜치를 원격(GitHub) 저장소에 밀어 올립니다.
git push origin feature/#5-signup
```
