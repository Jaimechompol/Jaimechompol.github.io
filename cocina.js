/**
 * Archivo para gestionar los pedidos de cocina
 * Contiene funciones para cargar y gestionar pedidos en la sección de cocina
 */

// Cargar pedidos de cocina
function cargarCocina() {
    const contenedorCocina = document.getElementById('cocina-pedidos');
    
    // Limpiar contenedor
    contenedorCocina.innerHTML = '';
    
    // Cargar pedidos de cocina desde localStorage
    const pedidosCocina = cargarDatos('cocina') || [];
    
    // Ordenar por timestamp (más antiguo primero para prioridad FIFO)
    pedidosCocina.sort((a, b) => a.timestamp - b.timestamp);
    
    // Verificar si hay pedidos
    if (pedidosCocina.length === 0) {
        contenedorCocina.innerHTML = '<p class="mensaje-vacio">No hay pedidos pendientes para cocina</p>';
        return;
    }
    
    // Agregar pedidos al contenedor
    pedidosCocina.forEach(pedido => {
        const pedidoElement = crearElementoPedidoCocina(pedido);
        contenedorCocina.appendChild(pedidoElement);
    });
}

// Crear elemento HTML para un pedido de cocina
function crearElementoPedidoCocina(pedido) {
    const pedidoElement = crearElemento('div', { class: 'cocina-pedido', 'data-id': pedido.id });
    
    // Header
    const headerElement = crearElemento('div', { class: 'cocina-header' });
    const mesaElement = crearElemento('div', { class: 'cocina-mesa' }, `Mesa ${pedido.mesa} - ${pedido.cliente}`);
    const horaElement = crearElemento('div', { class: 'cocina-hora' }, pedido.hora);
    headerElement.appendChild(mesaElement);
    headerElement.appendChild(horaElement);
    
    // Productos
    const productosElement = crearElemento('div', { class: 'cocina-productos' });
    pedido.items.forEach(item => {
        const productoElement = crearElemento('div', { class: 'cocina-producto' });
        
        let nombreProducto = item.nombre;
        if (item.detalles) {
            nombreProducto += ` (${item.detalles})`;
        }
        
        const nombreElement = crearElemento('div', { class: 'cocina-producto-nombre' }, nombreProducto);
        const cantidadElement = crearElemento('div', { class: 'cocina-producto-cantidad' }, item.cantidad);
        
        productoElement.appendChild(nombreElement);
        productoElement.appendChild(cantidadElement);
        productosElement.appendChild(productoElement);
    });
    
    // Resumen de acompañamientos con iconos
    const resumenElement = crearElemento('div', { class: 'cocina-resumen' });
    const tituloResumen = crearElemento('h4', {}, 'Acompañamientos:');
    resumenElement.appendChild(tituloResumen);
    
    // Contenedor para los iconos de acompañamientos
    const iconosContainer = crearElemento('div', { class: 'cocina-iconos-container' });
    resumenElement.appendChild(iconosContainer);
    
    const { ensaladas, papas, patacones, yucas, arrozMenestra, arrozMoro } = pedido.acompañamientos;
    
    // Definir los acompañamientos con sus iconos
    const acompañamientosIconos = [
        { nombre: 'Ensaladas', cantidad: ensaladas, icono: '🥗' },       // 🥗
        { nombre: 'Papas', cantidad: papas, icono: '🍟' },              // 🍟
        { nombre: 'Patacones', cantidad: patacones, icono: '🍠' },      // 🍠
        { nombre: 'Yucas', cantidad: yucas, icono: '🍠' },              // 🍠
        { nombre: 'Arroz y Menestra', cantidad: arrozMenestra, icono: '🍚' }, // 🍚
        { nombre: 'Arroz Moro', cantidad: arrozMoro, icono: '🍚' }      // 🍚
    ];
    
    // Crear elementos para cada acompañamiento con su icono
    acompañamientosIconos.forEach(acomp => {
        if (acomp.cantidad > 0) {
            // Crear elemento con icono y cantidad
            const iconoItem = crearElemento('div', { class: 'cocina-icono-item' });
            
            // Formato "icono=cantidad"
            const textoIcono = `${acomp.icono}=${acomp.cantidad}`;
            const iconoElement = crearElemento('span', { class: 'cocina-icono-con-cantidad' }, textoIcono);
            iconoItem.appendChild(iconoElement);
            
            // Nombre (opcional, se puede mostrar al hacer hover)
            iconoItem.title = acomp.nombre;

            // Evento para mostrar el nombre al hacer clic
            iconoItem.addEventListener('click', function() {
                // Si ya existe un nombre visible, no crear otro
                if (iconoItem.querySelector('.nombre-acompanamiento-temp')) return;
                const nombreTemp = crearElemento('span', { class: 'nombre-acompanamiento-temp' }, acomp.nombre);
                nombreTemp.style.position = 'absolute';
                nombreTemp.style.background = '#333';
                nombreTemp.style.color = '#fff';
                nombreTemp.style.padding = '2px 8px';
                nombreTemp.style.borderRadius = '6px';
                nombreTemp.style.fontSize = '13px';
                nombreTemp.style.top = '-30px';
                nombreTemp.style.left = '50%';
                nombreTemp.style.transform = 'translateX(-50%)';
                nombreTemp.style.zIndex = '10';
                nombreTemp.style.pointerEvents = 'none';
                iconoItem.style.position = 'relative';
                iconoItem.appendChild(nombreTemp);
                setTimeout(() => {
                    if (nombreTemp.parentNode) nombreTemp.parentNode.removeChild(nombreTemp);
                }, 1500);
            });
            
            // Agregar al contenedor de iconos
            iconosContainer.appendChild(iconoItem);
        }
    });
    
    // Botón para completar
    const btnCompletar = crearElemento('button', { class: 'btn-primario', 'data-id': pedido.id }, 'Completado');
    btnCompletar.addEventListener('click', () => completarPedidoCocina(pedido.id));
    
    // Agregar elementos al pedido
    pedidoElement.appendChild(headerElement);
    pedidoElement.appendChild(productosElement);
    pedidoElement.appendChild(resumenElement);
    pedidoElement.appendChild(btnCompletar);
    
    return pedidoElement;
}

