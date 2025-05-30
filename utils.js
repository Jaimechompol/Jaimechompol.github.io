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
    pedidoActual = {
        id: generarId(),
        cliente: '',
        mesa: '',
        items: [],
        total: 0,
        ...obtenerFechaHoraActual()
    };
    actualizarInterfazPedido();
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
    
    // Agregar al pedido
    pedidoActual.items.push(item);
    
    // Recalcular total
    recalcularTotalPedido();
    
    // Actualizar interfaz
    actualizarInterfazPedido();
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
    guardarPedidoEnPagos(pedidoFinal);
    
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
    
    // Agregar nuevo pedido
    historial.push(pedido);
    
    // Guardar historial actualizado
    guardarDatos('historial', historial);
    
    // Actualizar interfaz de historial si está visible
    if (document.getElementById('historial').classList.contains('active')) {
        cargarHistorial();
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
        
        // Agregar nuevo pedido
        pedidosCocina.push(pedidoCocina);
        
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
    
    // Agregar nuevo pago
    pagos.push(pago);
    
    // Guardar pagos actualizados
    guardarDatos('pagos', pagos);
    
    // Actualizar interfaz de pagos si está visible
    if (document.getElementById('pagos').classList.contains('active')) {
        cargarPagos();
    }
}/**
 * Archivo de utilidades para la aplicación de pedidos
 * Contiene funciones comunes utilizadas en toda la aplicación
 */

// Función para formatear precios en formato de moneda
function formatearPrecio(precio) {
    return '$' + parseFloat(precio).toFixed(2);
}

// Función para generar un ID único
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Función para obtener la fecha y hora actual formateada
function obtenerFechaHoraActual() {
    const ahora = new Date();
    return {
        fecha: ahora.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        hora: ahora.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        timestamp: ahora.getTime()
    };
}

// Función para guardar datos en localStorage
function guardarDatos(clave, datos) {
    try {
        // Verificar si localStorage está disponible
        if (typeof localStorage === 'undefined') {
            console.warn('localStorage no está disponible en este entorno');
            return false;
        }
        
        // Intentar guardar los datos
        localStorage.setItem(clave, JSON.stringify(datos));
        return true;
    } catch (error) {
        console.error('Error al guardar datos:', error);
        // Si hay un error de cuota, intentar limpiar algunos datos menos importantes
        if (error.name === 'QuotaExceededError') {
            try {
                // Intentar limpiar datos menos críticos
                localStorage.removeItem('comprobantes_guardados');
                // Intentar nuevamente guardar los datos importantes
                localStorage.setItem(clave, JSON.stringify(datos));
                return true;
            } catch (secondError) {
                console.error('Error al intentar recuperar espacio:', secondError);
            }
        }
        return false;
    }
}

// Función para cargar datos desde localStorage
function cargarDatos(clave) {
    try {
        // Verificar si localStorage está disponible
        if (typeof localStorage === 'undefined') {
            console.warn('localStorage no está disponible en este entorno');
            return null;
        }
        
        // Intentar cargar los datos
        const datos = localStorage.getItem(clave);
        
        // Si no hay datos, devolver null
        if (!datos) return null;
        
        // Intentar parsear los datos
        try {
            return JSON.parse(datos);
        } catch (parseError) {
            console.error('Error al parsear JSON:', parseError);
            return null;
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        return null;
    }
}

// Función para mostrar un modal
function mostrarModal(id) {
    console.log('Mostrando modal:', id);
    const modal = document.getElementById(id);
    if (modal) {
        console.log('Modal encontrado, mostrando...');
        // Asegurarnos de que el modal sea visible
        modal.style.display = 'block';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        
        // Asegurarnos de que el fondo del modal sea visible
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        
        // Asegurarnos de que el contenido del modal sea visible
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.display = 'block';
            modalContent.style.visibility = 'visible';
            modalContent.style.opacity = '1';
        }
        
        // Configurar el evento de cierre para el botón X
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function() {
                cerrarModal(id);
            };
        }
        
        // Permitir cerrar el modal haciendo clic fuera del contenido
        modal.onclick = function(event) {
            if (event.target === modal) {
                cerrarModal(id);
            }
        };
    } else {
        console.error('Modal no encontrado:', id);
    }
}

