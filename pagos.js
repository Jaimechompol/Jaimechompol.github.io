/**
 * Archivo para gestionar los pagos de pedidos
 * Contiene funciones para cargar, procesar pagos completos y parciales
 */

// Variables globales para pagos
let itemsSeleccionadosPago = [];
let pedidoPagoActual = null;

// Cargar pagos pendientes
function cargarPagos() {
    const contenedorPagos = document.getElementById('pagos-lista');
    
    // Limpiar contenedor
    contenedorPagos.innerHTML = '';
    
    // Cargar pagos desde localStorage
    const pagos = cargarDatos('pagos') || [];
    
    // Filtrar solo pagos pendientes
    const pagosPendientes = pagos.filter(pago => !pago.completado);
    
    // Ordenar por timestamp (más antiguo primero)
    pagosPendientes.sort((a, b) => a.pedidoOriginal.timestamp - b.pedidoOriginal.timestamp);
    
    // Verificar si hay pagos pendientes
    if (pagosPendientes.length === 0) {
        contenedorPagos.innerHTML = '<p class="mensaje-vacio">No hay pagos pendientes</p>';
        return;
    }
    
    // Agregar pagos al contenedor
    pagosPendientes.forEach(pago => {
        const pagoElement = crearElementoPago(pago);
        contenedorPagos.appendChild(pagoElement);
    });
}

// Crear elemento HTML para un pago
function crearElementoPago(pago) {
    // Determinar si el pago ha sido parcialmente pagado
    const esPagoParcial = pago.pagosRealizados && pago.pagosRealizados.length > 0 && !pago.completado;
    
    // Agregar clase especial si es un pago parcial
    const claseItem = esPagoParcial ? 'pago-item pago-parcial' : 'pago-item';
    const pagoElement = crearElemento('div', { class: claseItem, 'data-id': pago.id });
    
    // Header
    const headerElement = crearElemento('div', { class: 'pago-header' });
    const clienteElement = crearElemento('div', { class: 'pago-cliente' }, `${pago.pedidoOriginal.cliente} - Mesa ${pago.pedidoOriginal.mesa}`);
    const fechaElement = crearElemento('div', { class: 'pago-fecha' }, `${pago.pedidoOriginal.fecha} ${pago.pedidoOriginal.hora}`);
    headerElement.appendChild(clienteElement);
    headerElement.appendChild(fechaElement);
    
    // Productos pendientes
    const productosElement = crearElemento('div', { class: 'pago-productos' });
    
    if (pago.itemsPendientes.length === 0) {
        productosElement.innerHTML = '<p>Todos los productos han sido pagados</p>';
    } else {
        pago.itemsPendientes.forEach(item => {
            const productoElement = crearElemento('div', { class: 'pago-producto' });
            const nombreElement = crearElemento('div', { class: 'pago-producto-nombre' }, 
                `${item.cantidad}x ${item.nombre} ${formatearPrecio(item.precio * item.cantidad)}`);
            productoElement.appendChild(nombreElement);
            
            if (item.detalles) {
                const detallesElement = crearElemento('div', { class: 'pago-producto-detalles' }, item.detalles);
                productoElement.appendChild(detallesElement);
            }
            
            productosElement.appendChild(productoElement);
        });
    }
    
    // Total pendiente
    const totalElement = crearElemento('div', { class: 'pago-total' }, `Pendiente: ${formatearPrecio(pago.totalPendiente)}`);
    
    // Acciones
    const accionesElement = crearElemento('div', { class: 'pago-acciones' });
    
    const btnPagoCompleto = crearElemento('button', { class: 'btn-primario', 'data-id': pago.id }, 'Pago Completo');
    btnPagoCompleto.addEventListener('click', () => procesarPagoCompleto(pago.id));
    
    const btnPagoParcial = crearElemento('button', { class: 'btn-secundario', 'data-id': pago.id }, 'Pago Parcial');
    // Asignar evento para abrir la página de pago parcial directamente
    btnPagoParcial.addEventListener('click', function() {
        console.log('Botón pago parcial clickeado para ID:', pago.id);
        
        // Guardar el ID del pago en sessionStorage para recuperarlo en la página de pago parcial
        sessionStorage.setItem('pago_parcial_id', pago.id);
        
        // Abrir la página de pago parcial
        window.location.href = 'pago-parcial.html';
    });
    
    const btnVerOriginal = crearElemento('button', { class: 'btn-secundario', 'data-id': pago.id }, 'Ver Original');
    btnVerOriginal.addEventListener('click', () => verPedidoOriginal(pago.id));
    
    accionesElement.appendChild(btnPagoCompleto);
    accionesElement.appendChild(btnPagoParcial);
    accionesElement.appendChild(btnVerOriginal);
    
    // Agregar elementos al pago
    pagoElement.appendChild(headerElement);
    pagoElement.appendChild(productosElement);
    pagoElement.appendChild(totalElement);
    pagoElement.appendChild(accionesElement);
    
    return pagoElement;
}

// Procesar pago completo
function procesarPagoCompleto(pagoId) {
    if (!confirm('¿Confirmar pago completo del pedido?')) return;
    
    // Cargar pagos
    let pagos = cargarDatos('pagos') || [];
    
    // Buscar pago
    const index = pagos.findIndex(pago => pago.id === pagoId);
    if (index === -1) return;
    
    // Obtener fecha y hora actuales
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString();
    const horaFormateada = fechaActual.toLocaleTimeString();
    
    // Guardar el ID del pedido original antes de modificarlo
    const pedidoOriginalId = pagos[index].pedidoOriginal.id;
    
    // Marcar como completado
    pagos[index].completado = true;
    pagos[index].fechaCompletado = fechaFormateada;
    pagos[index].horaCompletado = horaFormateada;
    pagos[index].itemsPendientes = [];
    const montoPagado = pagos[index].totalPendiente;
    pagos[index].totalPendiente = 0;
    pagos[index].pagosRealizados.push({
        fecha: fechaFormateada,
        hora: horaFormateada,
        monto: montoPagado,
        tipo: 'completo'
    });
    pagos[index].totalPagado = pagos[index].pedidoOriginal.total;
    
    // Guardar pago en reportes
    guardarPagoEnReportes({
        id: generarId(),
        fechaPago: fechaFormateada,
        horaPago: horaFormateada,
        timestamp: fechaActual.getTime(),
        cliente: pagos[index].pedidoOriginal.cliente,
        mesa: pagos[index].pedidoOriginal.mesa,
        monto: montoPagado,
        tipoPago: 'completo',
        pedidoId: pedidoOriginalId,
        productos: pagos[index].pedidoOriginal.items
    });
    
    // Actualizar o eliminar del historial
    let historial = cargarDatos('historial') || [];
    const pedidoHistorialIndex = historial.findIndex(pedido => pedido.id === pedidoOriginalId);
    
    if (pedidoHistorialIndex !== -1) {
        // Opción 1: Eliminar del historial
        // historial = historial.filter(pedido => pedido.id !== pedidoOriginalId);
        
        // Opción 2: Marcar como pagado en el historial
        historial[pedidoHistorialIndex].pagado = true;
        historial[pedidoHistorialIndex].fechaPagado = fechaFormateada;
        historial[pedidoHistorialIndex].horaPagado = horaFormateada;
        historial[pedidoHistorialIndex].completado = true;
        
        // Guardar historial actualizado
        guardarDatos('historial', historial);
        
        console.log(`Pedido ${pedidoOriginalId} marcado como pagado en el historial`);
    }
    
    // Eliminar de cocina si existe
    let pedidosCocina = cargarDatos('cocina') || [];
    if (pedidosCocina.some(pedido => pedido.id === pedidoOriginalId)) {
        pedidosCocina = pedidosCocina.filter(pedido => pedido.id !== pedidoOriginalId);
        guardarDatos('cocina', pedidosCocina);
        console.log(`Pedido ${pedidoOriginalId} eliminado de cocina al completar pago`);
    }
    
    // Guardar pagos actualizados
    guardarDatos('pagos', pagos);
    
    // Mostrar mensaje de éxito
    alert('Pago completado correctamente');
    
    // Actualizar interfaz de pagos
    cargarPagos();
    
    // Si estamos en la sección de historial, actualizar
    if (document.getElementById('historial').classList.contains('active')) {
        cargarHistorial();
    }
    
    // Si estamos en la sección de cocina, actualizar
    if (document.getElementById('cocina').classList.contains('active')) {
        cargarCocina();
    }
}

// Mostrar modal de pago parcial
function mostrarModalPagoParcial(pagoId) {
    console.log('Mostrando modal de pago parcial para ID:', pagoId);
    
    // Cargar pagos
    const pagos = cargarDatos('pagos') || [];
    console.log('Pagos cargados:', pagos.length);
    
    // Buscar pago
    const pago = pagos.find(p => p.id === pagoId);
    if (!pago) {
        console.error('No se encontró el pago con ID:', pagoId);
        alert('Error: No se encontró el pago seleccionado');
        return;
    }
    
    console.log('Pago encontrado:', pago);
    
    // Guardar referencia al pago actual
    pedidoPagoActual = pago;
    
    // Limpiar selección
    itemsSeleccionadosPago = [];
    
    // Llenar modal con productos pendientes
    const contenedorProductos = document.getElementById('productos-pago-parcial');
    contenedorProductos.innerHTML = '';
    
    // Verificar si hay items pendientes
    if (!pago.itemsPendientes || pago.itemsPendientes.length === 0) {
        console.warn('No hay items pendientes para este pago');
        contenedorProductos.innerHTML = '<p>No hay productos pendientes de pago</p>';
    } else {
        // Agregar cada item al modal
        pago.itemsPendientes.forEach(item => {
            const productoElement = crearElemento('div', { class: 'producto-pago-parcial', 'data-id': item.id });
            
            const checkElement = crearElemento('input', { 
                type: 'checkbox', 
                class: 'producto-pago-check', 
                'data-id': item.id,
                'data-precio': item.precio * item.cantidad
            });
            
            // Asignar evento de cambio
            checkElement.addEventListener('change', (e) => seleccionarItemPagoParcial(e, item.id, item.precio * item.cantidad));
            
            const infoElement = crearElemento('div', { class: 'producto-pago-info' });
            const nombreElement = crearElemento('div', { class: 'producto-pago-nombre' }, 
                `${item.cantidad}x ${item.nombre}${item.detalles ? ` (${item.detalles})` : ''}`);
            infoElement.appendChild(nombreElement);
            
            const precioElement = crearElemento('div', { class: 'producto-pago-precio' }, formatearPrecio(item.precio * item.cantidad));
            
            productoElement.appendChild(checkElement);
            productoElement.appendChild(infoElement);
            productoElement.appendChild(precioElement);
            
            contenedorProductos.appendChild(productoElement);
        });
    }
    
    // Actualizar total
    actualizarTotalPagoParcial();
    
    // Mostrar modal
    console.log('Mostrando modal de pago parcial');
    mostrarModal('modal-pago-parcial');
}
// Seleccionar item para pago parcial
function seleccionarItemPagoParcial(event, itemId, precio) {
    if (event.target.checked) {
        // Agregar a seleccionados
        itemsSeleccionadosPago.push({
            id: itemId,
            precio: precio
        });
    } else {
        // Quitar de seleccionados
        itemsSeleccionadosPago = itemsSeleccionadosPago.filter(item => item.id !== itemId);
    }
    
    // Actualizar total
    actualizarTotalPagoParcial();
}

// Actualizar total de pago parcial
function actualizarTotalPagoParcial() {
    const totalElement = document.getElementById('total-pago-parcial');
    
    // Calcular total
    const total = itemsSeleccionadosPago.reduce((sum, item) => sum + item.precio, 0);
    
    // Actualizar interfaz
    totalElement.textContent = formatearPrecio(total);
    
    // Actualizar campo de monto
    document.getElementById('monto-pago-parcial').value = total.toFixed(2);
}

// Procesar pago parcial
function procesarPagoParcial() {
    // Verificar si hay items seleccionados
    if (itemsSeleccionadosPago.length === 0) {
        alert('Seleccione al menos un producto para pagar');
        return;
    }
    
    // Verificar si hay un pedido actual
    if (!pedidoPagoActual) {
        alert('No se ha seleccionado un pedido para pago parcial');
        return;
    }
    
    // Verificar monto
    const montoPagado = parseFloat(document.getElementById('monto-pago-parcial').value);
    if (isNaN(montoPagado) || montoPagado <= 0) {
        alert('Ingrese un monto válido');
        return;
    }
    
    // Calcular total de items seleccionados
    const totalSeleccionado = itemsSeleccionadosPago.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    
    // Verificar que el monto sea igual al total seleccionado
    if (montoPagado !== totalSeleccionado) {
        alert(`El monto debe ser igual al total de los productos seleccionados: ${formatearPrecio(totalSeleccionado)}`);
        return;
    }
    
    // Cargar pagos
    let pagos = cargarDatos('pagos') || [];
    
    // Buscar pago
    const index = pagos.findIndex(pago => pago.id === pedidoPagoActual.id);
    if (index === -1) {
        alert('No se encontró el pago seleccionado');
        return;
    }
    
    // Obtener fecha y hora actuales
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString();
    const horaFormateada = fechaActual.toLocaleTimeString();
    
    // Guardar el ID del pedido original para sincronización
    const pedidoOriginalId = pagos[index].pedidoOriginal.id;
    
    // Obtener los productos que se están pagando
    const productosPagados = pedidoPagoActual.itemsPendientes.filter(item => 
        itemsSeleccionadosPago.some(seleccionado => seleccionado.id === item.id)
    );
    
    // Calcular monto pagado
    const montoPagadoTotal = itemsSeleccionadosPago.reduce((sum, item) => sum + item.precio, 0);
    
    // Actualizar items pendientes
    pagos[index].itemsPendientes = pagos[index].itemsPendientes.filter(item => 
        !itemsSeleccionadosPago.some(seleccionado => seleccionado.id === item.id)
    );
    
    // Actualizar total pendiente
    pagos[index].totalPendiente -= montoPagadoTotal;
    
    // Actualizar total pagado
    pagos[index].totalPagado += montoPagadoTotal;
    
    // Registrar pago
    pagos[index].pagosRealizados.push({
        fecha: fechaFormateada,
        hora: horaFormateada,
        monto: montoPagadoTotal,
        tipo: 'parcial'
    });
    
    // Guardar pago en reportes
    guardarPagoEnReportes({
        id: generarId(),
        fechaPago: fechaFormateada,
        horaPago: horaFormateada,
        timestamp: fechaActual.getTime(),
        cliente: pagos[index].pedidoOriginal.cliente,
        mesa: pagos[index].pedidoOriginal.mesa,
        monto: montoPagadoTotal,
        tipoPago: 'parcial',
        pedidoId: pedidoOriginalId,
        productos: productosPagados
    });
    
    // Verificar si se completó el pago
    const pagoCompletado = pagos[index].itemsPendientes.length === 0 || pagos[index].totalPendiente <= 0;
    
    if (pagoCompletado) {
        pagos[index].completado = true;
        pagos[index].fechaCompletado = fechaFormateada;
        pagos[index].horaCompletado = horaFormateada;
        pagos[index].itemsPendientes = [];
        pagos[index].totalPendiente = 0;
        
        // Actualizar historial si el pago se completó
        let historial = cargarDatos('historial') || [];
        const pedidoHistorialIndex = historial.findIndex(pedido => pedido.id === pedidoOriginalId);
        
        if (pedidoHistorialIndex !== -1) {
            // Marcar como pagado en el historial
            historial[pedidoHistorialIndex].pagado = true;
            historial[pedidoHistorialIndex].fechaPagado = fechaFormateada;
            historial[pedidoHistorialIndex].horaPagado = horaFormateada;
            historial[pedidoHistorialIndex].completado = true;
            
            // Guardar historial actualizado
            guardarDatos('historial', historial);
            
            console.log(`Pedido ${pedidoOriginalId} marcado como pagado en el historial (pago parcial completado)`);
        }
        
        // Eliminar de cocina si existe y el pago se completó
        let pedidosCocina = cargarDatos('cocina') || [];
        if (pedidosCocina.some(pedido => pedido.id === pedidoOriginalId)) {
            pedidosCocina = pedidosCocina.filter(pedido => pedido.id !== pedidoOriginalId);
            guardarDatos('cocina', pedidosCocina);
            console.log(`Pedido ${pedidoOriginalId} eliminado de cocina al completar pago parcial`);
        }
    } else {
        // Si no se completó el pago, actualizar el historial para reflejar el pago parcial
        let historial = cargarDatos('historial') || [];
        const pedidoHistorialIndex = historial.findIndex(pedido => pedido.id === pedidoOriginalId);
        
        if (pedidoHistorialIndex !== -1) {
            // Marcar como parcialmente pagado
            historial[pedidoHistorialIndex].pagoParcial = true;
            historial[pedidoHistorialIndex].ultimoPagoParcial = {
                fecha: fechaFormateada,
                hora: horaFormateada,
                monto: montoPagadoTotal
            };
            historial[pedidoHistorialIndex].totalPagado = pagos[index].totalPagado;
            historial[pedidoHistorialIndex].totalPendiente = pagos[index].totalPendiente;
            
            // Guardar historial actualizado
            guardarDatos('historial', historial);
            
            console.log(`Pedido ${pedidoOriginalId} actualizado con pago parcial en el historial`);
        }
    }
    
    // Guardar pagos actualizados
    guardarDatos('pagos', pagos);
    
    // Mostrar mensaje de éxito
    alert('Pago parcial procesado correctamente');
    
    // Cerrar modal
    cerrarModal('modal-pago-parcial');
    
    // Actualizar interfaz de pagos
    cargarPagos();
    
    // Si estamos en la sección de historial, actualizar
    if (document.getElementById('historial').classList.contains('active')) {
        cargarHistorial();
    }
    
    // Si estamos en la sección de cocina y el pago se completó, actualizar
    if (pagoCompletado && document.getElementById('cocina').classList.contains('active')) {
        cargarCocina();
    }
}

