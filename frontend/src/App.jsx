import React, { useEffect, useState, useCallback } from 'react';
import api from './services/api';

function App() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener clientes con manejo de errores y estado seguro
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/clientes');
      // Validamos que la respuesta contenga el array esperado
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
        'No se pudo conectar con el servidor en http://localhost:4000'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return (
    <div style={styles.container}>
      {/* Header Corporativo PWA */}
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.logoBadge}>🏗️</div>
          <div>
            <h1 style={styles.title}>Quishpe Constructores</h1>
            <p style={styles.subtitle}>Sistema de Gestión & Cálculo Estructural de Invernaderos</p>
          </div>
        </div>

        <button
          style={styles.refreshButton}
          onClick={fetchClientes}
          disabled={loading}
          title="Recargar datos"
        >
          🔄 {loading ? 'Actualizando...' : 'Recargar'}
        </button>
      </header>

      {/* Contenido Principal */}
      <main style={styles.main}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Directorio de Clientes</h2>
            <p style={styles.sectionDesc}>Clientes registrados en la base de datos de Supabase</p>
          </div>
          <span style={styles.counterBadge}>
            {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
          </span>
        </div>

        {/* Estado: Error */}
        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>⚠️ <strong>Error de conexión:</strong> {error}</p>
            <button style={styles.retryButton} onClick={fetchClientes}>
              Reintentar conexión
            </button>
          </div>
        )}

        {/* Estado: Cargando */}
        {loading && !error && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Sincronizando clientes con Supabase...</p>
          </div>
        )}

        {/* Estado: Vacío */}
        {!loading && !error && clientes.length === 0 && (
          <div style={styles.emptyBox}>
            <p style={styles.emptyIcon}>📂</p>
            <h3 style={styles.emptyTitle}>No hay clientes registrados aún</h3>
            <p style={styles.emptySubtitle}>
              Crea registros mediante el endpoint POST o la interfaz para visualizarlos aquí.
            </p>
          </div>
        )}

        {/* Grid de Tarjetas de Clientes */}
        {!loading && !error && clientes.length > 0 && (
          <div style={styles.grid}>
            {clientes.map((cliente, index) => (
              <div key={cliente.id || cliente.id_cliente || index} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>
                    {(cliente.nombres || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.cardHeaderInfo}>
                    <h3 style={styles.clientName}>{cliente.nombres || 'Sin nombre'}</h3>
                    {cliente.empresa && (
                      <span style={styles.companyBadge}>🏢 {cliente.empresa}</span>
                    )}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  {cliente.ruc && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>RUC / CI:</span>
                      <code style={styles.infoCode}>{cliente.ruc}</code>
                    </div>
                  )}

                  {cliente.telefono && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Teléfono:</span>
                      <a href={`tel:${cliente.telefono}`} style={styles.infoLink}>
                        📞 {cliente.telefono}
                      </a>
                    </div>
                  )}

                  {cliente.email && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Email:</span>
                      <a href={`mailto:${cliente.email}`} style={styles.infoLink}>
                        ✉️ {cliente.email}
                      </a>
                    </div>
                  )}

                  {cliente.direccion && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Ubicación:</span>
                      <span style={styles.infoValue}>📍 {cliente.direccion}</span>
                    </div>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.statusPill}>● Activo</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Estilos limpios y responsivos (Dark Theme profesional para PWA)
const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#0b1120',
    color: '#f8fafc',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    textAlign: 'left'
  },
  header: {
    backgroundColor: '#0f172a',
    borderBottom: '1px solid #1e293b',
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  logoBadge: {
    fontSize: '2rem',
    background: '#1e293b',
    padding: '0.5rem',
    borderRadius: '12px',
    border: '1px solid #334155'
  },
  title: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.85rem',
    color: '#94a3b8'
  },
  refreshButton: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    border: '1px solid #334155',
    padding: '0.55rem 1.1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease'
  },
  main: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#f1f5f9'
  },
  sectionDesc: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: '#64748b'
  },
  counterBadge: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '600',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px'
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    padding: '1.25rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  errorText: {
    margin: 0,
    color: '#fca5a5',
    fontSize: '0.9rem'
  },
  retryButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  loadingBox: {
    textAlign: 'center',
    padding: '4rem 1rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto 1rem auto',
    border: '3px solid #1e293b',
    borderTop: '3px solid #0284c7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: '0.95rem'
  },
  emptyBox: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    border: '1px dashed #334155'
  },
  emptyIcon: {
    fontSize: '3rem',
    margin: 0
  },
  emptyTitle: {
    fontSize: '1.1rem',
    color: '#e2e8f0',
    margin: '0.5rem 0'
  },
  emptySubtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem'
  },
  card: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.15s ease, border-color 0.15s ease'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    marginBottom: '1rem'
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#0369a1',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: '700'
  },
  cardHeaderInfo: {
    flex: 1,
    overflow: 'hidden'
  },
  clientName: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  companyBadge: {
    display: 'inline-block',
    marginTop: '0.2rem',
    fontSize: '0.75rem',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.85rem',
    padding: '0.5rem 0',
    borderTop: '1px solid #1e293b',
    borderBottom: '1px solid #1e293b',
    margin: '0.5rem 0'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem'
  },
  infoLabel: {
    color: '#64748b',
    fontSize: '0.78rem'
  },
  infoCode: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontFamily: 'monospace'
  },
  infoLink: {
    color: '#93c5fd',
    textDecoration: 'none',
    fontSize: '0.82rem'
  },
  infoValue: {
    color: '#cbd5e1',
    fontSize: '0.82rem',
    textAlign: 'right'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '0.5rem'
  },
  statusPill: {
    fontSize: '0.72rem',
    color: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: '9999px',
    fontWeight: '500'
  }
};

export default App;