// Función para cerrar un modal
function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para crear un elemento HTML con atributos y contenido
function crearElemento(tag, atributos = {}, contenido = '') {
    const elemento = document.createElement(tag);
    
    // Asignar atributos
    for (const [clave, valor] of Object.entries(atributos)) {
        if (clave === 'class') {
            elemento.className = valor;
        } else {
            elemento.setAttribute(clave, valor);
        }
    }
    
    // Asignar contenido
    if (typeof contenido === 'string') {
        elemento.innerHTML = contenido;
    } else if (contenido instanceof HTMLElement) {
        elemento.appendChild(contenido);
    }
    
    return elemento;
}

// Función para encontrar un producto por ID
function encontrarProductoPorId(id) {
    return productos.find(producto => producto.id === id);
}

// Función para encontrar una opción adicional por ID
function encontrarOpcionAdicionalPorId(id) {
    return opcionesAdicionales.find(opcion => opcion.id === id);
}

// Función para encontrar un extra de pizza por ID
function encontrarExtraPizzaPorId(id) {
    return extrasPizza.find(extra => extra.id === id);
}

// Función para encontrar un sabor de pizza por ID
function encontrarSaborPizzaPorId(id) {
    return saboresPizza.find(sabor => sabor.id === id);
}

// Función para encontrar un término de corte por ID
function encontrarTerminoCortePorId(id) {
    return terminosCorte.find(termino => termino.id === id);
}

// Función para generar un comprobante en formato HTML
function generarComprobanteHTML(pedido) {
    const { cliente, mesa, items, total, fecha, hora, id } = pedido;
    
    // Calcular subtotal y número de artículos
    const numArticulos = items.reduce((sum, item) => sum + item.cantidad, 0);
    
    let html = `
        <div class="comprobante-ticket">
            <div class="comprobante-header">
                <div class="comprobante-titulo">D' cary</div>
                <div class="comprobante-subtitulo">Pedido Mesa ${mesa}</div>
            </div>
            
            <div class="comprobante-info">
                <div class="comprobante-info-row">
                    <div class="comprobante-info-col">Fecha: ${fecha}</div>
                    <div class="comprobante-info-col">Cliente: ${cliente}</div>
                </div>
                <div class="comprobante-info-row">
                    <div class="comprobante-info-col">Hora: ${hora}</div>
                    <div class="comprobante-info-col">Ticket #: ${id.substring(0, 6)}</div>
                </div>
            </div>
            
            <div class="comprobante-items">
                <div class="comprobante-items-header">
                    <span>Artículos (${numArticulos})</span>
                </div>
    `;
    
    // Agregar items del pedido
    items.forEach(item => {
        html += `
            <div class="comprobante-item">
                <div class="comprobante-item-nombre">
                    <span>${item.cantidad}x ${item.nombre}</span>
                    ${item.detalles ? `<div class="comprobante-item-detalles">${item.detalles}</div>` : ''}
                </div>
                <div class="comprobante-item-precio">${formatearPrecio(item.precio * item.cantidad)}</div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div class="comprobante-total-row">
                <div class="comprobante-total-label">TOTAL</div>
                <div class="comprobante-total-valor">${formatearPrecio(total)}</div>
            </div>
            
            <div class="comprobante-footer">
                <div>¡Gracias por su preferencia!</div>
                <div>Vuelva pronto</div>
                <div class="comprobante-fecha-emision">Emitido: ${new Date().toLocaleString()}</div>
            </div>
        </div>
    `;
    
    return html;
}

// Función para convertir HTML a imagen
function convertirHTMLaImagen(elementoHTML) {
    return new Promise((resolve, reject) => {
        html2canvas(elementoHTML, {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const imagen = canvas.toDataURL('image/png');
            resolve(imagen);
        }).catch(error => {
            console.error('Error al convertir HTML a imagen:', error);
            reject(error);
        });
    });
}

// Función para descargar una imagen
function descargarImagen(dataUrl, nombreArchivo) {
    const enlace = document.createElement('a');
    enlace.href = dataUrl;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

// Función para enviar por WhatsApp
function enviarPorWhatsApp(texto, imagen) {
    // Crear un mensaje para WhatsApp
    const mensaje = encodeURIComponent(texto);
    
    if (imagen) {
        // Si tenemos una imagen, primero la guardamos temporalmente
        // Crear un elemento de imagen para compartir
        const imgElement = document.createElement('img');
        imgElement.src = imagen;
        
        // Crear un contenedor para la imagen
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.zIndex = '-1';
        container.style.opacity = '0';
        container.appendChild(imgElement);
        document.body.appendChild(container);
        
        // Intentar compartir la imagen usando la Web Share API si está disponible
        if (navigator.share) {
            // Convertir la imagen a un archivo
            fetch(imagen)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'comprobante.png', { type: 'image/png' });
                    navigator.share({
                        title: 'Comprobante de Pedido',
                        text: texto,
                        files: [file]
                    }).catch(error => {
                        console.error('Error al compartir:', error);
                        // Si falla, usar el método tradicional
                        window.open(`https://wa.me/?text=${mensaje}`, '_blank');
                    }).finally(() => {
                        // Limpiar el contenedor temporal
                        document.body.removeChild(container);
                    });
                });
        } else {
            // Si Web Share API no está disponible, abrir WhatsApp con solo el texto
            window.open(`https://wa.me/?text=${mensaje}`, '_blank');
            // Limpiar el contenedor temporal
            document.body.removeChild(container);
        }
    } else {
        // Si no hay imagen, simplemente abrir WhatsApp con el texto
        window.open(`https://wa.me/?text=${mensaje}`, '_blank');
    }
}

