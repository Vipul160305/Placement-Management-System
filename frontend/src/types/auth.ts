export type Role = "admin" | "tpo" | "coordinator" | "student";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  section?: string;
  cgpa?: number;
  backlogCount?: number;
}

export interface AuthContextValue {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}
