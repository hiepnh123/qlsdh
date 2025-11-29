
import React, { useState } from 'react';
import { Student, TrainingStage, DocumentStatus, DocumentItem, TuitionStatus, SystemDocument } from '../types';
import { MOCK_SYSTEM_DOCUMENTS } from '../constants';
import { CheckCircle2, Circle, AlertCircle, FileText, ChevronRight, Clock, Award, Sparkles, ArrowLeft, DollarSign, Calendar, Link as LinkIcon, ExternalLink, Save, X, Edit2, Download } from 'lucide-react';
import DocumentGenerator from './DocumentGenerator';

interface Props {
  student: Student;
  onBack: () => void;
}

const StudentDetail: React.FC<Props> = ({ student: initialStudent, onBack }) => {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [selectedStage, setSelectedStage] = useState<TrainingStage>(
    student.stages.find(s => s.id === student.currentStageId) || student.stages[0]
  );
  const [activeTab, setActiveTab] = useState<'ACADEMIC' | 'TUITION'>('ACADEMIC');
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState('');

  // Link Editing State
  const [editingLinkDocId, setEditingLinkDocId] = useState<string | null>(null);
  const [tempLinkValue, setTempLinkValue] = useState('');

  const handleStatusChange = (stageId: number, docId: string, newStatus: DocumentStatus) => {
    const updatedStages = student.stages.map(stage => {
      if (stage.id !== stageId) return stage;
      const updatedDocs = stage.documents.map(doc => 
        doc.id === docId ? { ...doc, status: newStatus } : doc
      );
      return { ...stage, documents: updatedDocs };
    });
    setStudent({ ...student, stages: updatedStages });
    
    // Update selected stage view
    const currentUpdated = updatedStages.find(s => s.id === stageId);
    if (currentUpdated) setSelectedStage(currentUpdated);
  };

  const handleStartEditLink = (doc: DocumentItem) => {
      setEditingLinkDocId(doc.id);
      setTempLinkValue(doc.fileUrl || '');
  };

  const handleSaveLink = (stageId: number, docId: string) => {
    const updatedStages = student.stages.map(stage => {
        if (stage.id !== stageId) return stage;
        const updatedDocs = stage.documents.map(doc => 
            doc.id === docId ? { ...doc, fileUrl: tempLinkValue } : doc
        );
        return { ...stage, documents: updatedDocs };
    });
    setStudent({ ...student, stages: updatedStages });
    
    // Update selected stage view
    const currentUpdated = updatedStages.find(s => s.id === stageId);
    if (currentUpdated) setSelectedStage(currentUpdated);
    
    setEditingLinkDocId(null);
  };

  const openGenerator = (docName: string) => {
    setSelectedDocName(docName);
    setShowGenerator(true);
  };

  // Helper to find a system template that roughly matches the document name
  // In a real app, this would be linked via ID
  const findSystemTemplate = (docName: string): SystemDocument | undefined => {
      return MOCK_SYSTEM_DOCUMENTS.find(sysDoc => 
          sysDoc.degree === student.degree && 
          (sysDoc.name.toLowerCase().includes(docName.toLowerCase()) || docName.toLowerCase().includes(sysDoc.name.toLowerCase()))
      );
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED: return 'bg-green-100 text-green-700 border-green-200';
      case DocumentStatus.MISSING: return 'bg-red-50 text-red-600 border-red-200';
      case DocumentStatus.PENDING: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTuitionStatusColor = (status: TuitionStatus) => {
      switch(status) {
          case TuitionStatus.PAID: return 'bg-green-100 text-green-700 border-green-200';
          case TuitionStatus.OVERDUE: return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      }
  };

  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
      <DocumentGenerator 
        student={student} 
        documentName={selectedDocName} 
        isOpen={showGenerator} 
        onClose={() => setShowGenerator(false)} 
      />

      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="mb-4 text-sm text-gray-500 hover:text-blue-600 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1"/> Quay lại danh sách
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img src={student.avatarUrl} alt={student.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.fullName}</h1>
              <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-medium">{student.degree}</span>
                <span>•</span>
                <span>{student.studentCode}</span>
                <span>•</span>
                <span>{student.major}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inner Tabs */}
        <div className="flex space-x-6 mt-8 border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('ACADEMIC')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ACADEMIC' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Tiến độ Đào tạo
            </button>
            <button 
                onClick={() => setActiveTab('TUITION')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'TUITION' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <DollarSign className="w-4 h-4 mr-1"/>
                Học phí & Công nợ
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* VIEW 1: ACADEMIC WORKFLOW */}
        {activeTab === 'ACADEMIC' && (
            <>
                {/* Left: Workflow Timeline */}
                <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col overflow-y-auto">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                        <h3 className="font-semibold text-gray-700">Lộ trình đào tạo</h3>
                    </div>
                <div className="p-4 space-y-6">
                    {student.stages.map((stage, index) => (
                    <div 
                        key={stage.id} 
                        onClick={() => setSelectedStage(stage)}
                        className={`relative pl-8 cursor-pointer group transition-all duration-200 ${selectedStage.id === stage.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                    >
                        {/* Connector Line */}
                        {index !== student.stages.length - 1 && (
                        <div className={`absolute left-3 top-8 w-0.5 h-full -ml-px ${stage.isCompleted ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                        )}
                        
                        {/* Status Dot */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 bg-white
                            ${stage.isCompleted ? 'border-green-500 text-green-500' : 
                            stage.isCurrent ? 'border-blue-500 text-blue-500 ring-4 ring-blue-50' : 
                            'border-gray-300 text-gray-300'}`}>
                        {stage.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : 
                        stage.isCurrent ? <Clock className="w-4 h-4" /> : 
                        <Circle className="w-4 h-4" />}
                        </div>

                        <div className={`p-3 rounded-lg border ${selectedStage.id === stage.id ? 'bg-white border-blue-200 shadow-sm' : 'border-transparent hover:bg-gray-100'}`}>
                        <h4 className={`text-sm font-semibold ${selectedStage.id === stage.id ? 'text-blue-700' : 'text-gray-800'}`}>
                            {stage.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{stage.description}</p>
                        
                        {/* Mini Progress */}
                        <div className="mt-2 flex items-center space-x-1">
                            {stage.documents.map(d => (
                                <div key={d.id} className={`w-2 h-2 rounded-full ${d.status === 'APPROVED' ? 'bg-green-400' : 'bg-gray-200'}`} title={d.name}></div>
                            ))}
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Right: Stage Details & Documents */}
                <div className="w-2/3 flex flex-col bg-white overflow-y-auto">
                <div className="p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedStage.name}</h2>
                            <p className="text-gray-500 text-sm">{selectedStage.description}</p>
                        </div>
                        {selectedStage.isCompleted && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center">
                                <Award className="w-3 h-3 mr-1"/> Đã hoàn thành
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Hồ sơ & Quyết định bắt buộc</h3>
                    
                    {selectedStage.documents.map((doc) => {
                        // Check if there is a matching template for this document
                        // Priority: 1. doc.templateUrl (from blueprint) 2. findSystemTemplate (legacy/fallback)
                        const linkedTemplate = doc.templateUrl && doc.templateUrl !== '#' ? doc.templateUrl : findSystemTemplate(doc.name)?.downloadUrl;
                        const hasTemplate = linkedTemplate && linkedTemplate !== '#';

                        return (
                        <div key={doc.id} className="flex flex-col p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${doc.status === DocumentStatus.APPROVED ? 'bg-green-50' : 'bg-gray-50'}`}>
                                        <FileText className={`w-5 h-5 ${doc.status === DocumentStatus.APPROVED ? 'text-green-600' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                    <p className="font-medium text-gray-900">{doc.name}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(doc.status)}`}>
                                            {doc.status === DocumentStatus.APPROVED ? 'Đã có' : 
                                            doc.status === DocumentStatus.MISSING ? 'Còn thiếu' : 'Đang xử lý'}
                                        </span>
                                        {doc.required && <span className="text-xs text-red-500 font-medium">* Bắt buộc</span>}
                                    </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    
                                    {/* Action: Download Template (Updated logic) */}
                                    {(doc.status === DocumentStatus.MISSING && hasTemplate) && (
                                        <a 
                                            href={linkedTemplate}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium transition"
                                            title={`Tải biểu mẫu`}
                                        >
                                            <Download className="w-3 h-3 mr-1" />
                                            Tải mẫu
                                        </a>
                                    )}

                                    {/* Action: Generate AI Doc */}
                                    {(doc.status === DocumentStatus.MISSING || doc.status === DocumentStatus.PENDING) && (
                                        <button 
                                            onClick={() => openGenerator(doc.name)}
                                            className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium transition"
                                        >
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            AI Soạn
                                        </button>
                                    )}

                                    {/* Action: Toggle Status */}
                                    <select 
                                        value={doc.status}
                                        onChange={(e) => handleStatusChange(selectedStage.id, doc.id, e.target.value as DocumentStatus)}
                                        className="text-xs border-gray-200 rounded p-1.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 cursor-pointer"
                                    >
                                        <option value={DocumentStatus.MISSING}>Đánh dấu thiếu</option>
                                        <option value={DocumentStatus.PENDING}>Đang chờ duyệt</option>
                                        <option value={DocumentStatus.APPROVED}>Đã thu đủ</option>
                                    </select>
                                </div>
                            </div>

                            {/* Link / URL Section */}
                            <div className="mt-3 pl-14 flex items-center text-sm">
                                {editingLinkDocId === doc.id ? (
                                    <div className="flex items-center w-full max-w-lg space-x-2 animate-fade-in">
                                        <input 
                                            type="text" 
                                            placeholder="Dán đường dẫn hồ sơ (Google Drive/SharePoint)..."
                                            className="flex-1 border border-blue-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            autoFocus
                                            value={tempLinkValue}
                                            onChange={(e) => setTempLinkValue(e.target.value)}
                                        />
                                        <button 
                                            onClick={() => handleSaveLink(selectedStage.id, doc.id)}
                                            className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setEditingLinkDocId(null)}
                                            className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        {doc.fileUrl ? (
                                            <a 
                                                href={doc.fileUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                                Xem hồ sơ đính kèm
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Chưa có liên kết hồ sơ</span>
                                        )}

                                        <button 
                                            onClick={() => handleStartEditLink(doc)}
                                            className="flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                                            title="Chỉnh sửa liên kết"
                                        >
                                            {doc.fileUrl ? <Edit2 className="w-3.5 h-3.5" /> : (
                                                <span className="flex items-center text-xs hover:bg-gray-100 px-2 py-1 rounded">
                                                    <LinkIcon className="w-3 h-3 mr-1" />
                                                    Gắn link
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                    })}
                    </div>

                    {selectedStage.documents.every(d => d.status === DocumentStatus.APPROVED) && !selectedStage.isCompleted && (
                        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-green-800">
                                <CheckCircle2 className="w-6 h-6" />
                                <span className="font-medium">Giai đoạn này đã đủ hồ sơ. Chuyển giai đoạn tiếp theo?</span>
                            </div>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm">
                                Xác nhận hoàn thành
                            </button>
                        </div>
                    )}
                </div>
                </div>
            </>
        )}

        {/* VIEW 2: TUITION */}
        {activeTab === 'TUITION' && (
            <div className="w-full bg-white p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Lịch sử đóng học phí</h2>
                            <p className="text-sm text-gray-500">
                                Quy tắc thu: {student.degree === 'Thạc sĩ' ? 'Theo Kỳ học (Semester)' : 'Theo Năm học (Academic Year)'}
                            </p>
                        </div>
                        <div className="text-right">
                             <div className="text-xs text-gray-500 mb-1">Tổng đã đóng</div>
                             <div className="text-xl font-bold text-green-600">
                                {formatCurrency(student.tuitionRecords.filter(t => t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0))}
                             </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {student.tuitionRecords.length > 0 ? (
                            student.tuitionRecords.map((record) => (
                                <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-full ${record.status === TuitionStatus.PAID ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{record.title}</h3>
                                            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1"/> Hạn nộp: {new Date(record.dueDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            {record.paymentDate && (
                                                 <p className="text-xs text-green-600 mt-2 font-medium">
                                                    ✓ Đã thanh toán ngày {new Date(record.paymentDate).toLocaleDateString('vi-VN')}
                                                 </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 text-right">
                                        <div className="text-lg font-bold text-gray-900 mb-2">{formatCurrency(record.amount)}</div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTuitionStatusColor(record.status)}`}>
                                            {record.status === TuitionStatus.PAID ? 'Đã thanh toán' : 
                                             record.status === TuitionStatus.OVERDUE ? 'Quá hạn' : 'Chưa đóng'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                Chưa có dữ liệu học phí.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;
