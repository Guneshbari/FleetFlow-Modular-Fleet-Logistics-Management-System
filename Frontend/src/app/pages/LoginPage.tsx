import { useState } from 'react';
import { Truck, Sun, Moon } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTheme } from '../context/ThemeContext';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-10 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Moon className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {/* Left Side - Form */}
      <div className="w-1/2 bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">FleetFlow</span>
          </div>

          {/* Form */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground">
              {isRegister
                ? 'Register to manage your fleet efficiently'
                : 'Sign in to access your fleet dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role
                </label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="dispatcher">Dispatcher</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isRegister ? 'Register' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="w-1/2 bg-card flex items-center justify-center p-8 transition-colors duration-300">
        <div className="max-w-lg text-center">
          <div className="mb-6">
            <div className="w-32 h-32 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-16 h-16 text-[#22C55E]" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Fleet Management Made Simple
            </h2>
            <p className="text-lg text-muted-foreground">
              Streamline your logistics operations with real-time tracking, maintenance scheduling, and comprehensive analytics.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-background p-4 rounded-lg border border-border transition-colors duration-300">
              <p className="text-2xl font-bold text-[#22C55E]">500+</p>
              <p className="text-xs text-muted-foreground">Vehicles</p>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border transition-colors duration-300">
              <p className="text-2xl font-bold text-[#22C55E]">98%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border transition-colors duration-300">
              <p className="text-2xl font-bold text-[#22C55E]">24/7</p>
              <p className="text-xs text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
