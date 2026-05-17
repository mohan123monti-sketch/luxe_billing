import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  Users
} from 'lucide-react';
import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/reports/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Failed to fetch dashboard data');
        }
        return json;
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <div className="p-8 font-mono text-sm">Error loading data: {error}</div>;
  if (!data || !data.stats) return <div className="p-8 font-mono text-sm">Loading Analytics...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-white text-black font-sans">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-2 uppercase">// OVERVIEW</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">DASHBOARD</h1>
        </div>
        <div className="flex bg-gray-800 text-white p-4 items-center">
           <span className="text-xs mr-4">To exit full screen, press and hold <span className="border border-white/40 px-1 py-0.5 rounded ml-1 text-[10px]">Esc</span></span>
        </div>
        <button onClick={() => navigate('/billing')} className="bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-all rounded-lg shadow-md hover:shadow-lg active:scale-95">
          + NEW BILL
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">TODAY REVENUE</span>
              <Activity className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">₹{data.stats.today.toFixed(2)}</div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500">
                {data.stats.todayBills || 0} BILLS · {data.stats.todayItems || 0} ITEMS
              </span>
            </div>
        </div>

        <div className="border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">THIS WEEK</span>
              <ArrowUpRight className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">₹{data.stats.week.toFixed(2)}</div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500">
                {data.stats.weekBills || 0} bills
              </span>
            </div>
        </div>

        <div className="border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">PRODUCTS</span>
              <Package className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{data.stats.totalProducts || 0}</div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500">
                {data.stats.lowStock || 0} LOW STOCK
              </span>
            </div>
        </div>

        <div className="border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">CUSTOMERS</span>
              <Users className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{data.stats.totalCustomers || 0}</div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500">
                LIFETIME
              </span>
            </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 border border-gray-100 rounded-2xl shadow-sm bg-white p-6">
          <div className="flex justify-between mb-8">
             <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase">// WEEKLY REVENUE</h3>
             <span className="text-[10px] font-mono text-gray-400">LAST 7 DAYS</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 10, fill: '#666'}} 
                  axisLine={{stroke: '#ccc'}} 
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{fontSize: 10, fill: '#666'}} 
                  axisLine={{stroke: '#ccc'}} 
                  tickLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ border: '1px solid black', borderRadius: 0, fontSize: 10, fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} dot={{ stroke: '#000', strokeWidth: 2, r: 3, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="border border-gray-100 rounded-2xl shadow-sm bg-white p-6">
          <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase mb-8">// BEST SELLERS</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bestSelling} layout="vertical" barSize={30}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{fontSize: 10, fill: '#666'}} axisLine={{stroke: '#ccc'}} tickLine={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{fontSize: 9, fill: '#333'}} 
                  axisLine={{stroke: '#ccc'}} 
                  width={80}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ border: '1px solid black', borderRadius: 0, fontSize: 10 }}
                />
                <Bar dataKey="totalQty" fill="#000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


    </div>
  );
}
