import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Sun, Moon, LogOut, CheckCircle, AlertTriangle, Info, XCircle, Loader2, Menu } from 'lucide-react';
import { Input } from './ui/input';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

interface AppHeaderProps {
  title: string;
  user?: { id: number; name: string; email: string; role: string } | null;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
  onToggleSidebar?: () => void;
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

export function AppHeader({ title, user, onLogout, onNavigate, onToggleSidebar }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; id: number; title: string; subtitle: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [vehiclesData, driversData] = await Promise.all([
          api.vehicles.list().catch(() => []),
          api.drivers.list().catch(() => []),
        ]);
        
        const query = searchQuery.toLowerCase();
        const results: { type: string; id: number; title: string; subtitle: string }[] = [];
        
        const filteredVehicles = (Array.isArray(vehiclesData) ? vehiclesData : []).filter((v: any) => 
          v.model?.toLowerCase().includes(query) || 
          v.license_plate?.toLowerCase().includes(query)
        ).slice(0, 3);
        
        filteredVehicles.forEach((v: any) => {
          results.push({ type: 'vehicle', id: v.id, title: v.license_plate, subtitle: `Vehicle • ${v.model}` });
        });
        
        const filteredDrivers = (Array.isArray(driversData) ? driversData : []).filter((d: any) => 
          d.name?.toLowerCase().includes(query) || 
          d.license_type?.toLowerCase().includes(query)
        ).slice(0, 3);
        
        filteredDrivers.forEach((d: any) => {
          results.push({ type: 'driver', id: d.id, title: d.name, subtitle: `Driver • ${d.license_type || 'N/A'}` });
        });
        
        setSearchResults(results);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectResult = (type: string) => {
    setShowSearch(false);
    setSearchQuery('');
    if (onNavigate) {
      if (type === 'vehicle') onNavigate('vehicles');
      if (type === 'driver') onNavigate('drivers');
    }
  };

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
    <header className="h-16 bg-card border-b border-border px-4 lg:px-8 flex items-center justify-between transition-colors duration-300">
      {/* Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <h1 className="text-lg lg:text-2xl font-bold text-foreground truncate">{title}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Search — hidden on mobile */}
        <div className="relative w-80 hidden md:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, drivers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setShowSearch(true);
            }}
            className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          {showSearch && searchQuery.trim() && (
            <div className="absolute left-0 top-12 w-full bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="max-h-96 overflow-y-auto py-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground text-sm">
                    No results found
                  </div>
                ) : (
                  searchResults.map((result, idx) => (
                    <div
                      key={`${result.type}-${result.id}-${idx}`}
                      onClick={() => handleSelectResult(result.type)}
                      className="px-4 py-2 hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium text-foreground">{result.title}</p>
                      <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
            <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
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
          <div className="flex items-center gap-2 lg:gap-3 pl-2 border-l border-border">
            <div className="text-right hidden sm:block">
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
