import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = (query = '') => {
    setLoading(true);
    fetch(`/api/products?search=${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this product?')) return;
    
    await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchProducts();
  };

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-white text-black font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-2 uppercase">// CATALOG</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">INVENTORY</h1>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase flex items-center hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> ADD PRODUCT
        </button>
      </div>

      <div className="border border-gray-200">
        {/* Filters & Search */}
        <div className="flex justify-between items-center bg-white border-b border-gray-200">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or product ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchProducts(e.target.value);
              }}
              className="w-full pl-14 pr-4 py-6 border-none text-sm focus:outline-none transition-colors"
            />
          </div>
          <div className="pr-6">
            <div className="flex items-center gap-2 border border-gray-200 px-4 py-2 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 cursor-pointer">
              <AlertTriangle className="w-4 h-4 text-black" />
              LOW STOCK
            </div>
          </div>
        </div>

        {/* Product Table */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] whitespace-nowrap w-24">PRODUCT ID</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111]">NAME</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] whitespace-nowrap">CATEGORY</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] text-right whitespace-nowrap">PRICE</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] text-right whitespace-nowrap">DISCOUNT</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] text-center whitespace-nowrap w-20">STOCK</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#111] text-right whitespace-nowrap w-32">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-6 py-4 bg-gray-50 h-16"></td>
                </tr>
              ))
            ) : products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono font-medium">{product.id}</td>
                <td className="px-6 py-4 font-bold text-sm">{product.name}</td>
                <td className="px-6 py-4 font-mono text-gray-500 uppercase">{product.category}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-sm">{product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-sm">{product.discount || 0}%</td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "font-mono font-bold text-sm",
                    product.stock <= 0 ? "text-orange-500" : "text-black"
                  )}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => {
                        setEditingProduct(product);
                        setIsModalOpen(true);
                      }}
                      className="p-2 border border-gray-200 hover:bg-black hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 border border-gray-200 hover:bg-black hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <ProductModal 
          token={token} 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProducts();
          }} 
        />
      )}
    </div>
  );
}

function ProductModal({ token, product, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState(product || {
    name: '',
    category: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    lowStockThreshold: 10,
    id: '',
    discount: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = product ? `/api/products/${product.id}` : '/api/products';
    const method = product ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-black p-8 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-black uppercase tracking-tighter">
            {product ? 'MODIFY PRODUCT' : 'ADD PRODUCT'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 transition-colors rounded">
            <Plus className="w-6 h-6 rotate-45 text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none text-sm transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</label>
              <input 
                required
                type="text" 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none text-sm transition-colors uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Product ID</label>
              <input 
                type="text" 
                value={formData.id || ''}
                onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})}
                placeholder="Leave blank to auto-generate"
                className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none text-sm font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Selling Price</label>
              <input 
                required
                type="number" step="0.01"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none text-sm font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Actual Cost</label>
              <input 
                required
                type="number" step="0.01"
                value={formData.costPrice}
                onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})}
                className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none text-sm font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Stock</label>
              <input 
                required
                type="number" 
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none text-sm font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Alert Limit</label>
              <input 
                required
                type="number" 
                value={formData.lowStockThreshold}
                onChange={e => setFormData({...formData, lowStockThreshold: Number(e.target.value)})}
                className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none text-sm font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Discount (%)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                value={formData.discount}
                onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none text-sm font-mono transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-gray-200 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-black text-white font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-colors"
            >
              {product ? 'Update Inventory' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
