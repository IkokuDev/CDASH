
'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
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
import { AddStaffModal } from '@/components/AddStaffModal';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import type { AppUser } from '@/lib/types';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Database },
  { href: '/staff', label: 'Staff', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

const adminNavLinks = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

const DataContext = createContext<{ refreshData: () => void }>({ refreshData: () => {} });

export const useData = () => useContext(DataContext);


function SidebarContent({ user, onSignOut, onLinkClick }: { user: AppUser; onSignOut: () => void; onLinkClick?: () => void; }) {
  const pathname = usePathname();
  const allNavLinks = user?.role === 'Administrator' ? [...navLinks, ...adminNavLinks] : navLinks;

  return (
    <div className="flex flex-col justify-between bg-card p-4 h-full">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-primary p-2 rounded-lg">
                  <ShieldCheck className="text-primary-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">ICT Central</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <h1 className="text-xl font-bold text-foreground">CDASH</h1>
        </div>
        <nav className="space-y-2">
          <TooltipProvider>
            {allNavLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Tooltip key={link.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={link.href}
                      onClick={onLinkClick}
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
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <p>{link.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
      </div>
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.photoURL || 'https://placehold.co/40x40'} alt={user.displayName || 'Admin'} />
              <AvatarFallback>{(user.displayName || 'SA').substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{user.displayName || 'Super Admin'}</p>
              <p className="text-sm text-foreground/60">{user.email}</p>
            </div>
          </div>
           <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sign out">
              <LogOut className="w-5 h-5" />
           </Button>
        </div>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { appUser, loading, signOut } = useAuth();
  const router = useRouter();

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshData = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  useEffect(() => {
     if (!loading && !appUser) {
        router.replace('/login');
     }
  }, [appUser, loading, router])

  const getPageTitle = () => {
    if (pathname.startsWith('/settings/organization')) return 'Organization Profile';
    if (pathname.startsWith('/settings/roles')) return 'User Groups & Privileges';
    const allLinks = appUser?.role === 'Administrator' ? [...navLinks, ...adminNavLinks] : navLinks;
    const currentLink = allLinks.find(link => pathname.startsWith(link.href));
    return currentLink ? currentLink.label : 'Dashboard';
  };
  
  const getButtonText = () => {
    if (pathname.startsWith('/staff')) return 'Add New Staff';
    if (pathname.startsWith('/reports')) return 'Generate New Report';
    return 'Add New Asset';
  }

  const handleButtonClick = () => {
    if (pathname.startsWith('/staff')) {
      setIsStaffModalOpen(true);
    } else if (pathname.startsWith('/reports')) {
      console.log('Generate report action triggered');
    } else {
      setIsAssetModalOpen(true);
    }
  }
  
  if (loading || !appUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ refreshData }}>
      <div className="grid md:grid-cols-[280px_1fr] h-screen bg-background">
        <aside className="hidden md:block border-r border-border">
          <SidebarContent user={appUser} onSignOut={signOut} />
        </aside>

        <main className="overflow-y-auto">
          <header className="p-4 md:p-6 border-b border-border flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 border-r-0 w-[280px]">
                    <SidebarContent user={appUser} onSignOut={signOut} onLinkClick={() => setIsSheetOpen(false)} />
                  </SheetContent>
                </Sheet>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="hidden md:inline-flex"><Bell /></Button>
              <Button variant="ghost" size="icon" className="hidden md:inline-flex"><MessageSquare /></Button>
              <Button onClick={handleButtonClick}>
                <PlusCircle className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">{getButtonText()}</span>
              </Button>
            </div>
          </header>
          <div className="p-4 md:p-6" key={refreshCounter}>
            {children}
          </div>
        </main>

        <AddAssetModal isOpen={isAssetModalOpen} onOpenChange={setIsAssetModalOpen} onAssetAdded={refreshData} />
        <AddStaffModal isOpen={isStaffModalOpen} onOpenChange={setIsStaffModalOpen} onStaffAdded={refreshData} />
      </div>
    </DataContext.Provider>
  );
}
