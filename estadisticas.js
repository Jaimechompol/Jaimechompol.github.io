/**
 * Archivo para gestionar las estadísticas y reportes
 * Contiene funciones para procesar datos, generar gráficas y reportes PDF
 */

// Variables globales
let graficaProductos = null;
let graficaPagos = null;
let datosEstadisticas = {
    productos: [],
    pagos: [],
    totalVentas: 0,
    totalPedidos: 0,
    totalPagos: 0,
    ticketPromedio: 0,
    productoTop: ''
};

// Inicializar estadísticas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Configurar eventos
    document.getElementById('periodo-estadisticas').addEventListener('change', cambiarPeriodo);
    document.getElementById('btn-aplicar-fechas').addEventListener('click', aplicarFechasPersonalizadas);
    document.getElementById('btn-generar-reporte').addEventListener('click', generarReportePDF);
    
    // Inicializar con datos de hoy
    cargarEstadisticas('hoy');
});

/**
 * Cambiar periodo de estadísticas
 */
function cambiarPeriodo() {
    const periodo = document.getElementById('periodo-estadisticas').value;
    const fechasPersonalizadas = document.getElementById('fechas-personalizadas');
    
    // Mostrar/ocultar selector de fechas personalizadas
    if (periodo === 'personalizado') {
        fechasPersonalizadas.style.display = 'flex';
    } else {
        fechasPersonalizadas.style.display = 'none';
        cargarEstadisticas(periodo);
    }
}

/**
 * Aplicar fechas personalizadas
 */
function aplicarFechasPersonalizadas() {
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    
    if (!fechaInicio || !fechaFin) {
        alert('Por favor seleccione fechas de inicio y fin');
        return;
    }
    
    cargarEstadisticas('personalizado', fechaInicio, fechaFin);
}

/**
 * Cargar estadísticas según el periodo seleccionado
 * @param {string} periodo - Periodo de tiempo (hoy, semana, mes, personalizado)
 * @param {string} fechaInicio - Fecha de inicio para periodo personalizado
 * @param {string} fechaFin - Fecha de fin para periodo personalizado
 */
function cargarEstadisticas(periodo, fechaInicio = null, fechaFin = null) {
    // Obtener pedidos del historial
    const historial = cargarDatos('historial') || [];
    
    // Obtener pagos de reportes
    const reportesPagos = cargarDatos('reportes_pagos') || [];
    
    // Filtrar pedidos según el periodo
    const pedidosFiltrados = filtrarPedidosPorPeriodo(historial, periodo, fechaInicio, fechaFin);
    
    // Filtrar pagos según el periodo
    const pagosFiltrados = filtrarPagosPorPeriodo(reportesPagos, periodo, fechaInicio, fechaFin);
    
    // Verificar si hay datos para mostrar
    const hayDatos = (pedidosFiltrados.length > 0 || pagosFiltrados.length > 0);
    
    // Mostrar u ocultar mensaje de no hay datos
    const contenedorEstadisticas = document.getElementById('estadisticas-contenido');
    const mensajeNoHayDatos = document.getElementById('mensaje-no-hay-datos') || crearMensajeNoHayDatos();
    
    if (!hayDatos) {
        // Ocultar contenido de estadísticas y mostrar mensaje
        if (contenedorEstadisticas) contenedorEstadisticas.style.display = 'none';
        mensajeNoHayDatos.style.display = 'block';
        return; // No procesar más si no hay datos
    } else {
        // Mostrar contenido de estadísticas y ocultar mensaje
        if (contenedorEstadisticas) contenedorEstadisticas.style.display = 'block';
        mensajeNoHayDatos.style.display = 'none';
    }
    
    // Procesar datos para estadísticas
    procesarDatosEstadisticas(pedidosFiltrados, pagosFiltrados);
    
    // Actualizar interfaz
    actualizarInterfazEstadisticas();
}

/**
 * Crear mensaje de no hay datos
 * @returns {HTMLElement} - Elemento del mensaje
 */
