import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, Calendar, Filter, FileText } from 'lucide-react';

export default function Reports() {
  const [data, setData] = useState<any>(null);
  const { token } = useAuth();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [error, setError] = useState<string | null>(null);

  const fetchData = (start?: string, end?: string) => {
    let url = '/api/reports/dashboard';
    if (start && end) {
      url += `?start=${start}&end=${end}`;
    }
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Failed to fetch report data');
        }
        return json;
      })
      .then(setData)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (error) return <div className="p-12 text-red-500 font-mono">Error loading data: {error}</div>;
  if (!data || !data.revenueTrend) return <div className="p-12 text-sm font-bold text-gray-400 uppercase tracking-widest">Compiling Data Reports...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-white text-black font-sans">
       <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-2 uppercase">// REPORTS</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">SYSTEM REPORTS</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 border border-gray-200 flex flex-col h-full divide-y divide-gray-200">
          <div className="p-6">
             <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase mb-4 text-gray-400">TIME FILTRATION</h3>
             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="date" 
                      value={dateRange.start}
                      onChange={e => setDateRange({...dateRange, start: e.target.value})}
                      className="w-full border border-gray-200 p-3 pl-10 text-xs font-mono outline-none focus:border-black transition-colors" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="date" 
                      value={dateRange.end}
                      onChange={e => setDateRange({...dateRange, end: e.target.value})}
                      className="w-full border border-gray-200 p-3 pl-10 text-xs font-mono outline-none focus:border-black transition-colors" 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (dateRange.start && dateRange.end) {
                      setData(null); // trigger loading
                      fetchData(dateRange.start, dateRange.end);
                    } else {
                      alert('Please select both start and end dates.');
                    }
                  }}
                  className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors active:scale-95"
                >
                  APPLY RANGE
                </button>
             </div>
          </div>

          <div className="p-6 flex-1 bg-gray-50">
             <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase mb-4 text-gray-400">SEGMENTATION</h3>
             <ul className="space-y-3">
                {['General Sales', 'Cost Analysis', 'Loss Prevention', 'Tax Declarations'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-xs font-bold uppercase cursor-pointer hover:text-gray-500 transition-colors">
                    <Filter className="w-4 h-4 text-black" />
                    {f}
                  </li>
                ))}
             </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="border border-gray-200 p-8 pt-6">
             <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase mb-6 text-gray-400">REVENUE METRICS</h3>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#000', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={3} dot={false} activeDot={{ r: 8, fill: '#000', stroke: '#fff', strokeWidth: 3 }} />
                  </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 p-8 pt-6">
               <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase mb-6 text-gray-400">INVENTORY DISTRIBUTION</h3>
               <div className="h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                           { name: 'STABLE', value: data.stats.totalProducts - data.stats.lowStock },
                           { name: 'CRITICAL', value: data.stats.lowStock }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill="#000" />
                        <Cell fill="#e5e7eb" />
                      </Pie>
                      <Tooltip contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="border border-gray-200 p-8 pt-6">
               <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase mb-6 text-gray-400">UNIT SALES VELOCITY</h3>
               <div className="space-y-4">
                  {data.bestSelling.map((item: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase">
                        <span>{item.name}</span>
                        <span className="font-mono text-gray-500">{item.totalQty} TRX</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-black h-full transition-all duration-1000" 
                          style={{ width: `${(item.totalQty / data.bestSelling[0].totalQty) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
