import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Layers } from 'lucide-react';

function ModuloEnConstruccion({ epica, titulo, descripcion, criterios = [] }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Layers className="h-3.5 w-3.5" />
            {epica}
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-900">{titulo}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{descripcion}</p>
        </div>

        <div className="p-6">
          <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Criterios de Aceptación (Backlog Trello)
          </h3>
          <ul className="mt-4 space-y-3">
            {criterios.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-sm text-slate-700"
              >
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <span className="text-xs text-slate-400">
              Módulo listo para iniciar desarrollo en el siguiente sprint
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuloEnConstruccion;