// Función para obtener productos de cocina de un pedido
function obtenerProductosCocina(items) {
    // Filtrar productos que van a cocina (pizzas, cortes, etc.)
    return items.filter(item => {
        const producto = encontrarProductoPorId(item.productoId);
        if (!producto) return false;
        
        return producto.categoria === CATEGORIAS.PIZZAS || 
               producto.categoria === CATEGORIAS.CORTES || 
               producto.categoria === CATEGORIAS.MARISCOS ||
               producto.categoria === CATEGORIAS.BANDEJAS ||
               producto.categoria === CATEGORIAS.PLATOS;
    });
}

// Función para contar acompañamientos en un pedido
function contarAcompañamientos(items) {
    console.log('Contando acompañamientos para', items.length, 'items');
    
    const contador = {
        ensaladas: 0,
        papas: 0,
        patacones: 0,
        yucas: 0,
        arrozMenestra: 0,
        arrozMoro: 0
    };
    
    items.forEach(item => {
        console.log('Revisando item:', item.nombre, 'Tiene acompañamientos:', !!item.acompañamientos);
        
        // Verificar si el item tiene acompañamientos
        if (item.acompañamientos && Array.isArray(item.acompañamientos)) {
            console.log(`Item ${item.nombre} tiene ${item.acompañamientos.length} acompañamientos`);
            
            item.acompañamientos.forEach(acomp => {
                // Verificar si el acompañamiento tiene nombre
                if (!acomp || !acomp.nombre) {
                    console.log('Acompañamiento sin nombre detectado:', acomp);
                    return;
                }
                
                // Normalizar el nombre para comparación (quitar acentos, minúsculas)
                const nombreNormalizado = acomp.nombre.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                
                console.log('Procesando acompañamiento:', acomp.nombre, '- Normalizado:', nombreNormalizado);
                
                // Contar cada tipo de acompañamiento
                if (nombreNormalizado.includes('ensalada')) {
                    contador.ensaladas += item.cantidad;
                    console.log(`Incrementando ensaladas a ${contador.ensaladas}`);
                }
                if (nombreNormalizado.includes('papa')) {
                    contador.papas += item.cantidad;
                    console.log(`Incrementando papas a ${contador.papas}`);
                }
                if (nombreNormalizado.includes('patacon') || nombreNormalizado.includes('patacón')) {
                    contador.patacones += item.cantidad;
                    console.log(`Incrementando patacones a ${contador.patacones}`);
                }
                if (nombreNormalizado.includes('yuca')) {
                    contador.yucas += item.cantidad;
                    console.log(`Incrementando yucas a ${contador.yucas}`);
                }
                if (nombreNormalizado.includes('arroz') && nombreNormalizado.includes('menestra')) {
                    contador.arrozMenestra += item.cantidad;
                    console.log(`Incrementando arroz menestra a ${contador.arrozMenestra}`);
                }
                if (nombreNormalizado.includes('arroz') && nombreNormalizado.includes('moro')) {
                    contador.arrozMoro += item.cantidad;
                    console.log(`Incrementando arroz moro a ${contador.arrozMoro}`);
                }
            });
        } else if (item.porcion && item.porcion.nombre) {
            // También verificar si hay porción adicional que debería contarse como acompañamiento
            const nombreNormalizado = item.porcion.nombre.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            console.log('Procesando porción adicional:', item.porcion.nombre, '- Normalizado:', nombreNormalizado);
            
            // Contar cada tipo de porción como acompañamiento
            if (nombreNormalizado.includes('ensalada')) {
                contador.ensaladas += item.cantidad;
                console.log(`Incrementando ensaladas (porción) a ${contador.ensaladas}`);
            }
            if (nombreNormalizado.includes('papa')) {
                contador.papas += item.cantidad;
                console.log(`Incrementando papas (porción) a ${contador.papas}`);
            }
            if (nombreNormalizado.includes('patacon') || nombreNormalizado.includes('patacón')) {
                contador.patacones += item.cantidad;
                console.log(`Incrementando patacones (porción) a ${contador.patacones}`);
            }
            if (nombreNormalizado.includes('yuca')) {
                contador.yucas += item.cantidad;
                console.log(`Incrementando yucas (porción) a ${contador.yucas}`);
            }
            if (nombreNormalizado.includes('arroz') && nombreNormalizado.includes('menestra')) {
                contador.arrozMenestra += item.cantidad;
                console.log(`Incrementando arroz menestra (porción) a ${contador.arrozMenestra}`);
            }
            if (nombreNormalizado.includes('arroz') && nombreNormalizado.includes('moro')) {
                contador.arrozMoro += item.cantidad;
                console.log(`Incrementando arroz moro (porción) a ${contador.arrozMoro}`);
            }
        }
    });
    
    console.log('Contador final de acompañamientos:', contador);
    return contador;
}

