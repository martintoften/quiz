export interface Quiz {
  id: string;
  title: string;
  game_code: string;
  status: 'waiting' | 'active' | 'finished';
  current_question_index: number;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'text';
  options: string[] | null;
  correct_answers: string[];
  order_index: number;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  quiz_id: string;
  name: string;
  avatar_id: string;
  status: 'playing' | 'finished';
  current_question_index: number;
  joined_at: string;
}

export interface Answer {
  id: string;
  player_id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  answered_at: string;
}

export interface PlayerScore {
  player: Player;
  correctAnswers: number;
  totalQuestions: number;
}
