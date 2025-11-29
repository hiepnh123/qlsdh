
import React, { useState, useMemo } from 'react';
import { Student, DegreeType, TrainingStage, ClassInfo, DocumentStatus, TuitionStatus } from '../types';
import { Search, Filter, MoreHorizontal, GraduationCap, BookOpen, Plus, X, Check, ChevronDown, ChevronUp, RotateCcw, AlertCircle, DollarSign, Wand2 } from 'lucide-react';

interface Props {
  students: Student[];
  classes: ClassInfo[]; // New Prop
  onSelectStudent: (student: Student) => void;
  initialClassFilter?: string | null;
  onClearClassFilter?: () => void;
  onAddStudent: (student: Student) => void;
  onAddClass?: (newClass: ClassInfo) => void; // Support creating class from here
  masterConfig: TrainingStage[]; 
  phdConfig: TrainingStage[]; 
}

const StudentList: React.FC<Props> = ({ students, classes, onSelectStudent, initialClassFilter, onClearClassFilter, onAddStudent, onAddClass, masterConfig, phdConfig }) => {
  const [filterType, setFilterType] = useState<'ALL' | DegreeType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filter State
  const [showAdvFilter, setShowAdvFilter] = useState(false);
  const [advFilter, setAdvFilter] = useState({
      stageId: 'ALL',
      batch: 'ALL',
      missingDocsOnly: false,
      tuitionOverdueOnly: false,
  });

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
      fullName: '',
      studentCode: '',
      degree: DegreeType.MASTER,
      major: '',
      classId: '',
      batch: '',
      email: '',
      phone: ''
  });

  // Quick Class Creation State
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [quickClassData, setQuickClassData] = useState({ name: '' });

  // Logic to show class name
  const getClassName = (classId: string) => {
      const cls = classes.find(c => c.id === classId);
      return cls ? cls.name : 'Chưa phân lớp';
  };

  // Get unique batches for filter dropdown
  const uniqueBatches = useMemo(() => {
      const batches = new Set(students.map(s => s.batch).filter(Boolean));
      return Array.from(batches).sort();
  }, [students]);

  // Get all unique stages (merge master/phd names) for filter
  const uniqueStages = useMemo(() => {
      const stageMap = new Map<number, string>();
      [...masterConfig, ...phdConfig].forEach(s => stageMap.set(s.id, s.name));
      return Array.from(stageMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [masterConfig, phdConfig]);

  const filteredStudents = students.filter(s => {
      // 1. Basic Filters
      const matchesDegree = filterType === 'ALL' || s.degree === filterType;
      const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = initialClassFilter ? s.classId === initialClassFilter : true;
      
      // 2. Advanced Filters
      let matchesAdv = true;
      if (showAdvFilter) {
          // Filter by Stage
          if (advFilter.stageId !== 'ALL' && s.currentStageId.toString() !== advFilter.stageId) {
              matchesAdv = false;
          }
          // Filter by Batch
          if (advFilter.batch !== 'ALL' && s.batch !== advFilter.batch) {
              matchesAdv = false;
          }
          // Filter by Missing Docs
          if (advFilter.missingDocsOnly) {
              const currentStage = s.stages.find(st => st.id === s.currentStageId);
              const hasMissing = currentStage?.documents.some(d => d.status === DocumentStatus.MISSING);
              if (!hasMissing) matchesAdv = false;
          }
          // Filter by Tuition Overdue
          if (advFilter.tuitionOverdueOnly) {
              const hasOverdue = s.tuitionRecords.some(t => t.status === TuitionStatus.OVERDUE);
              if (!hasOverdue) matchesAdv = false;
          }
      }

      return matchesDegree && matchesSearch && matchesClass && matchesAdv;
  });

  const selectedClassName = initialClassFilter ? getClassName(initialClassFilter) : null;

  const handleQuickAddClass = () => {
      if (!quickClassData.name || !onAddClass) return;
      
      const newClass: ClassInfo = {
          id: `CLASS_${Date.now()}`,
          name: quickClassData.name,
          degree: newStudentData.degree,
          major: newStudentData.major || 'Chưa cập nhật',
          batch: newStudentData.batch || 'Chưa cập nhật',
          advisor: 'Chưa phân công',
          totalStudents: 0
      };

      onAddClass(newClass);
      setNewStudentData({ ...newStudentData, classId: newClass.id });
      setIsCreatingClass(false);
      setQuickClassData({ name: '' });
  };

  const handleAutoGenerateCode = () => {
      const year = new Date().getFullYear();
      const prefix = newStudentData.degree === DegreeType.MASTER ? 'MCS' : 'PHD';
      const randomNum = Math.floor(1000 + Math.random() * 9000); // Simple random for demo
      const code = `${prefix}${year}${randomNum}`;
      setNewStudentData({ ...newStudentData, studentCode: code });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // USE DYNAMIC CONFIG HERE (Deep Copy to avoid reference issues)
      const stagesTemplate = newStudentData.degree === DegreeType.MASTER ? masterConfig : phdConfig;
      const initialStages = JSON.parse(JSON.stringify(stagesTemplate));

      const newStudent: Student = {
          id: `NEW_${Date.now()}`,
          fullName: newStudentData.fullName,
          studentCode: newStudentData.studentCode,
          dob: '1995-01-01', // Default
          email: newStudentData.email,
          phone: newStudentData.phone,
          degree: newStudentData.degree,
          major: newStudentData.major,
          classId: newStudentData.classId,
          batch: newStudentData.batch,
          enrollmentDate: new Date().toISOString().split('T')[0],
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudentData.fullName)}&background=random&color=fff`,
          currentStageId: 1,
          stages: initialStages, // Use dynamic stages
          notes: 'Học viên mới nhập học',
          tuitionRecords: []
      };

      onAddStudent(newStudent);
      setShowAddModal(false);
      // Reset form
      setNewStudentData({
          fullName: '', studentCode: '', degree: DegreeType.MASTER, 
          major: '', classId: '', batch: '', email: '', phone: ''
      });
      setIsCreatingClass(false);
  };

  const resetAdvFilter = () => {
      setAdvFilter({
          stageId: 'ALL',
          batch: 'ALL',
          missingDocsOnly: false,
          tuitionOverdueOnly: false,
      });
  };

  return (
    <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex justify-between items-center">
            <div className="bg-white rounded-lg p-1.5 shadow-sm border border-gray-100 inline-flex">
                <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterType === 'ALL' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tất cả hồ sơ
                </button>
                <button
                    onClick={() => setFilterType(DegreeType.MASTER)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${filterType === DegreeType.MASTER ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <GraduationCap className="w-4 h-4" />
                    <span>Thạc sĩ</span>
                </button>
                <button
                    onClick={() => setFilterType(DegreeType.PHD)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${filterType === DegreeType.PHD ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <BookOpen className="w-4 h-4" />
                    <span>Tiến sĩ (NCS)</span>
                </button>
            </div>
            
            {initialClassFilter && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <span>Đang lọc: {selectedClassName}</span>
                    <button onClick={onClearClassFilter} className="ml-2 hover:bg-blue-200 rounded-full p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Actions Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Tìm theo tên, mã học viên..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            <div className="flex space-x-2">
                <button 
                    onClick={() => setShowAdvFilter(!showAdvFilter)}
                    className={`flex items-center px-3 py-2 border rounded-lg text-sm transition-colors ${showAdvFilter ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Lọc nâng cao
                    {showAdvFilter ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Thêm học viên
                </button>
            </div>
        </div>

        {/* Advanced Filter Panel */}
        {showAdvFilter && (
            <div className="bg-gray-50 border-b border-gray-200 p-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Giai đoạn đào tạo</label>
                        <select 
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={advFilter.stageId}
                            onChange={e => setAdvFilter({...advFilter, stageId: e.target.value})}
                        >
                            <option value="ALL">Tất cả giai đoạn</option>
                            {uniqueStages.map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Khóa (Batch)</label>
                        <select 
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={advFilter.batch}
                            onChange={e => setAdvFilter({...advFilter, batch: e.target.value})}
                        >
                            <option value="ALL">Tất cả khóa</option>
                            {uniqueBatches.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2 flex items-end gap-3 pb-0.5">
                         <label className={`flex items-center px-3 py-2 border rounded cursor-pointer select-none text-sm transition-colors ${advFilter.missingDocsOnly ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'bg-white border-gray-300 text-gray-700'}`}>
                            <input 
                                type="checkbox" 
                                className="hidden"
                                checked={advFilter.missingDocsOnly}
                                onChange={e => setAdvFilter({...advFilter, missingDocsOnly: e.target.checked})}
                            />
                            <AlertCircle className={`w-4 h-4 mr-2 ${advFilter.missingDocsOnly ? 'text-red-500' : 'text-gray-400'}`} />
                            Đang thiếu hồ sơ
                        </label>

                         <label className={`flex items-center px-3 py-2 border rounded cursor-pointer select-none text-sm transition-colors ${advFilter.tuitionOverdueOnly ? 'bg-orange-50 border-orange-200 text-orange-700 font-medium' : 'bg-white border-gray-300 text-gray-700'}`}>
                            <input 
                                type="checkbox" 
                                className="hidden"
                                checked={advFilter.tuitionOverdueOnly}
                                onChange={e => setAdvFilter({...advFilter, tuitionOverdueOnly: e.target.checked})}
                            />
                            <DollarSign className={`w-4 h-4 mr-2 ${advFilter.tuitionOverdueOnly ? 'text-orange-500' : 'text-gray-400'}`} />
                            Nợ học phí
                        </label>
                        
                        <button 
                            onClick={resetAdvFilter}
                            className="ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                            title="Xóa bộ lọc"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                <tr>
                <th className="px-6 py-3">Học viên</th>
                <th className="px-6 py-3">Lớp / Chuyên ngành</th>
                <th className="px-6 py-3">Giai đoạn hiện tại</th>
                <th className="px-6 py-3">Trạng thái hồ sơ</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                    const currentStage = student.stages.find(s => s.id === student.currentStageId);
                    const missingDocs = currentStage?.documents.filter(d => d.status === DocumentStatus.MISSING).length || 0;
                    
                    return (
                        <tr 
                            key={student.id} 
                            onClick={() => onSelectStudent(student)}
                            className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <img src={student.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{student.fullName}</p>
                                        <p className="text-xs text-gray-500">{student.studentCode}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{getClassName(student.classId)}</span>
                                    <span className="text-xs text-gray-500">{student.major}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800">{currentStage?.name}</span>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 max-w-[100px]">
                                        <div 
                                            className="bg-blue-500 h-1.5 rounded-full" 
                                            style={{ width: `${(student.currentStageId / student.stages.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {missingDocs > 0 ? (
                                    <div className="flex items-center text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded border border-red-100 w-fit">
                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                        Thiếu {missingDocs} tài liệu
                                    </div>
                                ) : (
                                    <div className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded border border-green-100 w-fit">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Đủ hồ sơ
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    );
                    })
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-500">
                            Không tìm thấy học viên nào phù hợp.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>

        {/* Add Student Modal */}
        {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                    <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-800">Tiếp nhận học viên mới</h3>
                        <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
                    </div>
                    <form onSubmit={handleAddSubmit}>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="VD: Nguyễn Văn A"
                                        value={newStudentData.fullName}
                                        onChange={e => setNewStudentData({...newStudentData, fullName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã học viên</label>
                                    <div className="flex space-x-2">
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                            placeholder="VD: MCS2024001"
                                            value={newStudentData.studentCode}
                                            onChange={e => setNewStudentData({...newStudentData, studentCode: e.target.value})}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleAutoGenerateCode}
                                            className="px-3 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100"
                                            title="Sinh mã tự động"
                                        >
                                            <Wand2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                                    <select 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newStudentData.degree}
                                        onChange={e => setNewStudentData({...newStudentData, degree: e.target.value as DegreeType})}
                                    >
                                        <option value={DegreeType.MASTER}>Thạc sĩ</option>
                                        <option value={DegreeType.PHD}>Tiến sĩ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Khóa học</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="VD: K30"
                                        value={newStudentData.batch}
                                        onChange={e => setNewStudentData({...newStudentData, batch: e.target.value})}
                                    />
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên ngành</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="VD: Khoa học Máy tính"
                                        value={newStudentData.major}
                                        onChange={e => setNewStudentData({...newStudentData, major: e.target.value})}
                                    />
                                </div>
                                
                                {/* CLASS SELECTION WITH QUICK ADD */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lớp quản lý</label>
                                    {!isCreatingClass ? (
                                        <div className="flex space-x-2">
                                            <select 
                                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={newStudentData.classId}
                                                onChange={e => setNewStudentData({...newStudentData, classId: e.target.value})}
                                            >
                                                <option value="">-- Chọn lớp --</option>
                                                {classes.filter(c => c.degree === newStudentData.degree).map(cls => (
                                                    <option key={cls.id} value={cls.id}>{cls.name} ({cls.major})</option>
                                                ))}
                                            </select>
                                            <button 
                                                type="button"
                                                onClick={() => setIsCreatingClass(true)}
                                                className="px-3 py-2 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 whitespace-nowrap text-sm font-medium"
                                                title="Tạo lớp mới"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2 animate-fade-in">
                                             <input 
                                                type="text" 
                                                className="w-full border border-blue-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Nhập tên lớp mới..."
                                                autoFocus
                                                value={quickClassData.name}
                                                onChange={e => setQuickClassData({...quickClassData, name: e.target.value})}
                                            />
                                            <button 
                                                type="button"
                                                onClick={handleQuickAddClass}
                                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIsCreatingClass(false)}
                                                className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="email@example.com"
                                        value={newStudentData.email}
                                        onChange={e => setNewStudentData({...newStudentData, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input 
                                        type="tel" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="090..."
                                        value={newStudentData.phone}
                                        onChange={e => setNewStudentData({...newStudentData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t bg-gray-50 flex justify-end space-x-2">
                            <button 
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-200 rounded"
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded shadow-sm"
                            >
                                Lưu hồ sơ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default StudentList;
