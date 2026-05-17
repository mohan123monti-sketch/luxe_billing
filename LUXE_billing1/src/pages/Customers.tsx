import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Search } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const fetchCustomers = (query = '') => {
    setLoading(true);
    fetch(`/api/customers?search=${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      });
  };

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-white text-black font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-2 uppercase">// CRM</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">CUSTOMERS</h1>
        </div>
      </div>

      <div className="border border-gray-200">
        {/* Filters & Search */}
        <div className="flex justify-between items-center bg-white border-b border-gray-200">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchCustomers(e.target.value);
              }}
              className="w-full pl-14 pr-4 py-6 border-none text-sm focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Product Table */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111]">NAME</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] whitespace-nowrap">PHONE</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111]">PRODUCTS</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] text-right whitespace-nowrap">ORDERS</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] text-right whitespace-nowrap">TOTAL SPENT</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] text-right whitespace-nowrap">LAST VISIT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4 bg-gray-50 h-16"></td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  No customers found
                </td>
              </tr>
            ) : customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-sm uppercase">{customer.name}</td>
                <td className="px-6 py-4 font-mono font-bold text-gray-500 uppercase">{customer.phone || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {customer.bills ? [...new Set(customer.bills.flatMap((b: any) => b.billItems?.map((i: any) => i.productName) || []))].join(', ') || 'N/A' : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-sm">{customer.ordersCount || 0}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-sm">₹{(customer.totalSpent || 0).toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-sm text-gray-500">
                  {new Date(customer.updatedAt || customer.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
