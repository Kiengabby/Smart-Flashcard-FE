# SEQUENCE DIAGRAMS - ĐỒNG ĐỒ ÁN TỐT NGHIỆP

## 1. UC-01.1: Đăng nhập (Login Sequence)

```mermaid
sequenceDiagram
    participant U as User
    participant LC as LoginComponent
    participant AS as AuthService
    participant API as Backend API
    participant TS as TokenService
    participant R as Router

    U->>LC: Nhập email/password và click "Đăng nhập"
    LC->>LC: Validate form data
    
    alt Form hợp lệ
        LC->>AS: login(email, password)
        AS->>API: POST /api/auth/login
        
        alt Credentials đúng
            API-->>AS: {token, user, refreshToken}
            AS->>TS: saveToken(token)
            AS->>TS: saveUser(user)
            AS-->>LC: LoginResponse{success: true, user}
            LC->>R: navigate('/app/dashboard')
            LC->>U: Chuyển hướng đến Dashboard
        else Credentials sai
            API-->>AS: {error: "Invalid credentials"}
            AS-->>LC: LoginResponse{success: false, error}
            LC->>U: Hiển thị lỗi "Email hoặc mật khẩu không chính xác"
        end
        
    else Form không hợp lệ
        LC->>U: Hiển thị lỗi validation
    end
```

## 2. UC-01.2: Đăng ký (Register Sequence)

```mermaid
sequenceDiagram
    participant U as User
    participant RC as RegisterComponent
    participant AS as AuthService
    participant API as Backend API
    participant R as Router

    U->>RC: Nhập thông tin đăng ký
    RC->>RC: Validate form (email, password, confirmPassword)
    
    alt Form hợp lệ
        RC->>AS: register(userData)
        AS->>API: POST /api/auth/register
        
        alt Đăng ký thành công
            API-->>AS: {success: true, message}
            AS-->>RC: RegisterResponse{success: true}
            RC->>U: Hiển thị thông báo "Đăng ký thành công"
            RC->>R: navigate('/auth/login')
        else Email đã tồn tại
            API-->>AS: {error: "Email already exists"}
            AS-->>RC: RegisterResponse{success: false, error}
            RC->>U: Hiển thị lỗi "Email đã được sử dụng"
        end
        
    else Form không hợp lệ
        RC->>U: Hiển thị lỗi validation
    end
```

## 3. UC-02: Quản lý Thư viện Deck (Deck Library Management)

```mermaid
sequenceDiagram
    participant U as User
    participant DLC as DeckLibraryComponent
    participant DS as DeckService
    participant API as Backend API
    participant CDM as CreateDeckModal

    U->>DLC: Truy cập /app/deck-library
    DLC->>DLC: ngOnInit()
    DLC->>DS: getDecks()
    DS->>API: GET /api/decks/
    
    alt API thành công
        API-->>DS: DeckDTO[]
        DS-->>DLC: decks data
        DLC->>DLC: updateStats(), applyFilters()
        DLC->>U: Hiển thị danh sách deck với stats
    else API thất bại
        DS-->>DLC: error
        DLC->>DLC: loadMockData()
        DLC->>U: Hiển thị mock data + cảnh báo
    end

    U->>DLC: Click "Tạo bộ thẻ mới"
    DLC->>CDM: openCreateModal()
    CDM->>U: Hiển thị form tạo deck
    
    U->>CDM: Nhập thông tin và click "Tạo"
    CDM->>DS: createDeck(deckData)
    DS->>API: POST /api/decks/
    
    alt Tạo thành công
        API-->>DS: DeckDTO (new deck)
        DS-->>CDM: success response
        CDM-->>DLC: DeckDTO
        DLC->>DLC: decks.unshift(newDeck)
        DLC->>DLC: updateStats()
        DLC->>U: Deck mới hiển thị ngay lập tức
    else Tạo thất bại
        API-->>DS: error response
        DS-->>CDM: error
        CDM->>U: Hiển thị lỗi
    end
```

## 4. UC-02.1: Tạo Deck mới (Create Deck Detail)

