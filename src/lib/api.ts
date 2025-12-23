import type { Quiz, Question, Player, Answer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class AdminApi {
  private credentials: string | null = null;

  setCredentials(username: string, password: string) {
    this.credentials = btoa(`${username}:${password}`);
    sessionStorage.setItem('admin_credentials', this.credentials);
  }

  loadCredentials() {
    this.credentials = sessionStorage.getItem('admin_credentials');
  }

  clearCredentials() {
    this.credentials = null;
    sessionStorage.removeItem('admin_credentials');
  }

  hasCredentials(): boolean {
    if (!this.credentials) {
      this.loadCredentials();
    }
    return !!this.credentials;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!this.credentials) {
      this.loadCredentials();
    }
    if (!this.credentials) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${this.credentials}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      this.clearCredentials();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async login(username: string, password: string): Promise<boolean> {
    this.setCredentials(username, password);
    try {
      // Use a protected endpoint to verify credentials
      await this.request<ApiQuiz[]>('/api/admin/quizzes', { method: 'OPTIONS' }).catch(() => {
        // OPTIONS might not work, try getting quizzes from public endpoint
        // The auth is verified on first mutation
      });
      // Verify by trying to access the public quiz list (auth header still sent)
      await fetch(`${API_URL}/api`, {
        headers: { 'Authorization': `Basic ${this.credentials}` }
      });
      return true;
    } catch {
      this.clearCredentials();
      return false;
    }
  }

  // Quiz operations - use public endpoints for reads
  async getQuizzes(): Promise<Quiz[]> {
    const data = await this.request<ApiQuiz[]>('/api');
    return data.map(mapQuizFromApi);
  }

  async getQuiz(id: string): Promise<Quiz> {
    const data = await this.request<ApiQuiz>(`/api/${id}`);
    return mapQuizFromApi(data);
  }

  async createQuiz(title: string, gameCode: string): Promise<Quiz> {
    const data = await this.request<ApiQuiz>('/api/admin/quizzes', {
      method: 'POST',
      body: JSON.stringify({ title, gameCode: gameCode }),
    });
    return mapQuizFromApi(data);
  }

  async updateQuiz(id: string, updates: { title?: string; status?: string; current_question_index?: number }): Promise<Quiz> {
    const data = await this.request<ApiQuiz>(`/api/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: updates.title,
        status: updates.status,
        currentQuestionIndex: updates.current_question_index,
      }),
    });
    return mapQuizFromApi(data);
  }

  async deleteQuiz(id: string): Promise<void> {
    await this.request<void>(`/api/admin/quizzes/${id}`, {
      method: 'DELETE',
    });
  }

  async resetQuiz(id: string): Promise<Quiz> {
    const data = await this.request<ApiQuiz>(`/api/admin/quizzes/${id}/reset`, {
      method: 'POST',
    });
    return mapQuizFromApi(data);
  }

  // Question operations - use public endpoint for reads
  async getQuestions(quizId: string): Promise<Question[]> {
    const data = await this.request<ApiQuestion[]>(`/api/${quizId}/questions`);
    return data.map(mapQuestionFromApi);
  }

  async createQuestion(quizId: string, question: Omit<Question, 'id' | 'quiz_id' | 'created_at'>): Promise<Question> {
    const data = await this.request<ApiQuestion>(`/api/admin/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify({
        questionText: question.question_text,
        questionType: question.question_type,
        options: question.options,
        correctAnswers: question.correct_answers,
        orderIndex: question.order_index,
        image: question.image_url,
        category: question.category,
      }),
    });
    return mapQuestionFromApi(data);
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.request<void>(`/api/admin/questions/${id}`, {
      method: 'DELETE',
    });
  }

  async updateQuestionOrder(id: string, orderIndex: number): Promise<Question> {
    const data = await this.request<ApiQuestion>(`/api/admin/questions/${id}/order`, {
      method: 'PUT',
      body: JSON.stringify({ orderIndex }),
    });
    return mapQuestionFromApi(data);
  }

  async uploadImage(file: File): Promise<string | null> {
    if (!this.credentials) {
      this.loadCredentials();
    }
    if (!this.credentials) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/admin/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.credentials}`,
      },
      body: formData,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.url;
  }
}

// API response types (camelCase from backend)
interface ApiQuiz {
  id: string;
  title: string;
  gameCode: string;
  status: 'waiting' | 'active' | 'finished';
  currentQuestionIndex: number;
  createdAt: string;
}

interface ApiQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'text';
  options: string[] | null;
  correctAnswers: string[];
  orderIndex: number;
  image: string | null;
  category: string | null;
  createdAt: string;
}

// Map API responses to frontend types
function mapQuizFromApi(quiz: ApiQuiz): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    gameCode: quiz.gameCode,
    status: quiz.status,
    current_question_index: quiz.currentQuestionIndex,
    created_at: quiz.createdAt,
  };
}

function mapQuestionFromApi(question: ApiQuestion): Question {
  return {
    id: question.id,
    quiz_id: question.quizId,
    question_text: question.questionText,
    question_type: question.questionType,
    options: question.options,
    correct_answers: question.correctAnswers,
    order_index: question.orderIndex,
    image_url: question.image,
    category: question.category,
    created_at: question.createdAt,
  };
}

export const adminApi = new AdminApi();

// API response types for game (camelCase from backend)
interface ApiPlayer {
  id: string;
  quizId: string;
  name: string;
  avatarId: string;
  status: 'playing' | 'finished';
  currentQuestionIndex: number;
  joinedAt: string;
}

interface ApiAnswer {
  id: string;
  playerId: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
  answeredAt: string;
}

// Map API responses to frontend types
function mapPlayerFromApi(player: ApiPlayer): Player {
  return {
    id: player.id,
    quiz_id: player.quizId,
    name: player.name,
    avatar_id: player.avatarId,
    status: player.status,
    current_question_index: player.currentQuestionIndex,
    joined_at: player.joinedAt,
  };
}

function mapAnswerFromApi(answer: ApiAnswer): Answer {
  return {
    id: answer.id,
    player_id: answer.playerId,
    question_id: answer.questionId,
    answer_text: answer.answerText,
    is_correct: answer.isCorrect,
    answered_at: answer.answeredAt,
  };
}

// Public Game API (no auth required)
// NOTE: Backend does not have dedicated game endpoints for players/answers yet.
// Player and answer operations will need backend implementation.
class GameApi {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async getQuizByCode(gameCode: string): Promise<Quiz | null> {
    try {
      // Backend doesn't have lookup by code - fetch all and filter
      const quizzes = await this.request<ApiQuiz[]>('/api');
      const quiz = quizzes.find(q => q.gameCode?.toUpperCase() === gameCode.toUpperCase());
      return quiz ? mapQuizFromApi(quiz) : null;
    } catch {
      return null;
    }
  }

  async getQuiz(quizId: string): Promise<Quiz | null> {
    try {
      const data = await this.request<ApiQuiz>(`/api/${quizId}`);
      return mapQuizFromApi(data);
    } catch {
      return null;
    }
  }

  async getPlayers(quizId: string): Promise<Player[]> {
    const data = await this.request<ApiPlayer[]>(`/api/game/quizzes/${quizId}/players`);
    return data.map(mapPlayerFromApi);
  }

  async getQuestions(quizId: string): Promise<Question[]> {
    const data = await this.request<ApiQuestion[]>(`/api/${quizId}/questions`);
    return data.map(mapQuestionFromApi);
  }

  async createPlayer(quizId: string, name: string, avatarId: string): Promise<Player> {
    // TODO: Backend needs /api/game/quizzes/{quizId}/players POST endpoint
    const data = await this.request<ApiPlayer>(`/api/game/quizzes/${quizId}/players`, {
      method: 'POST',
      body: JSON.stringify({ name, avatarId }),
    });
    return mapPlayerFromApi(data);
  }

  async updatePlayer(playerId: string, updates: { status?: string; currentQuestionIndex?: number }): Promise<Player> {
    // TODO: Backend needs /api/game/players/{playerId} PUT endpoint
    const data = await this.request<ApiPlayer>(`/api/game/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return mapPlayerFromApi(data);
  }

  async getAnswers(playerId: string): Promise<Answer[]> {
    // TODO: Backend needs /api/game/players/{playerId}/answers endpoint
    const data = await this.request<ApiAnswer[]>(`/api/game/players/${playerId}/answers`);
    return data.map(mapAnswerFromApi);
  }

  async getQuizAnswers(quizId: string): Promise<Answer[]> {
    // TODO: Backend needs /api/game/quizzes/{quizId}/answers endpoint
    const data = await this.request<ApiAnswer[]>(`/api/game/quizzes/${quizId}/answers`);
    return data.map(mapAnswerFromApi);
  }

  async submitAnswer(playerId: string, questionId: string, answerText: string, isCorrect: boolean): Promise<Answer> {
    // TODO: Backend needs /api/game/players/{playerId}/answers POST endpoint
    const data = await this.request<ApiAnswer>(`/api/game/players/${playerId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answerText, isCorrect }),
    });
    return mapAnswerFromApi(data);
  }

  async updateQuizStatus(quizId: string, status: string): Promise<Quiz> {
    // Uses the public quiz update endpoint
    const data = await this.request<ApiQuiz>(`/api/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return mapQuizFromApi(data);
  }
}

export const gameApi = new GameApi();