function crearMensajeNoHayDatos() {
    // Verificar si ya existe
    let mensajeElement = document.getElementById('mensaje-no-hay-datos');
    if (mensajeElement) return mensajeElement;
    
    // Crear elemento de mensaje
    mensajeElement = document.createElement('div');
    mensajeElement.id = 'mensaje-no-hay-datos';
    mensajeElement.className = 'mensaje-no-hay-datos';
    mensajeElement.innerHTML = `
        <div class="mensaje-contenido">
            <i class="fas fa-chart-bar mensaje-icono"></i>
            <h3>No hay datos disponibles</h3>
            <p>No se encontraron ventas o pagos en el período seleccionado.</p>
            <p>Prueba seleccionando otro período o realiza algunas ventas primero.</p>
        </div>
    `;
    
    // Insertar antes del contenido de estadísticas
    const seccionEstadisticas = document.querySelector('.seccion-estadisticas');
    if (seccionEstadisticas) {
        seccionEstadisticas.appendChild(mensajeElement);
    }
    
    return mensajeElement;
}

/**
 * Filtrar pedidos por periodo
 * @param {Array} pedidos - Lista de pedidos
 * @param {string} periodo - Periodo de tiempo
 * @param {string} fechaInicio - Fecha de inicio para periodo personalizado
 * @param {string} fechaFin - Fecha de fin para periodo personalizado
 * @returns {Array} - Pedidos filtrados
 */
function filtrarPedidosPorPeriodo(pedidos, periodo, fechaInicio, fechaFin) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo como inicio de semana
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    return pedidos.filter(pedido => {
        const fechaPedido = new Date(pedido.fecha);
        fechaPedido.setHours(0, 0, 0, 0);
        
        switch (periodo) {
            case 'hoy':
                return fechaPedido.getTime() === hoy.getTime();
            case 'semana':
                return fechaPedido >= inicioSemana;
            case 'mes':
                return fechaPedido >= inicioMes;
            case 'personalizado':
                const inicio = new Date(fechaInicio);
                inicio.setHours(0, 0, 0, 0);
                const fin = new Date(fechaFin);
                fin.setHours(23, 59, 59, 999);
                return fechaPedido >= inicio && fechaPedido <= fin;
            default:
                return true;
        }
    });
}

/**
 * Filtrar pagos por periodo
 * @param {Array} pagos - Lista de pagos
 * @param {string} periodo - Periodo de tiempo
 * @param {string} fechaInicio - Fecha de inicio para periodo personalizado
 * @param {string} fechaFin - Fecha de fin para periodo personalizado
 * @returns {Array} - Pagos filtrados
 */
function filtrarPagosPorPeriodo(pagos, periodo, fechaInicio, fechaFin) {
    // Imprimir para depuración
    console.log('Total de pagos en reportes:', pagos.length);
    console.log('Primer pago:', pagos[0]);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo como inicio de semana
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Filtrar pagos por periodo
    const pagosFiltrados = pagos.filter(pago => {
        if (!pago) return false;
        
        try {
            // Intentar obtener la fecha del pago de varias formas
            let fechaPago;
            
            if (pago.timestamp) {
                // Si hay timestamp, usarlo directamente
                fechaPago = new Date(pago.timestamp);
            } else if (pago.fechaPago) {
                // Si hay fechaPago, convertirla a fecha
                // El formato puede ser DD/MM/YYYY o MM/DD/YYYY dependiendo del navegador
                const partes = pago.fechaPago.split('/');
                if (partes.length === 3) {
                    // Intentar ambos formatos
                    fechaPago = new Date(partes[2], partes[1] - 1, partes[0]); // DD/MM/YYYY
                    if (isNaN(fechaPago.getTime())) {
                        fechaPago = new Date(partes[2], partes[0] - 1, partes[1]); // MM/DD/YYYY
                    }
                } else {
                    fechaPago = new Date(pago.fechaPago);
                }
            } else {
                // Si no hay fecha, usar la fecha actual
                fechaPago = new Date();
            }
            
            // Verificar si la fecha es válida
            if (isNaN(fechaPago.getTime())) {
                console.error('Fecha inválida para pago:', pago);
                return false;
            }
            
            fechaPago.setHours(0, 0, 0, 0);
            
            // Para depuración
            console.log('Fecha del pago:', fechaPago, 'Periodo:', periodo);
            
            switch (periodo) {
                case 'hoy':
                    return fechaPago.getTime() === hoy.getTime();
                case 'semana':
                    return fechaPago >= inicioSemana;
                case 'mes':
                    return fechaPago >= inicioMes;
                case 'personalizado':
                    const inicio = new Date(fechaInicio);
                    inicio.setHours(0, 0, 0, 0);
                    const fin = new Date(fechaFin);
                    fin.setHours(23, 59, 59, 999);
                    return fechaPago >= inicio && fechaPago <= fin;
                default:
                    return true;
            }
        } catch (error) {
            console.error('Error al procesar fecha del pago:', error, pago);
            return false;
        }
    });
    
    // Imprimir para depuración
    console.log('Pagos filtrados:', pagosFiltrados.length);
    
    return pagosFiltrados;
}

