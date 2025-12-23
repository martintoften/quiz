import type { Quiz, Question } from '../types';

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
      await this.request<Quiz[]>('/api/admin/quizzes');
      return true;
    } catch {
      this.clearCredentials();
      return false;
    }
  }

  // Quiz operations
  async getQuizzes(): Promise<Quiz[]> {
    const data = await this.request<ApiQuiz[]>('/api/admin/quizzes');
    return data.map(mapQuizFromApi);
  }

  async getQuiz(id: string): Promise<Quiz> {
    const data = await this.request<ApiQuiz>(`/api/admin/quizzes/${id}`);
    return mapQuizFromApi(data);
  }

  async createQuiz(title: string, gameCode: string): Promise<Quiz> {
    const data = await this.request<ApiQuiz>('/api/admin/quizzes', {
      method: 'POST',
      body: JSON.stringify({ title, game_code: gameCode }),
    });
    return mapQuizFromApi(data);
  }

  async updateQuiz(id: string, updates: { title?: string; status?: string; current_question_index?: number }): Promise<Quiz> {
    const data = await this.request<ApiQuiz>(`/api/admin/quizzes/${id}`, {
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

  // Question operations
  async getQuestions(quizId: string): Promise<Question[]> {
    const data = await this.request<ApiQuestion[]>(`/api/admin/quizzes/${quizId}/questions`);
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
    game_code: quiz.gameCode,
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
