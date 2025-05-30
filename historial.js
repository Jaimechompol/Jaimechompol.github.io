/**
 * Archivo para gestionar el historial de pedidos
 * Contiene funciones para cargar, modificar y eliminar pedidos del historial
 */

// Cargar historial de pedidos
function cargarHistorial() {
    const contenedorHistorial = document.getElementById('historial-lista');
    
    // Limpiar contenedor
    contenedorHistorial.innerHTML = '';
    
    // Cargar historial desde localStorage
    const historial = cargarDatos('historial') || [];
    
    // Ordenar por timestamp (más reciente primero)
    historial.sort((a, b) => b.timestamp - a.timestamp);
    
    // Verificar si hay pedidos
    if (historial.length === 0) {
        contenedorHistorial.innerHTML = '<p class="mensaje-vacio">No hay pedidos en el historial</p>';
        return;
    }
    
    // Agregar pedidos al contenedor
    historial.forEach(pedido => {
        const pedidoElement = crearElementoPedidoHistorial(pedido);
        contenedorHistorial.appendChild(pedidoElement);
    });
}

// Crear elemento HTML para un pedido del historial
function crearElementoPedidoHistorial(pedido) {
    const pedidoElement = crearElemento('div', { class: 'historial-item', 'data-id': pedido.id });
    
    // Header
    const headerElement = crearElemento('div', { class: 'historial-header' });
    const clienteElement = crearElemento('div', { class: 'historial-cliente' }, `${pedido.cliente} - Mesa ${pedido.mesa}`);
    const fechaElement = crearElemento('div', { class: 'historial-fecha' }, `${pedido.fecha} ${pedido.hora}`);
    headerElement.appendChild(clienteElement);
    headerElement.appendChild(fechaElement);
    
    // Productos
    const productosElement = crearElemento('div', { class: 'historial-productos' });
    pedido.items.forEach(item => {
        const productoElement = crearElemento('div', { class: 'historial-producto' });
        const nombreElement = crearElemento('div', { class: 'historial-producto-nombre' }, 
            `${item.cantidad}x ${item.nombre} ${formatearPrecio(item.precio * item.cantidad)}`);
        productoElement.appendChild(nombreElement);
        
        if (item.detalles) {
            const detallesElement = crearElemento('div', { class: 'historial-producto-detalles' }, item.detalles);
            productoElement.appendChild(detallesElement);
        }
        
        productosElement.appendChild(productoElement);
    });
    
    // Total
    const totalElement = crearElemento('div', { class: 'historial-total' }, `Total: ${formatearPrecio(pedido.total)}`);
    
    // Acciones
    const accionesElement = crearElemento('div', { class: 'historial-acciones' });
    
    const btnImprimir = crearElemento('button', { class: 'btn-secundario', 'data-id': pedido.id }, 'Imprimir');
    btnImprimir.addEventListener('click', () => imprimirPedidoHistorial(pedido.id));
    
    const btnModificar = crearElemento('button', { class: 'btn-secundario', 'data-id': pedido.id }, 'Modificar');
    btnModificar.addEventListener('click', () => modificarPedidoHistorial(pedido.id));
    
    const btnEliminar = crearElemento('button', { class: 'btn-primario', 'data-id': pedido.id }, 'Eliminar');
    btnEliminar.addEventListener('click', () => eliminarPedidoHistorial(pedido.id));
    
    accionesElement.appendChild(btnImprimir);
    accionesElement.appendChild(btnModificar);
    accionesElement.appendChild(btnEliminar);
    
    // Agregar elementos al pedido
    pedidoElement.appendChild(headerElement);
    pedidoElement.appendChild(productosElement);
    pedidoElement.appendChild(totalElement);
    pedidoElement.appendChild(accionesElement);
    
    return pedidoElement;
}

// Imprimir pedido del historial
function imprimirPedidoHistorial(pedidoId) {
    // Cargar historial
    const historial = cargarDatos('historial') || [];
    
    // Buscar pedido
    const pedido = historial.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    // Mostrar comprobante
    mostrarComprobante(pedido);
}