/**
 * Función para verificar y limpiar datos antiguos
 * Limpia historial, cocina, pagos y estadísticas después de 6 horas
 */
function verificarYLimpiarDatosAntiguos() {
    // Obtener la última vez que se limpiaron los datos
    const ultimaLimpieza = cargarDatos('ultima_limpieza') || Date.now();
    const ahora = Date.now();
    
    // Calcular diferencia en horas
    const diferenciaHoras = (ahora - ultimaLimpieza) / (1000 * 60 * 60);
    
    // Si han pasado 6 horas o más, limpiar datos
    if (diferenciaHoras >= 6) {
        console.log('Limpiando datos antiguos...');
        
        // Guardar datos importantes en archivo de respaldo antes de limpiar
        const historial = cargarDatos('historial') || [];
        const pagos = cargarDatos('pagos') || [];
        const reportesPagos = cargarDatos('reportes_pagos') || [];
        
        // Crear respaldo con fecha
        const fechaRespaldo = new Date().toISOString().split('T')[0];
        guardarDatos(`respaldo_historial_${fechaRespaldo}`, historial);
        guardarDatos(`respaldo_pagos_${fechaRespaldo}`, pagos);
        guardarDatos(`respaldo_reportes_${fechaRespaldo}`, reportesPagos);
        
        // Limpiar secciones
        guardarDatos('historial', []);
        guardarDatos('cocina', []);
        guardarDatos('pagos', []);
        
        // Actualizar última limpieza
        guardarDatos('ultima_limpieza', ahora);
        
        console.log('Datos antiguos limpiados y respaldados correctamente.');
        actualizarContadorLimpieza();
        return true;
    }
    
    // Actualizar el contador de tiempo restante
    actualizarContadorLimpieza();
    return false;
}

/**
 * Función para actualizar el contador de tiempo restante para la limpieza
 */
function actualizarContadorLimpieza() {
    // Obtener elementos del contador
    const contadorElement = document.getElementById('contador-tiempo');
    const contadorContainer = document.getElementById('contador-limpieza');
    
    if (!contadorElement) return; // Si no existe el elemento, salir
    
    // Intentar obtener la última vez que se limpiaron los datos
    let ultimaLimpieza;
    
    try {
        // Intentar cargar desde localStorage
        ultimaLimpieza = cargarDatos('ultima_limpieza');
        
        // Si no hay datos en localStorage, usar sessionStorage como respaldo
        if (!ultimaLimpieza && typeof sessionStorage !== 'undefined') {
            const sessionData = sessionStorage.getItem('ultima_limpieza');
            if (sessionData) {
                ultimaLimpieza = JSON.parse(sessionData);
            }
        }
        
        // Si aún no hay datos, usar el tiempo actual
        if (!ultimaLimpieza) {
            ultimaLimpieza = Date.now();
            // Intentar guardar en ambos almacenamientos
            guardarDatos('ultima_limpieza', ultimaLimpieza);
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('ultima_limpieza', JSON.stringify(ultimaLimpieza));
            }
        }
    } catch (error) {
        console.error('Error al obtener la última limpieza:', error);
        ultimaLimpieza = Date.now(); // Usar tiempo actual como respaldo
    }
    
    const ahora = Date.now();
    
    // Calcular tiempo restante en milisegundos (6 horas - tiempo transcurrido)
    const tiempoTranscurrido = ahora - ultimaLimpieza;
    const tiempoRestante = Math.max(0, (6 * 60 * 60 * 1000) - tiempoTranscurrido);
    
    // Convertir a formato horas:minutos:segundos
    const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);
    
    // Formatear con ceros a la izquierda
    const horasStr = horas.toString().padStart(2, '0');
    const minutosStr = minutos.toString().padStart(2, '0');
    const segundosStr = segundos.toString().padStart(2, '0');
    
    // Actualizar el texto del contador
    contadorElement.textContent = `${horasStr}:${minutosStr}:${segundosStr}`;
    
    // Agregar clase de alerta si queda menos de 1 hora
    if (tiempoRestante < (60 * 60 * 1000)) {
        contadorContainer.classList.add('alerta');
    } else {
        contadorContainer.classList.remove('alerta');
    }
    
    // Si el tiempo llega a cero, refrescar la página para aplicar la limpieza
    if (tiempoRestante === 0) {
        try {
            // Limpiar datos antes de recargar
            guardarDatos('ultima_limpieza', Date.now());
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('ultima_limpieza', JSON.stringify(Date.now()));
            }
            // Recargar la página
            location.reload();
        } catch (error) {
            console.error('Error al reiniciar el temporizador:', error);
        }
    }
}

