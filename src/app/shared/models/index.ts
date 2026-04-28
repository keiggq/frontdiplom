// ====================== AUTH ======================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  position?: string;
  phone?: string;
  departmentId?: number;
}

export interface JwtResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
}

// ====================== DOCUMENT ======================
export interface DocumentDto {
  id: number;
  title: string;
  registrationNumber: string;
  description?: string;
  documentDate: string;
  creationDate: string;
  expiryDate?: string;
  status: string;
  fileName: string;
  fileSize: number;
  authorName: string;
  authorId: number;
  documentTypeName?: string;
  departmentName?: string;
  keywords?: string;
  version: string;
  visibleToUserIds?: number[];
}

// ====================== TASK ======================
export interface TaskDto {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string;
  completedDate?: string;
  adminStatus?: string;
  assigneeName: string;
  completionReport?: string;        // описание выполненной работы
  completionFileName?: string;      // имя прикреплённого файла
  assigneeId: number;
  creatorName: string;
  creatorId: number;
  documentId?: number;
  documentTitle?: string;
  relatedTasks?: TaskDto[];
}
export interface TaskCreateDto {
  title: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  assigneeId: number;
  creatorId?: number;
  documentId?: number | null;
}

// ====================== COMMENT ======================
export interface CommentDto {
  id: number;
  content: string;
  authorName: string;
  authorId: number;
  authorPosition?: string;
  documentId: number;
  documentTitle: string;
  createdAt: string;
}

export interface CommentCreateDto {
  content: string;
  documentId: number;
}