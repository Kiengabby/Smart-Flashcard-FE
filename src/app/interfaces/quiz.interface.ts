export interface QuizQuestion {
  cardId: number;
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizAnswer {
  cardId: number;
  selectedAnswerIndex: number;
  responseTime?: number;
}

export interface QuizAnswerResult {
  isCorrect: boolean;
  correctAnswerIndex: number;
  correctAnswer: string;
  selectedAnswer: string;
  nextQuestion?: QuizQuestion;
}

export interface QuizResult {
  deckId: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  correctCardIds: number[];
  wrongCardIds: number[];
  message: string;
}