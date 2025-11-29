
import { DegreeType, DocumentStatus, Student, TrainingStage, ScheduleItem, TuitionStatus, ClassInfo, SystemDocument, SystemDocType } from "./types";

// --- QUY TRÌNH THẠC SĨ (CHUẨN HÓA LẠI THEO HƯỚNG HÀNH CHÍNH) ---
export const getMasterStages = (): TrainingStage[] => [
  {
    id: 1,
    name: "Tuyển sinh & Nhập học",
    description: "Xét tuyển hồ sơ, ra quyết định trúng tuyển và biên chế lớp.",
    isCompleted: false,
    isCurrent: true,
    documents: [
      { id: 'm1-1', name: "Quyết định công nhận trúng tuyển", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
      { id: 'm1-2', name: "Giấy báo nhập học", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
      { id: 'm1-3', name: "Sơ yếu lý lịch học viên", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
      { id: 'm1-4', name: "Quyết định biên chế lớp học", status: DocumentStatus.MISSING, required: true, templateUrl: '#' }, // Từ OCR
    ]
  },
  {
    id: 2,
    name: "Đào tạo Học phần & Ngoại ngữ",
    description: "Hoàn thành chương trình học tập trung và điều kiện tiếng Anh.",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'm2-1', name: "Bảng điểm các học phần chung", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm2-2', name: "Bảng điểm học phần cơ sở & chuyên ngành", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm2-3', name: "Chứng chỉ Tiếng Anh (Đạt chuẩn đầu ra)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm2-4', name: "Danh sách đủ điều kiện thi kết thúc học phần", status: DocumentStatus.MISSING, required: false, templateUrl: '#' },
    ]
  },
  {
    id: 3,
    name: "Phân công GVHD & Đề cương",
    description: "Giao đề tài và ký hợp đồng hướng dẫn luận văn.",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'm3-1', name: "Phiếu đăng ký tên đề tài & GVHD", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm3-2', name: "Quyết định phân công GVHD", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm3-3', name: "Hợp đồng hướng dẫn khoa học", status: DocumentStatus.MISSING, required: true, templateUrl: '#' }, // Quan trọng quản lý HĐ
      { id: 'm3-4', name: "Đề cương chi tiết luận văn (Đã duyệt)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm3-5', name: "Quyết định giao đề tài luận văn", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
    ]
  },
  {
    id: 4,
    name: "Bảo vệ Luận văn Tốt nghiệp",
    description: "Tổ chức hội đồng chấm luận văn.",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'm4-1', name: "Đơn xin bảo vệ luận văn", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm4-2', name: "Lý lịch khoa học (Cập nhật)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm4-3', name: "Nhận xét của GVHD", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm4-4', name: "Quyết định thành lập Hội đồng chấm luận văn", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm4-5', name: "Biên bản họp Hội đồng", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm4-6', name: "Quyết nghị của Hội đồng", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
    ]
  },
  {
    id: 5,
    name: "Sau bảo vệ & Cấp bằng",
    description: "Hoàn tất thủ tục chỉnh sửa, nộp lưu chiểu và nhận bằng.",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'm5-1', name: "Bản giải trình chỉnh sửa sau bảo vệ", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm5-2', name: "Giấy biên nhận nộp lưu chiểu Thư viện", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm5-3', name: "Quyết định công nhận tốt nghiệp & Cấp bằng", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'm5-4', name: "Sổ cấp bằng (Ký nhận)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
    ]
  }
];

