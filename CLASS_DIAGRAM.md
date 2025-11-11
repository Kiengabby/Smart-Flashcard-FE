# CLASS DIAGRAM - HỆ THỐNG SMART FLASHCARD

## Frontend Architecture Class Diagram

```mermaid
classDiagram
    %% =================== CORE INTERFACES ===================
    class DeckDTO {
        +id: number
        +name: string
        +description: string
        +cardCount: number
        +createdAt: string
        +updatedAt?: string
    }

    class CardDTO {
        +id: number
        +deckId: number
        +front: string
        +back: string
        +hint?: string
        +imageUrl?: string
        +audioUrl?: string
        +difficulty: number
        +lastReviewed?: Date
        +nextReview?: Date
        +createdAt: string
    }

    class UserDTO {
        +id: number
        +email: string
        +name: string
        +avatar?: string
        +studiedToday: number
        +streakDays: number
        +totalPoints: number
        +createdAt: string
    }

    class StudySessionDTO {
        +id: number
        +deckId: number
        +cardsStudied: number
        +correctAnswers: number
        +timeSpent: number
        +sessionDate: Date
    }

    %% =================== ANGULAR COMPONENTS ===================
    class OnboardingComponent {
        +features: Feature[]
        +steps: Step[]
        +navigateToRegister(): void
        +navigateToLogin(): void
    }

    class LoginComponent {
        +loginForm: FormGroup
        +isLoading: boolean
        +passwordVisible: boolean
        +onSubmit(): void
        +togglePasswordVisibility(): void
    }

    class RegisterComponent {
        +registerForm: FormGroup
        +isLoading: boolean
        +onSubmit(): void
        +validatePassword(): boolean
    }

    class DashboardComponent {
        +currentUser: UserDTO
        +stats: DashboardStats
        +recentActivities: Activity[]
        +dueCards: CardDTO[]
        +ngOnInit(): void
        +getGreetingText(): string
        +calculateProgress(): number
    }

    class DeckLibraryComponent {
        +decks: DeckDTO[]
        +filteredDecks: DeckDTO[]
        +isLoading: boolean
        +searchText: string
        +selectedCategory: string
        +ngOnInit(): void
        +loadDecks(): void
        +openCreateModal(): void
        +deleteDeck(id: number): void
        +navigateToDeckDetail(id: number): void
    }

    class CreateDeckModalComponent {
        +deckForm: FormGroup
        +isLoading: boolean
        +onSubmit(): void
        +closeModal(): void
    }

    class DeckDetailComponent {
        +deck: DeckDTO
        +cards: CardDTO[]
        +deckId: string
        +ngOnInit(): void
        +loadDeckDetail(): void
        +addCard(): void
        +editCard(card: CardDTO): void
        +deleteCard(id: number): void
    }

    %% =================== ANGULAR SERVICES ===================
    class AuthService {
        -http: HttpClient
        -router: Router
        +currentUser$: BehaviorSubject<UserDTO>
        +login(email: string, password: string): Observable<LoginResponse>
        +register(userData: RegisterRequest): Observable<RegisterResponse>
        +logout(): void
        +isAuthenticated(): boolean
        +getCurrentUser(): UserDTO
    }

    class DeckService {
        -http: HttpClient
        -readonly DECK_API: string
        +getDecks(): Observable<DeckDTO[]>
        +getDeckById(id: string): Observable<DeckDTO>
        +createDeck(deck: CreateDeckRequest): Observable<DeckDTO>
        +updateDeck(id: number, deck: UpdateDeckRequest): Observable<DeckDTO>
        +deleteDeck(id: number): Observable<void>
        -handleError(error: HttpErrorResponse): Observable<never>
    }

    class CardService {
        -http: HttpClient
        -readonly CARD_API: string
        +getCardsByDeck(deckId: number): Observable<CardDTO[]>
        +createCard(card: CreateCardRequest): Observable<CardDTO>
        +updateCard(id: number, card: UpdateCardRequest): Observable<CardDTO>
        +deleteCard(id: number): Observable<void>
    }

    class StudyService {
        -http: HttpClient
        -readonly STUDY_API: string
        +getDueCards(): Observable<CardDTO[]>
        +submitStudySession(session: StudySessionDTO): Observable<void>
        +getStudyStats(): Observable<StudyStats>
    }

    class TokenService {
        +saveToken(token: string): void
        +getToken(): string | null
        +removeToken(): void
        +saveUser(user: UserDTO): void
        +getUser(): UserDTO | null
        +removeUser(): void
    }

    class SM2Service {
        +calculateNextReview(quality: number, card: CardDTO): CardDTO
        +updateDifficulty(quality: number, difficulty: number): number
        +calculateInterval(difficulty: number, repetition: number): number
    }

    %% =================== GUARDS & INTERCEPTORS ===================
    class AuthGuard {
        -authService: AuthService
        -router: Router
        +canActivate(): boolean
        +canActivateChild(): boolean
    }

    class AuthInterceptor {
        -tokenService: TokenService
        +intercept(req: HttpRequest, next: HttpHandler): Observable<HttpEvent>
    }

    %% =================== LAYOUTS ===================
    class UserLayoutComponent {
        +currentUser: UserDTO
        +menuItems: MenuItem[]
        +collapsed: boolean
        +ngOnInit(): void
        +logout(): void
        +toggleSidebar(): void
    }

    class AuthLayoutComponent {
        +ngOnInit(): void
    }

    %% =================== RELATIONSHIPS ===================
    
    %% Components use Services
    LoginComponent --> AuthService : uses
    RegisterComponent --> AuthService : uses
    DashboardComponent --> DeckService : uses
    DashboardComponent --> StudyService : uses
    DeckLibraryComponent --> DeckService : uses
    CreateDeckModalComponent --> DeckService : uses
    DeckDetailComponent --> DeckService : uses
    DeckDetailComponent --> CardService : uses

    %% Services use DTOs
    AuthService --> UserDTO : returns
    DeckService --> DeckDTO : handles
    CardService --> CardDTO : handles
    StudyService --> StudySessionDTO : handles

    %% Service dependencies
    AuthService --> TokenService : uses
    DeckService --> TokenService : uses (via interceptor)
    StudyService --> SM2Service : uses
    
    %% Guards and Interceptors
    AuthGuard --> AuthService : uses
    AuthInterceptor --> TokenService : uses

    %% Layout relationships
    UserLayoutComponent --> AuthService : uses
    AuthLayoutComponent ..> LoginComponent : contains
    AuthLayoutComponent ..> RegisterComponent : contains
    UserLayoutComponent ..> DashboardComponent : contains
    UserLayoutComponent ..> DeckLibraryComponent : contains

    %% Modal relationships
    DeckLibraryComponent --> CreateDeckModalComponent : opens
    
    %% DTO Relationships
    DeckDTO --> CardDTO : contains many
    UserDTO --> StudySessionDTO : has many
    StudySessionDTO --> DeckDTO : belongs to
```

