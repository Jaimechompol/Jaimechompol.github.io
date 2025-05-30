/**
 * Archivo para gestionar los pedidos
 * Contiene funciones para crear, modificar y eliminar pedidos
 */

// Estado global de pedidos
let pedidoActual = {
    id: null,
    cliente: '',
    mesa: '',
    items: [],
    total: 0,
    fecha: '',
    hora: '',
    timestamp: 0
};

// Inicializar pedido actual
function inicializarPedidoActual() {
    // Limpiar todas las marcas de edición
    sessionStorage.removeItem('editando_pedido_id'); // Antigua marca (por compatibilidad)
    sessionStorage.removeItem('pedido_original_id');
    sessionStorage.removeItem('pedido_nuevo_id');
    
    // Limpiar cualquier marca visual de edición
    document.querySelectorAll('.historial-pedido.editando').forEach(el => {
        el.classList.remove('editando');
        el.removeAttribute('title');
    });
    
    pedidoActual = {
        id: generarId(),
        cliente: '',
        mesa: '',
        items: [],
        total: 0,
        ...obtenerFechaHoraActual()
    };
    actualizarInterfazPedido();
    
    console.log('Pedido actual inicializado con ID:', pedidoActual.id);
}

// Actualizar la interfaz del pedido actual
function actualizarInterfazPedido() {
    const contenedorItems = document.getElementById('items-pedido');
    const totalElement = document.getElementById('total-pedido');
    
    // Limpiar contenedor
    contenedorItems.innerHTML = '';
    
    // Agregar items
    pedidoActual.items.forEach(item => {
        const itemElement = crearElementoItemPedido(item);
        contenedorItems.appendChild(itemElement);
    });
    
    // Actualizar total
    totalElement.textContent = formatearPrecio(pedidoActual.total);
    
    // Actualizar contadores de productos
    actualizarContadoresProductos();
}

// Crear elemento HTML para un item del pedido
function crearElementoItemPedido(item) {
    const itemElement = crearElemento('div', { class: 'item-pedido' });
    
    const infoElement = crearElemento('div', { class: 'item-info' });
    const nombreElement = crearElemento('div', { class: 'item-nombre' }, `${item.cantidad}x ${item.nombre}`);
    infoElement.appendChild(nombreElement);
    
    if (item.detalles) {
        const detallesElement = crearElemento('div', { class: 'item-detalles' }, item.detalles);
        infoElement.appendChild(detallesElement);
    }
    
    const precioElement = crearElemento('div', { class: 'item-precio' }, formatearPrecio(item.precio * item.cantidad));
    
    const accionesElement = crearElemento('div', { class: 'item-acciones' });
    const btnEliminar = crearElemento('button', { class: 'btn-eliminar-item', 'data-id': item.id }, '<i class="fas fa-trash"></i>');
    btnEliminar.addEventListener('click', () => eliminarItemPedido(item.id));
    accionesElement.appendChild(btnEliminar);
    
    itemElement.appendChild(infoElement);
    itemElement.appendChild(precioElement);
    itemElement.appendChild(accionesElement);
    
    return itemElement;
}

// Agregar item al pedido actual
function agregarItemPedido(item) {
    // Generar ID único para el item
    item.id = generarId();
    
    // Asegurarse de que el item tenga un timestamp para diferenciarlo
    if (!item.timestamp) {
        item.timestamp = Date.now();
    }
    
    // Agregar directamente al pedido sin verificar duplicados
    // Ya que ahora cada producto se agrega individualmente con su propio timestamp
    pedidoActual.items.push(item);
    
    // Recalcular total
    recalcularTotalPedido();
    
    // Actualizar interfaz
    actualizarInterfazPedido();
    
    // Mostrar mensaje de confirmación en la consola
    console.log('Producto agregado:', item.nombre, item.detalles || '');
}

// Eliminar item del pedido actual
function eliminarItemPedido(itemId) {
    // Filtrar items
    pedidoActual.items = pedidoActual.items.filter(item => item.id !== itemId);
    
    // Recalcular total
    recalcularTotalPedido();
    
    // Actualizar interfaz
    actualizarInterfazPedido();
}

// Recalcular total del pedido
function recalcularTotalPedido() {
    pedidoActual.total = pedidoActual.items.reduce((total, item) => {
        return total + (item.precio * item.cantidad);
    }, 0);
}

