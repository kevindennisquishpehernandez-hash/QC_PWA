import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Grid3x3,
  FileText,
  Mic,
  Wallet,
  Menu,
  X,
  Building2,
  ChevronRight
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, badge: 'EP-05' },
      { to: '/clientes', label: 'Clientes', icon: Users }
    ]
  },
  {
    label: 'Ingeniería y Obra',
    items: [
      { to: '/estructuras', label: 'Cálculo Estructural', icon: Grid3x3, badge: 'EP-02' },
      { to: '/documentos', label: 'Documentos y PDFs', icon: FileText, badge: 'EP-01' },
      { to: '/reportes', label: 'Reportes PLN', icon: Mic, badge: 'EP-03' }
    ]
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/finanzas', label: 'Costos y Rentabilidad', icon: Wallet, badge: 'EP-04' }
    ]
  }
];

const ROUTE_META = {
  '/': {
    title: 'Panel Ejecutivo',
    subtitle: 'Resumen operativo y accesos rápidos de Quishpe Constructores'
  },
  '/clientes': {
    title: 'Directorio de Clientes',
    subtitle: 'Administra propietarios, fincas y contactos comerciales'
  },
  '/estructuras': {
    title: 'Cálculo Estructural de Invernaderos',
    subtitle: 'Retícula interactiva de naves, geometría de cerchas y despiece BOM'
  },
  '/documentos': {
    title: 'Gestión Documental y Cotizaciones',
    subtitle: 'Generación ágil de proformas, actas y exportación a PDF'
  },
  '/reportes': {
    title: 'Reportes de Campo con PLN',
    subtitle: 'Registro diario de avances, personal y almuerzos por voz o texto'
  },
  '/finanzas': {
    title: 'Costos, Abonos y Rentabilidad',
    subtitle: 'Control de egresos por obra, pagos recibidos y utilidad neta'
  }
};

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentMeta = ROUTE_META[location.pathname] || ROUTE_META['/'];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-900 text-slate-200">
      {/* Brand Header */}
      <div className="flex h-18 items-center justify-between border-b border-slate-800/80 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/50">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-bold tracking-tight text-white">
              Quishpe
            </span>
            <span className="block text-[11px] font-medium tracking-wider text-emerald-400 uppercase">
              Constructores
            </span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-4.5 w-4.5 transition-colors ${
                              isActive
                                ? 'text-emerald-400'
                                : 'text-slate-500 group-hover:text-slate-300'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-500 group-hover:text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Profile */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-emerald-300 ring-2 ring-emerald-500/30">
            KQ
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">Kevin Quishpe</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="truncate text-[11px] text-slate-400">Administrador</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-68">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col lg:pl-68">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Quishpe PWA</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-emerald-600">{currentMeta.title}</span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                {currentMeta.title}
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Supabase En Línea
          </div>
        </header>

        {/* Page Container */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
