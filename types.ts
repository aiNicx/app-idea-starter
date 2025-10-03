
export enum DocumentCategory {
  FRONTEND = "Frontend Description",
  CSS = "CSS Specifics",
  BACKEND = "Backend Architecture",
  DB_SCHEMA = "DB Schema (Convex)",
}

export interface Document {
  id: string;
  category: DocumentCategory;
  content: string;
}

export interface Project {
  id: string;
  name: string;
  idea: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}