## Backend API Class Structure (cho tham khảo)

```mermaid
classDiagram
    %% =================== ENTITIES ===================
    class User {
        +id: number
        +email: string
        +password: string (hashed)
        +name: string
        +avatar?: string
        +studiedToday: number
        +streakDays: number
        +totalPoints: number
        +createdAt: Date
        +updatedAt: Date
    }

    class Deck {
        +id: number
        +userId: number
        +name: string
        +description: string
        +cardCount: number
        +createdAt: Date
        +updatedAt: Date
    }

    class Card {
        +id: number
        +deckId: number
        +front: string
        +back: string
        +hint?: string
        +imageUrl?: string
        +audioUrl?: string
        +difficulty: number
        +repetition: number
        +easinessFactor: number
        +lastReviewed?: Date
        +nextReview?: Date
        +createdAt: Date
        +updatedAt: Date
    }

    class StudySession {
        +id: number
        +userId: number
        +deckId: number
        +cardsStudied: number
        +correctAnswers: number
        +timeSpent: number
        +sessionDate: Date
        +createdAt: Date
    }

    %% =================== CONTROLLERS ===================
    class AuthController {
        +login(LoginRequest): LoginResponse
        +register(RegisterRequest): RegisterResponse
        +refresh(RefreshRequest): TokenResponse
        +logout(): void
    }

    class DeckController {
        +getDecks(userId: number): DeckDTO[]
        +getDeckById(id: number): DeckDTO
        +createDeck(CreateDeckRequest): DeckDTO
        +updateDeck(id: number, UpdateDeckRequest): DeckDTO
        +deleteDeck(id: number): void
    }

    class CardController {
        +getCardsByDeck(deckId: number): CardDTO[]
        +createCard(CreateCardRequest): CardDTO
        +updateCard(id: number, UpdateCardRequest): CardDTO
        +deleteCard(id: number): void
    }

    %% =================== SERVICES ===================
    class AuthService_BE {
        +authenticate(email: string, password: string): User
        +generateTokens(user: User): TokenPair
        +validateToken(token: string): boolean
    }

    class DeckService_BE {
        +findByUserId(userId: number): Deck[]
        +create(deck: Deck): Deck
        +update(id: number, deck: Partial<Deck>): Deck
        +delete(id: number): void
    }

    class SM2Algorithm {
        +calculateNextReview(quality: number, card: Card): Card
        +updateEasinessFactor(quality: number, easiness: number): number
    }

    %% =================== RELATIONSHIPS ===================
    User ||--o{ Deck : owns
    Deck ||--o{ Card : contains
    User ||--o{ StudySession : has
    StudySession }o--|| Deck : studies

    AuthController --> AuthService_BE : uses
    DeckController --> DeckService_BE : uses
    CardController --> SM2Algorithm : uses
```

## Architectural Patterns Used:

### 1. **MVC Pattern (Frontend)**
- **Model**: DTOs (DeckDTO, CardDTO, UserDTO)
- **View**: Components (.html templates)
- **Controller**: Component classes (.ts files)

### 2. **Service Layer Pattern**
- **Presentation Layer**: Components
- **Business Logic Layer**: Services (AuthService, DeckService)
- **Data Access Layer**: HTTP Client + Backend API

### 3. **Observer Pattern**
- **Subject**: BehaviorSubject trong AuthService
- **Observers**: Components subscribe để nhận state changes

### 4. **Dependency Injection**
- Angular DI container quản lý lifecycle của services
- Constructor injection cho service dependencies

### 5. **Interceptor Pattern**
- AuthInterceptor tự động thêm JWT token vào HTTP requests

### Notes cho Demo:

#### Điểm mạnh Architecture:
1. **Separation of Concerns**: Rõ ràng giữa UI, Business Logic, và Data
2. **Scalability**: Dễ mở rộng thêm features
3. **Testability**: Services có thể unit test độc lập
4. **Maintainability**: Code organization theo Angular best practices
5. **Type Safety**: TypeScript với interfaces rõ ràng