
import React from 'react';
import { Student, DegreeType, DocumentStatus, AppNotification, NotificationType } from '../types';
import { Users, GraduationCap, AlertTriangle, TrendingUp, BookOpen, PieChart, ArrowRight, BellRing } from 'lucide-react';

interface Props {
  students: Student[];
  notifications: AppNotification[]; // Receive live notifications
  onHandleAction: (noti: AppNotification) => void;
}

const Dashboard: React.FC<Props> = ({ students, notifications, onHandleAction }) => {
    // 1. Calculate Basic Stats
    const totalStudents = students.length;
    const mastersCount = students.filter(s => s.degree === DegreeType.MASTER).length;
    const phdCount = students.filter(s => s.degree === DegreeType.PHD).length;
    
    // Logic: Graduated if the last stage is completed
    const graduatedCount = students.filter(s => {
        const lastStage = s.stages[s.stages.length - 1];
        return lastStage.isCompleted;
    }).length;

    // Logic: Delayed if they have > 2 missing documents in their current stage
    const delayedCount = students.filter(s => {
        const currentStage = s.stages.find(st => st.id === s.currentStageId);
        if (!currentStage) return false;
        const missingDocs = currentStage.documents.filter(d => d.status === DocumentStatus.MISSING).length;
        return missingDocs > 2;
    }).length;

    // 2. Calculate Stage Distribution
    const stageDistributionMap: Record<string, number> = {};
    students.forEach(s => {
        const currentStage = s.stages.find(st => st.id === s.currentStageId);
        if (currentStage) {
            const name = currentStage.name; 
            stageDistributionMap[name] = (stageDistributionMap[name] || 0) + 1;
        }
    });

    const stagesDistribution = Object.keys(stageDistributionMap).map(key => ({
        name: key,
        value: stageDistributionMap[key],
        max: totalStudents, 
        color: 'bg-blue-500'
    })).sort((a, b) => b.value - a.value);

    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500'];

    const degreeRatio = {
        masters: { count: mastersCount, percent: totalStudents > 0 ? Math.round((mastersCount / totalStudents) * 100) : 0 },
        phd: { count: phdCount, percent: totalStudents > 0 ? Math.round((phdCount / totalStudents) * 100) : 0 }
    };

    // Filter top critical notifications for the Action Center
    const urgentTasks = notifications.filter(n => n.type === NotificationType.DANGER).slice(0, 3);
    const warningTasks = notifications.filter(n => n.type === NotificationType.WARNING).slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* ACTION CENTER - NEW SECTION */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <BellRing className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                  <h2 className="text-xl font-bold">Trung tâm Điều hành</h2>
                  <p className="text-slate-400 text-sm">Bạn có {notifications.length} việc cần xử lý hôm nay.</p>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Urgent Column */}
              <div className="space-y-2">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Cần xử lý gấp (Học phí / Quá hạn)</h3>
                  {urgentTasks.length > 0 ? urgentTasks.map(task => (
                      <div key={task.id} className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-red-500/30 flex justify-between items-center transition-colors">
                          <div className="flex items-center">
                              <AlertTriangle className="w-4 h-4 text-red-500 mr-3" />
                              <div>
                                  <p className="text-sm font-medium text-white">{task.title}</p>
                                  <p className="text-xs text-slate-400">{task.message}</p>
                              </div>
                          </div>
                          <button 
                            onClick={() => onHandleAction(task)}
                            className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-white font-medium"
                          >
                              {task.actionLabel || 'Xử lý'}
                          </button>
                      </div>
                  )) : (
                      <div className="text-sm text-slate-500 italic">Không có cảnh báo nghiêm trọng.</div>
                  )}
              </div>

              {/* Warning Column */}
              <div className="space-y-2">
                  <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">Cảnh báo hồ sơ</h3>
                  {warningTasks.length > 0 ? warningTasks.map(task => (
                      <div key={task.id} className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-yellow-500/30 flex justify-between items-center transition-colors">
                          <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3"></div>
                              <div>
                                  <p className="text-sm font-medium text-white">{task.title}</p>
                                  <p className="text-xs text-slate-400">{task.message}</p>
                              </div>
                          </div>
                          <button 
                            onClick={() => onHandleAction(task)}
                            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white font-medium"
                          >
                              Chi tiết
                          </button>
                      </div>
                  )) : (
                      <div className="text-sm text-slate-500 italic">Hồ sơ ổn định.</div>
                  )}
              </div>
          </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Tổng học viên</p>
                <h3 className="text-3xl font-bold text-gray-900">{totalStudents}</h3>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> Đang theo dõi
                </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl">
                <Users className="w-8 h-8 text-blue-600" />
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Đã tốt nghiệp</p>
                <h3 className="text-3xl font-bold text-gray-900">{graduatedCount}</h3>
                 <p className="text-xs text-gray-400 mt-2">Hoàn thành CTĐT</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl">
                <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Cảnh báo hồ sơ</p>
                <h3 className="text-3xl font-bold text-gray-900">{delayedCount}</h3>
                <p className="text-xs text-red-500 mt-2 font-medium">Thiếu nhiều hồ sơ</p>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">NCS (Tiến sĩ)</p>
                <h3 className="text-3xl font-bold text-gray-900">{phdCount}</h3>
                <p className="text-xs text-purple-600 mt-2">Đang nghiên cứu</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-2xl">
                <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-gray-500"/>
                    Phân bổ theo giai đoạn đào tạo
                </h3>
            </div>
            <div className="space-y-4">
                {stagesDistribution.length > 0 ? (
                    stagesDistribution.map((item, index) => (
                        <div key={item.name} className="group">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 font-medium">{item.name}</span>
                                <span className="text-gray-900 font-bold">{item.value} HV</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden relative">
                                <div 
                                    className={`h-4 rounded-full transition-all duration-1000 ${colors[index % colors.length]}`} 
                                    style={{ width: `${(item.value / item.max) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400">Chưa có dữ liệu giai đoạn</div>
                )}
            </div>
        </div>

        {/* Pie Chart Visualization */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Tỷ lệ Trình độ</h3>
            <div className="flex-1 flex flex-col justify-center items-center space-y-6">
                
                {/* Circular Visualization */}
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                        
                        {/* Masters Circle (Blue) */}
                        <circle 
                            cx="80" cy="80" r="70" 
                            stroke="#3b82f6" strokeWidth="12" fill="transparent" 
                            strokeDasharray={440} 
                            strokeDashoffset={440 - (440 * degreeRatio.masters.percent) / 100} 
                            className="transition-all duration-1000 ease-out"
                        />
                        
                        {/* PhD Circle (Purple) */}
                         <circle 
                            cx="80" cy="80" r="70" 
                            stroke="#a855f7" strokeWidth="12" fill="transparent" 
                            strokeDasharray={440} 
                            strokeDashoffset={440 - (440 * degreeRatio.phd.percent) / 100} 
                            className="transition-all duration-1000 ease-out opacity-50" 
                            style={{ transform: `rotate(${360 * (degreeRatio.masters.percent / 100)}deg)`, transformOrigin: 'center' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-800">{degreeRatio.masters.percent}%</span>
                        <span className="text-xs text-gray-500 uppercase font-semibold">Thạc sĩ</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-700">Thạc sĩ</span>
                        </div>
                        <span className="text-sm font-bold text-blue-700">{degreeRatio.masters.count}</span>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                            <span className="text-sm font-medium text-gray-700">Tiến sĩ</span>
                        </div>
                        <span className="text-sm font-bold text-purple-700">{degreeRatio.phd.count}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
