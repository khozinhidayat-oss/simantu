/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  BookOpen, 
  ClipboardList, 
  CheckSquare, 
  BookMarked, 
  FileSpreadsheet, 
  PieChart, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Mock Data for Wireframe
const activityData = [
  { name: 'Sen', jurnal: 4, absen: 120 },
  { name: 'Sel', jurnal: 3, absen: 98 },
  { name: 'Rab', jurnal: 5, absen: 150 },
  { name: 'Kam', jurnal: 2, absen: 60 },
  { name: 'Jum', jurnal: 4, absen: 110 },
];

export default function App() {
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xl mr-2">S</div>
          {sidebarOpen && <span className="font-bold text-lg text-blue-800 tracking-tight">SI-MENGAJAR</span>}
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            <NavItem icon={<LayoutDashboard />} label="Dashboard" active sidebarOpen={sidebarOpen} />
            <NavItem icon={<CalendarDays />} label="Jadwal Mengajar" sidebarOpen={sidebarOpen} />
            
            {sidebarOpen && <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Master Data</div>}
            <NavItem icon={<Users />} label="Data Siswa" sidebarOpen={sidebarOpen} />
            <NavItem icon={<BookOpen />} label="Mata Pelajaran" sidebarOpen={sidebarOpen} />
            
            {sidebarOpen && <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administrasi</div>}
            <NavItem icon={<CheckSquare />} label="Absensi" sidebarOpen={sidebarOpen} />
            <NavItem icon={<BookMarked />} label="Modul Ajar" sidebarOpen={sidebarOpen} />
            <NavItem icon={<ClipboardList />} label="Jurnal Mengajar" sidebarOpen={sidebarOpen} />
            <NavItem icon={<FileSpreadsheet />} label="Penilaian" sidebarOpen={sidebarOpen} />
            
            {sidebarOpen && <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Lainnya</div>}
            <NavItem icon={<PieChart />} label="Laporan" sidebarOpen={sidebarOpen} />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <NavItem icon={<Settings />} label="Profil" sidebarOpen={sidebarOpen} />
          <NavItem icon={<LogOut />} label="Logout" className="text-red-500 hover:bg-red-50" sidebarOpen={sidebarOpen} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <Menu size={24} />
            </button>
            <div className="ml-6 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={18} className="text-gray-400" />
              </span>
              <input 
                type="text" 
                placeholder="Pencarian cepat..." 
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-700">Ahmad Guru, S.Pd</p>
                <p className="text-xs text-gray-500">NIP. 198501012010011001</p>
              </div>
              <img 
                src="https://ui-avatars.com/api/?name=Ahmad+Guru&background=0D8ABC&color=fff" 
                alt="Profile" 
                className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <div className="text-sm text-gray-500 mt-1 flex items-center">
                <span className="text-blue-600 mr-2">{time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold font-mono">
                  {time.toLocaleTimeString('id-ID')}
                </span>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center">
              <CheckSquare size={16} className="mr-2" />
              Isi Absensi Sekarang
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard icon={<Users className="text-blue-500" />} label="Total Siswa" value="124" />
            <StatCard icon={<BookOpen className="text-green-500" />} label="Kelas Diajar" value="4" />
            <StatCard icon={<ClipboardList className="text-purple-500" />} label="Jurnal Bulan Ini" value="18" />
            <StatCard icon={<CheckSquare className="text-orange-500" />} label="Absensi Hari Ini" value="32/32" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Grafik Aktivitas Mengajar (Minggu Ini)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="absen" name="Siswa Hadir" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="jurnal" name="Jurnal Diisi" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Side Area */}
            <div className="space-y-6">
              {/* Jadwal Hari Ini */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <CalendarDays size={18} className="mr-2 text-blue-600" />
                    Jadwal Hari Ini
                  </h3>
                </div>
                <div className="p-0">
                  <ul className="divide-y divide-gray-100">
                    <ScheduleItem time="07:30 - 09:00" subject="Matematika" class="X IPA 1" room="Ruang 101" active />
                    <ScheduleItem time="09:00 - 10:30" subject="Matematika" class="X IPA 2" room="Ruang 102" />
                    <ScheduleItem time="11:00 - 12:30" subject="Matematika Lanjut" class="XI IPA 1" room="Ruang 205" />
                  </ul>
                </div>
              </div>

              {/* Pengumuman */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Pengumuman</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm font-medium text-gray-800">Pengisian Nilai PTS</p>
                    <p className="text-xs text-gray-500 mt-1">Batas akhir pengisian nilai PTS adalah tanggal 25 Oktober 2023.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <p className="text-sm font-medium text-gray-800">Rapat Guru</p>
                    <p className="text-xs text-gray-500 mt-1">Rapat evaluasi bulanan akan diadakan pada hari Jumat pkl 13.00 WIB.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

// Components
function NavItem({ icon, label, active, sidebarOpen, className = '' }: any) {
  return (
    <a href="#" className={`flex items-center px-3 py-2.5 rounded-lg mb-1 transition-colors ${
      active 
        ? 'bg-blue-50 text-blue-700 font-medium' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    } ${className}`}>
      <span className={`${active ? 'text-blue-600' : 'text-gray-500'} ${!sidebarOpen && 'mx-auto'}`}>
        {icon}
      </span>
      {sidebarOpen && <span className="ml-3 text-sm">{label}</span>}
    </a>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
      <div className="p-3 rounded-lg bg-gray-50 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function ScheduleItem({ time, subject, class: className, room, active }: any) {
  return (
    <li className={`p-4 transition-colors hover:bg-gray-50 ${active ? 'bg-blue-50/50 relative' : ''}`}>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
      <div className="flex justify-between items-start">
        <div>
          <p className={`font-semibold text-sm ${active ? 'text-blue-700' : 'text-gray-800'}`}>{subject}</p>
          <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
            <span className="font-medium px-1.5 py-0.5 bg-gray-100 rounded">{className}</span>
            <span>•</span>
            <span>{room}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-mono font-medium ${active ? 'text-blue-600' : 'text-gray-500'}`}>{time}</span>
          {active && <span className="block mt-1 text-[10px] uppercase tracking-wider font-bold text-blue-500 bg-blue-100 px-1 py-0.5 rounded text-center">Sekarang</span>}
        </div>
      </div>
    </li>
  );
}

