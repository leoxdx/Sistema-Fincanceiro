'use client'

import { View } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  FileSpreadsheet, 
  Menu, 
  X,
  LogOut
} from 'lucide-react'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  isOpen: boolean
  onToggle: () => void
  onLogout: () => void
}

const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { view: 'payments', label: 'Pacientes e Pagamentos', icon: <Users className="h-5 w-5" /> },
  { view: 'expenses', label: 'Lançar Despesa', icon: <Receipt className="h-5 w-5" /> },
  { view: 'reports', label: 'Exportar Relatórios', icon: <FileSpreadsheet className="h-5 w-5" /> },
]

export function Sidebar({ currentView, onViewChange, isOpen, onToggle, onLogout }: SidebarProps) {
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md hover:bg-zinc-100"
        onClick={onToggle}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-zinc-200 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-zinc-200">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg text-zinc-800">DentClinic</h1>
              <p className="text-xs text-zinc-500">Gestão de Consultório</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  onViewChange(item.view)
                  if (window.innerWidth < 1024) onToggle()
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  currentView === item.view
                    ? "bg-primary text-white shadow-md"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
