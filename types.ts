
export enum DegreeType {
  MASTER = 'Thạc sĩ',
  PHD = 'Tiến sĩ'
}

export enum DocumentStatus {
  MISSING = 'MISSING',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface DocumentItem {
  id: string;
  name: string;
  status: DocumentStatus;
  required: boolean;
  dateUpdated?: string;
  fileUrl?: string; // Link file học viên nộp
  templateUrl?: string; // Link biểu mẫu gốc (Admin cấu hình)
}

export interface TrainingStage {
  id: number;
  name: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  documents: DocumentItem[];
}

// --- TUITION TYPES ---
export enum TuitionStatus {
  PAID = 'PAID',       // Đã đóng
  UNPAID = 'UNPAID',   // Chưa đóng (chưa đến hạn hoặc đang trong hạn)
  OVERDUE = 'OVERDUE'  // Quá hạn
}

export interface TuitionRecord {
  id: string;
  title: string;       // VD: Học phí Kỳ 1 - Năm học 2023-2024
  amount: number;      // Số tiền (VND)
  dueDate: string;     // Hạn nộp
  status: TuitionStatus;
  paymentDate?: string; // Ngày thực đóng
  termIndex: number;   // Kỳ thứ mấy / Năm thứ mấy
}
// ---------------------

// --- CLASS TYPES ---
export interface ClassInfo {
  id: string;
  name: string;        // VD: Thạc sĩ Dược K30 - Lớp A
  degree: DegreeType;
  major: string;
  batch: string;
  advisor: string;     // Cố vấn học tập / Chủ nhiệm lớp
  totalStudents: number; // Sĩ số hiện tại
}
// -------------------

// --- SYSTEM DOCUMENT TYPES (NEW) ---
export enum SystemDocType {
  TEMPLATE = 'TEMPLATE', // Biểu mẫu cho học viên điền (Đơn, Lý lịch...)
  DECISION = 'DECISION', // Mẫu Quyết định hành chính (QĐ thành lập HĐ...)
  REGULATION = 'REGULATION' // Văn bản quy định/Quy chế
}

export interface SystemDocument {
  id: string;
  code: string;       // Mã hiệu (VD: BM-01/SĐH)
  name: string;       // Tên biểu mẫu
  type: SystemDocType;
  degree: DegreeType; // Áp dụng cho đối tượng nào
  stageId?: number;   // Thuộc giai đoạn nào (nếu có)
  lastUpdated: string;
  downloadUrl: string;
  description?: string;
}
// -----------------------------------

// --- NOTIFICATION TYPES (NEW) ---
export enum NotificationType {
  WARNING = 'WARNING',   // Cảnh báo (Thiếu hồ sơ, Chậm tiến độ)
  DANGER = 'DANGER',     // Nghiêm trọng (Nợ học phí quá hạn, quá hạn đào tạo)
  INFO = 'INFO'          // Thông tin (Có học viên mới, v.v.)
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  studentId?: string; // Link tới học viên liên quan
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
}
// --------------------------------

export interface Student {
  id: string;
  fullName: string;
  dob: string;
  email: string;
  phone: string;
  degree: DegreeType;
  major: string; // Chuyên ngành
  classId: string; // ID lớp quản lý
  batch: string; // Khóa
  studentCode: string;
  enrollmentDate: string;
  avatarUrl: string;
  currentStageId: number; // ID of the stage they are currently in
  stages: TrainingStage[];
  notes: string;
  tuitionRecords: TuitionRecord[]; // New field for financial history
}

export interface ScheduleItem {
  id: string;
  subject: string;
  lecturer: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm - HH:mm
  room: string;
  batch: string; // Lớp/Khóa áp dụng (VD: K30 Cao học, NCS K22)
  degree: DegreeType;
  type: 'CLASS' | 'EXAM' | 'DEFENSE'; // Học, Thi, Bảo vệ
}

export interface DashboardStats {
  totalStudents: number;
  mastersCount: number;
  phdCount: number;
  graduatedCount: number;
  delayedCount: number; // Học viên bị chậm tiến độ
}
