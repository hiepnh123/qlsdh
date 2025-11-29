
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import ScheduleManager from './components/ScheduleManager';
import TuitionManager from './components/TuitionManager';
import ClassManager from './components/ClassManager';
import DocumentLibrary from './components/DocumentLibrary';
import SystemConfig from './components/SystemConfig';
import { MOCK_STUDENTS, MOCK_CLASSES, MOCK_SYSTEM_DOCUMENTS, getMasterStages, getPhdStages } from './constants';
import { Student, DegreeType, TrainingStage, ClassInfo, DocumentStatus, AppNotification, NotificationType, TuitionStatus, SystemDocument } from './types';
import { LayoutDashboard, Users, Settings, LogOut, Bell, CalendarDays, Wallet, School, Files, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'classes' | 'schedule' | 'tuition' | 'documents' | 'settings'>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string | null>(null);
  
  // State quản lý danh sách học viên & Lớp học
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [classes, setClasses] = useState<ClassInfo[]>(MOCK_CLASSES);

  // STATE QUẢN LÝ TÀI LIỆU HỆ THỐNG (MỚI)
  const [systemDocuments, setSystemDocuments] = useState<SystemDocument[]>(MOCK_SYSTEM_DOCUMENTS);

  // STATE QUẢN LÝ CẤU HÌNH (QUY TRÌNH MẪU)
  const [masterStagesConfig, setMasterStagesConfig] = useState<TrainingStage[]>(getMasterStages());
  const [phdStagesConfig, setPhdStagesConfig] = useState<TrainingStage[]>(getPhdStages());

  // NOTIFICATION STATE
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [detailInitialTab, setDetailInitialTab] = useState<'ACADEMIC' | 'TUITION'>('ACADEMIC');

  // --- NOTIFICATION ENGINE ---
  // Tự động quét dữ liệu để sinh ra cảnh báo
  useEffect(() => {
    const generatedNotis: AppNotification[] = [];

    students.forEach(student => {
        // 1. Check Tuition Overdue
        const overdue = student.tuitionRecords.filter(t => t.status === TuitionStatus.OVERDUE);
        if (overdue.length > 0) {
            generatedNotis.push({
                id: `noti_tuit_${student.id}`,
                type: NotificationType.DANGER,
                title: 'Nợ học phí quá hạn',
                message: `Học viên ${student.fullName} đang nợ ${overdue.length} khoản thu.`,
                timestamp: new Date().toISOString(),
                studentId: student.id,
                isRead: false,
                actionLabel: 'Xem công nợ'
            });
        }

        // 2. Check Missing Required Documents in Current Stage
        const currentStage = student.stages.find(s => s.id === student.currentStageId);
        if (currentStage) {
            const missingRequired = currentStage.documents.filter(d => d.required && d.status === DocumentStatus.MISSING);
            if (missingRequired.length > 0) {
                 generatedNotis.push({
                    id: `noti_doc_${student.id}`,
                    type: NotificationType.WARNING,
                    title: 'Thiếu hồ sơ bắt buộc',
                    message: `${student.fullName} thiếu ${missingRequired.length} tài liệu ở giai đoạn "${currentStage.name}".`,
                    timestamp: new Date().toISOString(),
                    studentId: student.id,
                    isRead: false,
                    actionLabel: 'Kiểm tra ngay'
                });
            }
        }
    });

    setNotifications(generatedNotis);
  }, [students]);
  // ---------------------------

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleClassSelect = (classId: string) => {
      setSelectedClassFilter(classId);
      setActiveTab('students');
  }

  const handleClearClassFilter = () => {
      setSelectedClassFilter(null);
  }

  const handleAddStudent = (newStudent: Student) => {
      setStudents(prev => [newStudent, ...prev]);
      
      // Update class count if assigned
      if (newStudent.classId) {
          setClasses(prev => prev.map(c => 
              c.id === newStudent.classId ? { ...c, totalStudents: c.totalStudents + 1 } : c
          ));
      }
  };

  const handleAddClass = (newClass: ClassInfo) => {
      setClasses(prev => [newClass, ...prev]);
  };

  const handleEditClass = (updatedClass: ClassInfo) => {
      setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleDeleteClass = (classId: string) => {
      // 1. Remove the class
      setClasses(prev => prev.filter(c => c.id !== classId));
      
      // 2. Unassign students who were in this class (set classId to empty)
      // This prevents data inconsistency
      setStudents(prevStudents => prevStudents.map(student => 
        student.classId === classId 
            ? { ...student, classId: '' } 
            : student
      ));
  };

  // --- DOCUMENT LIBRARY HANDLERS ---
  const handleAddSystemDoc = (doc: SystemDocument) => {
      setSystemDocuments(prev => [doc, ...prev]);
  };

  const handleEditSystemDoc = (updatedDoc: SystemDocument) => {
      setSystemDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const handleDeleteSystemDoc = (docId: string) => {
      setSystemDocuments(prev => prev.filter(d => d.id !== docId));
  };
  // ---------------------------------

  const handleSaveSystemConfig = (degree: DegreeType, newConfigStages: TrainingStage[]) => {
      // 1. Update the Global Config State
      if (degree === DegreeType.MASTER) {
          setMasterStagesConfig(newConfigStages);
      } else {
          setPhdStagesConfig(newConfigStages);
      }

      // 2. SYNCHRONIZATION: Update ALL existing students of that degree to the new config
      setStudents(prevStudents => prevStudents.map(student => {
          if (student.degree !== degree) return student;

          const mergedStages = newConfigStages.map(configStage => {
              const existingStudentStage = student.stages.find(s => s.id === configStage.id);
              
              if (!existingStudentStage) {
                  return configStage; 
              }

              const mergedDocs = configStage.documents.map(configDoc => {
                  const existingDoc = existingStudentStage.documents.find(d => d.id === configDoc.id);
                  return {
                      ...configDoc, 
                      status: existingDoc ? existingDoc.status : DocumentStatus.MISSING, 
                      fileUrl: existingDoc ? existingDoc.fileUrl : undefined 
                  };
              });

              return {
                  ...configStage, 
                  isCompleted: existingStudentStage.isCompleted, 
                  isCurrent: existingStudentStage.isCurrent,     
                  documents: mergedDocs
              };
          });

          return { ...student, stages: mergedStages };
      }));
  };

  const handleNotificationClick = (noti: AppNotification) => {
      if (noti.studentId) {
          const student = students.find(s => s.id === noti.studentId);
          if (student) {
              setSelectedStudent(student);
              setActiveTab('students'); // Force switch to students view
              
              // Smart Tab Switching
              if (noti.type === NotificationType.DANGER || noti.title.toLowerCase().includes('học phí')) {
                  setDetailInitialTab('TUITION');
              } else {
                  setDetailInitialTab('ACADEMIC');
              }
              
              setShowNotiDropdown(false);
          }
      }
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return <Dashboard students={students} notifications={notifications} onHandleAction={handleNotificationClick} />;
    }

    if (activeTab === 'classes') {
        return <ClassManager 
                  classes={classes} 
                  students={students}
                  onSelectClass={handleClassSelect} 
                  onAddClass={handleAddClass}
                  onEditClass={handleEditClass}
                  onDeleteClass={handleDeleteClass}
               />;
    }

    if (activeTab === 'schedule') {
        return <ScheduleManager />;
    }

    if (activeTab === 'tuition') {
        return <TuitionManager />;
    }

    if (activeTab === 'documents') {
        return <DocumentLibrary 
                  documents={systemDocuments}
                  onAddDoc={handleAddSystemDoc}
                  onEditDoc={handleEditSystemDoc}
                  onDeleteDoc={handleDeleteSystemDoc}
                  masterConfig={masterStagesConfig}
                  phdConfig={phdStagesConfig}
               />;
    }

    if (activeTab === 'settings') {
        return <SystemConfig 
                  masterConfig={masterStagesConfig} 
                  phdConfig={phdStagesConfig} 
                  onSave={handleSaveSystemConfig} 
               />;
    }

    if (selectedStudent) {
      return <StudentDetail 
                key={selectedStudent.id} 
                student={selectedStudent} 
                onBack={() => { setSelectedStudent(null); setDetailInitialTab('ACADEMIC'); }} 
                initialActiveTab={detailInitialTab}
             />;
    }

    return <StudentList 
        students={students} 
        classes={classes}
        onSelectStudent={handleStudentSelect} 
        initialClassFilter={selectedClassFilter}
        onClearClassFilter={handleClearClassFilter}
        onAddStudent={handleAddStudent}
        onAddClass={handleAddClass} 
        masterConfig={masterStagesConfig} 
        phdConfig={phdStagesConfig} 
    />;
  };

  const getHeaderTitle = () => {
      if (activeTab === 'dashboard') return 'Bảng tin chung';
      if (activeTab === 'classes') return 'Quản lý Lớp học';
      if (activeTab === 'schedule') return 'Quản lý Thời khoá biểu';
      if (activeTab === 'tuition') return 'Quản lý Học phí';
      if (activeTab === 'documents') return 'Kho Văn bản & Biểu mẫu';
      if (activeTab === 'settings') return 'Cấu hình Hệ thống';
      if (selectedStudent) return 'Hồ sơ chi tiết';
      return 'Danh sách học viên';
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white">E</div>
             <span className="text-lg font-bold tracking-tight">EduManage Pro</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedStudent(null); setSelectedClassFilter(null); }}
            className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Tổng quan
          </button>

          <button 
            onClick={() => { setActiveTab('classes'); setSelectedStudent(null); }}
            className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'classes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <School className="w-5 h-5 mr-3" />
            Quản lý Lớp học
          </button>
          
          <button 
             onClick={() => { setActiveTab('students'); setSelectedStudent(null); }}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Users className="w-5 h-5 mr-3" />
            Quản lý Học viên
          </button>

          <button 
             onClick={() => { setActiveTab('schedule'); setSelectedStudent(null); }}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <CalendarDays className="w-5 h-5 mr-3" />
            Thời khoá biểu
          </button>

          <button 
             onClick={() => { setActiveTab('tuition'); setSelectedStudent(null); }}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tuition' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Wallet className="w-5 h-5 mr-3" />
            Quản lý Học phí
          </button>

          <button 
             onClick={() => { setActiveTab('documents'); setSelectedStudent(null); }}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'documents' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Files className="w-5 h-5 mr-3" />
            Kho Biểu mẫu
          </button>

           <button 
             onClick={() => { setActiveTab('settings'); setSelectedStudent(null); }}
             className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Cấu hình
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button className="flex items-center w-full px-4 py-2 mt-1 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
            <h2 className="text-lg font-semibold text-gray-800">
                {getHeaderTitle()}
            </h2>
            <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative">
                    <button 
                        onClick={() => setShowNotiDropdown(!showNotiDropdown)}
                        className={`relative p-2 rounded-full hover:bg-gray-100 ${showNotiDropdown ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotiDropdown && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                            <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                                <span className="font-semibold text-gray-700 text-sm">Thông báo ({notifications.length})</span>
                                <button onClick={() => setShowNotiDropdown(false)}><X className="w-4 h-4 text-gray-500"/></button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(noti => (
                                        <div 
                                            key={noti.id} 
                                            onClick={() => handleNotificationClick(noti)}
                                            className="p-3 border-b hover:bg-blue-50 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-start">
                                                <div className={`w-2 h-2 mt-1.5 rounded-full mr-3 ${noti.type === NotificationType.DANGER ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{noti.title}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{noti.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2">{new Date(noti.timestamp).toLocaleDateString('vi-VN')} • {new Date(noti.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">Không có thông báo mới</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-gray-900">Admin User</p>
                        <p className="text-xs text-gray-500">Phòng Đào tạo SĐH</p>
                    </div>
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">A</div>
                </div>
            </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 p-8 overflow-y-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
