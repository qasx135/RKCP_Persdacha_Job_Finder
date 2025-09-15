export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  user_id: number;
  phone?: string;
  location?: string;
  experience?: string;
  skills?: string;
  education?: string;
  resume?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location?: string;
  salary?: string;
  type?: string;
  category?: string;
  requirements?: string;
  benefits?: string;
  employer_id: number;
  employer: User;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  job: Job;
  user_id: number;
  user: User;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}