// --- QUY TRÌNH TIẾN SĨ (PHD) - CẬP NHẬT THEO ẢNH OCR ---
export const getPhdStages = (): TrainingStage[] => [
  {
    id: 1,
    name: "Đầu vào & Nhập học",
    description: "Xét tuyển, công nhận NCS và biên chế lớp.",
    isCompleted: true,
    isCurrent: false,
    documents: [
      { id: 'p1-1', name: "Quyết định thành lập HĐ xét tuyển", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
      { id: 'p1-2', name: "Biên bản họp HĐ xét tuyển", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
      { id: 'p1-3', name: "Quyết định công nhận trúng tuyển", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
      { id: 'p1-4', name: "Giấy báo nhập học", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
      { id: 'p1-5', name: "Quyết định biên chế lớp", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
    ]
  },
  {
    id: 2,
    name: "Phân công GVHD & Đề cương",
    description: "Phê duyệt đề tài, GVHD và bảo vệ đề cương.",
    isCompleted: false,
    isCurrent: true,
    documents: [
      { id: 'p2-1', name: "Quyết định phân công GVHD", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
      { id: 'p2-2', name: "Hợp đồng GVHD (Ký kết)", status: DocumentStatus.PENDING, required: true, templateUrl: '#' },
      { id: 'p2-3', name: "Quyết định thành lập HĐ thông qua đề cương", status: DocumentStatus.APPROVED, required: true, templateUrl: '#' },
      { id: 'p2-4', name: "Biên bản hội đồng thông qua đề cương", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p2-5', name: "Quyết định giao đề tài Luận án", status: DocumentStatus.MISSING, required: true, templateUrl: '#' }, // Căn cứ vào biên bản
    ]
  },
  {
    id: 3,
    name: "Học phần & Tiểu luận Tổng quan",
    description: "Hoàn thành các học phần TS và tiểu luận tổng quan.",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'p3-1', name: "Bảng điểm các học phần Tiến sĩ", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p3-2', name: "Quyết định thành lập HĐ đánh giá Tiểu luận tổng quan", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p3-3', name: "Biên bản đánh giá Tiểu luận tổng quan", status: DocumentStatus.MISSING, required: true, templateUrl: '#' }, // Thu từ thư ký
      { id: 'p3-4', name: "Tài liệu tiểu luận (Sau chỉnh sửa)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
    ]
  },
  {
    id: 4,
    name: "Chuyên đề Tiến sĩ",
    description: "Đánh giá 03 chuyên đề tiến sĩ.",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'p4-1', name: "QĐ thành lập HĐ đánh giá Chuyên đề TS", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p4-2', name: "Biên bản đánh giá Chuyên đề 1", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p4-3', name: "Biên bản đánh giá Chuyên đề 2", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p4-4', name: "Biên bản đánh giá Chuyên đề 3", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p4-5', name: "Tài liệu chuyên đề (Sau chỉnh sửa)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
    ]
  },
  {
    id: 5,
    name: "Đánh giá cấp Đơn vị (Cơ sở)",
    description: "Đánh giá luận án tại đơn vị chuyên môn (Khoa/Bộ môn).",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'p5-1', name: "Hồ sơ xét bảo vệ Luận án (Đơn, Lý lịch...)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p5-2', name: "Quyết định thành lập HĐ đánh giá cấp Đơn vị", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p5-3', name: "Biên bản kết luận của Hội đồng", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p5-4', name: "Bản giải trình chỉnh sửa luận án", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
    ]
  },
  {
    id: 6,
    name: "Phản biện Độc lập (Kín)",
    description: "Gửi luận án lấy ý kiến chuyên gia độc lập.",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'p6-1', name: "Danh sách phản biện độc lập (Trình Hiệu trưởng)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p6-2', name: "Hồ sơ gửi phản biện (Đã xóa thông tin)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p6-3', name: "Kết quả phản biện độc lập 1", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p6-4', name: "Kết quả phản biện độc lập 2", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p6-5', name: "Bản giải trình chỉnh sửa sau phản biện", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
    ]
  },
  {
    id: 7,
    name: "Bảo vệ Cấp Trường",
    description: "Bảo vệ chính thức cấp cơ sở đào tạo.",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'p7-1', name: "Danh sách đủ điều kiện bảo vệ cấp Trường", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p7-2', name: "Quyết định thành lập HĐ cấp Trường", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p7-3', name: "Thông báo bảo vệ Luận án (Public Website)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p7-4', name: "Biên bản & Nghị quyết Hội đồng", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
    ]
  },
  {
    id: 8,
    name: "Tốt nghiệp & Cấp bằng",
    description: "Hoàn tất hồ sơ sau bảo vệ, in và cấp bằng.",
    isCompleted: false,
    isCurrent: false,
    documents: [
      { id: 'p8-1', name: "Luận án hoàn chỉnh (Nộp lưu chiểu)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p8-2', name: "Phiếu xác nhận thông tin in bằng", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p8-3', name: "Quyết định cấp bằng Tiến sĩ", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
      { id: 'p8-4', name: "Sổ cấp bằng (Ký nhận)", status: DocumentStatus.MISSING, required: true, templateUrl: '#' },
    ]
  }
];

// DỮ LIỆU LỚP HỌC MẪU
export const MOCK_CLASSES: ClassInfo[] = [
    { id: 'class-it-1', name: 'CH CNTT K30 - Lớp 1', degree: DegreeType.MASTER, major: 'Khoa học Máy tính', batch: 'K30', advisor: 'TS. Nguyễn Văn A', totalStudents: 30 },
    { id: 'class-it-2', name: 'CH CNTT K30 - Lớp 2', degree: DegreeType.MASTER, major: 'Kỹ thuật Phần mềm', batch: 'K30', advisor: 'TS. Lê Thị B', totalStudents: 25 },
    
    { id: 'class-pharm-1', name: 'CH Dược K29 - Lớp A', degree: DegreeType.MASTER, major: 'Dược lý & Dược lâm sàng', batch: 'K29', advisor: 'PGS.TS Trần Văn C', totalStudents: 40 },
    { id: 'class-pharm-2', name: 'CH Dược K29 - Lớp B', degree: DegreeType.MASTER, major: 'Dược liệu', batch: 'K29', advisor: 'TS. Phạm Thị D', totalStudents: 38 },
    { id: 'class-pharm-3', name: 'CH Dược K30 - Lớp A', degree: DegreeType.MASTER, major: 'Quản lý Dược', batch: 'K30', advisor: 'PGS.TS Hoàng Văn E', totalStudents: 45 },
    { id: 'class-pharm-4', name: 'CH Dược K30 - Lớp B', degree: DegreeType.MASTER, major: 'Kiểm nghiệm thuốc', batch: 'K30', advisor: 'TS. Ngô Thị F', totalStudents: 42 },
    { id: 'class-pharm-5', name: 'CH Dược K30 - Lớp C', degree: DegreeType.MASTER, major: 'Công nghệ Dược phẩm', batch: 'K30', advisor: 'TS. Đỗ Văn G', totalStudents: 35 },

    { id: 'class-eco-ncs', name: 'NCS Kinh tế K22', degree: DegreeType.PHD, major: 'Quản lý Kinh tế', batch: 'NCS2022', advisor: 'GS.TS Nguyễn Hoàng H', totalStudents: 15 },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'SV001',
    fullName: "Nguyễn Văn An",
    dob: "1995-05-12",
    email: "an.nguyen@email.com",
    phone: "0901234567",
    degree: DegreeType.MASTER,
    major: "Khoa học Máy tính",
    classId: 'class-it-1',
    batch: "K30",
    studentCode: "MCS2023001",
    enrollmentDate: "2023-09-15",
    avatarUrl: "https://picsum.photos/200/200",
    currentStageId: 1, 
    stages: getMasterStages(), // Uses new function
    notes: "Đang chờ Quyết định trúng tuyển bản giấy.",
    tuitionRecords: [
      { 
        id: 't-sv1-1', title: 'Học phí Kỳ 1 - Năm học 2023-2024', amount: 15000000, 
        dueDate: '2023-10-15', status: TuitionStatus.PAID, paymentDate: '2023-10-10', termIndex: 1 
      },
      { 
        id: 't-sv1-2', title: 'Học phí Kỳ 2 - Năm học 2023-2024', amount: 15000000, 
        dueDate: '2024-03-15', status: TuitionStatus.UNPAID, termIndex: 2 
      }
    ]
  },
  {
    id: 'SV002',
    fullName: "Trần Thị Bích",
    dob: "1990-10-20",
    email: "bich.tran@email.com",
    phone: "0912345678",
    degree: DegreeType.PHD,
    major: "Quản lý Kinh tế",
    classId: 'class-eco-ncs',
    batch: "NCS2022",
    studentCode: "PHD2022005",
    enrollmentDate: "2022-05-01",
    avatarUrl: "https://picsum.photos/201/201",
    currentStageId: 2, 
    stages: (() => {
        const s = getPhdStages();
        s[0].isCompleted = true; // Đầu vào xong
        s[1].isCurrent = true;   // Đang ở giai đoạn Đề cương
        return s;
    })(),
    notes: "Cần nhắc nộp Hợp đồng GVHD.",
    tuitionRecords: [
        { 
          id: 't-sv2-1', title: 'Học phí Năm thứ 1', amount: 30000000, 
          dueDate: '2022-06-01', status: TuitionStatus.PAID, paymentDate: '2022-05-20', termIndex: 1 
        },
        { 
          id: 't-sv2-2', title: 'Học phí Năm thứ 2', amount: 30000000, 
          dueDate: '2023-06-01', status: TuitionStatus.OVERDUE, termIndex: 2 
        }
    ]
  },
   {
    id: 'SV003',
    fullName: "Lê Hoàng Nam",
    dob: "1998-01-15",
    email: "nam.le@email.com",
    phone: "0987654321",
    degree: DegreeType.MASTER,
    major: "Dược lý & Dược lâm sàng",
    classId: 'class-pharm-1',
    batch: "K29",
    studentCode: "MP2024012",
    enrollmentDate: "2024-02-15",
    avatarUrl: "https://picsum.photos/202/202",
    currentStageId: 3, 
    stages: (() => {
        const s = getMasterStages();
        s[0].isCompleted = true; 
        s[1].isCompleted = true; 
        s[2].isCurrent = true;   
        return s;
    })(),
    notes: "Đã có chứng chỉ tiếng Anh, đang làm đề cương.",
    tuitionRecords: [
        { 
          id: 't-sv3-1', title: 'Học phí Kỳ 1 - Năm học 2024-2025', amount: 16500000, 
          dueDate: '2024-03-15', status: TuitionStatus.PAID, paymentDate: '2024-03-01', termIndex: 1 
        }
    ]
  }
];

export const MOCK_SCHEDULES: ScheduleItem[] = [
    {
        id: 'sch_1',
        subject: 'Phương pháp nghiên cứu khoa học',
        lecturer: 'PGS.TS Nguyễn Thanh Bình',
        date: '2023-11-20',
        time: '08:00 - 11:30',
        room: 'B1-204',
        batch: 'K30 Cao học',
        degree: DegreeType.MASTER,
        type: 'CLASS'
    },
    {
        id: 'sch_2',
        subject: 'Triết học nâng cao',
        lecturer: 'TS. Trần Văn Đạo',
        date: '2023-11-21',
        time: '13:30 - 17:00',
        room: 'C2-101',
        batch: 'NCS K22',
        degree: DegreeType.PHD,
        type: 'CLASS'
    },
     {
        id: 'sch_3',
        subject: 'Bảo vệ Đề cương Luận văn',
        lecturer: 'Hội đồng chuyên môn K30',
        date: '2023-11-25',
        time: '07:30 - 11:30',
        room: 'Hội trường A',
        batch: 'K30 Cao học',
        degree: DegreeType.MASTER,
        type: 'DEFENSE'
    },
    {
        id: 'sch_4',
        subject: 'Tiếng Anh B1 - Kỹ năng Viết',
        lecturer: 'ThS. Sarah Jenkins',
        date: '2023-11-22',
        time: '18:00 - 20:30',
        room: 'Online (Zoom)',
        batch: 'K30 Cao học',
        degree: DegreeType.MASTER,
        type: 'CLASS'
    }
];

// KHO BIỂU MẪU HỆ THỐNG (MỚI)
export const MOCK_SYSTEM_DOCUMENTS: SystemDocument[] = [
    // Giai đoạn 1: Nhập học
    { id: 'bm-01', code: 'BM.01/SĐH', name: 'Sơ yếu lý lịch học viên cao học', type: SystemDocType.TEMPLATE, degree: DegreeType.MASTER, stageId: 1, lastUpdated: '2023-08-01', downloadUrl: '#' },
    { id: 'bm-02', code: 'BM.02/SĐH', name: 'Cam kết thực hiện quy chế đào tạo', type: SystemDocType.TEMPLATE, degree: DegreeType.MASTER, stageId: 1, lastUpdated: '2023-01-15', downloadUrl: '#' },
    
    // Giai đoạn 3: Giao đề tài
    { id: 'bm-05', code: 'BM.05/SĐH', name: 'Đơn xin nhận đề tài luận văn', type: SystemDocType.TEMPLATE, degree: DegreeType.MASTER, stageId: 3, lastUpdated: '2023-05-20', downloadUrl: '#' },
    { id: 'qd-01', code: 'QĐ-Mẫu-01', name: 'Mẫu Quyết định giao đề tài', type: SystemDocType.DECISION, degree: DegreeType.MASTER, stageId: 3, lastUpdated: '2022-11-10', downloadUrl: '#' },

    // Giai đoạn 4: Bảo vệ
    { id: 'bm-08', code: 'BM.08/SĐH', name: 'Đơn xin bảo vệ luận văn', type: SystemDocType.TEMPLATE, degree: DegreeType.MASTER, stageId: 4, lastUpdated: '2023-02-20', downloadUrl: '#' },
    { id: 'qd-05', code: 'QĐ-Mẫu-05', name: 'Mẫu QĐ thành lập HĐ chấm luận văn', type: SystemDocType.DECISION, degree: DegreeType.MASTER, stageId: 4, lastUpdated: '2023-01-05', downloadUrl: '#' },
    { id: 'bm-10', code: 'BM.10/SĐH', name: 'Biên bản họp Hội đồng', type: SystemDocType.DECISION, degree: DegreeType.MASTER, stageId: 4, lastUpdated: '2023-01-05', downloadUrl: '#' },

    // Tiến sĩ (Cập nhật theo workflow mới)
    { id: 'bm-ncs-01', code: 'BM.01/NCS', name: 'Biên bản họp HĐ xét tuyển', type: SystemDocType.DECISION, degree: DegreeType.PHD, stageId: 1, lastUpdated: '2022-09-01', downloadUrl: '#' },
    { id: 'bm-ncs-05', code: 'BM.05/NCS', name: 'Hợp đồng hướng dẫn nghiên cứu sinh', type: SystemDocType.TEMPLATE, degree: DegreeType.PHD, stageId: 2, lastUpdated: '2022-09-01', downloadUrl: '#' },
    { id: 'bm-ncs-12', code: 'BM.12/NCS', name: 'Biên bản đánh giá chuyên đề', type: SystemDocType.DECISION, degree: DegreeType.PHD, stageId: 4, lastUpdated: '2023-03-15', downloadUrl: '#' },
];