// Actualizar contadores de productos
function actualizarContadoresProductos() {
    // Reiniciar contadores
    document.querySelectorAll('.producto-contador').forEach(contador => {
        contador.remove();
    });
    
    // Contar productos en el pedido actual
    const contadores = {};
    
    pedidoActual.items.forEach(item => {
        if (item.productoId) {
            if (!contadores[item.productoId]) {
                contadores[item.productoId] = 0;
            }
            contadores[item.productoId] += item.cantidad;
        }
    });
    
    // Mostrar contadores
    for (const [productoId, cantidad] of Object.entries(contadores)) {
        const productoElement = document.querySelector(`.producto-card[data-id="${productoId}"]`);
        if (productoElement) {
            const contadorElement = crearElemento('div', { class: 'producto-contador' }, cantidad);
            productoElement.appendChild(contadorElement);
        }
    }
}

// Generar pedido final
function generarPedidoFinal() {
    // Verificar que haya items
    if (pedidoActual.items.length === 0) {
        alert('No hay productos en el pedido');
        return null;
    }
    
    // Verificar datos del cliente
    const nombreCliente = document.getElementById('nombre-cliente').value.trim();
    const numeroMesa = document.getElementById('mesa-numero').value.trim();
    
    if (!nombreCliente || !numeroMesa) {
        alert('Ingrese el nombre del cliente y número de mesa');
        return null;
    }
    
    // Actualizar datos del cliente
    pedidoActual.cliente = nombreCliente;
    pedidoActual.mesa = numeroMesa;
    
    // Verificar si estamos editando un pedido existente
    const pedidoOriginalId = sessionStorage.getItem('pedido_original_id');
    const pedidoNuevoId = sessionStorage.getItem('pedido_nuevo_id');
    let pagosRealizados = [];
    let totalPagado = 0;
    
    // Verificar si es una edición
    if (pedidoOriginalId && pedidoNuevoId && pedidoActual.esEdicion) {
        console.log(`Procesando edición de pedido. Original: ${pedidoOriginalId}, Nuevo: ${pedidoNuevoId}`);
        
        // Guardar información de pagos para mantenerla
        const pedidosPagos = cargarDatos('pagos') || [];
        const pagoExistente = pedidosPagos.find(pago => pago.id === pedidoOriginalId);
        
        if (pagoExistente) {
            pagosRealizados = pagoExistente.pagosRealizados || [];
            totalPagado = pagoExistente.totalPagado || 0;
            console.log(`Recuperados pagos realizados: ${pagosRealizados.length}, Total pagado: ${totalPagado}`);
        }
        
        // Eliminar el pedido original de todas las secciones
        eliminarPedidoCompletamente(pedidoOriginalId);
        console.log(`Pedido original con ID ${pedidoOriginalId} eliminado`);
        
        // Limpiar las marcas de edición
        sessionStorage.removeItem('pedido_original_id');
        sessionStorage.removeItem('pedido_nuevo_id');
        
        // Eliminar las propiedades de edición del pedido actual
        delete pedidoActual.esEdicion;
        delete pedidoActual.pedidoOriginalId;
    }
    
    // Crear copia del pedido para guardar
    const pedidoFinal = { ...pedidoActual };
    
    // Guardar en historial
    guardarPedidoEnHistorial(pedidoFinal);
    
    // Guardar en cocina si hay productos de cocina
    const productosCocina = obtenerProductosCocina(pedidoFinal.items);
    if (productosCocina.length > 0) {
        guardarPedidoEnCocina(pedidoFinal);
    }
    
    // Guardar en pagos
    if (pedidoOriginalId && pedidoNuevoId) {
        // Si es una edición, restaurar los pagos realizados
        guardarPedidoEnPagosConHistorial(pedidoFinal, pagosRealizados, totalPagado);
    } else {
        guardarPedidoEnPagos(pedidoFinal);
    }
    
    // Mostrar comprobante
    mostrarComprobante(pedidoFinal);
    
    // Inicializar nuevo pedido
    inicializarPedidoActual();
    
    return pedidoFinal;
}

// Mostrar comprobante
function mostrarComprobante(pedido) {
    const contenedorComprobante = document.getElementById('comprobante-contenido');
    contenedorComprobante.innerHTML = generarComprobanteHTML(pedido);
    
    // Guardar referencia al pedido actual en el modal
    document.getElementById('modal-comprobante').dataset.pedidoId = pedido.id;
    
    // Mostrar modal
    mostrarModal('modal-comprobante');
}

