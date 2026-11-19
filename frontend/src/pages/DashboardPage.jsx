import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Grid3x3,
  FileText,
  Mic,
  Wallet,
  ArrowUpRight,
  HardHat,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

function DashboardPage() {
  const [totalClientes, setTotalClientes] = useState(null);

  useEffect(() => {
    api
      .get('/api/clientes')
      .then((res) => {
        if (res.data?.estado === 'success' && Array.isArray(res.data.datos)) {
          setTotalClientes(res.data.datos.length);
        }
      })
      .catch(() => setTotalClientes(0));
  }, []);

  const kpis = [
    {
      label: 'Clientes Registrados',
      value: totalClientes === null ? '...' : totalClientes,
      sub: 'Sincronizado con Supabase',
      icon: Users,
      accent: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Obras Activas',
      value: '0',
      sub: 'Próximo módulo: Proyectos',
      icon: HardHat,
      accent: 'bg-sky-50 text-sky-600'
    },
    {
      label: 'Cotizaciones PDF',
      value: '0',
      sub: 'Módulo EP-01 pendiente',
      icon: FileText,
      accent: 'bg-indigo-50 text-indigo-600'
    },
    {
      label: 'Utilidad Neta Global',
      value: '$0.00',
      sub: 'Módulo financiero EP-04',
      icon: TrendingUp,
      accent: 'bg-amber-50 text-amber-600'
    }
  ];

  const modulos = [
    {
      title: 'Directorio de Clientes',
      desc: 'Registra, busca y gestiona propietarios, fincas y datos de facturación.',
      to: '/clientes',
      icon: Users,
      status: 'Operativo',
      statusColor: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70'
    },
    {
      title: 'Cálculo Estructural y BOM',
      desc: 'Retícula interactiva de naves, cerchas, lista de compra y hoja de corte (6m / 8m).',
      to: '/estructuras',
      icon: Grid3x3,
      status: 'Operativo · HU-02-01',
      statusColor: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70'
    },
    {
      title: 'Documentos y Cotizaciones',
      desc: 'Generación ágil de proformas comerciales, actas y exportación a PDF.',
      to: '/documentos',
      icon: FileText,
      status: 'En Backlog · EP-01',
      statusColor: 'bg-slate-100 text-slate-600 ring-slate-200'
    },
    {
      title: 'Reportes de Campo (PLN)',
      desc: 'Dictado por voz o texto para registrar avances, personal y almuerzos en obra.',
      to: '/reportes',
      icon: Mic,
      status: 'En Backlog · EP-03',
      statusColor: 'bg-slate-100 text-slate-600 ring-slate-200'
    },
    {
      title: 'Costos y Rentabilidad',
      desc: 'Control de facturas, jornales, abonos de clientes y margen neto por proyecto.',
      to: '/finanzas',
      icon: Wallet,
      status: 'En Backlog · EP-04',
      statusColor: 'bg-slate-100 text-slate-600 ring-slate-200'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Banner de bienvenida */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma PWA · Quishpe Constructores
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Bienvenido, Kevin
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Gestiona tus clientes, diseña geometrías de invernaderos, genera hojas de corte exactas
              y controla la rentabilidad de cada obra desde un solo lugar.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/clientes"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
            >
              Gestionar Clientes
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/estructuras"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
            >
              Ver Cálculo Estructural
            </Link>
          </div>
        </div>
      </section>

      {/* Tarjetas KPI (Base de HU-05-01) */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wide text-slate-700 uppercase">
            Indicadores Clave (KPIs)
          </h3>
          <span className="text-xs text-slate-400">Actualización en tiempo real</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                  <div className={`rounded-xl p-2.5 ${kpi.accent}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{kpi.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Accesos directos a Módulos */}
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-bold tracking-wide text-slate-700 uppercase">
            Módulos de la Plataforma
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modulos.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                to={mod.to}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${mod.statusColor}`}
                    >
                      {mod.status}
                    </span>
                  </div>
                  <h4 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-700">
                    {mod.title}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{mod.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <span>Abrir módulo</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
