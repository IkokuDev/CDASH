'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Database,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddAssetModal } from '@/components/AddAssetModal';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Database },
  { href: '/staff', label: 'Staff', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [adminName, setAdminName] = useState('Super Admin');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('ict-central-admin-name');
    if (storedName) {
      setAdminName(storedName);
    }
  }, []);

  const getPageTitle = () => {
    const currentLink = navLinks.find(link => pathname.startsWith(link.href));
    return currentLink ? currentLink.label : 'Dashboard';
  };
  
  const getButtonText = () => {
    if (pathname.startsWith('/staff')) return 'Add New Staff';
    if (pathname.startsWith('/reports')) return 'Generate New Report';
    return 'Add New Asset';
  }

  const handleButtonClick = () => {
    if (pathname.startsWith('/reports')) {
       // In a real app, you might open a different modal or navigate.
      console.log('Generate report action triggered');
    } else {
      setIsAssetModalOpen(true);
    }
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] h-screen">
      <aside className="hidden md:flex flex-col justify-between bg-card p-4 border-r border-border">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-primary p-2 rounded-lg">
              <ShieldCheck className="text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">CDASH</h1>
          </div>
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center px-4 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/90 text-primary-foreground'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40" alt="Super Admin" />
              <AvatarFallback>{adminName.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{adminName}</p>
              <p className="text-sm text-foreground/60">super.admin@org.com</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="overflow-y-auto">
        <header className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <h2 className="text-2xl font-bold text-foreground">{getPageTitle()}</h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><Bell /></Button>
            <Button variant="ghost" size="icon"><MessageSquare /></Button>
            <Button onClick={handleButtonClick}>
              <PlusCircle className="w-5 h-5" />
              <span>{getButtonText()}</span>
            </Button>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>

      <AddAssetModal isOpen={isAssetModalOpen} onOpenChange={setIsAssetModalOpen} />
    </div>
  );
}