// Modificar pedido del historial
function modificarPedidoHistorial(pedidoId) {
    // Cargar historial
    const historial = cargarDatos('historial') || [];
    
    // Buscar pedido
    const pedido = historial.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    // Generar un nuevo ID único para el pedido editado
    // Esto evita problemas de duplicación y referencias cruzadas
    const nuevoId = generarId();
    
    // Guardar la relación entre el ID original y el nuevo ID
    sessionStorage.setItem('pedido_original_id', pedidoId);
    sessionStorage.setItem('pedido_nuevo_id', nuevoId);
    
    // Establecer pedido actual con el nuevo ID
    pedidoActual = { 
        ...pedido,
        id: nuevoId, // Usar el nuevo ID
        esEdicion: true, // Marcar como edición
        pedidoOriginalId: pedidoId // Guardar referencia al ID original
    };
    
    console.log(`Editando pedido. ID original: ${pedidoId}, Nuevo ID: ${nuevoId}`);
    
    // Marcar visualmente el pedido como en edición
    const pedidosElements = document.querySelectorAll('.historial-pedido');
    pedidosElements.forEach(el => {
        if (el.getAttribute('data-id') === pedidoId) {
            el.classList.add('editando');
            el.setAttribute('title', 'Este pedido está siendo editado');
        }
    });
    
    // Mostrar mensaje al usuario
    alert(`Estás editando el pedido de ${pedido.cliente} en la mesa ${pedido.mesa}. Se creará un nuevo pedido y el original será eliminado automáticamente.`);
    
    // Actualizar interfaz
    document.getElementById('nombre-cliente').value = pedido.cliente;
    document.getElementById('mesa-numero').value = pedido.mesa;
    actualizarInterfazPedido();
    
    // Cambiar a sección de pedidos
    cambiarSeccion('pedidos');
}

// Eliminar pedido del historial
function eliminarPedidoHistorial(pedidoId) {
    if (!confirm('¿Está seguro de eliminar este pedido del historial?')) return;
    
    // Verificar si hay un pedido editado relacionado con este pedido
    const historial = cargarDatos('historial') || [];
    
    // Buscar si hay un pedido con el mismo ID (caso improbable pero por seguridad)
    const pedidosRelacionados = historial.filter(p => p.id === pedidoId);
    
    if (pedidosRelacionados.length > 1) {
        console.warn(`Se encontraron ${pedidosRelacionados.length} pedidos con el mismo ID: ${pedidoId}. Esto no debería ocurrir.`);
    }
    
    // Buscar si hay pedidos con la misma mesa y cliente en la misma fecha (posible edición)
    const pedidoAEliminar = historial.find(p => p.id === pedidoId);
    
    if (pedidoAEliminar) {
        const pedidosMismaMesa = historial.filter(p => 
            p.id !== pedidoId && // No es el mismo pedido
            p.mesa === pedidoAEliminar.mesa && // Misma mesa
            p.cliente === pedidoAEliminar.cliente && // Mismo cliente
            p.fecha === pedidoAEliminar.fecha // Misma fecha
        );
        
        if (pedidosMismaMesa.length > 0) {
            const confirmarEliminar = confirm(`Se encontraron ${pedidosMismaMesa.length} pedidos relacionados para la mesa ${pedidoAEliminar.mesa}. \n\n¿Está seguro de que desea eliminar este pedido? Esto podría afectar a otros pedidos relacionados.`);
            if (!confirmarEliminar) return;
        }
    }
    
    // Cargar historial
    let historialActualizado = cargarDatos('historial') || [];
    
    // Filtrar pedido
    historialActualizado = historialActualizado.filter(pedido => pedido.id !== pedidoId);
    
    // Guardar historial actualizado
    guardarDatos('historial', historialActualizado);
    
    // Eliminar también de cocina si existe
    let pedidosCocina = cargarDatos('cocina') || [];
    pedidosCocina = pedidosCocina.filter(pedido => pedido.id !== pedidoId);
    guardarDatos('cocina', pedidosCocina);
    
    // Eliminar también de pagos si existe
    let pedidosPagos = cargarDatos('pagos') || [];
    pedidosPagos = pedidosPagos.filter(pedido => pedido.id !== pedidoId);
    guardarDatos('pagos', pedidosPagos);
    
    // Eliminar también de pedidos guardados si existe
    let pedidosGuardados = cargarDatos('pedidos_guardados') || [];
    pedidosGuardados = pedidosGuardados.filter(pedido => pedido.id !== pedidoId);
    guardarDatos('pedidos_guardados', pedidosGuardados);
    
    console.log(`Pedido ${pedidoId} eliminado completamente de todas las secciones`);
    
    // Actualizar interfaz
    cargarHistorial();
    
    // Si estamos en la sección de cocina, actualizar
    if (document.getElementById('cocina').classList.contains('active')) {
        cargarCocina();
    }
    
    // Si estamos en la sección de pagos, actualizar
    if (document.getElementById('pagos').classList.contains('active')) {
        cargarPagos();
    }
}