// Guardar pedido en historial
function guardarPedidoEnHistorial(pedido) {
    // Cargar historial existente
    let historial = cargarDatos('historial') || [];
    
    // Verificar si el pedido ya existe en el historial (está siendo editado)
    const pedidoExistenteIndex = historial.findIndex(p => p.id === pedido.id);
    
    if (pedidoExistenteIndex !== -1) {
        // Si el pedido ya existe, reemplazarlo
        console.log(`Reemplazando pedido existente con ID ${pedido.id} en el historial`);
        historial[pedidoExistenteIndex] = pedido;
    } else {
        // Si es un nuevo pedido, agregarlo
        console.log(`Agregando nuevo pedido con ID ${pedido.id} al historial`);
        historial.push(pedido);
    }
    
    // Guardar historial actualizado
    guardarDatos('historial', historial);
    
    // Actualizar interfaz de historial si está visible
    if (document.getElementById('historial').classList.contains('active')) {
        cargarHistorial();
    }
}

// Eliminar pedido de cocina
function eliminarPedidoDeCocina(pedidoId) {
    // Cargar pedidos de cocina existentes
    let pedidosCocina = cargarDatos('cocina') || [];
    
    // Verificar si el pedido existe en la cocina
    const pedidoExistenteIndex = pedidosCocina.findIndex(p => p.id === pedidoId);
    
    if (pedidoExistenteIndex !== -1) {
        // Si el pedido existe, eliminarlo
        console.log(`Eliminando pedido con ID ${pedidoId} de la cocina`);
        pedidosCocina.splice(pedidoExistenteIndex, 1);
        
        // Guardar pedidos de cocina actualizados
        guardarDatos('cocina', pedidosCocina);
        
        // Actualizar interfaz de cocina si está visible
        if (document.getElementById('cocina').classList.contains('active')) {
            cargarCocina();
        }
    }
}

// Guardar pedido en cocina
function guardarPedidoEnCocina(pedido) {
    // Cargar pedidos de cocina existentes
    let pedidosCocina = cargarDatos('cocina') || [];
    
    // Filtrar solo productos de cocina
    const productosCocina = obtenerProductosCocina(pedido.items);
    
    // Si hay productos de cocina, guardar pedido
    if (productosCocina.length > 0) {
        // Crear objeto de pedido para cocina
        const pedidoCocina = {
            id: pedido.id,
            mesa: pedido.mesa,
            cliente: pedido.cliente,
            items: productosCocina,
            fecha: pedido.fecha,
            hora: pedido.hora,
            timestamp: pedido.timestamp,
            acompañamientos: contarAcompañamientos(pedido.items)
        };
        
        // Verificar si el pedido ya existe en la cocina (está siendo editado)
        const pedidoExistenteIndex = pedidosCocina.findIndex(p => p.id === pedido.id);
        
        if (pedidoExistenteIndex !== -1) {
            // Si el pedido ya existe, reemplazarlo
            console.log(`Reemplazando pedido existente con ID ${pedido.id} en la cocina`);
            pedidosCocina[pedidoExistenteIndex] = pedidoCocina;
        } else {
            // Si es un nuevo pedido, agregarlo
            console.log(`Agregando nuevo pedido con ID ${pedido.id} a la cocina`);
            pedidosCocina.push(pedidoCocina);
        }
        
        // Guardar pedidos de cocina actualizados
        guardarDatos('cocina', pedidosCocina);
        
        // Actualizar interfaz de cocina si está visible
        if (document.getElementById('cocina').classList.contains('active')) {
            cargarCocina();
        }
    }
}

