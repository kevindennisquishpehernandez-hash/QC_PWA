import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Grid3x3,
  Calculator,
  SlidersHorizontal,
  ShoppingCart,
  Scissors,
  Layers,
  Star,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Ruler
} from 'lucide-react';
import api from '../services/api';

// Crea una matriz de filas x columnas
function crearMatriz(filas, cols, valorInicial = true) {
  return Array.from({ length: filas }, () => Array(cols).fill(valorInicial));
}

// Calcula el largo exacto del tubo de un arco circular asentado en el piso
function calcularLargoArcoLocal(ancho, altoMedio) {
  const W = Number(ancho);
  const h = Number(altoMedio);
  if (!Number.isFinite(W) || W <= 0) return 0;
  if (!Number.isFinite(h) || h <= 0) return Number(W.toFixed(2));
  const radio = h / 2 + (W * W) / (8 * h);
  const angulo = 4 * Math.atan((2 * h) / W);
  return Number((radio * angulo).toFixed(2));
}

function EstructurasPage() {
  const [filas, setFilas] = useState(4);
  const [columnas, setColumnas] = useState(4);
  const [matriz, setMatriz] = useState(() => crearMatriz(4, 4, true));
  const [filaCumbrera, setFilaCumbrera] = useState(2);

  // Parámetros de alturas y taller
  const [params, setParams] = useState({
    alturaMaxima: 4.0,
    desnivelPorFila: 0.2,
    largoComercial: 6.0,
    margenCorte: 0.0,
    largoCarevaca: 0.3,
    largoBasePerimetral: 1.0,
    largoBaseInterna: 1.0,
    largoCacho: 0.4,
    largoFlautin: 0.35
  });

  // Tipos de cercha (Arco + Aleta + Perico, con soporte para múltiples anchos)
  const [tiposCercha, setTiposCercha] = useState([
    {
      id: 'A',
      nombre: 'Cercha Estándar',
      ancho: 6.8,
      altoMedio: 1.2,
      largoAleta: 0.8,
      largoPerico: 0.6,
      esDefault: true,
      naves: []
    }
  ]);

  const [mostrarAvanzado, setMostrarAvanzado] = useState(false);
  const [tabActiva, setTabActiva] = useState('orden'); // 'orden' | 'corte' | 'alturas'
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cambiar tamaño de la retícula preservando celdas seleccionadas
  const handleResize = (nuevasFilas, nuevasCols) => {
    const f = Math.max(1, Math.min(12, Number(nuevasFilas) || 1));
    const c = Math.max(1, Math.min(12, Number(nuevasCols) || 1));
    setFilas(f);
    setColumnas(c);
    setMatriz((prev) =>
      Array.from({ length: f }, (_, r) =>
        Array.from({ length: c }, (_, col) =>
          prev[r] && prev[r][col] !== undefined ? prev[r][col] : true
        )
      )
    );
    // Limpiar naves fuera de rango en los tipos de cercha adicionales
    setTiposCercha((prev) =>
      prev.map((t) => ({
        ...t,
        naves: t.naves.filter((n) => n < c)
      }))
    );
    if (filaCumbrera > f) {
      setFilaCumbrera(Math.floor((f + 1) / 2));
    }
  };

  // Alternar estado de una celda (nave)
  const toggleCelda = (r, c) => {
    setMatriz((prev) =>
      prev.map((fila, ri) =>
        ri === r ? fila.map((val, ci) => (ci === c ? !val : val)) : fila
      )
    );
  };

  const marcarTodas = (valor) => {
    setMatriz(crearMatriz(filas, columnas, valor));
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  // Gestión de múltiples tipos de cercha
  const actualizarTipoCercha = (id, campo, valor) => {
    setTiposCercha((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, [campo]: campo === 'nombre' ? valor : valor === '' ? '' : Number(valor) }
          : t
      )
    );
  };

  const agregarTipoCercha = () => {
    const siguienteLetra = String.fromCharCode(65 + tiposCercha.length);
    setTiposCercha((prev) => [
      ...prev,
      {
        id: `${siguienteLetra}-${Date.now()}`,
        nombre: `Cercha Tipo ${siguienteLetra}`,
        ancho: 5.5,
        altoMedio: 1.0,
        largoAleta: 0.8,
        largoPerico: 0.6,
        esDefault: false,
        naves: columnas > 0 ? [columnas - 1] : []
      }
    ]);
  };

  const eliminarTipoCercha = (id) => {
    setTiposCercha((prev) => prev.filter((t) => t.id !== id));
  };

  // Asigna o desasigna una nave (columna) a un tipo de cercha específico
  const toggleNaveEnTipoCercha = (tipoId, colIndex) => {
    setTiposCercha((prev) =>
      prev.map((t) => {
        if (t.esDefault) return t;
        if (t.id === tipoId) {
          const yaEsta = t.naves.includes(colIndex);
          return {
            ...t,
            naves: yaEsta
              ? t.naves.filter((n) => n !== colIndex)
              : [...t.naves, colIndex].sort((a, b) => a - b)
          };
        }
        // Si estaba en otro tipo adicional, la quitamos de ese otro para evitar duplicados
        return {
          ...t,
          naves: t.naves.filter((n) => n !== colIndex)
        };
      })
    );
  };

  // Helper para saber qué tipo de cercha tiene asignada cada columna en la retícula
  const obtenerTipoDeNave = useCallback(
    (colIndex) => {
      const especifico = tiposCercha.find((t) => !t.esDefault && t.naves.includes(colIndex));
      return especifico || tiposCercha[0];
    },
    [tiposCercha]
  );

  // Llamada al motor de cálculo en el backend
  const calcularEstructura = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/estructuras/calcular', {
        matriz,
        filaCumbrera,
        tiposCercha,
        ...params
      });
      if (response.data?.estado === 'success') {
        setResultado(response.data.datos);
      } else {
        throw new Error(response.data?.mensaje || 'Error al calcular la estructura');
      }
    } catch (err) {
      setResultado(null);
      setError(
        err.response?.data?.mensaje ||
          err.message ||
          'No se pudo conectar con el servidor de cálculo (puerto 4000).'
      );
    } finally {
      setLoading(false);
    }
  }, [matriz, filaCumbrera, tiposCercha, params]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calcularEstructura();
    }, 180);
    return () => clearTimeout(timer);
  }, [calcularEstructura]);

  const mapaNodos = useMemo(() => {
    const map = new Map();
    if (resultado?.nodos) {
      resultado.nodos.forEach((n) => map.set(`${n.fila}-${n.columna}`, n));
    }
    return map;
  }, [resultado]);

  const badgeCategoria = (cat) => {
    const estilos = {
      'Postes Perimetrales': 'bg-amber-50 text-amber-700 ring-amber-200/80',
      'Postes Internos': 'bg-sky-50 text-sky-700 ring-sky-200/80',
      Bases: 'bg-slate-100 text-slate-700 ring-slate-200',
      'Pies de Amigo': 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
      'Cerchas / Arcos': 'bg-indigo-50 text-indigo-700 ring-indigo-200/80',
      'Cortes de Taller': 'bg-rose-50 text-rose-700 ring-rose-200/80'
    };
    return estilos[cat] || 'bg-slate-100 text-slate-700 ring-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Barra superior de dimensiones y acciones */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Divisiones (Filas):</label>
            <input
              type="number"
              min={1}
              max={12}
              value={filas}
              onChange={(e) => handleResize(e.target.value, columnas)}
              className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Naves (Cols):</label>
            <input
              type="number"
              min={1}
              max={12}
              value={columnas}
              onChange={(e) => handleResize(filas, e.target.value)}
              className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => marcarTodas(true)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Marcar todo
            </button>
            <button
              type="button"
              onClick={() => marcarTodas(false)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={calcularEstructura}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calculator className="h-4 w-4" />
          )}
          Recalcular BOM
        </button>
      </div>

      {/* Área de trabajo principal: Retícula (izq) + Parámetros separados (der) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* RETÍCULA INTERACTIVA */}
        <section className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs xl:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Grid3x3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Retícula Interactiva de Naves y Nodos
                </h2>
                <p className="text-xs text-slate-500">
                  Haz clic en las celdas para trazar el bloque y elige la fila cumbrera a la izquierda
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="inline-block min-w-full">
              {/* Encabezado de Naves con indicador del ancho de cercha asignado */}
              <div className="mb-2 flex items-center pl-32">
                {Array.from({ length: columnas }, (_, c) => {
                  const tipoNave = obtenerTipoDeNave(c);
                  const esPersonalizada = !tipoNave.esDefault;
                  return (
                    <div
                      key={c}
                      className="flex flex-1 flex-col items-center gap-0.5"
                      style={{ minWidth: '64px' }}
                    >
                      <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                        Nave {c + 1}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                          esPersonalizada
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-200/70 text-slate-500'
                        }`}
                      >
                        {Number(tipoNave.ancho || 0).toFixed(1)}m
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Filas de nodos y celdas intercaladas */}
              <div className="space-y-0">
                {Array.from({ length: filas + 1 }, (_, nr) => {
                  const esCumbrera = nr === filaCumbrera;
                  const alturaEstimada = Number(
                    (
                      (Number(params.alturaMaxima) || 0) -
                      Math.abs(nr - filaCumbrera) * (Number(params.desnivelPorFila) || 0)
                    ).toFixed(2)
                  );

                  return (
                    <div key={nr}>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setFilaCumbrera(nr)}
                          title="Establecer esta fila como Poste Cumbrera (altura máxima)"
                          className={`mr-3 flex w-29 shrink-0 items-center justify-between rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                            esCumbrera
                              ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-400'
                              : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Star
                              className={`h-3 w-3 ${
                                esCumbrera ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
                              }`}
                            />
                            F{nr + 1}
                          </span>
                          <span className="font-mono tabular-nums">{alturaEstimada.toFixed(2)}m</span>
                        </button>

                        <div className="relative flex flex-1 items-center justify-between">
                          <div
                            className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 ${
                              esCumbrera ? 'bg-amber-400/80' : 'bg-slate-200/70'
                            }`}
                          />
                          {Array.from({ length: columnas + 1 }, (_, nc) => {
                            const nodo = mapaNodos.get(`${nr}-${nc}`);
                            const etiquetaTipo = !nodo
                              ? 'Vértice inactivo'
                              : nodo.tipo === 'pie_de_amigo'
                              ? 'PIE DE AMIGO (Pared Lateral)'
                              : nodo.tipo === 'perimetral'
                              ? 'POSTE PERIMETRAL (Frente/Fondo)'
                              : 'POSTE INTERNO';

                            return (
                              <div
                                key={nc}
                                title={
                                  nodo
                                    ? `Nodo F${nr + 1}-C${nc + 1} · ${etiquetaTipo} · Altura: ${nodo.altura.toFixed(2)} m`
                                    : 'Vértice inactivo'
                                }
                                className={`relative z-10 h-3.5 w-3.5 rounded-full border-2 transition-transform ${
                                  !nodo
                                    ? 'border-slate-200 bg-white'
                                    : nodo.tipo === 'pie_de_amigo'
                                    ? 'scale-115 border-white bg-emerald-500 shadow-sm ring-2 ring-emerald-200'
                                    : nodo.tipo === 'perimetral'
                                    ? 'scale-110 border-white bg-amber-400 shadow-sm ring-2 ring-amber-200'
                                    : 'scale-110 border-white bg-sky-500 shadow-sm ring-2 ring-sky-200'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {nr < filas && (
                        <div className="flex items-center pl-32">
                          <div className="flex flex-1 gap-1.5 px-1.5 py-1.5">
                            {Array.from({ length: columnas }, (_, c) => {
                              const activa = matriz[nr]?.[c];
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => toggleCelda(nr, c)}
                                  style={{ minWidth: '54px' }}
                                  className={`flex h-12 flex-1 items-center justify-center rounded-lg border text-xs font-semibold transition-all ${
                                    activa
                                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-xs hover:bg-emerald-500/25'
                                      : 'border-dashed border-slate-300 bg-white/80 text-slate-300 hover:border-slate-400 hover:text-slate-500'
                                  }`}
                                >
                                  {activa ? `D${nr + 1}·N${c + 1}` : '+'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              Pie de Amigo (Paredes Laterales)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-400 ring-2 ring-amber-200" />
              Poste Perimetral (Frente y Fondo)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-sky-500 ring-2 ring-sky-200" />
              Poste Interno
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              Fila Cumbrera (F1..F{filas + 1})
            </span>
          </div>
        </section>

        {/* PANEL DE PARÁMETROS ESTRUCTURALES (3 SECCIONES SEPARADAS) */}
        <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs xl:col-span-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Parámetros Estructurales</h2>
              <p className="text-xs text-slate-500">
                Configura alturas, cerchas por nave y medidas de taller
              </p>
            </div>
          </div>

          {/* BLOQUE 1: ALTURAS Y DESNIVEL DE POSTES */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200/80 text-[11px] font-bold text-slate-700">
                1
              </span>
              <h3 className="text-xs font-bold tracking-wide text-slate-800 uppercase">
                Alturas y Desnivel de Postes
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Altura Máxima Cumbrera (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  name="alturaMaxima"
                  value={params.alturaMaxima}
                  onChange={handleParamChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Desnivel por Fila (m)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  name="desnivelPorFila"
                  value={params.desnivelPorFila}
                  onChange={handleParamChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* BLOQUE 2: CERCHA (ARCO EN EL PISO + ALETA + PERICO) */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200/80 text-[11px] font-bold text-slate-700">
                  2
                </span>
                <div>
                  <h3 className="text-xs font-bold tracking-wide text-slate-800 uppercase">
                    Cercha (Arco, Aleta y Perico)
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={agregarTipoCercha}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Otra medida
              </button>
            </div>

            <div className="space-y-3">
              {tiposCercha.map((cercha) => {
                const largoCalculado = calcularLargoArcoLocal(cercha.ancho, cercha.altoMedio);
                return (
                  <div
                    key={cercha.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            cercha.esDefault
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {cercha.esDefault ? 'Estándar' : 'Nave Angosta'}
                        </span>
                        <input
                          type="text"
                          value={cercha.nombre}
                          onChange={(e) => actualizarTipoCercha(cercha.id, 'nombre', e.target.value)}
                          className="w-36 border-b border-transparent bg-transparent text-xs font-bold text-slate-800 focus:border-slate-300 focus:outline-none"
                        />
                      </div>

                      {!cercha.esDefault && (
                        <button
                          type="button"
                          onClick={() => eliminarTipoCercha(cercha.id)}
                          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Eliminar esta medida de cercha"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                          Ancho de Cercha (m)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          value={cercha.ancho}
                          onChange={(e) => actualizarTipoCercha(cercha.id, 'ancho', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                          Alto Punto Medio (m)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.1"
                          value={cercha.altoMedio}
                          onChange={(e) =>
                            actualizarTipoCercha(cercha.id, 'altoMedio', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                          Largo de Aleta (m)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.05"
                          value={cercha.largoAleta}
                          onChange={(e) =>
                            actualizarTipoCercha(cercha.id, 'largoAleta', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                          Largo de Perico (m)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.05"
                          value={cercha.largoPerico}
                          onChange={(e) =>
                            actualizarTipoCercha(cercha.id, 'largoPerico', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Indicador en vivo del largo exacto del tubo de arco */}
                    <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Ruler className="h-3.5 w-3.5 text-emerald-400" />
                        Largo de tubo para arco:
                      </span>
                      <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                        {largoCalculado.toFixed(2)} m
                      </span>
                    </div>

                    {/* Selector de naves para cerchas adicionales */}
                    {cercha.esDefault ? (
                      <p className="mt-2 text-[11px] text-slate-400">
                        Aplica automáticamente a todas las naves que no tengan otra medida asignada.
                      </p>
                    ) : (
                      <div className="mt-2.5 border-t border-slate-100 pt-2">
                        <p className="mb-1.5 text-[11px] font-semibold text-slate-600">
                          Selecciona a qué naves aplica esta cercha:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from({ length: columnas }, (_, c) => {
                            const seleccionada = cercha.naves.includes(c);
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => toggleNaveEnTipoCercha(cercha.id, c)}
                                className={`rounded-md px-2 py-1 text-[11px] font-bold transition-all ${
                                  seleccionada
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                N{c + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BLOQUE 3: TALLER Y CORTES COMERCIALES */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200/80 text-[11px] font-bold text-slate-700">
                3
              </span>
              <h3 className="text-xs font-bold tracking-wide text-slate-800 uppercase">
                Taller y Cortes Comerciales
              </h3>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Tubo Comercial Taller (m)
              </label>
              <select
                name="largoComercial"
                value={params.largoComercial}
                onChange={handleParamChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
              >
                <option value={6}>6.00 metros (Estándar)</option>
                <option value={8}>8.00 metros</option>
              </select>
            </div>

            {/* Acordeón de medidas exactas de piezas de taller */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setMostrarAvanzado((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span>Medidas de carevacas, cachos, flautines y bases</span>
                {mostrarAvanzado ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>

              {mostrarAvanzado && (
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 rounded-xl border border-slate-200/70 bg-white p-3">
                  {[
                    { name: 'largoCarevaca', label: 'Carevaca (m)' },
                    { name: 'largoCacho', label: 'Cacho (m)' },
                    { name: 'largoFlautin', label: 'Flautín (m)' },
                    { name: 'largoBasePerimetral', label: 'Base Perimetral (m)' },
                    { name: 'largoBaseInterna', label: 'Base Interna (m)' }
                  ].map((campo) => (
                    <div key={campo.name}>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">
                        {campo.label}
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.05"
                        name={campo.name}
                        value={params[campo.name]}
                        onChange={handleParamChange}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* RESULTADOS DEL CÁLCULO */}
      {resultado && (
        <>
          {/* Tarjetas KPI de Resumen Estructural */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Naves / Celdas Activas
              </span>
              <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
                {resultado.resumen.totalCeldasActivas}
              </p>
              <p className="mt-0.5 text-xs text-emerald-600">
                Cumbrera en Fila {resultado.resumen.filaCumbreraNumero}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Postes y Bases (1:1)
              </span>
              <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
                {resultado.resumen.totalNodosActivos}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                <span className="font-semibold text-emerald-600">
                  {resultado.resumen.totalPiesDeAmigo} pies
                </span>{' '}
                ·{' '}
                <span className="font-semibold text-amber-600">
                  {resultado.resumen.totalNodosPerimetrales} perim.
                </span>{' '}
                ·{' '}
                <span className="font-semibold text-sky-600">
                  {resultado.resumen.totalNodosInternos} int.
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Cerchas ({resultado.resumen.cantidadTiposCercha}{' '}
                {resultado.resumen.cantidadTiposCercha === 1 ? 'medida' : 'medidas'})
              </span>
              <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
                {resultado.resumen.totalCerchas}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {resultado.resumen.cerchasPerimetrales} perim. · {resultado.resumen.cerchasInternas}{' '}
                internas
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Pies de Amigo (2 pzas)
              </span>
              <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
                {resultado.resumen.cantidadPiesDeAmigo}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {resultado.resumen.cantidadPiesDeAmigo * 2} piezas totales (princ. + apoyo)
              </p>
            </div>
          </div>

          {/* Pestañas de Salida: Orden de Compra / Hoja de Corte / Alturas por Fila */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 px-4 pt-3">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setTabActiva('orden')}
                  className={`inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                    tabActiva === 'orden'
                      ? 'border-x border-t border-slate-200 bg-white text-emerald-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Orden de Compra ({resultado.ordenCompra.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTabActiva('corte')}
                  className={`inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                    tabActiva === 'corte'
                      ? 'border-x border-t border-slate-200 bg-white text-emerald-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Scissors className="h-4 w-4" />
                  Hoja de Corte Taller ({params.largoComercial}m)
                </button>
                <button
                  type="button"
                  onClick={() => setTabActiva('alturas')}
                  className={`inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                    tabActiva === 'alturas'
                      ? 'border-x border-t border-slate-200 bg-white text-emerald-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  Alturas por Fila
                </button>
              </div>
              <span className="hidden items-center gap-1 pb-2 text-[11px] font-medium text-emerald-700 md:inline-flex">
                <Sparkles className="h-3.5 w-3.5" />
                Cálculo exacto listo para compra y taller
              </span>
            </div>

            {/* TAB 1: ORDEN DE COMPRA CONSOLIDADA */}
            {tabActiva === 'orden' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3.5">Categoría</th>
                      <th className="px-5 py-3.5">Cantidad a Pedir</th>
                      <th className="px-5 py-3.5">Medida Exacta</th>
                      <th className="px-5 py-3.5">Diámetro y Espesor</th>
                      <th className="px-5 py-3.5">Destino Exacto en Obra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultado.ordenCompra.map((item, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${badgeCategoria(
                              item.categoria
                            )}`}
                          >
                            {item.categoria}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap tabular-nums">
                          {item.cantidad}{' '}
                          <span className="text-xs font-normal text-slate-500">{item.unidad}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {item.medidaExacta}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-800">
                            {item.especificacion}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">{item.destino}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: HOJA DE CORTE TALLER */}
            {tabActiva === 'corte' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3.5">Elemento</th>
                      <th className="px-5 py-3.5">Especificación</th>
                      <th className="px-5 py-3.5">Piezas × Corte</th>
                      <th className="px-5 py-3.5">Metros Lineales</th>
                      <th className="px-5 py-3.5">Tubos ({params.largoComercial}m)</th>
                      <th className="px-5 py-3.5">Patrón / Retazo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultado.hojaCorte.map((corte, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{corte.nombre}</td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-800">
                            {corte.especificacion}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-700 tabular-nums">
                          {corte.detalleMedidas ||
                            `${corte.cantidadPiezas} pzas × ${Number(corte.largoPieza || 0).toFixed(2)} m`}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">
                          {corte.totalMetrosLineales.toFixed(2)} m
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/70">
                            {corte.tubosNecesarios} tubos
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          {corte.patronTexto ||
                            `${corte.piezasPorTubo} pzas/tubo · Retazo: ${Number(corte.retazoPorTubo || 0).toFixed(2)} m/tubo`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: DESNIVELES SIMÉTRICOS POR FILA */}
            {tabActiva === 'alturas' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3.5">Fila de Nodos</th>
                      <th className="px-5 py-3.5">Distancia a Cumbrera</th>
                      <th className="px-5 py-3.5">Altura Poste</th>
                      <th className="px-5 py-3.5">Apoyo Pie (+1.10m)</th>
                      <th className="px-5 py-3.5">Pies de Amigo</th>
                      <th className="px-5 py-3.5">Postes Perimetrales</th>
                      <th className="px-5 py-3.5">Postes Internos</th>
                      <th className="px-5 py-3.5">Total Nodos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultado.alturasPorFila.map((fila) => (
                      <tr
                        key={fila.filaIndice}
                        className={fila.esCumbrera ? 'bg-amber-50/50' : 'hover:bg-slate-50/70'}
                      >
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          Fila {fila.filaNumero}{' '}
                          {fila.esCumbrera && (
                            <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              Cumbrera
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600 tabular-nums">
                          {fila.distanciaCumbrera === 0
                            ? '0 (Punto más alto)'
                            : `${fila.distanciaCumbrera} fila(s) · -${(
                                fila.distanciaCumbrera * Number(params.desnivelPorFila)
                              ).toFixed(2)} m`}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-sm font-bold text-emerald-700">
                          {fila.altura.toFixed(2)} m
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">
                          {fila.piesDeAmigo > 0
                            ? `${Number(fila.alturaApoyoPie || fila.altura + 1.1).toFixed(2)} m`
                            : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-emerald-700 tabular-nums">
                          {fila.piesDeAmigo}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-amber-700 tabular-nums">
                          {fila.postesPerimetrales}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-sky-700 tabular-nums">
                          {fila.postesInternos}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 tabular-nums">
                          {fila.totalPostes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default EstructurasPage;
