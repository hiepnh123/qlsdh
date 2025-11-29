import React, { useState } from 'react';
import { MOCK_STUDENTS } from '../constants';
import { TuitionStatus, DegreeType, Student } from '../types';
import { DollarSign, AlertCircle, CheckCircle2, Search, Filter, CalendarClock, Send } from 'lucide-react';

const TuitionManager: React.FC = () => {
    const [filterType, setFilterType] = useState<'ALL' | TuitionStatus>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Flatten all tuition records for easy listing
    const allRecords = MOCK_STUDENTS.flatMap(student => 
        student.tuitionRecords.map(record => ({
            ...record,
            studentName: student.fullName,
            studentCode: student.studentCode,
            studentDegree: student.degree,
            studentId: student.id,
            enrollmentDate: student.enrollmentDate
        }))
    );

    const filteredRecords = allRecords.filter(record => {
        const matchesStatus = filterType === 'ALL' || record.status === filterType;
        const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              record.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Stats Calculation
    const totalCollected = allRecords.filter(r => r.status === TuitionStatus.PAID).reduce((sum, r) => sum + r.amount, 0);
    const totalPending = allRecords.filter(r => r.status === TuitionStatus.UNPAID).reduce((sum, r) => sum + r.amount, 0);
    const totalOverdue = allRecords.filter(r => r.status === TuitionStatus.OVERDUE).reduce((sum, r) => sum + r.amount, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusColor = (status: TuitionStatus) => {
        switch (status) {
            case TuitionStatus.PAID: return 'bg-green-100 text-green-700 border-green-200';
            case TuitionStatus.UNPAID: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case TuitionStatus.OVERDUE: return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getDegreeBadge = (degree: DegreeType) => {
         return degree === DegreeType.PHD 
            ? 'bg-purple-50 text-purple-700 border-purple-100' 
            : 'bg-blue-50 text-blue-700 border-blue-100';
    };

    return (
        <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tổng thực thu</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCollected)}</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Dự kiến thu (Chưa đóng)</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalPending)}</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                        <CalendarClock className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Nợ quá hạn</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalOverdue)}</h3>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Tìm học viên, mã số..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-2">
                         <select 
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none bg-white"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                         >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value={TuitionStatus.PAID}>Đã đóng</option>
                            <option value={TuitionStatus.UNPAID}>Chưa đóng</option>
                            <option value={TuitionStatus.OVERDUE}>Quá hạn</option>
                         </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Học viên</th>
                                <th className="px-6 py-3">Khoản thu</th>
                                <th className="px-6 py-3">Số tiền</th>
                                <th className="px-6 py-3">Hạn nộp</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRecords.map((record) => (
                                <tr key={`${record.studentId}-${record.id}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{record.studentName}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs text-gray-500">{record.studentCode}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getDegreeBadge(record.studentDegree)}`}>
                                                    {record.studentDegree}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900 font-medium">{record.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {record.studentDegree === DegreeType.MASTER ? `Kỳ thứ ${record.termIndex}` : `Năm thứ ${record.termIndex}`}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {formatCurrency(record.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(record.dueDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                                            {record.status === TuitionStatus.PAID ? 'Đã thanh toán' : 
                                             record.status === TuitionStatus.UNPAID ? 'Chưa đóng' : 'Quá hạn'}
                                        </span>
                                        {record.paymentDate && (
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                Ngày đóng: {new Date(record.paymentDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {record.status !== TuitionStatus.PAID && (
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center justify-end w-full">
                                                <Send className="w-3 h-3 mr-1" />
                                                Gửi nhắc nhở
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredRecords.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            Không tìm thấy dữ liệu phù hợp.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TuitionManager;