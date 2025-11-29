import React, { useState } from 'react';
import { generateDocumentDraft } from '../services/geminiService';
import { Student } from '../types';
import { Loader2, FileText, Check, Copy, X } from 'lucide-react';

interface Props {
  student: Student;
  documentName: string;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentGenerator: React.FC<Props> = ({ student, documentName, isOpen, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateDocumentDraft(student, documentName, context);
    setContent(result);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert('Đã sao chép nội dung vào bộ nhớ đệm!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-blue-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">Trợ lý Soạn thảo AI</h2>
                <p className="text-sm text-gray-600">Đang tạo: <span className="font-semibold text-blue-700">{documentName}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
            
          {/* Input Context */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ngữ cảnh bổ sung (Tùy chọn)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Ví dụ: Ngày quyết định là 15/10/2023, Người ký là Hiệu trưởng..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          {/* Action Button */}
          {!content && (
             <div className="flex justify-center py-4">
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-medium shadow-md disabled:opacity-50 transition-all transform hover:scale-105"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" className="w-5 h-5 mr-1" alt="AI"/>}
                    <span>{loading ? 'AI đang soạn thảo...' : 'Tạo văn bản ngay'}</span>
                </button>
             </div>
          )}

          {/* Result Area */}
          {content && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Nội dung đề xuất:</label>
                <div className="space-x-2">
                    <button 
                        onClick={() => setContent('')} 
                        className="text-sm text-gray-500 hover:text-red-500 underline"
                    >
                        Soạn lại
                    </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                    readOnly
                    className="w-full h-80 p-4 border rounded-lg bg-gray-50 font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-200"
                    value={content}
                />
                <button
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 bg-white border border-gray-200 p-2 rounded-md shadow-sm hover:bg-gray-50 text-gray-600"
                    title="Sao chép"
                >
                    <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerator;