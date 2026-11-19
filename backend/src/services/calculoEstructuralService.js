/**
 * Motor de Cálculo Estructural Metalmecánico - Quishpe Constructores
 * Módulo EP-02 / HU-02-01
 *
 * 1. Clasificación topológica de los 3 tipos de nodos estructurales:
 *    - 🟢 Pie de Amigo (Paredes Laterales Izquierda y Derecha): !tieneIzq || !tieneDer
 *    - 🟡 Poste Perimetral (Paredes Frontal y Posterior): tieneIzq && tieneDer && (!tieneArriba || !tieneAbajo)
 *    - 🔵 Poste Interno (Rodeado en los 4 sentidos): tieneIzq && tieneDer && tieneArriba && tieneAbajo
 * 2. Alturas de postes con desnivel simétrico desde la fila cumbrera.
 * 3. Pies de amigo de 2 piezas:
 *    - Poste Principal (2.5" x 2.0 mm): pedido a medida exacta por fila.
 *    - Poste de Apoyo  (2" x 1.5 mm): siempre mide (Altura_Principal + 1.10 m),
 *      calculado automáticamente y consolidado en tubos comerciales de 6m en la Orden de Compra y Hoja de Corte.
 * 4. Cerchas (Arco + Aleta + Perico) con soporte para múltiples anchos por nave.
 * 5. Optimización de cortes en tubos comerciales (6.00 m / 8.00 m).
 * 6. Consolidación de Orden de Compra y Hoja de Corte para taller.
 */

const DEFAULTS = {
  alturaMaxima: 4.0,
  desnivelPorFila: 0.2,
  anchoArco: 6.8,
  altoMedioArco: 1.2, // Altura del punto medio del arco asentado en el piso (flecha)
  largoComercial: 6.0,
  margenCorte: 0.0,

  // Regla fija de taller: el apoyo del pie de amigo mide 1.10 m más que el poste principal
  incrementoPieApoyo: 1.1,

  // Medidas por defecto de piezas (metros)
  largoBasePerimetral: 1.0,
  largoBaseInterna: 1.0,
  largoCarevaca: 0.3,
  largoCacho: 0.4,
  largoFlautin: 0.35,
  largoAleta: 0.8,
  largoPerico: 0.6,

  // Especificaciones de tubería (diámetro y espesor)
  especPiePrincipal: '2.5" x 2.0 mm',
  especPieApoyo: '2" x 1.5 mm',
  especPostePerimetral: '2.5" x 2.0 mm',
  especPosteInterno: '2" x 1.5 mm',
  especBasePerimetral: '3" x 2.0 mm',
  especBaseInterna: '2.5" x 2.0 mm'
};

/**
 * Calcula la longitud exacta del tubo para un arco circular asentado en el piso,
 * a partir del ancho total de la cercha (W) y el alto en el punto medio (h).
 */
function calcularLargoArco(anchoArco, altoMedioArco) {
  const W = Number(anchoArco);
  const h = Number(altoMedioArco);

  if (!Number.isFinite(W) || W <= 0) return 0;
  if (!Number.isFinite(h) || h <= 0) return Number(W.toFixed(2));

  const radio = h / 2 + (W * W) / (8 * h);
  const angulo = 4 * Math.atan((2 * h) / W);
  const longitudArco = radio * angulo;

  return Number(longitudArco.toFixed(2));
}

/**
 * Optimiza el corte de elementos de longitud uniforme en tubos comerciales (ej. 6.00 m).
 */
function calcularOptimizacionCorte({
  nombre,
  cantidadPiezas,
  largoPieza,
  especificacion,
  destino,
  largoComercial,
  margenCorte
}) {
  if (cantidadPiezas <= 0 || largoPieza <= 0) {
    return null;
  }

  const largoEfectivo = Number(largoPieza) + Number(margenCorte || 0);
  const totalMetrosLineales = Number((cantidadPiezas * largoEfectivo).toFixed(2));
  const tubosNecesarios = Math.ceil(totalMetrosLineales / largoComercial);
  const piezasPorTubo = Math.floor(largoComercial / largoEfectivo);
  const retazoPorTubo =
    piezasPorTubo > 0
      ? Number((largoComercial - piezasPorTubo * largoEfectivo).toFixed(2))
      : 0;
  const metrosComprados = Number((tubosNecesarios * largoComercial).toFixed(2));
  const sobranteTotal = Number(Math.max(0, metrosComprados - totalMetrosLineales).toFixed(2));

  return {
    nombre,
    cantidadPiezas,
    largoPieza: Number(largoPieza),
    detalleMedidas: `${cantidadPiezas} pzas × ${Number(largoPieza).toFixed(2)} m`,
    totalMetrosLineales,
    largoComercial,
    tubosNecesarios,
    piezasPorTubo,
    retazoPorTubo,
    sobranteTotal,
    patronTexto: `${piezasPorTubo} pzas/tubo · Retazo: ${retazoPorTubo.toFixed(2)} m/tubo`,
    especificacion,
    destino
  };
}

/**
 * Optimiza el corte cuando un mismo perfil tiene varias medidas (ej. Apoyo de Pie de Amigo
 * por desnivel de filas, o Aletas/Pericos de distintos anchos de cercha).
 */
function calcularOptimizacionCorteVariable({
  nombre,
  items, // [{ cantidad, largo, etiqueta }]
  especificacion,
  destinoBase,
  largoComercial,
  margenCorte
}) {
  const validos = items.filter((i) => i.cantidad > 0 && i.largo > 0);
  if (validos.length === 0) return null;

  // Si todos tienen la misma medida exacta, usamos el cálculo uniforme estándar
  const medidasUnicas = new Set(validos.map((i) => Number(i.largo).toFixed(2)));
  if (medidasUnicas.size === 1) {
    const cantidadTotal = validos.reduce((acc, i) => acc + i.cantidad, 0);
    const largoUnico = Number(validos[0].largo);
    return calcularOptimizacionCorte({
      nombre,
      cantidadPiezas: cantidadTotal,
      largoPieza: largoUnico,
      especificacion,
      destino: destinoBase,
      largoComercial,
      margenCorte
    });
  }

  let cantidadPiezas = 0;
  let totalMetrosLineales = 0;

  validos.forEach((item) => {
    const largoEfectivo = Number(item.largo) + Number(margenCorte || 0);
    cantidadPiezas += item.cantidad;
    totalMetrosLineales += item.cantidad * largoEfectivo;
  });

  totalMetrosLineales = Number(totalMetrosLineales.toFixed(2));
  const tubosNecesarios = Math.ceil(totalMetrosLineales / largoComercial);
  const metrosComprados = Number((tubosNecesarios * largoComercial).toFixed(2));
  const sobranteTotal = Number(Math.max(0, metrosComprados - totalMetrosLineales).toFixed(2));

  const resumenCortes = validos
    .map((i) => `${i.cantidad} de ${Number(i.largo).toFixed(2)}m`)
    .join(', ');

  return {
    nombre,
    cantidadPiezas,
    largoPieza: null,
    detalleMedidas: resumenCortes,
    totalMetrosLineales,
    largoComercial,
    tubosNecesarios,
    piezasPorTubo: null,
    retazoPorTubo: null,
    sobranteTotal,
    patronTexto: `Cortes variables (${resumenCortes}) · Sobrante est.: ${sobranteTotal.toFixed(2)} m`,
    especificacion,
    destino: `${destinoBase} (${resumenCortes})`
  };
}

/**
 * Función principal del motor de cálculo estructural.
 */
function calcularEstructuraInvernadero(params) {
  const config = { ...DEFAULTS, ...params };
  const { matriz } = config;

  if (!Array.isArray(matriz) || matriz.length === 0 || !Array.isArray(matriz[0])) {
    throw new Error('La matriz de celdas debe ser un arreglo bidimensional válido.');
  }

  const numFilasCeldas = matriz.length;
  const numColsCeldas = matriz[0].length;
  const numFilasNodos = numFilasCeldas + 1;
  const numColsNodos = numColsCeldas + 1;

  const filaCumbrera =
    config.filaCumbrera !== undefined && config.filaCumbrera !== null
      ? Number(config.filaCumbrera)
      : Math.floor(numFilasNodos / 2);

  if (filaCumbrera < 0 || filaCumbrera >= numFilasNodos) {
    throw new Error(
      `La fila cumbrera (${filaCumbrera}) debe estar entre 0 y ${numFilasNodos - 1}.`
    );
  }

  const alturaMaxima = Number(config.alturaMaxima);
  const desnivelPorFila = Number(config.desnivelPorFila);
  const largoComercial = Number(config.largoComercial) || 6.0;
  const margenCorte = Number(config.margenCorte) || 0;
  const incrementoPieApoyo = Number(config.incrementoPieApoyo) || 1.1;

  const esCeldaActiva = (r, c) => {
    if (r < 0 || r >= numFilasCeldas || c < 0 || c >= numColsCeldas) return false;
    return Boolean(matriz[r][c]);
  };

  let totalCeldasActivas = 0;
  for (let r = 0; r < numFilasCeldas; r++) {
    for (let c = 0; c < numColsCeldas; c++) {
      if (esCeldaActiva(r, c)) totalCeldasActivas++;
    }
  }

  if (totalCeldasActivas === 0) {
    throw new Error('Debe seleccionar al menos una celda (nave) activa en la retícula.');
  }

  // =========================================================================
  // 1 y 2. CLASIFICACIÓN DE NODOS Y ALTURAS SIMÉTRICAS POR FILA
  // =========================================================================
  const nodos = [];
  const alturasPorFila = [];

  const mapaPiesDeAmigo = new Map();
  const mapaPostesPerimetrales = new Map();
  const mapaPostesInternos = new Map();

  let totalPiesDeAmigo = 0;
  let totalNodosPerimetrales = 0;
  let totalNodosInternos = 0;

  const registrarEnMapa = (mapa, altura, filaNum) => {
    if (!mapa.has(altura)) {
      mapa.set(altura, { cantidad: 0, filas: new Set() });
    }
    const grupo = mapa.get(altura);
    grupo.cantidad++;
    grupo.filas.add(filaNum);
  };

  for (let nr = 0; nr < numFilasNodos; nr++) {
    const distanciaCumbrera = Math.abs(nr - filaCumbrera);
    const alturaFila = Number((alturaMaxima - distanciaCumbrera * desnivelPorFila).toFixed(2));

    if (alturaFila <= 0) {
      throw new Error(
        `La fila ${nr + 1} resulta con altura no positiva (${alturaFila} m). Reduzca el desnivel o aumente la altura máxima.`
      );
    }

    let filaPiesDeAmigo = 0;
    let filaPerimetrales = 0;
    let filaInternos = 0;

    for (let nc = 0; nc < numColsNodos; nc++) {
      const tl = esCeldaActiva(nr - 1, nc - 1);
      const tr = esCeldaActiva(nr - 1, nc);
      const bl = esCeldaActiva(nr, nc - 1);
      const br = esCeldaActiva(nr, nc);

      const adyacentes = (tl ? 1 : 0) + (tr ? 1 : 0) + (bl ? 1 : 0) + (br ? 1 : 0);
      if (adyacentes === 0) continue;

      const tieneIzq = tl || bl;
      const tieneDer = tr || br;
      const tieneArriba = tl || tr;
      const tieneAbajo = bl || br;

      let tipo;
      if (!tieneIzq || !tieneDer) {
        tipo = 'pie_de_amigo';
        totalPiesDeAmigo++;
        filaPiesDeAmigo++;
        registrarEnMapa(mapaPiesDeAmigo, alturaFila, nr + 1);
      } else if (!tieneArriba || !tieneAbajo) {
        tipo = 'perimetral';
        totalNodosPerimetrales++;
        filaPerimetrales++;
        registrarEnMapa(mapaPostesPerimetrales, alturaFila, nr + 1);
      } else {
        tipo = 'interno';
        totalNodosInternos++;
        filaInternos++;
        registrarEnMapa(mapaPostesInternos, alturaFila, nr + 1);
      }

      nodos.push({
        fila: nr,
        columna: nc,
        adyacentes,
        tipo,
        altura: alturaFila,
        esCumbrera: nr === filaCumbrera
      });
    }

    if (filaPiesDeAmigo > 0 || filaPerimetrales > 0 || filaInternos > 0) {
      alturasPorFila.push({
        filaIndice: nr,
        filaNumero: nr + 1,
        esCumbrera: nr === filaCumbrera,
        distanciaCumbrera,
        altura: alturaFila,
        alturaApoyoPie: Number((alturaFila + incrementoPieApoyo).toFixed(2)),
        piesDeAmigo: filaPiesDeAmigo,
        postesPerimetrales: filaPerimetrales,
        postesInternos: filaInternos,
        totalPostes: filaPiesDeAmigo + filaPerimetrales + filaInternos
      });
    }
  }

  const totalNodosActivos = totalPiesDeAmigo + totalNodosPerimetrales + totalNodosInternos;
  const totalBasesPerimetrales = totalPiesDeAmigo + totalNodosPerimetrales;
  const totalBasesInternas = totalNodosInternos;

  // =========================================================================
  // 3. PIES DE AMIGO (APOYO = ALTURA PRINCIPAL + 1.10 m, EN TUBOS DE 6 m)
  // =========================================================================
  const itemsApoyoPie = Array.from(mapaPiesDeAmigo.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([alturaPrincipal, info]) => ({
      cantidad: info.cantidad,
      largo: Number((alturaPrincipal + incrementoPieApoyo).toFixed(2)),
      alturaPrincipal,
      filas: Array.from(info.filas).sort((a, b) => a - b)
    }));

  const corteApoyosPie = calcularOptimizacionCorteVariable({
    nombre: 'Apoyo de Pies de Amigo',
    items: itemsApoyoPie,
    especificacion: config.especPieApoyo,
    destinoBase: 'Para apoyo de pies de amigo (Altura + 1.10 m)',
    largoComercial,
    margenCorte
  });

  const piesDeAmigo = {
    cantidadConjuntos: totalPiesDeAmigo,
    incrementoApoyo: incrementoPieApoyo,
    postePrincipal: {
      cantidad: totalPiesDeAmigo,
      especificacion: config.especPiePrincipal
    },
    posteApoyo: {
      cantidad: totalPiesDeAmigo,
      especificacion: config.especPieApoyo,
      detallePorMedida: itemsApoyoPie,
      tubosComerciales: corteApoyosPie ? corteApoyosPie.tubosNecesarios : 0
    }
  };

  // =========================================================================
  // 4. CERCHAS (ARCO + ALETA + PERICO) CON MÚLTIPLES ANCHOS POR NAVE
  // =========================================================================
  const tiposCerchaEntrada =
    Array.isArray(config.tiposCercha) && config.tiposCercha.length > 0
      ? config.tiposCercha
      : [
          {
            id: 'A',
            nombre: 'Cercha Estándar',
            ancho: Number(config.anchoArco),
            altoMedio: Number(config.altoMedioArco),
            largoAleta: Number(config.largoAleta),
            largoPerico: Number(config.largoPerico),
            esDefault: true,
            naves: []
          }
        ];

  const tiposNormalizados = tiposCerchaEntrada.map((t, idx) => ({
    id: t.id || String.fromCharCode(65 + idx),
    nombre:
      t.nombre ||
      (idx === 0 ? 'Cercha Estándar' : `Cercha Tipo ${String.fromCharCode(65 + idx)}`),
    ancho: Number(t.ancho) || Number(config.anchoArco),
    altoMedio: Number(t.altoMedio) || Number(config.altoMedioArco),
    largoAleta:
      t.largoAleta !== undefined && t.largoAleta !== ''
        ? Number(t.largoAleta)
        : Number(config.largoAleta),
    largoPerico:
      t.largoPerico !== undefined && t.largoPerico !== ''
        ? Number(t.largoPerico)
        : Number(config.largoPerico),
    largoArco: calcularLargoArco(t.ancho || config.anchoArco, t.altoMedio || config.altoMedioArco),
    esDefault: idx === 0 || Boolean(t.esDefault),
    navesAsignadas: Array.isArray(t.naves) ? t.naves.map(Number) : []
  }));

  const tipoDefault = tiposNormalizados.find((t) => t.esDefault) || tiposNormalizados[0];

  const obtenerTipoCerchaDeNave = (colIndex) => {
    const especifico = tiposNormalizados.find(
      (t) => !t.esDefault && t.navesAsignadas.includes(colIndex)
    );
    return especifico || tipoDefault;
  };

  const mapaCerchasPorTipo = new Map();
  tiposNormalizados.forEach((t) => {
    mapaCerchasPorTipo.set(t.id, {
      id: t.id,
      nombre: t.nombre,
      ancho: t.ancho,
      altoMedio: t.altoMedio,
      largoArco: t.largoArco,
      largoAleta: t.largoAleta,
      largoPerico: t.largoPerico,
      perimetrales: 0,
      internas: 0,
      navesUsadas: new Set()
    });
  });

  let cerchasPerimetrales = 0;
  let cerchasInternas = 0;

  for (let nr = 0; nr < numFilasNodos; nr++) {
    for (let c = 0; c < numColsCeldas; c++) {
      const celdaArriba = esCeldaActiva(nr - 1, c);
      const celdaAbajo = esCeldaActiva(nr, c);

      if (!celdaArriba && !celdaAbajo) continue;

      const tipoCercha = obtenerTipoCerchaDeNave(c);
      const acum = mapaCerchasPorTipo.get(tipoCercha.id);
      acum.navesUsadas.add(c + 1);

      if (celdaArriba && celdaAbajo) {
        cerchasInternas++;
        acum.internas++;
      } else {
        cerchasPerimetrales++;
        acum.perimetrales++;
      }
    }
  }

  const detalleCerchasPorTipo = Array.from(mapaCerchasPorTipo.values())
    .filter((item) => item.perimetrales > 0 || item.internas > 0)
    .map((item) => ({
      ...item,
      total: item.perimetrales + item.internas,
      navesUsadas: Array.from(item.navesUsadas).sort((a, b) => a - b)
    }));

  const totalCerchas = cerchasPerimetrales + cerchasInternas;
  const totalCarevacas = totalNodosActivos; // 1 carevaca soldada en la punta de cada poste y pie de amigo
  const totalCachos = totalNodosActivos;
  const totalFlautines = totalCerchas * 2;

  // =========================================================================
  // 5. OPTIMIZACIÓN DE CORTES EN TUBOS COMERCIALES (6 METROS)
  // =========================================================================
  const itemsAletas = detalleCerchasPorTipo.map((g) => ({
    cantidad: g.internas,
    largo: g.largoAleta
  }));

  const itemsPericos = detalleCerchasPorTipo.map((g) => ({
    cantidad: g.total,
    largo: g.largoPerico
  }));

  const hojaCorte = [
    corteApoyosPie,
    calcularOptimizacionCorte({
      nombre: 'Carevacas',
      cantidadPiezas: totalCarevacas,
      largoPieza: config.largoCarevaca,
      especificacion: '1 3/4" x 2.0 mm',
      destino: 'Para carevacas (punta de postes y pies de amigo donde ancla la cercha)',
      largoComercial: 6.0, // La carevaca siempre se compra en tubos de 6.00 metros
      margenCorte
    }),
    calcularOptimizacionCorte({
      nombre: 'Cachos',
      cantidadPiezas: totalCachos,
      largoPieza: config.largoCacho,
      especificacion: '2" x 2.0 mm',
      destino: 'Para cachos de conexión en nodos',
      largoComercial,
      margenCorte
    }),
    calcularOptimizacionCorte({
      nombre: 'Flautines',
      cantidadPiezas: totalFlautines,
      largoPieza: config.largoFlautin,
      especificacion: '1.5" x 2.0 mm',
      destino: 'Para flautines de cerchas',
      largoComercial,
      margenCorte
    }),
    calcularOptimizacionCorteVariable({
      nombre: 'Aletas Internas',
      items: itemsAletas,
      especificacion: '2" x 1.5 mm',
      destinoBase: 'Para aletas de cerchas internas',
      largoComercial,
      margenCorte
    }),
    calcularOptimizacionCorteVariable({
      nombre: 'Pericos (Perimetrales + Internos)',
      items: itemsPericos,
      especificacion: '1.5" x 1.5 mm',
      destinoBase: `Para pericos (${cerchasPerimetrales} perimetrales + ${cerchasInternas} internos)`,
      largoComercial,
      margenCorte
    })
  ].filter(Boolean);

  // =========================================================================
  // 6. CONSOLIDACIÓN DE LA ORDEN DE COMPRA
  // =========================================================================
  const ordenCompra = [];

  // 6.1 Pies de Amigo - Poste Principal (a medida exacta por fila)
  Array.from(mapaPiesDeAmigo.entries())
    .sort((a, b) => b[0] - a[0])
    .forEach(([altura, info]) => {
      const filasTexto = Array.from(info.filas)
        .sort((a, b) => a - b)
        .join(', ');
      ordenCompra.push({
        categoria: 'Pies de Amigo',
        cantidad: info.cantidad,
        unidad: 'unidades',
        medidaExacta: `${altura.toFixed(2)} m`,
        especificacion: config.especPiePrincipal,
        destino: `Para pies de amigo - poste principal (Fila${info.filas.size > 1 ? 's' : ''} ${filasTexto})`
      });
    });

  // 6.2 Postes Perimetrales (Paredes frontal y posterior)
  Array.from(mapaPostesPerimetrales.entries())
    .sort((a, b) => b[0] - a[0])
    .forEach(([altura, info]) => {
      const filasTexto = Array.from(info.filas)
        .sort((a, b) => a - b)
        .join(', ');
      ordenCompra.push({
        categoria: 'Postes Perimetrales',
        cantidad: info.cantidad,
        unidad: 'unidades',
        medidaExacta: `${altura.toFixed(2)} m`,
        especificacion: config.especPostePerimetral,
        destino: `Para postes perimetrales frente/fondo (Fila${info.filas.size > 1 ? 's' : ''} ${filasTexto})`
      });
    });

  // 6.3 Postes Internos
  Array.from(mapaPostesInternos.entries())
    .sort((a, b) => b[0] - a[0])
    .forEach(([altura, info]) => {
      const filasTexto = Array.from(info.filas)
        .sort((a, b) => a - b)
        .join(', ');
      ordenCompra.push({
        categoria: 'Postes Internos',
        cantidad: info.cantidad,
        unidad: 'unidades',
        medidaExacta: `${altura.toFixed(2)} m`,
        especificacion: config.especPosteInterno,
        destino: `Para postes internos (Fila${info.filas.size > 1 ? 's' : ''} ${filasTexto})`
      });
    });

  // 6.4 Bases (correspondencia 1 a 1)
  if (totalBasesPerimetrales > 0) {
    ordenCompra.push({
      categoria: 'Bases',
      cantidad: totalBasesPerimetrales,
      unidad: 'unidades',
      medidaExacta: `${Number(config.largoBasePerimetral).toFixed(2)} m`,
      especificacion: config.especBasePerimetral,
      destino: `Para bases perimetrales (${totalPiesDeAmigo} pies de amigo + ${totalNodosPerimetrales} postes perimetrales)`
    });
  }

  if (totalBasesInternas > 0) {
    ordenCompra.push({
      categoria: 'Bases',
      cantidad: totalBasesInternas,
      unidad: 'unidades',
      medidaExacta: `${Number(config.largoBaseInterna).toFixed(2)} m`,
      especificacion: config.especBaseInterna,
      destino: 'Para bases internas (anclaje de postes internos)'
    });
  }

  // 6.5 Arcos de Cerchas (separados por tamaño/ancho y naves asignadas)
  detalleCerchasPorTipo.forEach((grupo) => {
    const etiquetaNaves =
      grupo.navesUsadas.length === 1
        ? `Nave ${grupo.navesUsadas[0]}`
        : `Naves ${grupo.navesUsadas.join(', ')}`;

    if (grupo.perimetrales > 0) {
      ordenCompra.push({
        categoria: 'Cerchas / Arcos',
        cantidad: grupo.perimetrales,
        unidad: 'unidades',
        medidaExacta: `${grupo.largoArco.toFixed(2)} m`,
        especificacion: '2" x 2.0 mm',
        destino: `Arcos perimetrales · ${grupo.nombre} (Ancho ${grupo.ancho.toFixed(2)} m · ${etiquetaNaves})`
      });
    }

    if (grupo.internas > 0) {
      ordenCompra.push({
        categoria: 'Cerchas / Arcos',
        cantidad: grupo.internas,
        unidad: 'unidades',
        medidaExacta: `${grupo.largoArco.toFixed(2)} m`,
        especificacion: '2" x 1.5 mm',
        destino: `Arcos internos · ${grupo.nombre} (Ancho ${grupo.ancho.toFixed(2)} m · ${etiquetaNaves})`
      });
    }
  });

  // 6.6 Elementos comprados en tubos comerciales (Apoyos de Pie de Amigo, Carevacas, Cachos, Flautines, Aletas, Pericos)
  hojaCorte.forEach((corte) => {
    const esApoyoPie = corte.nombre === 'Apoyo de Pies de Amigo';
    const largoTubo = Number(corte.largoComercial || largoComercial);
    ordenCompra.push({
      categoria: esApoyoPie ? 'Pies de Amigo' : 'Cortes de Taller',
      cantidad: corte.tubosNecesarios,
      unidad: `tubos de ${largoTubo.toFixed(2)} m`,
      medidaExacta: `Tubo ${largoTubo.toFixed(2)} m`,
      especificacion: corte.especificacion,
      destino: `${corte.destino} (${corte.totalMetrosLineales} m lineales)`
    });
  });

  return {
    resumen: {
      totalCeldasActivas,
      totalNodosActivos,
      totalPiesDeAmigo,
      totalNodosPerimetrales,
      totalNodosInternos,
      totalBasesPerimetrales,
      totalBasesInternas,
      cantidadPiesDeAmigo: totalPiesDeAmigo,
      cerchasPerimetrales,
      cerchasInternas,
      totalCerchas,
      largoArcoCalculado: tipoDefault.largoArco,
      cantidadTiposCercha: detalleCerchasPorTipo.length,
      filaCumbreraNumero: filaCumbrera + 1
    },
    nodos,
    alturasPorFila,
    detalleCerchasPorTipo,
    piesDeAmigo,
    hojaCorte,
    ordenCompra
  };
}

module.exports = {
  calcularEstructuraInvernadero,
  calcularLargoArco,
  DEFAULTS
};
