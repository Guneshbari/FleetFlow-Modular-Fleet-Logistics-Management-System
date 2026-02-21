import {
  LayoutDashboard,
  Truck,
  Navigation,
  Wrench,
  FileText,
  UserCheck,
  BarChart3
} from 'lucide-react';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole?: string;
}

// Define which roles can access which pages
const roleAccess: Record<string, string[]> = {
  'Manager':            ['dashboard', 'vehicles', 'trips', 'maintenance', 'expenses', 'drivers', 'analytics'],
  'Dispatcher':         ['dashboard', 'vehicles', 'trips'],
  'Safety Officer':     ['dashboard', 'drivers'],
  'Financial Analyst':  ['dashboard', 'expenses', 'analytics'],
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicle Registry', icon: Truck },
  { id: 'trips', label: 'Trip Dispatcher', icon: Navigation },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'expenses', label: 'Trip & Expense', icon: FileText },
  { id: 'drivers', label: 'Driver Performance', icon: UserCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function AppSidebar({ currentPage, onNavigate, userRole }: AppSidebarProps) {
  const allowedPages = roleAccess[userRole || 'Manager'] || roleAccess['Manager'];
  const visibleItems = menuItems.filter(item => allowedPages.includes(item.id));

  return (
    <div className="fixed left-0 top-0 h-screen w-[260px] bg-card border-r border-border flex flex-col transition-colors duration-300">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">FleetFlow</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative ${isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Role Badge */}
      {userRole && (
        <div className="px-4 py-2 border-t border-border">
          <div className="bg-secondary rounded-lg px-3 py-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Role</p>
            <p className="text-sm font-semibold text-foreground">{userRole}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          © 2026 FleetFlow
        </div>
      </div>
    </div>
  );
}
