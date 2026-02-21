import { Search, Bell, User, Sun, Moon } from 'lucide-react';
import { Input } from './ui/input';
import { useTheme } from '../context/ThemeContext';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();

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
        <button className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* User Avatar */}
        <button className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-opacity">
          <User className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>
    </header>
  );
}
