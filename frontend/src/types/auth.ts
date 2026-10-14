export type UserRole = 
  | "ADMIN" 
  | "MAINTENANCE_ENGINEER" 
  | "PRODUCTION_MANAGER" 
  | "PLANT_MANAGER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
