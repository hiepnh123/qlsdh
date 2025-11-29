
import React, { useState, useEffect } from 'react';
import { DegreeType, TrainingStage, DocumentItem, DocumentStatus } from '../types';
import { Save, Plus, Trash2, Link as LinkIcon, Edit2, ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface Props {
  masterConfig: TrainingStage[];
  phdConfig: TrainingStage[];
  onSave: (degree: DegreeType, newStages: TrainingStage[]) => void;
}

const SystemConfig: React.FC<Props> = ({ masterConfig, phdConfig, onSave }) => {
  const [activeDegree, setActiveDegree] = useState<DegreeType>(DegreeType.MASTER);
  const [stages, setStages] = useState<TrainingStage[]>([]);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  // Load initial state when switching tabs
  useEffect(() => {
    const sourceData = activeDegree === DegreeType.MASTER ? masterConfig : phdConfig;
    // Deep copy to avoid reference issues
    setStages(JSON.parse(JSON.stringify(sourceData)));
  }, [activeDegree, masterConfig, phdConfig]);

  const handleSave = () => {
    onSave(activeDegree, stages);
    alert(`Đã lưu cấu hình cho hệ ${activeDegree} thành công!`);
  };

  const handleStageNameChange = (id: number, newName: string) => {
    setStages(stages.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleDocChange = (stageId: number, docId: string, field: keyof DocumentItem, value: any) => {
    setStages(stages.map(stage => {
      if (stage.id !== stageId) return stage;
      return {
        ...stage,
        documents: stage.documents.map(doc => doc.id === docId ? { ...doc, [field]: value } : doc)
      };
    }));
  };

  const addDocument = (stageId: number) => {
    setStages(stages.map(stage => {
      if (stage.id !== stageId) return stage;
      const newDoc: DocumentItem = {
        id: `new_${Date.now()}`,
        name: 'Biểu mẫu mới',
        status: DocumentStatus.MISSING,
        required: true,
        templateUrl: ''
      };
      return { ...stage, documents: [...stage.documents, newDoc] };
    }));
  };

  const removeDocument = (stageId: number, docId: string) => {
    if (!confirm('Bạn có chắc muốn xóa biểu mẫu này khỏi quy trình?')) return;
    setStages(stages.map(stage => {
      if (stage.id !== stageId) return stage;
      return { ...stage, documents: stage.documents.filter(d => d.id !== docId) };
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-gray-600" />
                Cấu hình Quy trình Đào tạo
            </h2>
            <p className="text-sm text-gray-500 mt-1">Thiết lập tên giai đoạn và danh mục hồ sơ bắt buộc cho toàn hệ thống.</p>
        </div>
        <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
        >
            <Save className="w-4 h-4 mr-2" />
            Lưu thay đổi
        </button>
      </div>

      {/* Degree Tabs */}
      <div className="flex justify-center space-x-4">
         <button
            onClick={() => setActiveDegree(DegreeType.MASTER)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeDegree === DegreeType.MASTER ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
            Thạc sĩ
        </button>
        <button
            onClick={() => setActiveDegree(DegreeType.PHD)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeDegree === DegreeType.PHD ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
            Tiến sĩ
        </button>
      </div>

      {/* Stages Editor */}
      <div className="space-y-4">
          {stages.map((stage) => (
              <div key={stage.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Stage Header */}
                  <div 
                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${expandedStage === stage.id ? 'bg-gray-50 border-b' : ''}`}
                    onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                  >
                      <div className="flex items-center flex-1 space-x-3">
                           {expandedStage === stage.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                           <div className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded text-xs">Giai đoạn {stage.id}</div>
                           <input 
                                type="text" 
                                value={stage.name}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleStageNameChange(stage.id, e.target.value)}
                                className="flex-1 font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-blue-500 outline-none px-2 py-1 focus:bg-white"
                           />
                      </div>
                      <span className="text-xs text-gray-400 mr-2">{stage.documents.length} biểu mẫu</span>
                  </div>

                  {/* Documents List */}
                  {expandedStage === stage.id && (
                      <div className="p-6 bg-gray-50/50">
                          <div className="space-y-3">
                            {stage.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-400 font-medium uppercase">Tên hồ sơ / Quyết định</label>
                                        <input 
                                            type="text"
                                            value={doc.name}
                                            onChange={(e) => handleDocChange(stage.id, doc.id, 'name', e.target.value)}
                                            className="w-full font-medium text-sm text-gray-800 border-b border-gray-200 focus:border-blue-500 outline-none py-1"
                                        />
                                    </div>
                                    
                                    <div className="flex-[0.5]">
                                        <label className="text-xs text-gray-400 font-medium uppercase flex items-center">
                                            <LinkIcon className="w-3 h-3 mr-1" /> Link Template (Gốc)
                                        </label>
                                        <input 
                                            type="text"
                                            value={doc.templateUrl || ''}
                                            placeholder="https://..."
                                            onChange={(e) => handleDocChange(stage.id, doc.id, 'templateUrl', e.target.value)}
                                            className="w-full text-sm text-blue-600 border-b border-gray-200 focus:border-blue-500 outline-none py-1"
                                        />
                                    </div>

                                    <div className="w-24 text-center">
                                        <label className="block text-xs text-gray-400 font-medium uppercase mb-1">Bắt buộc</label>
                                        <input 
                                            type="checkbox" 
                                            checked={doc.required}
                                            onChange={(e) => handleDocChange(stage.id, doc.id, 'required', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </div>

                                    <button 
                                        onClick={() => removeDocument(stage.id, doc.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                          </div>
                          
                          <button 
                            onClick={() => addDocument(stage.id)}
                            className="mt-4 flex items-center text-sm text-blue-600 font-medium hover:text-blue-800"
                          >
                              <Plus className="w-4 h-4 mr-1" /> Thêm biểu mẫu
                          </button>
                      </div>
                  )}
              </div>
          ))}
      </div>
    </div>
  );
};

export default SystemConfig;
