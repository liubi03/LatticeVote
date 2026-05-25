export interface User {
  user_id: string;
  username: string;
  role: 'admin' | 'voter' | 'trustee';
  status: 'pending' | 'active' | 'rejected';
  public_key?: string;
  private_key?: string;
  created_at: string;
}

export interface Project {
  project_id: string;
  name: string;
  description: string;
  candidates: string[];
  status: 'draft' | 'active' | 'paused' | 'finished' | 'tallied';
  created_at: string;
  created_by: string;
  trustees: string[];
  voters: string[];
  start_time?: string;
  end_time?: string;
}

export interface Ballot {
  ballot_id: string;
  project_id: string;
  voter_id: string;
  timestamp: string;
}

export interface TallyResult {
  project_id: string;
  results: number[];
  candidates: string[];
  winner: string;
  winner_index: number;
  total_votes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: 'voter' | 'trustee';
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  candidates: string[];
  trustees: string[];
  voters: string[];
}

export interface SubmitBallotRequest {
  project_id: string;
  encrypted_vote: string;
  signature: string;
}
