export interface ClassItem {
  id: string;
  title: string;
  freelancer: string;
  freelancerEmail?: string;
  freelancerId?: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  isOffline: boolean;
  location?: string;
  startAt?: string;
  endAt?: string;
  maxCapacity?: number;
  curriculum?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RequestItem {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  reward: number;
  category: string;
  image: string;
  comments: number;
  location?: string;
  timeSlot?: string;
  lessonType?: string;
  startAt?: string;       // 희망 시작 일시
  endAt?: string;         // 희망 종료 일시
  requesterEmail?: string; // 본인 글 여부 판단용
}

export const REGIONS = [
  {
    name: '서울특별시',
    districts: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구']
  },
  {
    name: '경기도',
    districts: ['수원시', '고양시', '용인시', '성남시', '부천시', '화성시', '안산시', '남양주시', '안양시', '평택시', '시흥시', '파주시', '의정부시', '김포시', '광주시', '광명시', '군포시', '하남시', '오산시', '양주시', '이천시', '구리시', '안성시', '포천시', '의왕시', '양평군', '여주시', '동두천시', '가평군', '과천시', '연천군']
  },
  {
    name: '인천광역시',
    districts: ['계양구', '미추홀구', '남동구', '동구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군']
  },
  {
    name: '부산광역시',
    districts: ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군']
  },
  {
    name: '대구광역시',
    districts: ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구', '달성군', '군위군']
  },
  {
    name: '광주광역시',
    districts: ['광산구', '남구', '동구', '북구', '서구']
  },
  {
    name: '대전광역시',
    districts: ['대덕구', '동구', '서구', '유성구', '중구']
  },
  {
    name: '울산광역시',
    districts: ['남구', '동구', '북구', '중구', '울주군']
  },
  {
    name: '세종특별자치시',
    districts: ['세종시']
  },
  {
    name: '강원특별자치도',
    districts: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군']
  },
  {
    name: '충청북도',
    districts: ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군']
  },
  {
    name: '충청남도',
    districts: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군']
  },
  {
    name: '전북특별자치도',
    districts: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군']
  },
  {
    name: '전라남도',
    districts: ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군']
  },
  {
    name: '경상북도',
    districts: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군']
  },
  {
    name: '경상남도',
    districts: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군']
  },
  {
    name: '제주특별자치도',
    districts: ['제주시', '서귀포시']
  }
];

export const CATEGORIES = [
  { id: 'beauty', name: '뷰티·패션', icon: 'Sparkles' },
  { id: 'music', name: '음악·악기', icon: 'Music' },
  { id: 'art', name: '미술·공예', icon: 'Palette' },
  { id: 'dance', name: '댄스·연기', icon: 'Drama' },
  { id: 'edu', name: '어학·교육', icon: 'Languages' },
  { id: 'sports', name: '스포츠·레저', icon: 'Trophy' },
  { id: 'game', name: '게임', icon: 'Gamepad2' },
  { id: 'life', name: '라이프·요리', icon: 'Utensils' },
  { id: 'etc', name: '기타', icon: 'MoreHorizontal' },
];

//클래스 더미데이터
export const MOCK_CLASSES: ClassItem[] = [
  {
    id: '1',
    title: '따스한 수채화 원데이 클래스',
    freelancer: '김화가',
    freelancerId: 'f1',
    price: 35000,
    category: 'art',
    image: 'https://picsum.photos/seed/art1/400/300',
    rating: 4.9,
    reviews: 124,
    isOffline: true,
    location: '서울특별시 종로구',
    createdAt: '2024-04-01'
  },
  {
    id: '2',
    title: '초보 자전거 정비 및 라이딩 기초',
    freelancer: '바이크마스터',
    freelancerId: 'f1',
    price: 25000,
    category: 'sports',
    image: 'https://picsum.photos/seed/bike/400/300',
    rating: 4.8,
    reviews: 89,
    isOffline: true,
    location: '경기도 수원시',
    createdAt: '2024-04-02'
  },
  {
    id: '3',
    title: '나만의 향수 만들기: 조향 기초',
    freelancer: '센트룸',
    freelancerId: 'f1',
    price: 45000,
    category: 'beauty',
    image: 'https://picsum.photos/seed/perfume/400/300',
    rating: 5.0,
    reviews: 56,
    isOffline: true,
    location: '서울특별시 강남구',
    createdAt: '2024-04-03'
  },
  {
    id: '4',
    title: '퇴근 후 즐기는 재즈 피아노',
    freelancer: '멜로디킴',
    freelancerId: 'f1',
    price: 55000,
    category: 'music',
    image: 'https://picsum.photos/seed/piano/400/300',
    rating: 4.7,
    reviews: 42,
    isOffline: false,
    createdAt: '2024-04-04'
  },
  {
    id: '5',
    title: '왕초보도 가능한 가죽 공예: 카드지갑',
    freelancer: '레더워크',
    freelancerId: 'f1',
    price: 38000,
    category: 'art',
    image: 'https://picsum.photos/seed/leather/400/300',
    rating: 4.9,
    reviews: 67,
    isOffline: true,
    location: '서울특별시 마포구',
    createdAt: '2024-04-05'
  },
  {
    id: '6',
    title: '집에서 만드는 정통 이탈리안 요리',
    freelancer: '셰프박',
    freelancerId: 'f1',
    price: 42000,
    category: 'life',
    image: 'https://picsum.photos/seed/pasta/400/300',
    rating: 4.8,
    reviews: 93,
    isOffline: false,
    createdAt: '2024-04-06'
  },
  {
    id: '7',
    title: '전 프로게이머가 알려주는 롤 티어 올리는 법',
    freelancer: '페이커워너비',
    freelancerId: 'f1',
    price: 35000,
    category: 'game',
    image: 'https://picsum.photos/seed/lol/400/300',
    rating: 4.9,
    reviews: 128,
    isOffline: false,
    createdAt: '2024-04-07'
  },
  {
    id: '8',
    title: '퇴근 후 힐링, 아이패드 드로잉 기초',
    freelancer: '그림그리는토끼',
    freelancerId: 'f1',
    price: 25000,
    category: 'art',
    image: 'https://picsum.photos/seed/ipad/400/300',
    rating: 4.8,
    reviews: 256,
    isOffline: false,
    createdAt: '2024-04-08'
  },
  {
    id: '9',
    title: '한 달 만에 마스터하는 통기타 기초',
    freelancer: '기타치는베짱이',
    freelancerId: 'f1',
    price: 40000,
    category: 'music',
    image: 'https://picsum.photos/seed/guitar/400/300',
    rating: 5.0,
    reviews: 89,
    isOffline: true,
    location: '서울시 마포구',
    createdAt: '2024-04-09'
  },
  {
    id: '10',
    title: '자취생을 위한 10분 컷 홈카페 레시피',
    freelancer: '바리스타킴',
    freelancerId: 'f1',
    price: 15000,
    category: 'life',
    image: 'https://picsum.photos/seed/homecafe/400/300',
    rating: 4.7,
    reviews: 42,
    isOffline: false,
    createdAt: '2024-04-10'
  },
  {
    id: '11',
    title: '나에게 딱 맞는 퍼스널 컬러 진단 & 메이크업',
    freelancer: '컬러리스트제이',
    freelancerId: 'f1',
    price: 55000,
    category: 'beauty',
    image: 'https://picsum.photos/seed/personalcolor/400/300',
    rating: 4.9,
    reviews: 312,
    isOffline: true,
    location: '서울시 강남구',
    createdAt: '2024-04-11'
  },
  {
    id: '12',
    title: '몸치 탈출! K-POP 방송댄스 1:1 레슨',
    freelancer: '댄서로아',
    freelancerId: 'f1',
    price: 45000,
    category: 'dance',
    image: 'https://picsum.photos/seed/kpop/400/300',
    rating: 4.8,
    reviews: 156,
    isOffline: true,
    location: '서울시 서초구',
    createdAt: '2024-04-12'
  },
  {
    id: '13',
    title: '미드 쉐도잉으로 배우는 진짜 원어민 영어',
    freelancer: '잉글리시쌤',
    freelancerId: 'f1',
    price: 30000,
    category: 'edu',
    image: 'https://picsum.photos/seed/english/400/300',
    rating: 4.9,
    reviews: 420,
    isOffline: false,
    createdAt: '2024-04-13'
  },
  {
    id: '14',
    title: '거북목 탈출! 체형 교정 필라테스 1:1 레슨',
    freelancer: '필라테스여신',
    freelancerId: 'f1',
    price: 60000,
    category: 'sports',
    image: 'https://picsum.photos/seed/pilates/400/300',
    rating: 5.0,
    reviews: 189,
    isOffline: true,
    location: '서울시 송파구',
    createdAt: '2024-04-14'
  },
  {
    id: '15',
    title: '발로란트 에임 깎는 장인의 1:1 코칭',
    freelancer: '헤드헌터',
    freelancerId: 'f1',
    price: 25000,
    category: 'game',
    image: 'https://picsum.photos/seed/valorant/400/300',
    rating: 4.7,
    reviews: 95,
    isOffline: false,
    createdAt: '2024-04-15'
  },
  {
    id: '16',
    title: '똥손도 가능한 감성 오일파스텔 풍경화',
    freelancer: '파스텔요정',
    freelancerId: 'f1',
    price: 35000,
    category: 'art',
    image: 'https://picsum.photos/seed/pastel/400/300',
    rating: 4.9,
    reviews: 112,
    isOffline: true,
    location: '서울시 마포구',
    createdAt: '2024-04-16'
  },
  {
    id: '17',
    title: '음치 탈출! 시원하게 고음 뚫어주는 보컬 레슨',
    freelancer: '고음폭발',
    freelancerId: 'f1',
    price: 50000,
    category: 'music',
    image: 'https://picsum.photos/seed/vocal/400/300',
    rating: 4.8,
    reviews: 210,
    isOffline: true,
    location: '서울시 강남구',
    createdAt: '2024-04-17'
  },
  {
    id: '18',
    title: '초보 홈베이킹: 겉바속촉 휘낭시에 만들기',
    freelancer: '빵굽는마을',
    freelancerId: 'f1',
    price: 45000,
    category: 'life',
    image: 'https://picsum.photos/seed/baking/400/300',
    rating: 4.9,
    reviews: 154,
    isOffline: true,
    location: '서울시 성동구',
    createdAt: '2024-04-18'
  },
  {
    id: '19',
    title: '곰손을 위한 데일리 퀵 메이크업 1:1 코칭',
    freelancer: '뷰티멘토',
    freelancerId: 'f1',
    price: 40000,
    category: 'beauty',
    image: 'https://picsum.photos/seed/makeup/400/300',
    rating: 4.7,
    reviews: 88,
    isOffline: true,
    location: '서울시 강남구',
    createdAt: '2024-04-19'
  },
  {
    id: '20',
    title: '스트릿 댄스 입문: 힙합 그루브 타기',
    freelancer: '그루브마스터',
    freelancerId: 'f1',
    price: 45000,
    category: 'dance',
    image: 'https://picsum.photos/seed/streetdance/400/300',
    rating: 4.9,
    reviews: 132,
    isOffline: true,
    location: '서울시 마포구',
    createdAt: '2024-04-20'
  },
  {
    id: '21',
    title: '애니메이션으로 배우는 찐 일상 일본어',
    freelancer: '오타쿠센세',
    freelancerId: 'f1',
    price: 25000,
    category: 'edu',
    image: 'https://picsum.photos/seed/japanese/400/300',
    rating: 4.8,
    reviews: 275,
    isOffline: false,
    createdAt: '2024-04-21'
  },
  {
    id: '22',
    title: '테린이를 위한 랠리 성공 프로젝트',
    freelancer: '테니스왕자',
    freelancerId: 'f1',
    price: 55000,
    category: 'sports',
    image: 'https://picsum.photos/seed/tennis/400/300',
    rating: 4.9,
    reviews: 198,
    isOffline: true,
    location: '서울시 송파구',
    createdAt: '2024-04-22'
  },
  {
    id: '23',
    title: '유튜브 시작하기: 프리미어 프로 컷편집 기초',
    freelancer: '편집의신',
    freelancerId: 'f1',
    price: 30000,
    category: 'etc',
    image: 'https://picsum.photos/seed/youtube/400/300',
    rating: 4.7,
    reviews: 340,
    isOffline: false,
    createdAt: '2024-04-23'
  },
  {
    id: '24',
    title: '오버워치2 포지션별 맞춤 피드백 코칭',
    freelancer: '그랜드마스터',
    freelancerId: 'f1',
    price: 30000,
    category: 'game',
    image: 'https://picsum.photos/seed/overwatch/400/300',
    rating: 4.8,
    reviews: 76,
    isOffline: false,
    createdAt: '2024-04-24'
  },
  {
    id: '25',
    title: '물 번짐의 미학, 감성 수채화 일러스트',
    freelancer: '물감요정',
    freelancerId: 'f1',
    price: 35000,
    category: 'art',
    image: 'https://picsum.photos/seed/watercolor/400/300',
    rating: 4.9,
    reviews: 145,
    isOffline: true,
    location: '서울시 종로구',
    createdAt: '2024-04-25'
  },
  {
    id: '26',
    title: '피아노치는남자: 이루마 곡 한 달 완성',
    freelancer: '피아노치는남자',
    freelancerId: 'f1',
    price: 45000,
    category: 'music',
    image: 'https://picsum.photos/seed/piano2/400/300',
    rating: 5.0,
    reviews: 220,
    isOffline: true,
    location: '서울시 서초구',
    createdAt: '2024-04-26'
  },
  {
    id: '27',
    title: '미니멀 라이프를 위한 공간 정리 수납 컨설팅',
    freelancer: '정리의달인',
    freelancerId: 'f1',
    price: 50000,
    category: 'life',
    image: 'https://picsum.photos/seed/organize/400/300',
    rating: 4.8,
    reviews: 92,
    isOffline: true,
    location: '서울시 강남구',
    createdAt: '2024-04-27'
  },
  {
    id: '28',
    title: '체형별 맞춤 데일리룩 스타일링 코칭',
    freelancer: '스타일리스트킴',
    freelancerId: 'f1',
    price: 60000,
    category: 'beauty',
    image: 'https://picsum.photos/seed/styling/400/300',
    rating: 4.7,
    reviews: 115,
    isOffline: true,
    location: '서울시 강남구',
    createdAt: '2024-04-28'
  },
  {
    id: '29',
    title: '우아한 취미, 성인 취미 발레 기초',
    freelancer: '백조의호수',
    freelancerId: 'f1',
    price: 50000,
    category: 'dance',
    image: 'https://picsum.photos/seed/ballet/400/300',
    rating: 4.9,
    reviews: 180,
    isOffline: true,
    location: '서울시 서초구',
    createdAt: '2024-04-29'
  },
  {
    id: '30',
    title: '여행 스페인어: 한 달 만에 현지인처럼 주문하기',
    freelancer: '올라쌤',
    freelancerId: 'f1',
    price: 25000,
    category: 'edu',
    image: 'https://picsum.photos/seed/spanish/400/300',
    rating: 4.8,
    reviews: 85,
    isOffline: false,
    createdAt: '2024-04-30'
  },
  {
    id: '31',
    title: '물공포증 극복! 성인 수영 1:1 개인 강습',
    freelancer: '물개코치',
    freelancerId: 'f1',
    price: 70000,
    category: 'sports',
    image: 'https://picsum.photos/seed/swim/400/300',
    rating: 5.0,
    reviews: 142,
    isOffline: true,
    location: '서울시 송파구',
    createdAt: '2024-05-01'
  },
  {
    id: '32',
    title: '일잘러의 필수템, 노션(Notion) 완벽 활용법',
    freelancer: '노션마스터',
    freelancerId: 'f1',
    price: 20000,
    category: 'etc',
    image: 'https://picsum.photos/seed/notion/400/300',
    rating: 4.9,
    reviews: 310,
    isOffline: false,
    createdAt: '2024-05-02'
  },
  {
    id: '33',
    title: '배틀그라운드 치킨 먹는 운영법 코칭',
    freelancer: '치킨전문가',
    freelancerId: 'f1',
    price: 25000,
    category: 'game',
    image: 'https://picsum.photos/seed/pubg/400/300',
    rating: 4.7,
    reviews: 85,
    isOffline: false,
    createdAt: '2024-05-03'
  },
  {
    id: '34',
    title: '흙을 만지며 힐링하는 도자기 물레 체험',
    freelancer: '도예가김',
    freelancerId: 'f1',
    price: 40000,
    category: 'art',
    image: 'https://picsum.photos/seed/pottery/400/300',
    rating: 4.9,
    reviews: 205,
    isOffline: true,
    location: '서울시 종로구',
    createdAt: '2024-05-04'
  },
  {
    id: '35',
    title: '내 방이 작업실! 로직 프로 X 미디 작곡 기초',
    freelancer: '비트메이커',
    freelancerId: 'f1',
    price: 55000,
    category: 'music',
    image: 'https://picsum.photos/seed/midi/400/300',
    rating: 4.8,
    reviews: 120,
    isOffline: false,
    createdAt: '2024-05-05'
  },
  {
    id: '36',
    title: '내 마음을 읽어주는 타로카드 기초 클래스',
    freelancer: '타로마스터',
    freelancerId: 'f1',
    price: 30000,
    category: 'life',
    image: 'https://picsum.photos/seed/tarot/400/300',
    rating: 4.9,
    reviews: 175,
    isOffline: false,
    createdAt: '2024-05-06'
  }
];

// ✅ MOCK_REQUESTS 제거 완료 — 실제 API(/api/request-classes)에서 데이터를 가져옵니다.

export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'CANCEL_REQUESTED' | 'CANCELLED';

export interface EnrollmentItem {
  id: string;
  classId: string;
  classTitle: string;
  studentName: string;
  studentEmail: string;
  status: EnrollmentStatus;
  appliedAt: string;
  price: number;
  cancelReason?: string;
}

export type UserRole = 'ROLE_USER' | 'ROLE_FREELANCER' | 'ROLE_ADMIN';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface FreelancerApprovalRequest {
  id: string;
  name: string;
  email: string;
  specialty: string;
  career: string;
  portfolio: string;
  appliedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason?: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  birth: string;
  role: UserRole;
  phone: string;
  address: string;
  joinedAt: string;
  quitAt?: string;
  isDeleted: boolean;
}

export interface ReportItem {
  id: string;
  type: 'CLASS' | 'USER' | 'COMMENT';
  reason: string;
  reportedAt: string;
  status: 'PENDING' | 'RESOLVED';
  isDeleted?: boolean;
}

export const MOCK_FREELANCER_APPROVALS: FreelancerApprovalRequest[] = [
  { 
    id: 'a1', 
    name: '박공예', 
    email: 'park@example.com',
    specialty: '도자기', 
    career: '도예 경력 10년, 다수 전시회 참여',
    portfolio: 'https://portfolio.com/park',
    appliedAt: '2024-04-07', 
    status: 'PENDING' 
  },
  { 
    id: 'a2', 
    name: '최댄스', 
    email: 'choi@example.com',
    specialty: '현대무용', 
    career: '무용 전공, 강습 경력 5년',
    portfolio: 'https://portfolio.com/choi',
    appliedAt: '2024-04-06', 
    status: 'PENDING' 
  },
];

export const MOCK_USERS_ADMIN: AdminUserItem[] = [
  { id: 'u1', name: '홍길동', birth: '1990-01-01', role: 'ROLE_USER', phone: '010-1111-2222', address: '서울시 종로구', joinedAt: '2024-01-15', isDeleted: false },
  { id: 'u2', name: '김철수', birth: '1985-05-12', role: 'ROLE_FREELANCER', phone: '010-3333-4444', address: '서울시 강남구', joinedAt: '2024-02-20', isDeleted: false },
  { id: 'u3', name: '이영희', birth: '1992-08-23', role: 'ROLE_USER', phone: '010-5555-6666', address: '경기도 성남시', joinedAt: '2024-03-05', isDeleted: true, quitAt: '2024-04-01' },
  { id: 'u4', name: '박민수', birth: '1988-11-30', role: 'ROLE_ADMIN', phone: '010-7777-8888', address: '서울시 마포구', joinedAt: '2023-12-10', isDeleted: false },
  { id: 'u5', name: '최지우', birth: '1995-03-15', role: 'ROLE_USER', phone: '010-9999-0000', address: '부산시 해운대구', joinedAt: '2024-04-01', isDeleted: false },
];

export const MOCK_REPORTS: ReportItem[] = [
  { id: 'r1', type: 'COMMENT', reason: '부적절한 언어 사용', reportedAt: '2024-04-08', status: 'PENDING', isDeleted: false },
  { id: 'r2', type: 'CLASS', reason: '허위 정보 기재', reportedAt: '2024-04-07', status: 'PENDING', isDeleted: false },
];

export const MOCK_ENROLLMENTS: EnrollmentItem[] = [
  {
    id: 'e1',
    classId: '1',
    classTitle: '따스한 수채화 원데이 클래스',
    studentName: '홍길동',
    studentEmail: 'hong@example.com',
    status: 'PENDING',
    appliedAt: '2024-04-07',
    price: 35000
  },
  {
    id: 'e2',
    classId: '3',
    classTitle: '나만의 향수 만들기: 조향 기초',
    studentName: '이순신',
    studentEmail: 'lee@example.com',
    status: 'APPROVED',
    appliedAt: '2024-04-05',
    price: 45000
  }
];

export interface FreelancerProfile {
  id: string;
  name: string;
  specialty: string;
  location: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  followerCount: number;
  career: string;
  portfolioImages: string[];
  introduction: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  className: string;
  classId: string;
  userId: string;
  image?: string;
}

export const MOCK_FREELANCER_PROFILES: FreelancerProfile[] = [
  {
    id: 'f1',
    name: '김화가',
    specialty: '수채화·일러스트',
    location: '서울특별시 종로구',
    avatar: 'https://picsum.photos/seed/artist/200/200',
    rating: 4.9,
    reviewCount: 124,
    followerCount: 850,
    career: '홍익대학교 미술대학 졸업\n개인전 5회 진행\n기업 출강 다수 (삼성, LG 등)',
    portfolioImages: [
      'https://picsum.photos/seed/p1/600/400',
      'https://picsum.photos/seed/p2/600/400',
      'https://picsum.photos/seed/p3/600/400',
      'https://picsum.photos/seed/p4/600/400',
    ],
    introduction: '안녕하세요, 일상의 따스함을 그리는 김화가입니다. 누구나 쉽게 그림을 시작할 수 있도록 도와드려요.'
  }
];

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 'rv1',
    author: '그림초보',
    rating: 5,
    content: '선생님이 너무 친절하게 알려주셔서 똥손인 저도 멋진 작품을 완성했어요!',
    date: '2024-04-05',
    className: '따스한 수채화 원데이 클래스',
    classId: '1',
    userId: 'u1'
  },
  {
    id: 'rv2',
    author: '미술사랑',
    rating: 4,
    content: '분위기도 좋고 힐링되는 시간이었어요. 다음에도 또 참여하고 싶네요.',
    date: '2024-04-01',
    className: '따스한 수채화 원데이 클래스',
    classId: '1',
    userId: 'u2'
  },
  {
    id: 'rv3',
    author: '직장인A',
    rating: 5,
    content: '퇴근 후 힐링하기 딱 좋은 클래스입니다. 추천해요!',
    date: '2024-03-28',
    className: '나만의 캐릭터 그리기',
    classId: '2',
    userId: 'u3'
  }
];
