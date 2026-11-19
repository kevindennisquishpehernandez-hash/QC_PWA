import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import EstructurasPage from './pages/EstructurasPage';
import ModuloEnConstruccion from './pages/ModuloEnConstruccion';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/estructuras" element={<EstructurasPage />} />

          <Route
            path="/documentos"
            element={
              <ModuloEnConstruccion
                epica="EP-01 · HU-01-01"
                titulo="Gestión Documental y Cotizaciones"
                descripcion="Automatización y generación ágil de presupuestos, proformas comerciales, actas y documentos técnicos iniciales con exportación estandarizada a PDF."
                criterios={[
                  'CA-01-01.1: Permitir escoger diferentes tipos de formatos de documentos.',
                  'CA-01-01.2: Validación de campos vacíos y tipos de datos al llenar el formulario.',
                  'CA-01-01.3: Exportación estandarizada en formato PDF al finalizar el formulario.'
                ]}
              />
            }
          />

          <Route
            path="/reportes"
            element={
              <ModuloEnConstruccion
                epica="EP-03 · HU-03-01"
                titulo="Reportes de Campo con Lenguaje Natural (PLN)"
                descripcion="Captura de reportes diarios en finca u obra mediante texto libre o dictado por voz, extrayendo automáticamente avances, trabajadores, materiales y almuerzos."
                criterios={[
                  'CA-03-01.1: Conversión precisa de audio dictado a texto (Reconocimiento de voz).',
                  'CA-03-01.2: Extracción automática de proyecto/finca, trabajadores, materiales, avances y almuerzos.',
                  'CA-03-01.3: Validación conversacional inteligente solicitando datos faltantes.'
                ]}
              />
            }
          />

          <Route
            path="/finanzas"
            element={
              <ModuloEnConstruccion
                epica="EP-04 · HU-04-01 / 02 / 03"
                titulo="Gestión de Costos, Abonos y Rentabilidad"
                descripcion="Trazabilidad detallada de ingresos (abonos de clientes) y egresos (materiales, mano de obra, almuerzos y fletes) con cálculo automático de utilidad neta por obra."
                criterios={[
                  'CA-04-01: Registro de egresos asignados obligatoriamente a un proyecto, por categoría y número de factura.',
                  'CA-04-02: Gestión de abonos parciales, cálculo automático de saldo pendiente e historial cronológico.',
                  'CA-04-03: Balance automático de utilidad neta, margen porcentual y alertas visuales de sobrecosto.'
                ]}
              />
            }
          />

          {/* Cualquier ruta desconocida redirige al Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