/**
 * Función para verificar y eliminar pedidos completados
 * Elimina pedidos completados de todas las secciones (historial, cocina, pagos)
 */
function verificarYEliminarPedidosCompletados() {
    console.log('Verificando y eliminando pedidos completados...');
    
    // Cargar pagos
    const pagos = cargarDatos('pagos') || [];
    
    // Filtrar pagos completados
    const pagosCompletados = pagos.filter(pago => pago.completado === true);
    
    if (pagosCompletados.length === 0) {
        console.log('No hay pagos completados para procesar');
        return;
    }
    
    console.log(`Se encontraron ${pagosCompletados.length} pagos completados para eliminar`);
    
    // Obtener todos los IDs de pedidos completados y sus pedidos originales
    const idsCompletados = [];
    
    pagosCompletados.forEach(pago => {
        idsCompletados.push(pago.id);
        if (pago.pedidoOriginal && pago.pedidoOriginal.id) {
            idsCompletados.push(pago.pedidoOriginal.id);
        }
    });
    
    console.log('IDs de pedidos completados:', idsCompletados);
    
    // Eliminar de historial
    let historial = cargarDatos('historial') || [];
    const historialAntes = historial.length;
    historial = historial.filter(pedido => !idsCompletados.includes(pedido.id));
    guardarDatos('historial', historial);
    console.log(`Eliminados ${historialAntes - historial.length} pedidos del historial`);
    
    // Eliminar de cocina
    let cocina = cargarDatos('cocina') || [];
    const cocinaAntes = cocina.length;
    cocina = cocina.filter(pedido => !idsCompletados.includes(pedido.id));
    guardarDatos('cocina', cocina);
    console.log(`Eliminados ${cocinaAntes - cocina.length} pedidos de cocina`);
    
    // Eliminar de pedidos guardados
    let pedidosGuardados = cargarDatos('pedidos_guardados') || [];
    const guardadosAntes = pedidosGuardados.length;
    pedidosGuardados = pedidosGuardados.filter(pedido => !idsCompletados.includes(pedido.id));
    guardarDatos('pedidos_guardados', pedidosGuardados);
    console.log(`Eliminados ${guardadosAntes - pedidosGuardados.length} pedidos guardados`);
    
    // Actualizar la lista de pagos para mantener solo los no completados
    const pagosActualizados = pagos.filter(pago => !pago.completado);
    guardarDatos('pagos', pagosActualizados);
    console.log(`Eliminados ${pagos.length - pagosActualizados.length} pedidos de pagos`);
    
    // Forzar actualización de interfaces
    localStorage.setItem('_force_refresh', Date.now());
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatearPrecio,
        generarId,
        obtenerFechaHoraActual,
        guardarDatos,
        cargarDatos,
        mostrarModal,
        cerrarModal,
        crearElemento,
        encontrarProductoPorId,
        encontrarOpcionAdicionalPorId,
        encontrarExtraPizzaPorId,
        encontrarSaborPizzaPorId,
        encontrarTerminoCortePorId,
        generarComprobanteHTML,
        convertirHTMLaImagen,
        descargarImagen,
        enviarPorWhatsApp,
        obtenerProductosCocina,
        contarAcompañamientos,
        verificarYLimpiarDatosAntiguos,
        actualizarContadorLimpieza,
        verificarYEliminarPedidosCompletados
    };
}
