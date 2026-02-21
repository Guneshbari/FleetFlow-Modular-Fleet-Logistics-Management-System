import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Sun, Moon, LogOut, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Input } from './ui/input';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

interface AppHeaderProps {
  title: string;
  user?: { id: number; name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
}

const typeIcons = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const typeColors = {
  success: 'text-[#22C55E]',
  info: 'text-[#3B82F6]',
  warning: 'text-[#F59E0B]',
  error: 'text-[#EF4444]',
};

const typeBg = {
  success: 'bg-[#22C55E]/10',
  info: 'bg-[#3B82F6]/10',
  warning: 'bg-[#F59E0B]/10',
  error: 'bg-[#EF4444]/10',
};

export function AppHeader({ title, user, onLogout }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await (api as any).analytics.notifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleToggleNotifications = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) loadNotifications();
  };

  const unreadCount = notifications.filter(n => n.type === 'error' || n.type === 'warning').length;

  return (
    <header className="h-16 bg-card border-b border-border px-8 flex items-center justify-between transition-colors duration-300">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleToggleNotifications}
            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{unreadCount}</span>
              </div>
            )}
            <div className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground">{notifications.length} recent events</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = typeIcons[n.type] || Info;
                    return (
                      <div key={n.id} className="px-4 py-3 border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg ${typeBg[n.type]} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon className={`w-4 h-4 ${typeColors[n.type]}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info + Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">{user.role}</p>
            </div>
            <button className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-opacity">
              <User className="w-5 h-5 text-primary-foreground" />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-[#EF4444]/20 hover:text-[#EF4444] transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
