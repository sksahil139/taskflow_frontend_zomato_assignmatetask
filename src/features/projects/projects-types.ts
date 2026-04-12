export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
}

export interface ProjectListResponse {
  projects: Project[];
}