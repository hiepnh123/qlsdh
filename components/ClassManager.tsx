
import React, { useState, useMemo } from 'react';
import { ClassInfo, DegreeType, Student } from '../types';
import { Users, GraduationCap, Briefcase, Search, ArrowRight, Plus, X, Trash2, AlertTriangle, Edit, Filter, ChevronDown, ChevronUp, RotateCcw, UserX } from 'lucide-react';

interface Props {
  classes: ClassInfo[];
  students: Student[];
  onSelectClass: (classId: string) => void;
  onAddClass: (newClass: ClassInfo) => void;
  onEditClass: (updatedClass: ClassInfo) => void;
  onDeleteClass: (classId: string) => void;
}

const ClassManager: React.FC<Props> = ({ classes, students, onSelectClass, onAddClass, onEditClass, onDeleteClass }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDegree, setFilterDegree] = useState<'ALL' | DegreeType>('ALL');
  
  // Advanced Filter State
  const [showAdvFilter, setShowAdvFilter] = useState(false);
  const [advFilter, setAdvFilter] = useState({
      major: 'ALL',
      batch: 'ALL',
      noAdvisorOnly: false,
  });

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<{id: string, name: string} | null>(null);
  
  // Edit State
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [newClassData, setNewClassData] = useState({
      name: '',
      degree: DegreeType.MASTER,
      major: '',
      batch: '',
      advisor: '',
  });

  // Derived Data for Dropdowns
  const uniqueMajors = useMemo(() => Array.from(new Set(classes.map(c => c.major))).sort(), [classes]);
  const uniqueBatches = useMemo(() => Array.from(new Set(classes.map(c => c.batch))).sort(), [classes]);

  const filteredClasses = classes.filter(c => {
    // Basic Filters
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.major.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDegree = filterDegree === 'ALL' || c.degree === filterDegree;

    // Advanced Filters
    let matchesAdv = true;
    if (showAdvFilter) {
        if (advFilter.major !== 'ALL' && c.major !== advFilter.major) matchesAdv = false;
        if (advFilter.batch !== 'ALL' && c.batch !== advFilter.batch) matchesAdv = false;
        if (advFilter.noAdvisorOnly) {
            // Check if advisor is empty or strictly equals generic placeholders
            const isAssigned = c.advisor && c.advisor.trim() !== '' && c.advisor !== 'Chưa phân công';
            if (isAssigned) matchesAdv = false;
        }
    }

    return matchesSearch && matchesDegree && matchesAdv;
  });

  const handleOpenAddModal = () => {
      setEditingClassId(null);
      setNewClassData({ name: '', degree: DegreeType.MASTER, major: '', batch: '', advisor: '' });
      setShowAddModal(true);
  };

  const handleOpenEditModal = (cls: ClassInfo) => {
      setEditingClassId(cls.id);
      setNewClassData({
          name: cls.name,
          degree: cls.degree,
          major: cls.major,
          batch: cls.batch,
          advisor: cls.advisor
      });
      setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingClassId) {
          // UPDATE EXISTING CLASS
          const updatedClass: ClassInfo = {
              id: editingClassId,
              name: newClassData.name,
              degree: newClassData.degree,
              major: newClassData.major,
              batch: newClassData.batch,
              advisor: newClassData.advisor || 'Chưa phân công',
              totalStudents: classes.find(c => c.id === editingClassId)?.totalStudents || 0
          };
          onEditClass(updatedClass);
      } else {
          // CREATE NEW CLASS
          const newClass: ClassInfo = {
              id: `CLASS_${Date.now()}`,
              name: newClassData.name,
              degree: newClassData.degree,
              major: newClassData.major,
              batch: newClassData.batch,
              advisor: newClassData.advisor || 'Chưa phân công',
              totalStudents: 0
          };
          onAddClass(newClass);
      }
      
      setShowAddModal(false);
      setEditingClassId(null);
      // Reset form
      setNewClassData({ name: '', degree: DegreeType.MASTER, major: '', batch: '', advisor: '' });
  };

  const confirmDelete = () => {
      if (classToDelete) {
          onDeleteClass(classToDelete.id);
          setClassToDelete(null);
      }
  };

  const resetAdvFilter = () => {
      setAdvFilter({ major: 'ALL', batch: 'ALL', noAdvisorOnly: false });
  };

  return (
    <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Tìm tên lớp, chuyên ngành..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex space-x-1">
                        <button 
                            onClick={() => setFilterDegree('ALL')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterDegree === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Tất cả
                        </button>
                        <button 
                            onClick={() => setFilterDegree(DegreeType.MASTER)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterDegree === DegreeType.MASTER ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                        >
                            Thạc sĩ
                        </button>
                        <button 
                            onClick={() => setFilterDegree(DegreeType.PHD)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterDegree === DegreeType.PHD ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                        >
                            Tiến sĩ
                        </button>
                    </div>
                    
                    <div className="w-px bg-gray-300 mx-2 h-6 hidden md:block"></div>

                    <button 
                        onClick={() => setShowAdvFilter(!showAdvFilter)}
                        className={`flex items-center px-3 py-2 border rounded-lg text-sm transition-colors ${showAdvFilter ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Lọc
                        {showAdvFilter ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                    </button>
                    
                    <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-md ml-auto"
                    >
                        <Plus className="w-5 h-5 mr-1.5" />
                        Thêm lớp
                    </button>
                </div>
            </div>

            {/* Advanced Filter Panel */}
            {showAdvFilter && (
                <div className="bg-gray-50 border-t border-gray-200 p-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Chuyên ngành</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={advFilter.major}
                                onChange={e => setAdvFilter({...advFilter, major: e.target.value})}
                            >
                                <option value="ALL">Tất cả chuyên ngành</option>
                                {uniqueMajors.map(m => (
                                    <option key={m} value={m}>{m}</option>
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
                        <div className="flex items-end gap-3 pb-0.5">
                             <label className={`flex-1 flex items-center px-3 py-2 border rounded cursor-pointer select-none text-sm transition-colors ${advFilter.noAdvisorOnly ? 'bg-orange-50 border-orange-200 text-orange-700 font-medium' : 'bg-white border-gray-300 text-gray-700'}`}>
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={advFilter.noAdvisorOnly}
                                    onChange={e => setAdvFilter({...advFilter, noAdvisorOnly: e.target.checked})}
                                />
                                <UserX className={`w-4 h-4 mr-2 ${advFilter.noAdvisorOnly ? 'text-orange-500' : 'text-gray-400'}`} />
                                Chưa có GVCN
                            </label>
                            
                            <button 
                                onClick={resetAdvFilter}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title="Xóa bộ lọc"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map(cls => (
                <div key={cls.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col relative group">
                    <div className={`h-2 w-full ${cls.degree === DegreeType.MASTER ? 'bg-blue-500' : 'bg-purple-600'}`}></div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2 z-30">
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(cls);
                            }}
                            className="p-2 bg-white text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full shadow-sm border border-gray-200 transition-all"
                            title="Sửa thông tin"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setClassToDelete({ id: cls.id, name: cls.name });
                            }}
                            className="p-2 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm border border-gray-200 transition-all"
                            title="Xóa lớp học"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${cls.degree === DegreeType.MASTER ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                {cls.degree}
                            </span>
                            <span className="text-sm font-medium text-gray-400 pr-16">{cls.batch}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 mr-6">{cls.name}</h3>
                        
                        <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-center text-sm text-gray-600">
                                <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="line-clamp-1">{cls.major}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{students.filter(s => s.classId === cls.id).length} Học viên</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="line-clamp-1">GVCN: {cls.advisor}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => onSelectClass(cls.id)}
                            className="w-full flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors group/btn"
                        >
                            Xem danh sách
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            ))}
            
            {filteredClasses.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                    Không tìm thấy lớp học nào phù hợp với bộ lọc.
                </div>
            )}
        </div>

        {/* Add/Edit Class Modal */}
        {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                    <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-800">
                            {editingClassId ? 'Cập nhật thông tin lớp' : 'Tạo lớp học mới'}
                        </h3>
                        <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
                    </div>
                    <form onSubmit={handleAddSubmit}>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp học</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="VD: Cao học CNTT K31"
                                    value={newClassData.name}
                                    onChange={e => setNewClassData({...newClassData, name: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                                    <select 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newClassData.degree}
                                        onChange={e => setNewClassData({...newClassData, degree: e.target.value as DegreeType})}
                                    >
                                        <option value={DegreeType.MASTER}>Thạc sĩ</option>
                                        <option value={DegreeType.PHD}>Tiến sĩ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Khóa (Batch)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="VD: K31"
                                        value={newClassData.batch}
                                        onChange={e => setNewClassData({...newClassData, batch: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên ngành</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="VD: Khoa học dữ liệu"
                                    value={newClassData.major}
                                    onChange={e => setNewClassData({...newClassData, major: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cố vấn học tập (GVCN)</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="VD: TS. Nguyễn Văn X"
                                    value={newClassData.advisor}
                                    onChange={e => setNewClassData({...newClassData, advisor: e.target.value})}
                                />
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
                                {editingClassId ? 'Lưu thay đổi' : 'Lưu lớp'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {classToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setClassToDelete(null)}>
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center space-x-3 mb-4 text-red-600">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa lớp</h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        Bạn có chắc chắn muốn xóa lớp <span className="font-bold text-gray-900">{classToDelete.name}</span> không?
                        <br/><br/>
                        <span className="text-red-600 font-medium">Lưu ý:</span> Hành động này không thể hoàn tác. Các học viên thuộc lớp này sẽ được chuyển sang trạng thái "Chưa phân lớp".
                    </p>
                    
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={() => setClassToDelete(null)}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg text-sm shadow-sm transition-colors"
                        >
                            Xóa vĩnh viễn
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ClassManager;
