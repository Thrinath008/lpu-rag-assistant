export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
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
  author_sig: string;
  integrity: string;
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