/**
 * Procesar datos para estadísticas
 * @param {Array} pedidos - Lista de pedidos filtrados
 * @param {Array} pagos - Lista de pagos filtrados
 */
function procesarDatosEstadisticas(pedidos, pagos) {
    console.log('Procesando datos para estadísticas:');
    console.log('Pedidos filtrados:', pedidos.length);
    console.log('Pagos filtrados:', pagos.length);
    
    // Reiniciar datos
    datosEstadisticas = {
        productos: [],
        pagos: [],
        totalVentas: 0,
        totalPedidos: pedidos.length,
        totalPagos: pagos.length,
        ticketPromedio: 0,
        productoTop: '-'
    };
    
    // Mapa para contar productos
    const productosMap = new Map();
    
    // Mapa para agrupar pagos por día
    const pagosMap = new Map();
    
    // Procesar cada pedido
    pedidos.forEach(pedido => {
        if (!pedido || typeof pedido.total !== 'number') return;
        
        // Sumar al total de ventas
        datosEstadisticas.totalVentas += pedido.total;
        
        // Procesar items del pedido
        if (pedido.items && Array.isArray(pedido.items)) {
            pedido.items.forEach(item => {
                if (!item) return;
                
                const nombreProducto = item.nombre || 'Producto sin nombre';
                const categoria = item.categoria || 'Sin categoría';
                const cantidad = item.cantidad || 1;
                const precio = item.precio || 0;
                const total = precio * cantidad;
                
                // Actualizar o crear entrada en el mapa
                if (productosMap.has(nombreProducto)) {
                    const producto = productosMap.get(nombreProducto);
                    producto.cantidad += cantidad;
                    producto.total += total;
                } else {
                    productosMap.set(nombreProducto, {
                        nombre: nombreProducto,
                        categoria: categoria,
                        cantidad: cantidad,
                        total: total
                    });
                }
            });
        }
    });
    
    // Procesar cada pago
    pagos.forEach(pago => {
        if (!pago) return;
        
        try {
            // Obtener fecha formateada para agrupar por día
            let fechaFormateada = pago.fechaPago || new Date().toLocaleDateString();
            const monto = pago.monto || 0;
            
            // Para depuración
            console.log('Procesando pago:', pago);
            console.log('Fecha del pago:', fechaFormateada, 'Monto:', monto);
            
            // Actualizar o crear entrada en el mapa de pagos
            if (pagosMap.has(fechaFormateada)) {
                pagosMap.get(fechaFormateada).monto += monto;
                pagosMap.get(fechaFormateada).cantidad += 1;
            } else {
                pagosMap.set(fechaFormateada, {
                    fecha: fechaFormateada,
                    monto: monto,
                    cantidad: 1
                });
            }
            
            // Si el pago tiene productos, procesarlos también
            if (pago.productos && Array.isArray(pago.productos)) {
                pago.productos.forEach(item => {
                    if (!item) return;
                    
                    const nombreProducto = item.nombre || 'Producto sin nombre';
                    const categoria = item.categoria || 'Sin categoría';
                    const cantidad = item.cantidad || 1;
                    const precio = item.precio || 0;
                    const total = precio * cantidad;
                    
                    // Actualizar o crear entrada en el mapa
                    if (productosMap.has(nombreProducto)) {
                        const producto = productosMap.get(nombreProducto);
                        producto.cantidad += cantidad;
                        producto.total += total;
                    } else {
                        productosMap.set(nombreProducto, {
                            nombre: nombreProducto,
                            categoria: categoria,
                            cantidad: cantidad,
                            total: total
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error al procesar pago para estadísticas:', error, pago);
        }
    });
    
    // Convertir mapa de productos a array y ordenar por total
    datosEstadisticas.productos = Array.from(productosMap.values())
        .sort((a, b) => b.total - a.total);
    
    // Convertir mapa de pagos a array y ordenar por fecha
    datosEstadisticas.pagos = Array.from(pagosMap.values())
        .sort((a, b) => {
            try {
                return new Date(a.fecha) - new Date(b.fecha);
            } catch (error) {
                console.error('Error al ordenar pagos por fecha:', error);
                return 0;
            }
        });
    
    // Calcular ticket promedio
    if (datosEstadisticas.totalPedidos > 0) {
        datosEstadisticas.ticketPromedio = datosEstadisticas.totalVentas / datosEstadisticas.totalPedidos;
    }
    
    // Determinar producto más vendido
    if (datosEstadisticas.productos.length > 0) {
        datosEstadisticas.productoTop = datosEstadisticas.productos[0].nombre;
    }
    
    // Imprimir resultados para depuración
    console.log('Productos procesados:', datosEstadisticas.productos.length);
    console.log('Pagos procesados:', datosEstadisticas.pagos.length);
    console.log('Total ventas:', datosEstadisticas.totalVentas);
}

/**
 * Actualizar interfaz con los datos de estadísticas
 */
function actualizarInterfazEstadisticas() {
    // Actualizar valores de resumen
    document.getElementById('total-ventas').textContent = formatearPrecio(datosEstadisticas.totalVentas);
    document.getElementById('total-pedidos').textContent = datosEstadisticas.totalPedidos;
    document.getElementById('ticket-promedio').textContent = formatearPrecio(datosEstadisticas.ticketPromedio);
    document.getElementById('producto-top').textContent = datosEstadisticas.productoTop;
    
    // Actualizar tabla de productos
    actualizarTablaProductos();
    
    // Actualizar gráficas
    actualizarGraficaProductos();
    actualizarGraficaPagos();
}

/**
 * Actualizar tabla de productos
 */
function actualizarTablaProductos() {
    const tbody = document.getElementById('tabla-productos-body');
    tbody.innerHTML = '';
    
    // Si no hay productos, mostrar mensaje
    if (datosEstadisticas.productos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" style="text-align: center; padding: 20px;">No hay datos disponibles para el periodo seleccionado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Calcular porcentaje del total para cada producto
    datosEstadisticas.productos.forEach(producto => {
        const porcentaje = (producto.total / datosEstadisticas.totalVentas) * 100;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.cantidad}</td>
            <td>${formatearPrecio(producto.total)}</td>
            <td>${porcentaje.toFixed(2)}%</td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Actualizar gráfica de productos
 */
function actualizarGraficaProductos() {
    const canvas = document.getElementById('grafica-productos');
    const ctx = canvas.getContext('2d');
    
    // Asegurarnos de que el canvas tenga el tamaño correcto
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.height = 350; // Altura fija para el canvas
    
    // Si no hay datos, mostrar mensaje
    if (datosEstadisticas.productos.length === 0) {
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Mostrar mensaje
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No hay datos disponibles para mostrar', canvas.width / 2, canvas.height / 2);
        
        // Destruir gráfica anterior si existe
        if (graficaProductos) {
            graficaProductos.destroy();
            graficaProductos = null;
        }
        
        return;
    }
    
    // Limitar a los 10 productos más vendidos
    const topProductos = datosEstadisticas.productos.slice(0, 10);
    
    // Preparar datos para la gráfica
    const labels = topProductos.map(p => acortarTexto(p.nombre, 15));
    const datos = topProductos.map(p => p.total);
    const colores = generarColores(topProductos.length);
    
    // Destruir gráfica anterior si existe
    if (graficaProductos) {
        graficaProductos.destroy();
    }
    
    // Crear nueva gráfica
    graficaProductos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: datos,
                backgroundColor: colores,
                borderColor: colores.map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatearPrecio(context.raw);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Actualizar gráfica de pagos
 */
function actualizarGraficaPagos() {
    // Obtener el canvas para la gráfica de pagos
    const canvas = document.getElementById('grafica-pagos');
    if (!canvas) return; // Si no existe el canvas, no hacer nada
    
    const ctx = canvas.getContext('2d');
    
    // Asegurarnos de que el canvas tenga el tamaño correcto
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.height = 350; // Altura fija para el canvas
    
    // Si no hay datos, mostrar mensaje
    if (datosEstadisticas.pagos.length === 0) {
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Destruir gráfica anterior si existe
    if (graficaPagos) {
        graficaPagos.destroy();
    }
    
    // Imprimir datos para depuración
    console.log('Actualizando gráfica de pagos con:', datosEstadisticas.pagos);
    
    // Si no hay datos, mostrar mensaje
    if (datosEstadisticas.pagos.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No hay datos disponibles para generar el reporte', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    // Preparar datos para la gráfica
    const labels = datosEstadisticas.pagos.map(pago => pago.fecha);
    const datos = datosEstadisticas.pagos.map(pago => pago.monto);
    
    // Imprimir datos para depuración
    console.log('Etiquetas para gráfica de pagos:', labels);
    console.log('Datos para gráfica de pagos:', datos);
    
    // Configurar gráfica
    graficaPagos = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pagos ($)',
                data: datos,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Pagos: $' + context.raw.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Generar colores aleatorios para la gráfica
 * @param {number} cantidad - Cantidad de colores a generar
 * @returns {Array} - Array de colores en formato rgba
 */
function generarColores(cantidad) {
    const colores = [];
    const baseColors = [
        'rgba(255, 99, 132, 0.7)',   // Rojo
        'rgba(54, 162, 235, 0.7)',   // Azul
        'rgba(255, 206, 86, 0.7)',   // Amarillo
        'rgba(75, 192, 192, 0.7)',   // Verde azulado
        'rgba(153, 102, 255, 0.7)',  // Púrpura
        'rgba(255, 159, 64, 0.7)',   // Naranja
        'rgba(199, 199, 199, 0.7)',  // Gris
        'rgba(83, 102, 255, 0.7)',   // Azul violeta
        'rgba(255, 99, 71, 0.7)',    // Tomate
        'rgba(60, 179, 113, 0.7)'    // Verde medio
    ];
    
    for (let i = 0; i < cantidad; i++) {
        colores.push(baseColors[i % baseColors.length]);
    }
    
    return colores;
}

/**
 * Generar reporte PDF
 */
function generarReportePDF() {
    // Verificar si hay datos para el reporte
    if (datosEstadisticas.totalPedidos === 0) {
        alert('No hay datos disponibles para generar el reporte');
        return;
    }
    
    // Obtener periodo seleccionado
    const selectPeriodo = document.getElementById('periodo-estadisticas');
    const periodoTexto = selectPeriodo.options[selectPeriodo.selectedIndex].text;
    
    // Crear instancia de jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración de página
    const margenIzq = 15;
    const margenDer = 15;
    const anchoDisponible = doc.internal.pageSize.width - margenIzq - margenDer;
    let posY = 20;
    
    // Título del reporte
    doc.setFontSize(18);
    doc.setTextColor(229, 57, 53); // Color primario
    doc.text('Reporte de Ventas', doc.internal.pageSize.width / 2, posY, { align: 'center' });
    
    // Subtítulo con periodo
    posY += 10;
    doc.setFontSize(12);
    doc.setTextColor(102, 102, 102);
    doc.text(`Periodo: ${periodoTexto}`, doc.internal.pageSize.width / 2, posY, { align: 'center' });
    
    // Fecha de generación
    posY += 7;
    doc.setFontSize(10);
    doc.text(`Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 
             doc.internal.pageSize.width / 2, posY, { align: 'center' });
    
    // Línea separadora
    posY += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margenIzq, posY, doc.internal.pageSize.width - margenDer, posY);
    
    // Resumen de ventas
    posY += 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen de Ventas', margenIzq, posY);
    
    // Datos de resumen
    posY += 10;
    doc.setFontSize(10);
    doc.text(`Total Ventas: ${formatearPrecio(datosEstadisticas.totalVentas)}`, margenIzq, posY);
    posY += 7;
    doc.text(`Pedidos Completados: ${datosEstadisticas.totalPedidos}`, margenIzq, posY);
    posY += 7;
    doc.text(`Ticket Promedio: ${formatearPrecio(datosEstadisticas.ticketPromedio)}`, margenIzq, posY);
    posY += 7;
    doc.text(`Producto Más Vendido: ${datosEstadisticas.productoTop}`, margenIzq, posY);
    
    // Tabla de productos
    posY += 15;
    doc.setFontSize(14);
    doc.text('Detalle de Ventas por Producto', margenIzq, posY);
    
    // Cabecera de tabla
    posY += 10;
    doc.setFillColor(240, 240, 240);
    doc.setDrawColor(200, 200, 200);
    doc.rect(margenIzq, posY - 5, anchoDisponible, 7, 'FD');
    
    // Columnas de la tabla
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const colWidths = [0.35, 0.2, 0.15, 0.15, 0.15]; // Proporciones del ancho disponible
    
    doc.text('Producto', margenIzq + 2, posY);
    doc.text('Categoría', margenIzq + anchoDisponible * colWidths[0] + 2, posY);
    doc.text('Cantidad', margenIzq + anchoDisponible * (colWidths[0] + colWidths[1]) + 2, posY);
    doc.text('Total', margenIzq + anchoDisponible * (colWidths[0] + colWidths[1] + colWidths[2]) + 2, posY);
    doc.text('% del Total', margenIzq + anchoDisponible * (colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]) + 2, posY);
    
    // Filas de la tabla
    posY += 7;
    let colorFila = false;
    
    // Limitar a 20 productos para que quepa en el PDF
    const productosParaReporte = datosEstadisticas.productos.slice(0, 20);
    
    productosParaReporte.forEach((producto, index) => {
        // Verificar si necesitamos una nueva página
        if (posY > doc.internal.pageSize.height - 20) {
            doc.addPage();
            posY = 20;
        }
        
        // Alternar color de fondo
        if (colorFila) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margenIzq, posY - 5, anchoDisponible, 7, 'F');
        }
        colorFila = !colorFila;
        
        // Calcular porcentaje
        const porcentaje = (producto.total / datosEstadisticas.totalVentas) * 100;
        
        // Datos de la fila
        doc.text(acortarTexto(producto.nombre, 30), margenIzq + 2, posY);
        doc.text(acortarTexto(producto.categoria, 15), margenIzq + anchoDisponible * colWidths[0] + 2, posY);
        doc.text(producto.cantidad.toString(), margenIzq + anchoDisponible * (colWidths[0] + colWidths[1]) + 2, posY);
        doc.text(formatearPrecio(producto.total), margenIzq + anchoDisponible * (colWidths[0] + colWidths[1] + colWidths[2]) + 2, posY);
        doc.text(porcentaje.toFixed(2) + '%', margenIzq + anchoDisponible * (colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]) + 2, posY);
        
        posY += 7;
    });
    
    // Pie de página
    posY = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Sistema de Gestión de Pedidos - Reporte generado automáticamente', 
             doc.internal.pageSize.width / 2, posY, { align: 'center' });
    
    // Guardar PDF
    const nombreArchivo = `Reporte_Ventas_${periodoTexto.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
}

/**
 * Acortar texto si es muy largo
 * @param {string} texto - Texto a acortar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto acortado
 */
function acortarTexto(texto, maxLength) {
    if (!texto) return '';
    return texto.length > maxLength ? texto.substring(0, maxLength - 3) + '...' : texto;
}
}