// Ver pedido original
function verPedidoOriginal(pagoId) {
    // Cargar pagos
    const pagos = cargarDatos('pagos') || [];
    
    // Buscar pago
    const pago = pagos.find(p => p.id === pagoId);
    if (!pago) return;
    
    // Mostrar comprobante del pedido original
    mostrarComprobante(pago.pedidoOriginal);
}

/**
 * Guardar pago en reportes
 * @param {Object} pago - Datos del pago a guardar
 */
function guardarPagoEnReportes(pago) {
    // Cargar reportes existentes
    let reportes = cargarDatos('reportes_pagos') || [];
    
    // Asegurarse de que el pago tenga toda la información necesaria
    const fechaActual = new Date();
    const pagoCompleto = {
        ...pago,
        id: pago.id || generarId(),
        fechaPago: pago.fechaPago || fechaActual.toLocaleDateString(),
        horaPago: pago.horaPago || fechaActual.toLocaleTimeString(),
        timestamp: pago.timestamp || fechaActual.getTime(), // Importante para filtrar por fecha
        monto: pago.monto || 0,
        tipoPago: pago.tipoPago || 'completo',
        // Asegurarse de que los productos estén bien formateados
        productos: Array.isArray(pago.productos) ? pago.productos.map(producto => ({
            ...producto,
            nombre: producto.nombre || 'Producto sin nombre',
            categoria: producto.categoria || 'Sin categoría',
            cantidad: producto.cantidad || 1,
            precio: producto.precio || 0
        })) : []
    };
    
    // Agregar nuevo reporte
    reportes.push(pagoCompleto);
    
    // Guardar reportes actualizados
    guardarDatos('reportes_pagos', reportes);
    
    console.log('Pago guardado en reportes:', pagoCompleto);
    
    // Actualizar estadísticas si estamos en esa sección
    if (document.getElementById('estadisticas').classList.contains('active')) {
        const periodo = document.getElementById('periodo-estadisticas').value;
        setTimeout(() => cargarEstadisticas(periodo), 100);
    }
}

// Función para actualizar el selector de pagos de emergencia
function actualizarSelectorPagosEmergencia() {
    const selector = document.getElementById('selector-pago-emergencia');
    if (!selector) return;
    
    // Limpiar opciones actuales, manteniendo la primera
    while (selector.options.length > 1) {
        selector.remove(1);
    }
    
    // Cargar pagos
    const pagos = cargarDatos('pagos') || [];
    const pagosPendientes = pagos.filter(pago => !pago.completado);
    
    // Agregar opciones al selector
    pagosPendientes.forEach(pago => {
        const option = document.createElement('option');
        option.value = pago.id;
        option.textContent = `Mesa ${pago.pedidoOriginal.mesa} - ${pago.pedidoOriginal.cliente} - $${pago.totalPendiente.toFixed(2)}`;
        selector.appendChild(option);
    });
}

