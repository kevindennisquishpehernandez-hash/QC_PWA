const express = require('express');
const router = express.Router();
const estructuraControlador = require('../controllers/estructuraControlador');

// Endpoint de cálculo estructural y despiece BOM (HU-02-01)
router.post('/calcular', estructuraControlador.calcular);

module.exports = router;
