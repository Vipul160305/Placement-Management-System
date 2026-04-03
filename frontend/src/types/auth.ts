export type Role = "tpo" | "hr" | "student";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  section?: string;
  branch?: string;
  cgpa?: number;
  backlogCount?: number;
  hasResume?: boolean;
  companyId?: string | null;
}

export interface AuthContextValue {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}