// Función para mostrar el modal de pago parcial de emergencia
function mostrarModalPagoParcialEmergencia() {
    const selector = document.getElementById('selector-pago-emergencia');
    if (!selector || !selector.value) {
        alert('Por favor, selecciona un pedido primero');
        return;
    }
    
    const pagoId = selector.value;
    console.log('Mostrando modal de pago parcial de emergencia para ID:', pagoId);
    
    // Cargar pagos
    const pagos = cargarDatos('pagos') || [];
    const pago = pagos.find(p => p.id === pagoId);
    
    if (!pago) {
        alert('Error: No se encontró el pago seleccionado');
        return;
    }
    
    // Guardar referencia al pago actual
    pedidoPagoActual = pago;
    itemsSeleccionadosPago = [];
    
    // Preparar el modal
    const contenedor = document.getElementById('productos-pago-parcial');
    if (!contenedor) {
        alert('Error: No se encontró el contenedor de productos en el modal');
        return;
    }
    
    contenedor.innerHTML = '';
    
    // Verificar si hay items pendientes
    if (!pago.itemsPendientes || pago.itemsPendientes.length === 0) {
        contenedor.innerHTML = '<p>No hay productos pendientes de pago</p>';
    } else {
        // Agregar cada item al modal
        pago.itemsPendientes.forEach(item => {
            const elem = document.createElement('div');
            elem.className = 'producto-pago-parcial';
            elem.setAttribute('data-id', item.id);
            
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.className = 'producto-pago-check';
            check.setAttribute('data-id', item.id);
            check.setAttribute('data-precio', item.precio * item.cantidad);
            
            // Asignar evento de cambio
            check.addEventListener('change', function(e) {
                seleccionarItemPagoParcial(e, item.id, item.precio * item.cantidad);
            });
            
            const info = document.createElement('div');
            info.className = 'producto-pago-info';
            
            const nombre = document.createElement('div');
            nombre.className = 'producto-pago-nombre';
            nombre.textContent = `${item.cantidad}x ${item.nombre}${item.detalles ? ` (${item.detalles})` : ''}`;
            info.appendChild(nombre);
            
            const precio = document.createElement('div');
            precio.className = 'producto-pago-precio';
            precio.textContent = formatearPrecio(item.precio * item.cantidad);
            
            elem.appendChild(check);
            elem.appendChild(info);
            elem.appendChild(precio);
            
            contenedor.appendChild(elem);
        });
    }
    
    // Actualizar total
    actualizarTotalPagoParcial();
    
    // Mostrar el modal
    const modal = document.getElementById('modal-pago-parcial');
    if (!modal) {
        alert('Error: No se encontró el modal de pago parcial');
        return;
    }
    
    // Asegurarse de que los botones tengan sus eventos
    const btnConfirmar = document.getElementById('btn-confirmar-pago-parcial');
    if (btnConfirmar) {
        btnConfirmar.onclick = procesarPagoParcial;
    }
    
    const btnCancelar = document.getElementById('btn-cancelar-pago-parcial');
    if (btnCancelar) {
        btnCancelar.onclick = function() { cerrarModal('modal-pago-parcial'); };
    }
    
    // Mostrar el modal
    modal.style.display = 'block';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    
    // Asegurarse de que el contenido del modal sea visible
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.display = 'block';
        modalContent.style.visibility = 'visible';
        modalContent.style.opacity = '1';
    }
}

// Configurar eventos
document.addEventListener('DOMContentLoaded', () => {
    console.log('Configurando eventos de pagos...');
    
    // Botón para confirmar pago parcial
    const btnConfirmar = document.getElementById('btn-confirmar-pago-parcial');
    if (btnConfirmar) {
        console.log('Botón confirmar pago parcial encontrado, asignando evento');
        btnConfirmar.addEventListener('click', procesarPagoParcial);
    } else {
        console.error('Botón confirmar pago parcial no encontrado');
    }
    
    // Botón para cancelar pago parcial
    const btnCancelar = document.getElementById('btn-cancelar-pago-parcial');
    if (btnCancelar) {
        console.log('Botón cancelar pago parcial encontrado, asignando evento');
        btnCancelar.addEventListener('click', () => cerrarModal('modal-pago-parcial'));
    } else {
        console.error('Botón cancelar pago parcial no encontrado');
    }
    
    // Botón de emergencia para pago parcial
    const btnEmergencia = document.getElementById('btn-pago-parcial-emergencia');
    if (btnEmergencia) {
        console.log('Botón de emergencia para pago parcial encontrado, asignando evento');
        btnEmergencia.addEventListener('click', function() {
            // Abrir directamente la página de pago parcial
            window.location.href = 'pago-parcial.html';
        });
    }
    
    // Evento para cuando se muestra la sección de pagos
    const pagosLink = document.querySelector('.nav-link[data-section="pagos"]');
    if (pagosLink) {
        pagosLink.addEventListener('click', function() {
            // Actualizar el selector de pagos cuando se muestra la sección
            setTimeout(actualizarSelectorPagosEmergencia, 500);
        });
    }
});