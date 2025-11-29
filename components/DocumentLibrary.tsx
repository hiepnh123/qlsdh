
import React, { useState } from 'react';
import { DegreeType, SystemDocument, SystemDocType, TrainingStage } from '../types';
import { FileText, Shield, Download, Search, FolderOpen, Upload, Trash2, Edit, X, Plus, AlertTriangle } from 'lucide-react';

interface Props {
  documents: SystemDocument[];
  onAddDoc: (doc: SystemDocument) => void;
  onEditDoc: (doc: SystemDocument) => void;
  onDeleteDoc: (docId: string) => void;
  masterConfig: TrainingStage[];
  phdConfig: TrainingStage[];
}

const DocumentLibrary: React.FC<Props> = ({ documents, onAddDoc, onEditDoc, onDeleteDoc, masterConfig, phdConfig }) => {
    const [activeDegree, setActiveDegree] = useState<DegreeType>(DegreeType.MASTER);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStageId, setSelectedStageId] = useState<number | 'ALL'>('ALL');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<SystemDocument | null>(null);

    // Form Data
    const [formData, setFormData] = useState<Partial<SystemDocument>>({
        name: '',
        code: '',
        type: SystemDocType.TEMPLATE,
        degree: DegreeType.MASTER,
        stageId: 1,
        downloadUrl: ''
    });

    const stages = activeDegree === DegreeType.MASTER ? masterConfig : phdConfig;

    const filteredDocs = documents.filter(doc => {
        const matchesDegree = doc.degree === activeDegree;
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              doc.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStage = selectedStageId === 'ALL' || doc.stageId === selectedStageId;

        return matchesDegree && matchesSearch && matchesStage;
    });

    // Group by Stage for display if "ALL" is selected, otherwise just list
    const groupedDocs = selectedStageId === 'ALL' 
        ? stages.map(stage => ({
            stage,
            docs: filteredDocs.filter(d => d.stageId === stage.id)
          })).filter(g => g.docs.length > 0) // Only show stages with docs
        : [{ stage: stages.find(s => s.id === selectedStageId), docs: filteredDocs }];

    const getDocIcon = (type: SystemDocType) => {
        return type === SystemDocType.DECISION ? <Shield className="w-5 h-5 text-purple-600" /> : <FileText className="w-5 h-5 text-blue-600" />;
    };

    const getTypeLabel = (type: SystemDocType) => {
        return type === SystemDocType.DECISION ? 'Mẫu Quyết định' : 'Biểu mẫu học viên';
    };

    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormData({
            name: '',
            code: '',
            type: SystemDocType.TEMPLATE,
            degree: activeDegree, // Default to current view
            stageId: 1,
            downloadUrl: ''
        });
        setShowModal(true);
    };

    const handleOpenEdit = (doc: SystemDocument) => {
        setIsEditing(true);
        setFormData(doc);
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.code) return;

        const timestamp = new Date().toISOString().split('T')[0];

        if (isEditing && formData.id) {
            onEditDoc({ ...formData, lastUpdated: timestamp } as SystemDocument);
        } else {
            onAddDoc({
                ...formData,
                id: `sys_doc_${Date.now()}`,
                lastUpdated: timestamp
            } as SystemDocument);
        }
        setShowModal(false);
    };

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDeleteDoc(showDeleteConfirm.id);
            setShowDeleteConfirm(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Kho Văn bản & Biểu mẫu</h2>
                        <p className="text-sm text-gray-500">Quản lý các biểu mẫu chuẩn và mẫu quyết định hành chính.</p>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                         <button
                            onClick={() => { setActiveDegree(DegreeType.MASTER); setSelectedStageId('ALL'); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeDegree === DegreeType.MASTER ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Thạc sĩ
                        </button>
                        <button
                            onClick={() => { setActiveDegree(DegreeType.PHD); setSelectedStageId('ALL'); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeDegree === DegreeType.PHD ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Tiến sĩ
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                     <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm tên biểu mẫu, mã hiệu (VD: BM.01)..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select 
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={selectedStageId}
                            onChange={(e) => setSelectedStageId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                        >
                            <option value="ALL">Tất cả giai đoạn</option>
                            {stages.map(s => (
                                <option key={s.id} value={s.id}>{s.id}. {s.name}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleOpenAdd}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition-colors whitespace-nowrap"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Tải lên văn bản
                    </button>
                </div>
            </div>

            {/* Document List */}
            <div className="space-y-6">
                {groupedDocs.length > 0 ? (
                    groupedDocs.map((group) => (
                        group.stage && (
                            <div key={group.stage.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center">
                                    <FolderOpen className="w-5 h-5 text-gray-400 mr-2" />
                                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                                        Giai đoạn {group.stage.id}: {group.stage.name}
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {group.docs.map(doc => (
                                        <div key={doc.id} className="p-4 hover:bg-blue-50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-2 rounded-lg ${doc.type === SystemDocType.DECISION ? 'bg-purple-50' : 'bg-blue-50'}`}>
                                                    {getDocIcon(doc.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                                                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{doc.code}</span>
                                                        <span>•</span>
                                                        <span>{getTypeLabel(doc.type)}</span>
                                                        <span>•</span>
                                                        <span>Cập nhật: {doc.lastUpdated}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <a 
                                                    href={doc.downloadUrl || '#'} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                                                    title="Xem/Tải về"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                                
                                                <div className="h-4 w-px bg-gray-200 mx-2"></div>

                                                <button 
                                                    onClick={() => handleOpenEdit(doc)}
                                                    className="p-2 text-gray-400 hover:text-green-600 transition-colors" 
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setShowDeleteConfirm(doc)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors" 
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Không tìm thấy văn bản nào phù hợp.</p>
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {isEditing ? 'Cập nhật văn bản' : 'Tải lên văn bản mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên văn bản / Biểu mẫu</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="VD: Đơn xin bảo vệ luận văn..."
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã hiệu (Code)</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                            placeholder="VD: BM.01/SĐH"
                                            value={formData.code}
                                            onChange={e => setFormData({...formData, code: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại văn bản</label>
                                        <select 
                                            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.type}
                                            onChange={e => setFormData({...formData, type: e.target.value as SystemDocType})}
                                        >
                                            <option value={SystemDocType.TEMPLATE}>Biểu mẫu (Template)</option>
                                            <option value={SystemDocType.DECISION}>Mẫu Quyết định</option>
                                            <option value={SystemDocType.REGULATION}>Văn bản Quy chế</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ áp dụng</label>
                                        <select 
                                            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.degree}
                                            onChange={e => setFormData({...formData, degree: e.target.value as DegreeType})}
                                        >
                                            <option value={DegreeType.MASTER}>Thạc sĩ</option>
                                            <option value={DegreeType.PHD}>Tiến sĩ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giai đoạn</label>
                                        <select 
                                            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.stageId}
                                            onChange={e => setFormData({...formData, stageId: Number(e.target.value)})}
                                        >
                                            {(formData.degree === DegreeType.MASTER ? masterConfig : phdConfig).map(s => (
                                                <option key={s.id} value={s.id}>{s.id}. {s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link tải về (URL)</label>
                                    <input 
                                        type="url" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="https://drive.google.com/..."
                                        value={formData.downloadUrl}
                                        onChange={e => setFormData({...formData, downloadUrl: e.target.value})}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Dán liên kết đến file lưu trữ trên Google Drive, OneDrive hoặc hệ thống nội bộ.</p>
                                </div>
                            </div>
                            <div className="p-5 border-t bg-gray-50 flex justify-end space-x-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-200 rounded"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded shadow-sm"
                                >
                                    {isEditing ? 'Lưu thay đổi' : 'Tải lên'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM MODAL */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center space-x-3 mb-4 text-red-600">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Xóa văn bản?</h3>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Bạn có chắc chắn muốn xóa văn bản <span className="font-bold text-gray-900">{showDeleteConfirm.name}</span> không?
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleDelete}
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

export default DocumentLibrary;
