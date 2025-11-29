import React, { useState, useMemo } from 'react';
import { ScheduleItem, DegreeType } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, User, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { MOCK_SCHEDULES } from '../constants';

// Utility to generate consistent colors based on string (Class Name / Batch)
const getClassColor = (str: string) => {
    const colors = [
        'bg-red-100 text-red-700 border-l-4 border-red-500',
        'bg-orange-100 text-orange-700 border-l-4 border-orange-500',
        'bg-amber-100 text-amber-700 border-l-4 border-amber-500',
        'bg-green-100 text-green-700 border-l-4 border-green-500',
        'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500',
        'bg-teal-100 text-teal-700 border-l-4 border-teal-500',
        'bg-cyan-100 text-cyan-700 border-l-4 border-cyan-500',
        'bg-blue-100 text-blue-700 border-l-4 border-blue-500',
        'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500',
        'bg-violet-100 text-violet-700 border-l-4 border-violet-500',
        'bg-purple-100 text-purple-700 border-l-4 border-purple-500',
        'bg-fuchsia-100 text-fuchsia-700 border-l-4 border-fuchsia-500',
        'bg-pink-100 text-pink-700 border-l-4 border-pink-500',
        'bg-rose-100 text-rose-700 border-l-4 border-rose-500',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const ScheduleManager: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(MOCK_SCHEDULES);
  const [currentDate, setCurrentDate] = useState(new Date('2023-11-20')); // Default to mock data date for demo
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK'>('MONTH');
  const [filterDegree, setFilterDegree] = useState<'ALL' | DegreeType>('ALL');
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);

  // Form State
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleItem>>({
    type: 'CLASS',
    degree: DegreeType.MASTER,
    date: new Date().toISOString().split('T')[0],
    time: '08:00 - 11:30'
  });

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const days = [];
      
      // Padding days from previous month
      const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Adjust for Monday start
      for (let i = 0; i < startDay; i++) {
          const d = new Date(year, month, 0 - i); // Count backwards
          days.unshift({ date: d, isCurrentMonth: false });
      }

      // Days of current month
      for (let i = 1; i <= daysInMonth; i++) {
          days.push({ date: new Date(year, month, i), isCurrentMonth: true });
      }

      // Padding days for next month to complete the grid (42 cells max usually covers 6 rows)
      const remainingCells = 42 - days.length;
      for (let i = 1; i <= remainingCells; i++) {
           days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }

      return days;
  };

  const getDaysInWeek = (date: Date) => {
      const curr = new Date(date);
      // Adjust to get Monday as start of week
      const day = curr.getDay();
      const diff = curr.getDate() - day + (day === 0 ? -6 : 1); 
      
      const monday = new Date(curr.setDate(diff));
      
      const days = [];
      for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          days.push({ date: d, isCurrentMonth: true });
      }
      return days;
  };

  const calendarDays = viewMode === 'MONTH' ? getDaysInMonth(currentDate) : getDaysInWeek(currentDate);

  const handlePrev = () => {
      const newDate = new Date(currentDate);
      if (viewMode === 'MONTH') newDate.setMonth(newDate.getMonth() - 1);
      else newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
  };

  const handleNext = () => {
      const newDate = new Date(currentDate);
      if (viewMode === 'MONTH') newDate.setMonth(newDate.getMonth() + 1);
      else newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  // --- FILTERING ---
  const filteredSchedules = useMemo(() => {
      return schedules.filter(s => filterDegree === 'ALL' || s.degree === filterDegree);
  }, [schedules, filterDegree]);

  const getEventsForDay = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return filteredSchedules.filter(s => s.date === dateStr);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newSchedule.subject || !newSchedule.date) return;
      
      const item: ScheduleItem = {
          id: Math.random().toString(),
          subject: newSchedule.subject!,
          lecturer: newSchedule.lecturer || 'Đang cập nhật',
          date: newSchedule.date!,
          time: newSchedule.time || '07:00 - 11:30',
          room: newSchedule.room || 'Hội trường',
          batch: newSchedule.batch || 'Lớp chung',
          degree: newSchedule.degree || DegreeType.MASTER,
          type: newSchedule.type || 'CLASS'
      };

      setSchedules([...schedules, item]);
      setShowAddModal(false);
      setNewSchedule({ type: 'CLASS', degree: DegreeType.MASTER, date: new Date().toISOString().split('T')[0], time: '08:00 - 11:30' });
  };

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const dayHeaders = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

  return (
    <div className="space-y-6 h-full flex flex-col">
       
       {/* Header Controls */}
       <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            {/* Title & Nav */}
            <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1 space-x-1">
                    <button onClick={handlePrev} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                    <button onClick={handleToday} className="px-3 text-sm font-medium text-gray-700 hover:bg-white rounded transition">Hôm nay</button>
                    <button onClick={handleNext} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                </div>
                <h2 className="text-xl font-bold text-gray-800 capitalize min-w-[200px]">
                    {viewMode === 'MONTH' 
                        ? `${monthNames[currentDate.getMonth()]} năm ${currentDate.getFullYear()}` 
                        : `Tuần ${currentDate.getDate()}/${currentDate.getMonth()+1} - ...`
                    }
                </h2>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                    <button 
                        onClick={() => setViewMode('MONTH')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'MONTH' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Tháng
                    </button>
                    <button 
                        onClick={() => setViewMode('WEEK')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'WEEK' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Tuần
                    </button>
                </div>

                <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

                <select 
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={filterDegree}
                    onChange={(e) => setFilterDegree(e.target.value as any)}
                >
                    <option value="ALL">Toàn trường</option>
                    <option value={DegreeType.MASTER}>Thạc sĩ</option>
                    <option value={DegreeType.PHD}>Tiến sĩ</option>
                </select>

                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 font-medium text-sm ml-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Lên lịch mới
                </button>
            </div>
       </div>

       {/* CALENDAR GRID */}
       <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {dayHeaders.map((day, idx) => (
                    <div key={idx} className={`py-3 text-center text-sm font-semibold text-gray-600 ${idx === 6 ? 'text-red-500' : ''}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className={`grid grid-cols-7 flex-1 ${viewMode === 'MONTH' ? 'auto-rows-fr' : 'h-full'}`}>
                {calendarDays.map((dayObj, idx) => {
                    const isToday = dayObj.date.toDateString() === new Date().toDateString();
                    const dayEvents = getEventsForDay(dayObj.date);
                    
                    return (
                        <div 
                            key={idx} 
                            className={`
                                min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 relative group
                                ${!dayObj.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}
                                ${idx % 7 === 6 ? 'border-r-0' : ''}
                            `}
                            onClick={() => {
                                setNewSchedule({...newSchedule, date: dayObj.date.toISOString().split('T')[0]});
                            }}
                        >
                            {/* Date Number */}
                            <div className="flex justify-between items-start mb-1">
                                <span className={`
                                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                    ${isToday ? 'bg-blue-600 text-white shadow-md' : (!dayObj.isCurrentMonth ? 'text-gray-400' : 'text-gray-700')}
                                `}>
                                    {dayObj.date.getDate()}
                                </span>
                                {dayEvents.length > 0 && (
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 rounded-full hidden group-hover:block">
                                        {dayEvents.length} lịch
                                    </span>
                                )}
                            </div>

                            {/* Events List */}
                            <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar">
                                {dayEvents.map(event => (
                                    <div 
                                        key={event.id}
                                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                                        className={`
                                            text-xs p-1.5 rounded cursor-pointer border-l-2 shadow-sm transition hover:brightness-95 truncate
                                            ${getClassColor(event.batch)}
                                        `}
                                        title={`${event.time} - ${event.subject} (${event.batch})`}
                                    >
                                        <div className="font-bold flex justify-between">
                                            <span>{event.time.split(' - ')[0]}</span>
                                            <span className="opacity-75 text-[10px]">{event.room}</span>
                                        </div>
                                        <div className="truncate font-medium">{event.subject}</div>
                                        <div className="text-[10px] opacity-80 truncate">{event.batch}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Add button on hover */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setNewSchedule({...newSchedule, date: dayObj.date.toISOString().split('T')[0]});
                                    setShowAddModal(true);
                                }}
                                className="absolute bottom-2 right-2 p-1.5 bg-blue-50 text-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                                title="Thêm lịch vào ngày này"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
       </div>

       {/* ADD SCHEDULE MODAL */}
       {showAddModal && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">Thêm lịch học / thi</h3>
                        <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
                    </div>
                    <form onSubmit={handleAddSchedule}>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Môn học / Nội dung</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="VD: Triết học Mác - Lênin"
                                    value={newSchedule.subject}
                                    onChange={e => setNewSchedule({...newSchedule, subject: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                                    <input 
                                        required
                                        type="date" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        value={newSchedule.date}
                                        onChange={e => setNewSchedule({...newSchedule, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="08:00 - 11:30"
                                        value={newSchedule.time}
                                        onChange={e => setNewSchedule({...newSchedule, time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giảng viên</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="VD: TS. Nguyễn Văn A"
                                        value={newSchedule.lecturer}
                                        onChange={e => setNewSchedule({...newSchedule, lecturer: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng học</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="VD: B1-204"
                                        value={newSchedule.room}
                                        onChange={e => setNewSchedule({...newSchedule, room: e.target.value})}
                                    />
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lớp / Khóa (Batch)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="VD: K30 Cao học"
                                        value={newSchedule.batch}
                                        onChange={e => setNewSchedule({...newSchedule, batch: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại lịch</label>
                                    <select
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newSchedule.type}
                                        onChange={e => setNewSchedule({...newSchedule, type: e.target.value as any})}
                                    >
                                        <option value="CLASS">Lịch học</option>
                                        <option value="EXAM">Lịch thi</option>
                                        <option value="DEFENSE">Bảo vệ</option>
                                    </select>
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
                                Lưu lịch
                            </button>
                        </div>
                    </form>
               </div>
           </div>
       )}

       {/* EVENT DETAIL MODAL */}
       {selectedEvent && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedEvent(null)}>
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
                    <div className={`h-2 w-full ${selectedEvent.degree === DegreeType.MASTER ? 'bg-blue-500' : 'bg-purple-600'}`}></div>
                    <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${selectedEvent.type === 'CLASS' ? 'bg-blue-100 text-blue-700' : selectedEvent.type === 'EXAM' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {selectedEvent.type === 'CLASS' ? 'Lịch học' : selectedEvent.type === 'EXAM' ? 'Lịch thi' : 'Bảo vệ'}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">{selectedEvent.batch}</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-6">{selectedEvent.subject}</h3>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <CalendarIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(selectedEvent.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-500">Ngày diễn ra</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{selectedEvent.time}</p>
                                    <p className="text-xs text-gray-500">Thời gian</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{selectedEvent.room}</p>
                                    <p className="text-xs text-gray-500">Địa điểm / Phòng học</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{selectedEvent.lecturer}</p>
                                    <p className="text-xs text-gray-500">Giảng viên / Hội đồng</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                            <button 
                                className="text-red-500 text-sm font-medium hover:underline"
                                onClick={() => {
                                    setSchedules(schedules.filter(s => s.id !== selectedEvent.id));
                                    setSelectedEvent(null);
                                }}
                            >
                                Xóa lịch này
                            </button>
                        </div>
                    </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default ScheduleManager;