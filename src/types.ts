export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  organization: string;
  website: string;
  address: string;
  linkedin: string;
  twitter: string;
  github: string;
  avatar: string; // Base64 DataURL
  createdAt: string;
}

export interface DbConfig {
  configured: boolean;
  mode: "database" | "memory";
  connected: boolean;
  dbName: string;
  error: string | null;
}
