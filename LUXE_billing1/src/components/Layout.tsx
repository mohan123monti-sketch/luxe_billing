import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Moon,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'DASHBOARD', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'BILLING', icon: ShoppingCart, path: '/billing' },
    { name: 'INVENTORY', icon: Package, path: '/inventory' },
    { name: 'CUSTOMERS', icon: Users, path: '/customers' },
    { name: 'REPORTS', icon: BarChart3, path: '/reports' },
    { name: 'SETTINGS', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex flex-col h-screen bg-white text-black font-sans font-medium overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-20 bg-black text-white border-b border-gray-900 flex items-center justify-between px-12 no-print shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-12 w-full">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="font-black text-2xl leading-none tracking-tighter uppercase text-white">LUXE</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider text-gray-400 hover:text-white transition-all uppercase rounded-lg",
                  isActive && "text-white bg-white/10"
                )}
              >
                <item.icon className="w-4 h-4" strokeWidth={2.5} />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col bg-white">
        <Outlet />
      </main>
    </div>
  );
}
