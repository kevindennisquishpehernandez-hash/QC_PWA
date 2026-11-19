import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Loader2, Building2, Hash, Phone, Mail, MapPin, User } from 'lucide-react';
import api from '../services/api';

const INITIAL_STATE = {
  nombres: '',
  empresa: '',
  ruc: '',
  telefono: '',
  email: '',
  direccion: ''
};

function ClienteForm({ onClienteCreado, onCancelar }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.nombres.trim()) {
      setErrorMsg('El nombre del cliente es obligatorio.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/api/clientes', formData);
      if (response.data && response.data.estado === 'success') {
        setFormData(INITIAL_STATE);
        if (onClienteCreado) {
          onClienteCreado(response.data.datos);
        }
      } else {
        throw new Error(response.data?.mensaje || 'No se pudo guardar el cliente');
      }
    } catch (err) {
      console.error('Error al crear cliente:', err);
      setErrorMsg(
        err.response?.data?.mensaje ||
        err.message ||
        'Error al conectar con el servidor.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-cliente-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 id="modal-cliente-title" className="text-base font-bold text-slate-900">
                Registrar Nuevo Cliente
              </h3>
              <p className="text-xs text-slate-500">
                Se sincronizará directamente en tu base de datos Supabase
              </p>
            </div>
          </div>
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
              aria-label="Cerrar ventana"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {errorMsg && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Nombres */}
            <div className="sm:col-span-2">
              <label htmlFor="nombres" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Nombres y Apellidos <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="nombres"
                  name="nombres"
                  type="text"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Ej. Carlos Mendoza"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>
            </div>

            {/* Empresa */}
            <div>
              <label htmlFor="empresa" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Empresa / Finca
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  value={formData.empresa}
                  onChange={handleChange}
                  placeholder="Ej. Florícola Los Andes S.A."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>
            </div>

            {/* RUC */}
            <div>
              <label htmlFor="ruc" className="mb-1.5 block text-xs font-semibold text-slate-700">
                RUC / Cédula
              </label>
              <div className="relative">
                <Hash className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="ruc"
                  name="ruc"
                  type="text"
                  value={formData.ruc}
                  onChange={handleChange}
                  placeholder="Ej. 1712345678001"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Teléfono / WhatsApp
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 0991234567"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contacto@finca.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="sm:col-span-2">
              <label htmlFor="direccion" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Dirección / Sector de Obra
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej. Cayambe, Sector El Pisque"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            {onCancelar && (
              <button
                type="button"
                onClick={onCancelar}
                disabled={submitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Guardar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClienteForm;