// Completar pedido de cocina
function completarPedidoCocina(pedidoId) {
    if (!confirm('¿Confirmar que este pedido ha sido completado por cocina?')) return;
    
    // Cargar pedidos de cocina
    let pedidosCocina = cargarDatos('cocina') || [];
    
    // Buscar el pedido para obtener sus datos antes de eliminarlo
    const pedidoCompletado = pedidosCocina.find(pedido => pedido.id === pedidoId);
    
    // Filtrar pedido de cocina
    pedidosCocina = pedidosCocina.filter(pedido => pedido.id !== pedidoId);
    
    // Guardar pedidos de cocina actualizados
    guardarDatos('cocina', pedidosCocina);
    
    // Actualizar el historial si es necesario
    // Marcar el pedido como completado en cocina
    let historial = cargarDatos('historial') || [];
    const pedidoHistorialIndex = historial.findIndex(pedido => pedido.id === pedidoId);
    
    if (pedidoHistorialIndex !== -1) {
        historial[pedidoHistorialIndex].completadoCocina = true;
        historial[pedidoHistorialIndex].fechaCompletadoCocina = new Date().toLocaleDateString();
        historial[pedidoHistorialIndex].horaCompletadoCocina = new Date().toLocaleTimeString();
        guardarDatos('historial', historial);
    }
    
    // Actualizar en pagos si existe
    let pedidosPagos = cargarDatos('pagos') || [];
    const pedidoPagosIndex = pedidosPagos.findIndex(pedido => pedido.id === pedidoId);
    
    if (pedidoPagosIndex !== -1) {
        pedidosPagos[pedidoPagosIndex].completadoCocina = true;
        pedidosPagos[pedidoPagosIndex].fechaCompletadoCocina = new Date().toLocaleDateString();
        pedidosPagos[pedidoPagosIndex].horaCompletadoCocina = new Date().toLocaleTimeString();
        guardarDatos('pagos', pedidosPagos);
    }
    
    // Registrar en el log
    console.log(`Pedido ${pedidoId} marcado como completado por cocina`);
    
    // Mostrar mensaje de éxito
    alert('Pedido completado correctamente');
    
    // Actualizar interfaz de cocina
    cargarCocina();
    
    // Si estamos en la sección de historial, actualizar
    if (document.getElementById('historial').classList.contains('active')) {
        cargarHistorial();
    }
    
    // Si estamos en la sección de pagos, actualizar
    if (document.getElementById('pagos').classList.contains('active')) {
        cargarPagos();
    }
}
