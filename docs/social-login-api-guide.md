# 소셜 로그인 api 키 사용 가이드

## 1. application-secret.properties 에 코드 추가

```
# =======================================================
# Social Login
# =======================================================
app.backend-base-url=http://localhost:8080
app.frontend-base-url=http://localhost:5173

oauth.naver.client-id=
oauth.naver.client-secret=

oauth.kakao.client-id=
oauth.kakao.client-secret=

oauth.google.client-id=
oauth.google.client-secret=
```

## 2. api 키 발급받기

### 2-1. 네이버

A. https://developers.naver.com/main/ 접속

B. '네이버 로그인' 클릭

C. '오픈 API 이용 신청' 클릭

D. '어플리케이션 이름, 카테고리' 자유롭게 설정 후

#### E. 필수!! '사용 API'에서 '회원이름', '연락처 이메일 주소' 영역 '필수' 체크
F. 서비스 URL : http://localhost:5173

G. 네이버 로그인 Callback URL(3개 다 등록) :

    1. http://localhost:8080/api/auth/naver/callback
    2. http://localhost:8080
    3. http://localhost:5173

H. 네이버에서 얻은 api 키를 프로젝트의 application-secret.properties에 입력
```
oauth.naver.client-id= Client ID
oauth.naver.client-secret= Client Secret
```


### 2-2 카카오

A. https://developers.kakao.com/ 접속

B. header에 '앱' 클릭

C. 좌측 메뉴에서 '앱' - '제품 링크 관리' 들어가서
    
    웹 도메인 : http://localhost:5173 설정 

D. '앱 생성' 클릭 => 필수 입력만 입력(url 입력 X)

E. 좌측 메뉴에서 '비즈니스 인증' 클릭 후 '개인 개발자 등록(? 기억이 안 나요 ㅠ)
    
    *중요* 여기에서 동의 항목에서 이메일 허용

F. 좌측 메뉴에서 '카카오 로그인' - '일반' 들어가서 사용설정 'ON'

G. 좌측 메뉴에서 '카카오 로그인' - '동의항목' 들어가서 '닉네임', '카카오계정(이메일)' 필수 동의 설정

H. 좌측 메뉴에서 '앱' - '플랫폼 키' 들어가서

    1. REST API 키에서 보이는 key가 'API ID'입니다.
    2. 클릭하면 상세 페이지로 이동하는데 가장 위에 'REST API 키'는 방금과 동일한 키입니다.
    3. 내리면 '카카오 로그인'에 코드가 있는데 이게 'secret'입니다.

I. '카카오 로그인 리다이렉트 URI' 에 3개 등록

    1. http://localhost:8080/api/auth/kakao/callback
    2. http://localhost:8080
    3. http://localhost:5173

J. 카카오에서 얻은 api 키를 프로젝트의 application-secret.properties에 입력

```
oauth.kakao.client-id= API ID(REST API 키)
oauth.kakao.client-secret= secret
```

### 2-3 구글

A. https://console.cloud.google.com/ 접속

B. 좌측 위 '프로젝트 생성' - '새 프로젝트' - '만들기'

C. 우측 위 '종 모양'(아마 열려 있을 거예요.) 해당 프로젝트 선택 

    1. 시작하기 누른 후 입력 사항 기입
    2. OAuth 클라이언트 만들기
    3. 웹 어플리케이션

D. 좌측 메뉴에서 'API 및 서비스' > '사용자 인증 정보' 들어가서 방금 만든 프로젝트 접속

E. '승인된 JavaScript 원본' 에 http://localhost:3000 입력

F. '승인된 리다이랙 URI'에 아래 3개 입력 후 저장

    1. http://localhost:8080/api/auth/google/callback 
    2. http://localhost:8080
    3. http://localhost:5173

G. 구글에서 얻은 api 키를 프로젝트의 application-secret.properties에 입력

```
oauth.google.client-id= 클라이언트 ID
oauth.google.client-secret= 클라이언트 보안 비밀번호
```