// Guardar pedido en pagos
function guardarPedidoEnPagos(pedido) {
    // Cargar pagos existentes
    let pagos = cargarDatos('pagos') || [];
    
    // Crear objeto de pago
    const pago = {
        id: pedido.id,
        pedidoOriginal: pedido,
        itemsPendientes: [...pedido.items],
        totalPendiente: pedido.total,
        pagosRealizados: [],
        totalPagado: 0,
        completado: false
    };
    
    // Verificar si el pedido ya existe en pagos (está siendo editado)
    const pagoExistenteIndex = pagos.findIndex(p => p.id === pedido.id);
    
    if (pagoExistenteIndex !== -1) {
        // Si el pedido ya existe, reemplazarlo manteniendo los pagos realizados
        console.log(`Reemplazando pedido existente con ID ${pedido.id} en pagos`);
        
        // Mantener los pagos realizados y el total pagado del pedido anterior
        const pagosRealizados = pagos[pagoExistenteIndex].pagosRealizados || [];
        const totalPagado = pagos[pagoExistenteIndex].totalPagado || 0;
        
        // Actualizar el pago con la información nueva pero manteniendo los pagos realizados
        pago.pagosRealizados = pagosRealizados;
        pago.totalPagado = totalPagado;
        pago.totalPendiente = pedido.total - totalPagado;
        
        // Si el total pendiente es 0 o negativo, marcar como completado
        if (pago.totalPendiente <= 0) {
            pago.completado = true;
        }
        
        pagos[pagoExistenteIndex] = pago;
    } else {
        // Si es un nuevo pedido, agregarlo
        console.log(`Agregando nuevo pedido con ID ${pedido.id} a pagos`);
        pagos.push(pago);
    }
    
    // Guardar pagos actualizados
    guardarDatos('pagos', pagos);
    
    // Actualizar interfaz de pagos si está visible
    if (document.getElementById('pagos').classList.contains('active')) {
        cargarPagos();
    }
}

// Eliminar un pedido completamente de todas las secciones
function eliminarPedidoCompletamente(pedidoId) {
    console.log(`Eliminando completamente el pedido con ID: ${pedidoId} de todas las secciones`);
    
    try {
        // Eliminar de historial
        let historial = cargarDatos('historial') || [];
        const historialAnterior = [...historial]; // Guardar copia para verificación
        historial = historial.filter(pedido => pedido.id !== pedidoId);
        guardarDatos('historial', historial);
        console.log(`Pedido eliminado del historial: ${historialAnterior.length - historial.length} elementos`);
        
        // Eliminar de cocina
        let pedidosCocina = cargarDatos('cocina') || [];
        const cocinaAnterior = [...pedidosCocina]; // Guardar copia para verificación
        pedidosCocina = pedidosCocina.filter(pedido => pedido.id !== pedidoId);
        guardarDatos('cocina', pedidosCocina);
        console.log(`Pedido eliminado de cocina: ${cocinaAnterior.length - pedidosCocina.length} elementos`);
        
        // Eliminar de pagos
        let pedidosPagos = cargarDatos('pagos') || [];
        const pagosAnterior = [...pedidosPagos]; // Guardar copia para verificación
        pedidosPagos = pedidosPagos.filter(pedido => pedido.id !== pedidoId);
        guardarDatos('pagos', pedidosPagos);
        console.log(`Pedido eliminado de pagos: ${pagosAnterior.length - pedidosPagos.length} elementos`);
        
        // Eliminar de pedidos guardados
        let pedidosGuardados = cargarDatos('pedidos_guardados') || [];
        const guardadosAnterior = [...pedidosGuardados]; // Guardar copia para verificación
        pedidosGuardados = pedidosGuardados.filter(pedido => pedido.id !== pedidoId);
        guardarDatos('pedidos_guardados', pedidosGuardados);
        console.log(`Pedido eliminado de guardados: ${guardadosAnterior.length - pedidosGuardados.length} elementos`);
        
        return true;
    } catch (error) {
        console.error(`Error al eliminar el pedido ${pedidoId}:`, error);
        return false;
    }
}

// Guardar pedido en pagos manteniendo el historial de pagos
function guardarPedidoEnPagosConHistorial(pedido, pagosRealizados, totalPagado) {
    // Cargar pagos existentes
    let pagos = cargarDatos('pagos') || [];
    
    // Crear objeto de pago con el historial de pagos
    const pago = {
        id: pedido.id,
        pedidoOriginal: pedido,
        itemsPendientes: [...pedido.items],
        totalPendiente: pedido.total - totalPagado,
        pagosRealizados: pagosRealizados,
        totalPagado: totalPagado,
        completado: (pedido.total - totalPagado) <= 0
    };
    
    // Agregar el pago actualizado
    pagos.push(pago);
    
    // Guardar pagos actualizados
    guardarDatos('pagos', pagos);
    
    // Actualizar interfaz de pagos si está visible
    if (document.getElementById('pagos').classList.contains('active')) {
        cargarPagos();
    }
    
    console.log(`Pedido con ID ${pedido.id} guardado en pagos con historial de pagos restaurado`);
}