```mermaid
sequenceDiagram
    participant U as User
    participant CDM as CreateDeckModal
    participant DS as DeckService
    participant API as Backend API
    participant DLC as DeckLibraryComponent

    U->>CDM: Click "Tạo bộ thẻ mới"
    CDM->>CDM: initializeForm()
    CDM->>U: Hiển thị modal form

    U->>CDM: Nhập name, description
    CDM->>CDM: validateForm()
    
    U->>CDM: Click "Tạo bộ thẻ"
    
    alt Form validation pass
        CDM->>CDM: setLoading(true)
        CDM->>DS: createDeck({name, description})
        DS->>API: POST /api/decks/
        
        Note over API: Tạo deck mới trong database<br/>với userId từ JWT token
        
        alt Tạo thành công
            API-->>DS: DeckDTO{id, name, description, cardCount: 0, createdAt}
            DS-->>CDM: DeckDTO
            CDM->>CDM: setLoading(false)
            CDM->>CDM: closeModal()
            CDM-->>DLC: DeckDTO (via modalRef)
            DLC->>DLC: addNewDeckToList(deck)
            DLC->>U: Hiển thị deck mới + thông báo thành công
            
        else Tạo thất bại
            API-->>DS: ErrorResponse
            DS-->>CDM: Error
            CDM->>CDM: setLoading(false)
            CDM->>U: Hiển thị thông báo lỗi
        end
        
    else Form validation fail
        CDM->>U: Hiển thị lỗi validation
    end
```

## 5. UC-Dashboard: Hiển thị Dashboard (Dashboard Display)

```mermaid
sequenceDiagram
    participant U as User
    participant DC as DashboardComponent
    participant DS as DeckService
    participant SS as StudyService
    participant API as Backend API

    U->>DC: Truy cập /app/dashboard
    DC->>DC: ngOnInit()
    
    par Tải thống kê tổng quan
        DC->>DS: getDashboardStats()
        DS->>API: GET /api/dashboard/stats
        API-->>DS: {totalDecks, totalCards, studiedToday, streakDays}
        DS-->>DC: DashboardStats
    and Tải deck cần ôn tập
        DC->>SS: getStudyDueCards()
        SS->>API: GET /api/study/due-cards
        API-->>SS: DueCard[]
        SS-->>DC: dueCards
    and Tải hoạt động gần đây
        DC->>DS: getRecentActivity()
        DS->>API: GET /api/dashboard/activities
        API-->>DS: Activity[]
        DS-->>DC: recentActivities
    end
    
    DC->>DC: calculateProgress(), updateCharts()
    DC->>U: Hiển thị dashboard hoàn chỉnh với:
    Note over U: - Greeting theo thời gian<br/>- Thống kê học tập<br/>- Biểu đồ tiến độ<br/>- Deck cần ôn tập<br/>- Hoạt động gần đây
```

## 6. Authentication Guard Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant R as Router
    participant AG as AuthGuard
    participant AS as AuthService
    participant TS as TokenService

    U->>R: Truy cập protected route (/app/*)
    R->>AG: canActivate()
    AG->>AS: isAuthenticated()
    AS->>TS: getToken()
    
    alt Token tồn tại và hợp lệ
        TS-->>AS: valid token
        AS->>AS: validateTokenExpiry()
        AS-->>AG: true
        AG-->>R: true
        R->>U: Cho phép truy cập route
    else Token không tồn tại hoặc hết hạn
        TS-->>AS: null hoặc expired token
        AS-->>AG: false
        AG->>R: navigate('/auth/login')
        R->>U: Chuyển hướng đến trang đăng nhập
    end
```

## Notes cho Demo:

### Điểm mạnh khi trình bày:
1. **Kiến trúc rõ ràng**: Frontend-Backend separation với RESTful API
2. **Error Handling**: Xử lý lỗi comprehensive cho tất cả scenarios
3. **User Experience**: Loading states, immediate feedback, fallback data
4. **Security**: JWT token authentication với guards
5. **Performance**: Async operations, caching strategies

### Technical Highlights:
- **Angular Standalone Components** (Angular 17+)
- **Reactive Forms** với validation
- **RxJS Observables** cho async operations
- **Ng-Zorro Ant Design** cho UI components
- **Route Guards** cho authentication
- **Service Architecture** cho business logic separation