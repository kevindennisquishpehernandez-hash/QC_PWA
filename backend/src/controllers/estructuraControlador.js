const { calcularEstructuraInvernadero } = require('../services/calculoEstructuralService');

const estructuraControlador = {
  /**
   * POST /api/estructuras/calcular
   * Recibe la matriz de celdas activas y parámetros geométricos,
   * y devuelve la clasificación de nodos, alturas, hoja de corte y orden de compra.
   */
  calcular: async (req, res) => {
    try {
      const { matriz } = req.body;

      if (!Array.isArray(matriz) || matriz.length === 0) {
        return res.status(400).json({
          estado: 'error',
          mensaje: 'Debe enviar una matriz válida de celdas seleccionadas.'
        });
      }

      const resultado = calcularEstructuraInvernadero(req.body);

      res.json({
        estado: 'success',
        mensaje: 'Cálculo estructural y despiece BOM generado con éxito.',
        datos: resultado
      });
    } catch (error) {
      console.error('Error en cálculo estructural:', error.message);
      res.status(400).json({
        estado: 'error',
        mensaje: error.message
      });
    }
  }
};

module.exports = estructuraControlador;
