import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Save, Store, MapPin, Phone, Hash, Loader2, AlertTriangle, Trash2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      alert('Settings updated successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm("WARNING: Are you sure you want to clear all shopping data (bills, customers)? Inventory will NOT be deleted. This action cannot be undone.")) {
      try {
        const response = await fetch('/api/settings/clear-data', {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          alert("All shopping data has been cleared.");
        } else {
          const err = await response.json();
          alert(`Failed to clear data: ${err.error || 'Unknown error'}`);
        }
      } catch (e) {
        console.error(e);
        alert("An error occurred while clearing data.");
      }
    }
  };

  if (loading) return <div className="p-12 text-sm font-bold text-gray-400 uppercase tracking-widest">Accessing Configuration...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-white text-black font-sans">
      <div className="flex items-start justify-between mb-8 max-w-4xl mx-auto">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-2 uppercase">// CONFIGURATION</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">SETTINGS</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Store Profile */}
        <div className="border border-gray-200">
           <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
             <Store className="w-5 h-5 text-gray-400" />
             <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-600">ESTABLISHMENT PROFILE</h3>
           </div>
           
           <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Identity Label</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={settings.shopName}
                    onChange={e => setSettings({...settings, shopName: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 font-bold focus:border-black outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Physical Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={settings.address}
                    onChange={e => setSettings({...settings, address: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 font-bold focus:border-black outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Contact Line</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={settings.phone}
                    onChange={e => setSettings({...settings, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 font-bold text-gray-500 focus:text-black focus:border-black outline-none font-mono text-sm transition-colors"
                  />
                </div>
              </div>
           </div>
        </div>

        {/* Business Logic */}
        <div className="border border-gray-200">
           <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
             <Hash className="w-5 h-5 text-gray-400" />
             <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-600">TAXATION & RULES</h3>
           </div>

           <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">GST-ID</label>
                  <input 
                    type="text" 
                    value={settings.gstNumber}
                    onChange={e => setSettings({...settings, gstNumber: e.target.value})}
                    className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none font-mono text-sm transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">GST Rate (%)</label>
                  <input 
                    type="number" 
                    value={settings.gstRate}
                    onChange={e => setSettings({...settings, gstRate: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none font-mono text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Receipt Footer Text</label>
                <textarea 
                  rows={4}
                  value={settings.receiptFooter}
                  onChange={e => setSettings({...settings, receiptFooter: e.target.value})}
                  className="w-full p-3 border border-gray-200 font-bold focus:border-black outline-none text-sm resize-none transition-colors"
                />
              </div>
           </div>
        </div>

        <div className="md:col-span-2 mt-4 flex items-center justify-between">
           <button 
             type="submit"
             disabled={saving}
             className="px-8 py-4 bg-black text-white rounded-lg shadow-md font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
           >
             {saving ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin mr-3" />
                 SAVING...
               </>
             ) : (
               <>
                 <Save className="w-4 h-4 mr-3" />
                 SAVE SETTINGS
               </>
             )}
           </button>
           
           <button 
             type="button"
             onClick={handleClearData}
             className="px-6 py-4 bg-red-50 text-red-600 rounded-lg shadow-sm font-bold uppercase text-xs tracking-widest hover:bg-red-100 hover:text-red-700 transition-all flex items-center justify-center active:scale-95"
           >
             <Trash2 className="w-4 h-4 mr-2" />
             CLEAR SHOPPING DATA
           </button>
        </div>
      </form>
    </div>
  );
}
