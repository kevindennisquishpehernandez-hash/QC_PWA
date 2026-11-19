import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  UserPlus,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  MapPin,
  Hash,
  Users,
  AlertTriangle,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import api from '../services/api';
import ClienteForm from '../components/ClienteForm';

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [toastMensaje, setToastMensaje] = useState(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/clientes');
      if (response.data && response.data.estado === 'success') {
        setClientes(Array.isArray(response.data.datos) ? response.data.datos : []);
      } else {
        throw new Error(response.data?.mensaje || 'Respuesta inesperada del servidor');
      }
    } catch (err) {
      console.error('Error al conectar con la API:', err);
      setError(
        err.response?.data?.mensaje ||
        err.message ||
        'No se pudo conectar con el servidor backend (puerto 4000).'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleClienteCreado = (nuevoCliente) => {
    setClientes((prev) => [nuevoCliente, ...prev]);
    setMostrarModal(false);
    setToastMensaje(`Cliente "${nuevoCliente.nombres}" registrado correctamente.`);
    setTimeout(() => setToastMensaje(null), 4500);
  };

  // Filtrado instantáneo en memoria (rápido e intuitivo)
  const clientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) =>
      [c.nombres, c.empresa, c.ruc, c.direccion, c.email, c.telefono]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(q))
    );
  }, [clientes, busqueda]);

  const totalEmpresas = useMemo(
    () => clientes.filter((c) => c.empresa && c.empresa.trim() !== '').length,
    [clientes]
  );

  return (
    <div className="space-y-6">
      {/* Notificación de éxito */}
      {toastMensaje && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{toastMensaje}</span>
        </div>
      )}

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Total Clientes
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {clientes.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Registrados en Supabase</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Empresas / Fincas
            </span>
            <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {totalEmpresas}
          </p>
          <p className="mt-1 text-xs text-slate-500">Con razón social asociada</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Resultados Mostrados
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Search className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {clientesFiltrados.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {busqueda ? `Filtrado por "${busqueda}"` : 'Mostrando directorio completo'}
          </p>
        </div>
      </div>

      {/* Barra de herramientas: Buscador + Acciones */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, finca, RUC o sector..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchClientes}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={() => setMostrarModal(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 sm:flex-none"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Estado: Error */}
      {error && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">No se pudo cargar los clientes</h3>
              <p className="mt-0.5 text-xs text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchClientes}
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado: Cargando (Skeleton elegante) */}
      {loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
              <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-4/5 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado: Vacío */}
      {!loading && !error && clientesFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FolderOpen className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            {busqueda ? 'No encontramos coincidencias' : 'Aún no hay clientes registrados'}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {busqueda
              ? `No existen clientes que coincidan con "${busqueda}". Intenta con otro término.`
              : 'Registra tu primer cliente o finca para empezar a cotizar y diseñar invernaderos.'}
          </p>
          {!busqueda && (
            <button
              onClick={() => setMostrarModal(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <UserPlus className="h-4 w-4" />
              Registrar primer cliente
            </button>
          )}
        </div>
      )}

      {/* Grid de Tarjetas de Clientes */}
      {!loading && !error && clientesFiltrados.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clientesFiltrados.map((cliente, index) => (
            <article
              key={cliente.id || cliente.id_cliente || index}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div>
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-sm font-bold text-white shadow-xs">
                      {(cliente.nombres || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-900">
                        {cliente.nombres || 'Sin nombre'}
                      </h3>
                      {cliente.empresa ? (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-medium text-emerald-700">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{cliente.empresa}</span>
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-slate-400">Cliente particular</p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
                    Activo
                  </span>
                </div>

                {/* Detalles de contacto */}
                <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  {cliente.ruc && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Hash className="h-3.5 w-3.5" /> RUC / CI
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono font-medium text-slate-700">
                        {cliente.ruc}
                      </span>
                    </div>
                  )}

                  {cliente.telefono && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="h-3.5 w-3.5" /> Teléfono
                      </span>
                      <a
                        href={`tel:${cliente.telefono}`}
                        className="font-medium text-slate-700 hover:text-emerald-600"
                      >
                        {cliente.telefono}
                      </a>
                    </div>
                  )}

                  {cliente.email && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Mail className="h-3.5 w-3.5" /> Email
                      </span>
                      <a
                        href={`mailto:${cliente.email}`}
                        className="truncate font-medium text-slate-700 hover:text-emerald-600"
                      >
                        {cliente.email}
                      </a>
                    </div>
                  )}

                  {cliente.direccion && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex shrink-0 items-center gap-1.5 text-slate-400">
                        <MapPin className="h-3.5 w-3.5" /> Ubicación
                      </span>
                      <span className="text-right font-medium text-slate-700">
                        {cliente.direccion}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de creación */}
      {mostrarModal && (
        <ClienteForm
          onClienteCreado={handleClienteCreado}
          onCancelar={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
}

export default ClientesPage;
