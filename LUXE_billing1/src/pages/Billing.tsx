import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Search, Printer, Trash2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode: string;
  discount?: number;
}

interface CartItem extends Product {
  quantity: number;
  total: number;
  discount: number;
}

export default function Billing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [extraDiscount, setExtraDiscount] = useState(0);
  const { token, user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentBillData, setCurrentBillData] = useState<any>(null);
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, [token]);

  const fetchProducts = (query = '') => {
    fetch(`/api/products?search=${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProducts);
  };

  const fetchSettings = () => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings);
  };

  const addToCart = (product: Product) => {
    const discountPercent = product.discount || 0;
    const discountAmount = (product.price * discountPercent) / 100;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { 
                ...item, 
                quantity: item.quantity + 1, 
                total: (item.quantity + 1) * item.price,
                discount: (item.quantity + 1) * discountAmount
              } 
            : item
        );
      }
      return [...prev, { 
        ...product, 
        quantity: 1, 
        total: product.price, 
        discount: discountAmount 
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        const discountPercent = item.discount! / (item.total / item.price) || 0; // This is complex, better to just use product.discount if available or store it
        // Actually, item.discount is total discount. Let's just recalculate based on unit discount.
        const unitDiscount = item.discount / item.quantity;
        return { 
          ...item, 
          quantity: newQty, 
          total: newQty * item.price,
          discount: newQty * unitDiscount
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const itemDiscount = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
  const gstRate = settings?.gstRate || 18;
  const taxableAmount = subtotal - itemDiscount - extraDiscount;
  const gstAmount = taxableAmount * (gstRate / 100);
  const grandTotal = taxableAmount + gstAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            total: item.total
          })),
          paymentMethod,
          subtotal,
          itemDiscount,
          extraDiscount,
          gstAmount,
          totalAmount: grandTotal,
          customerName: customer.name,
          customerPhone: customer.phone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentBillData({
          id: data.id,
          items: [...cart],
          customer: { ...customer },
          subtotal,
          itemDiscount,
          extraDiscount,
          gstAmount,
          grandTotal,
          paymentMethod,
          date: new Date()
        });
        
        setCart([]);
        setCustomer({ name: '', phone: '' });
        setExtraDiscount(0);
        // Reset itemDiscount is handled by setCart([])
        fetchProducts();
        setShowReceipt(true);
      } else {
        const errorData = await response.json();
        alert(`Checkout failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred during checkout. Please check the console.');
    }
  };

  const getQtyInCart = (id: string) => {
    return cart.find(i => i.id === id)?.quantity || 0;
  };

  return (
    <div className="flex flex-col h-full bg-white text-black font-sans overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-8 pb-6 shrink-0">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-500 mb-2 uppercase">// POINT OF SALE</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">BILLING</h1>
        </div>
        <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500">
          GST {gstRate}% · {paymentMethod.toUpperCase()}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Products */}
        <div className="flex-1 flex flex-col px-8 pb-8 gap-6 overflow-hidden">
          <div className="relative shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or product ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchProducts(e.target.value);
              }}
              className="w-full border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
            {products.map(product => {
              const qtyInCart = getQtyInCart(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-left flex flex-col justify-between hover:shadow-md hover:border-gray-300 transition-all h-36 relative active:scale-[0.98]"

                >
                  <div>
                    <div className="text-[10px] font-mono text-gray-400 mb-2 uppercase tracking-wider">{product.id}</div>
                    <h3 className="text-sm font-bold text-gray-700 leading-snug">{product.name}</h3>
                  </div>
                  <div className="flex justify-between items-baseline mt-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">₹{(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}</span>
                      {product.discount ? (
                        <span className="text-[9px] text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                      ) : null}
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono font-bold space-x-1",
                      qtyInCart > 0 ? "text-black" : "text-orange-400"
                    )}>
                      <span>x</span><span>{qtyInCart}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Billing Panel */}
        <div className="w-[400px] bg-gray-50 flex flex-col shrink-0 border-l border-gray-200">
          <div className="p-6 flex justify-between items-center shrink-0 border-b border-gray-200 bg-gray-50">
            <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase">// CURRENT BILL</h3>
            <span className="text-[10px] font-mono font-bold uppercase">{cart.reduce((s,i) => s+i.quantity, 0)} ITEMS</span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 font-mono text-xs">
            {cart.length === 0 ? (
               <div className="h-full flex items-center justify-center">
                 <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">CART IS EMPTY</span>
               </div>
            ) : (
               <div className="space-y-4">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-start group">
                     <div className="flex-1">
                       <p className="font-bold uppercase text-black line-clamp-1">{item.name}</p>
                       <div className="flex items-center gap-2 mt-1 opacity-50">
                         <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-black">-</button>
                         <span>{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-black">+</button>
                         <span className="mx-2">x</span>
                         <span>₹{item.price.toFixed(2)}</span>
                       </div>
                     </div>
                     <div className="flex flex-col items-end">
                       <span className="font-bold text-black">₹{item.total.toFixed(2)}</span>
                       <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500 uppercase mt-1 opacity-0 group-hover:opacity-100">Remove</button>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          <div className="p-6 shrink-0 font-sans border-t border-gray-200">
             <div className="flex gap-2 mb-6">
               <input 
                 placeholder="Customer name" 
                 className="flex-1 border border-gray-200 rounded-lg shadow-sm p-3 text-xs focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                 value={customer.name}
                 onChange={e => setCustomer({...customer, name: e.target.value})}
               />
               <input 
                 placeholder="Phone" 
                 className="flex-1 border border-gray-200 rounded-lg shadow-sm p-3 text-xs focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                 value={customer.phone}
                 onChange={e => setCustomer({...customer, phone: e.target.value})}
               />
             </div>
             <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-black font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Item Discount</span>
                  <span className="text-black font-mono">- ₹{itemDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium items-center">
                  <span>Extra Discount</span>
                  <input 
                    type="number" 
                    className="border border-gray-200 w-20 p-1 text-right text-xs bg-white focus:outline-none focus:border-black font-mono text-black" 
                    value={extraDiscount} 
                    onChange={e => setExtraDiscount(Number(e.target.value))}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>GST ({gstRate}%)</span>
                  <span className="text-black font-mono">₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-4 border-t border-gray-200 text-black mt-2">
                  <span>GRAND TOTAL</span>
                  <span className="font-mono text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>
             </div>
             <div className="grid grid-cols-3 gap-2 mb-4">
               {(['cash', 'card', 'upi'] as const).map(method => (
                 <button
                   key={method}
                   onClick={() => setPaymentMethod(method)}
                   className={cn(
                     "py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200",
                     paymentMethod === method 
                       ? "bg-black text-white shadow-md scale-[1.02]" 
                       : "bg-white border border-gray-200 text-gray-400 hover:border-black hover:text-black"
                   )}
                 >
                   {method}
                 </button>
               ))}
             </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={cn(
                  "w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  cart.length > 0 
                    ? "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 active:scale-[0.98]" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <Printer className="w-4 h-4" /> CHECKOUT & PRINT
              </button>
          </div>
        </div>
      </div>

      {showReceipt && currentBillData && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center p-8 max-w-2xl mx-auto w-full">
            <button 
              onClick={() => setShowReceipt(false)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
            >
              <span className="text-lg">←</span> BACK
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
            >
              <Printer className="w-4 h-4" /> PRINT
            </button>
          </div>

          <div className="flex-1 p-8">
            <div className="max-w-md mx-auto bg-white border border-gray-100 shadow-2xl p-10">
              <Receipt 
                ref={receiptRef} 
                billData={currentBillData}
                settings={settings}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Receipt Component for Printing
const Receipt = ({ ref, billData, settings }: any) => {
  if (!billData) return null;
  const { items, subtotal, itemDiscount, gstAmount, extraDiscount, grandTotal, paymentMethod, customer, id, date } = billData;

  return (
    <div ref={ref} className="text-black font-mono text-[11px] leading-tight print-receipt bg-white w-[80mm] mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">LUXE</h1>
        <div className="text-[9px] space-y-0.5 text-black">
          <p>{settings?.address || "45 Fashion Avenue, Boutique District, NY 10012"}</p>
          <p>TEL {settings?.phone || "+1 (212) 555-8899"}</p>
          <p>GSTIN {settings?.gstNumber || "74108520"}</p>
        </div>
      </div>

      {/* Dotted Line */}
      <div className="border-t border-dotted border-black my-4"></div>

      {/* Details Section */}
      <div className="space-y-1 mb-4 text-[10px]">
        <div className="flex justify-between">
          <span className="uppercase">Bill #</span>
          <span className="font-bold">{id}</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase">Date</span>
          <span>{date.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase">Customer</span>
          <span className="uppercase">{customer?.name || "Test Customer"}</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase">Phone</span>
          <span>{customer?.phone || "1234567890"}</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase">Payment</span>
          <span className="uppercase">{paymentMethod}</span>
        </div>
      </div>

      {/* Dotted Line */}
      <div className="border-t border-dotted border-black my-4"></div>

      {/* Items Table */}
      <table className="w-full mb-4 text-[10px]">
        <thead>
          <tr className="text-left text-gray-400 uppercase">
            <th className="pb-2 font-normal">Item</th>
            <th className="pb-2 font-normal text-center">Qty</th>
            <th className="pb-2 font-normal text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-black">
          {items.map((item: any) => (
            <tr key={item.id}>
              <td className="py-1 uppercase pr-2">{item.name}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right">₹{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dotted Line */}
      <div className="border-t border-dotted border-black my-4"></div>

      {/* Totals Section */}
      <div className="space-y-1.5 text-[10px]">
        <div className="flex justify-between">
          <span className="uppercase">Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {itemDiscount > 0 && (
          <div className="flex justify-between">
            <span className="uppercase">Item Discount</span>
            <span>-₹{itemDiscount.toFixed(2)}</span>
          </div>
        )}
        {extraDiscount > 0 && (
          <div className="flex justify-between">
            <span className="uppercase">Extra Discount</span>
            <span>-₹{extraDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="uppercase">GST ({settings?.gstRate || 12}%)</span>
          <span>₹{gstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-black pt-2 border-t border-black mt-1">
          <span className="uppercase">Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="text-[9px] uppercase tracking-widest">{settings?.receiptFooter || "Thank you for shopping with us!"}</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          body * { visibility: hidden; }
          .print-receipt, .print-receipt * { visibility: visible; }
          .print-receipt { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 15mm;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
};
