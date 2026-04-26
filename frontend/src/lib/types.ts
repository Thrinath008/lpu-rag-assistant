export interface ConfidenceResult {
  level: string;
  label: string;
  best_score: number;
  avg_score: number;
  strong_chunks: number;
  message: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  confidence?: ConfidenceResult;
}

export interface Source {
  text: string;
  source_file: string;
  category: string;
  chunk_index: number;
  token_count: number;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  original_query: string;
  rewritten_query: string;
  category: string;
  confidence: ConfidenceResult;
  session_id: string;
  model: string;
  author: string;
  timestamp: string;
}

export interface UploadResponse {
  status: string;
  message: string;
  chunks_created?: number;
  category?: string;
}

export interface DocumentInfo {
  filename: string;
  uploaded_at: string;
  size_bytes: number;
}
