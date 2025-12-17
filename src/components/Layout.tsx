import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Users, BarChart3, QrCode, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.jpg';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/scan', icon: QrCode, label: 'Scanner' },
  { path: '/products', icon: Package, label: 'Prodotti' },
  { path: '/suppliers', icon: Users, label: 'Fornitori' },
  { path: '/reports', icon: BarChart3, label: 'Report' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Macellum" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-display text-xl font-bold text-primary">Macellum</span>
          </Link>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            title="Esci"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div className="container mx-auto px-2">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                    isActive
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'scale-110')} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
