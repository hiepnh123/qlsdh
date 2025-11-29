import { GoogleGenAI } from "@google/genai";
import { Student, DocumentItem } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateDocumentDraft = async (
  student: Student,
  documentName: string,
  context: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      Bạn là một trợ lý hành chính học vụ chuyên nghiệp tại một trường đại học lớn ở Việt Nam.
      Nhiệm vụ của bạn là soạn thảo nội dung văn bản hành chính (Quyết định, Tờ trình, hoặc Thông báo).
      
      Thông tin học viên:
      - Họ tên: ${student.fullName}
      - Mã học viên: ${student.studentCode}
      - Trình độ: ${student.degree}
      - Chuyên ngành: ${student.major}
      - Khóa: ${student.batch}
      
      Yêu cầu văn bản:
      - Loại văn bản cần soạn: "${documentName}"
      - Ngữ cảnh bổ sung: ${context}
      
      Hãy tạo ra nội dung văn bản đầy đủ, trang trọng, đúng chuẩn thể thức văn bản hành chính Việt Nam (có Quốc hiệu, Tiêu ngữ, Kính gửi, Căn cứ pháp lý giả định phù hợp). 
      Chỉ trả về nội dung văn bản, không cần lời dẫn. Sử dụng định dạng Markdown.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Không thể tạo nội dung văn bản.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra API Key.";
  }
};

export const analyzeStudentProgress = async (student: Student): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const stageInfo = student.stages.map(s => 
            `- Giai đoạn: ${s.name} (${s.isCompleted ? 'Đã xong' : s.isCurrent ? 'Đang thực hiện' : 'Chưa đến'}). Hồ sơ thiếu: ${s.documents.filter(d => d.status === 'MISSING').map(d => d.name).join(', ')}`
        ).join('\n');

        const prompt = `
            Dựa vào dữ liệu sau đây về tiến độ học tập của học viên ${student.fullName}, hãy đưa ra một đánh giá ngắn gọn (dưới 100 từ) về tình trạng hiện tại và lời khuyên hành động tiếp theo cho người quản lý.
            Dữ liệu:
            ${stageInfo}
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text || "Không thể phân tích dữ liệu.";
    } catch (error) {
        return "Lỗi phân tích AI.";
    }
}
