import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Zap } from 'lucide-react';

const AppSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/forms/new', icon: PlusCircle, label: 'Novo Formulário' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-60 h-screen bg-sidebar flex flex-col border-r border-sidebar-border flex-shrink-0 sticky top-0">
      <div className="p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-bold text-sidebar-accent-foreground text-sm">Lead Forms</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive(link.to)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            }`}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
