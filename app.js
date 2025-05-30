/**
 * Archivo principal de la aplicación
 * Coordina todas las funcionalidades y gestiona la interfaz de usuario
 */

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar y limpiar datos antiguos (después de 6 horas)
    const datosLimpiados = verificarYLimpiarDatosAntiguos();
    
    // Si los datos fueron limpiados, mostrar mensaje
    if (datosLimpiados) {
        setTimeout(() => {
            alert('Los datos han sido limpiados automáticamente después de 6 horas. Se ha creado un respaldo de seguridad.');
        }, 1000);
    }
    
    // Verificar y eliminar pedidos completados
    verificarYEliminarPedidosCompletados();
    
    // Migrar pedidos guardados al historial
    migrarPedidosGuardadosAlHistorial();
    
    // Migrar pedidos del historial a cocina y pagos
    migrarPedidosHistorialACocinaPagos();
    
    // Inicializar secciones
    inicializarNavegacion();
    
    // Cargar productos
    cargarProductos();
    
    // Inicializar pedido actual
    inicializarPedidoActual();
    
    // Inicializar filtro de categorías
    inicializarFiltroCategorias();
    
    // Inicializar modales
    inicializarModales();
    
    // Inicializar botones
    inicializarBotones();
    
    // Cargar historial
    cargarHistorial();
    
    // Cargar cocina
    cargarCocina();
    
    // Cargar pagos
    cargarPagos();
    
    // Configurar verificación periódica cada hora
    setInterval(() => {
        verificarYLimpiarDatosAntiguos();
    }, 60 * 60 * 1000); // 1 hora en milisegundos
    
    // Actualizar el contador cada segundo
    setInterval(() => {
        actualizarContadorLimpieza();
    }, 1000); // 1 segundo
});

// Migrar pedidos guardados al historial
function migrarPedidosGuardadosAlHistorial() {
    // Verificar si hay pedidos guardados
    const pedidosGuardados = cargarDatos('pedidos_guardados') || [];
    
    if (pedidosGuardados.length === 0) {
        return; // No hay pedidos guardados para migrar
    }
    
    // Cargar historial actual
    let historial = cargarDatos('historial') || [];
    
    // Obtener IDs de pedidos en el historial
    const idsHistorial = historial.map(pedido => pedido.id);
    
    // Filtrar pedidos guardados que no estén en el historial
    const pedidosNuevos = pedidosGuardados.filter(pedido => !idsHistorial.includes(pedido.id));
    
    if (pedidosNuevos.length === 0) {
        return; // No hay pedidos nuevos para migrar
    }
    
    // Agregar pedidos nuevos al historial
    historial = [...historial, ...pedidosNuevos];
    
    // Guardar historial actualizado
    guardarDatos('historial', historial);
    
    // Limpiar pedidos guardados (opcional)
    // guardarDatos('pedidos_guardados', []);
    
    console.log(`Migrados ${pedidosNuevos.length} pedidos al historial`);
}

// Migrar pedidos del historial a cocina y pagos
function migrarPedidosHistorialACocinaPagos() {
    // Cargar historial actual
    const historial = cargarDatos('historial') || [];
    
    if (historial.length === 0) {
        return; // No hay pedidos en el historial para migrar
    }
    
    // Cargar pedidos de cocina y pagos actuales
    let pedidosCocina = cargarDatos('cocina') || [];
    let pedidosPagos = cargarDatos('pagos') || [];
    
    // Obtener IDs de pedidos en cocina y pagos
    const idsCocina = pedidosCocina.map(pedido => pedido.id);
    const idsPagos = pedidosPagos.map(pedido => pedido.id);
    
    // Contador de migraciones
    let migradosACocina = 0;
    let migradosAPagos = 0;
    
    // Procesar cada pedido del historial
    historial.forEach(pedido => {
        // Verificar si el pedido tiene productos de cocina y no está ya en cocina
        const productosCocina = obtenerProductosCocina(pedido.items);
        if (productosCocina.length > 0 && !idsCocina.includes(pedido.id)) {
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
            
            // Agregar a cocina
            pedidosCocina.push(pedidoCocina);
            migradosACocina++;
        }
        
        // Verificar si el pedido no está ya en pagos
        if (!idsPagos.includes(pedido.id)) {
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
            
            // Agregar a pagos
            pedidosPagos.push(pago);
            migradosAPagos++;
        }
    });
    
    // Guardar datos actualizados si hubo cambios
    if (migradosACocina > 0) {
        guardarDatos('cocina', pedidosCocina);
        console.log(`Migrados ${migradosACocina} pedidos a cocina`);
    }
    
    if (migradosAPagos > 0) {
        guardarDatos('pagos', pedidosPagos);
        console.log(`Migrados ${migradosAPagos} pedidos a pagos`);
    }
}

// Inicializar navegación entre secciones
function inicializarNavegacion() {
    const enlaces = document.querySelectorAll('.nav-link');
    
    // Verificar si hay una sección guardada en sessionStorage
    const seccionGuardada = sessionStorage.getItem('seccion_activa');
    if (seccionGuardada) {
        cambiarSeccion(seccionGuardada);
    }
    
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', (e) => {
            e.preventDefault();
            const seccion = enlace.getAttribute('data-section');
            
            // Guardar la sección seleccionada en sessionStorage
            sessionStorage.setItem('seccion_activa', seccion);
            
            // Cambiar a la sección seleccionada
            cambiarSeccion(seccion);
            
            // Recargar la página después de un breve retraso
            setTimeout(() => {
                location.reload();
            }, 100);
        });
    });
}

// Cambiar sección activa
function cambiarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Desactivar todos los enlaces
    document.querySelectorAll('.nav-link').forEach(enlace => {
        enlace.classList.remove('active');
    });
    
    // Activar sección y enlace correspondiente
    document.getElementById(seccion).classList.add('active');
    document.querySelector(`.nav-link[data-section="${seccion}"]`).classList.add('active');
    
    // Actualizar datos según la sección seleccionada
    switch (seccion) {
        case 'pedidos':
            // Actualizar productos y pedido actual
            cargarProductos();
            actualizarInterfazPedido();
            break;
        case 'historial':
            // Actualizar historial de pedidos
            cargarHistorial();
            break;
        case 'cocina':
            // Actualizar pedidos en cocina
            cargarCocina();
            break;
        case 'pagos':
            // Actualizar pagos pendientes
            cargarPagos();
            break;
    }
    
    // Verificar y eliminar pedidos completados
    verificarYEliminarPedidosCompletados();
}

// Cargar productos en la interfaz
function cargarProductos() {
    const contenedorProductos = document.getElementById('productos-lista');
    
    // Limpiar contenedor
    contenedorProductos.innerHTML = '';
    
    // Agregar productos
    productos.forEach(producto => {
        const productoElement = crearElementoProducto(producto);
        contenedorProductos.appendChild(productoElement);
    });
    
    // Inicializar filtro de categorías
    inicializarFiltroCategorias();
}

// Crear elemento HTML para un producto
function crearElementoProducto(producto) {
    const productoElement = crearElemento('div', { 
        class: 'producto-card', 
        'data-id': producto.id, 
        'data-categoria': producto.categoria,
        'data-tipo': producto.tipo
    });
    
    const nombreElement = crearElemento('div', { class: 'producto-nombre' }, producto.nombre);
    const precioElement = crearElemento('div', { class: 'producto-precio' }, formatearPrecio(producto.precio));
    
    productoElement.appendChild(nombreElement);
    productoElement.appendChild(precioElement);
    
    if (producto.descripcion) {
        const descripcionElement = crearElemento('div', { class: 'producto-descripcion' }, producto.descripcion);
        productoElement.appendChild(descripcionElement);
    }
    
    // Agregar evento click
    productoElement.addEventListener('click', () => seleccionarProducto(producto));
    
    return productoElement;
}

// Inicializar filtro de categorías
function inicializarFiltroCategorias() {
    const botonesCategorias = document.querySelectorAll('.categoria-btn');
    
    botonesCategorias.forEach(boton => {
        boton.addEventListener('click', () => {
            // Desactivar todos los botones
            botonesCategorias.forEach(b => b.classList.remove('active'));
            
            // Activar botón seleccionado
            boton.classList.add('active');
            
            // Filtrar productos
            const categoria = boton.getAttribute('data-categoria');
            filtrarProductosPorCategoria(categoria);
        });
    });
}

// Filtrar productos por categoría
function filtrarProductosPorCategoria(categoria) {
    const productosElements = document.querySelectorAll('.producto-card');
    
    productosElements.forEach(producto => {
        if (categoria === 'todos' || producto.getAttribute('data-categoria') === categoria) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });
}

// Seleccionar producto
function seleccionarProducto(producto) {
    // Verificar si el producto es especial (no requiere acompañamientos obligatorios)
    const productosEspeciales = ['Asado Completo', 'Picaditas de Carne', 'Seco de Gallina', 'Arroz con Camarón', 'Arroz Mariscos'];
    const esProductoEspecial = productosEspeciales.includes(producto.nombre) || producto.sinAcompanamientosObligatorios === true;
    
    // Productos que requieren selección de término (estos también llevan porciones adicionales)
    const productosConTermino = ['Picaña', 'Ribye', 'Lomo fino', 'Costillas ahumadas'];
    const requiereTermino = productosConTermino.includes(producto.nombre);
    
    // Verificar tipo de producto
    if (esProductoEspecial) {
        // Los productos especiales se agregan directamente sin modal
        agregarProductoDirecto(producto);
    } else if (requiereTermino) {
        // Productos que requieren término Y porciones adicionales
        mostrarModalCorte(producto);
    } else if (producto.tipo === TIPOS_PRODUCTO.PIZZA) {
        // Para pizzas, mostrar el modal de pizza
        mostrarModalPizza(producto);
    } else if (producto.tipo === TIPOS_PRODUCTO.PLATO || producto.tipo === TIPOS_PRODUCTO.CORTE || producto.tipo === TIPOS_PRODUCTO.CORTE_TERMINO) {
        // Todos los demás platos y cortes (que no son especiales y no requieren término) requieren porciones adicionales
        mostrarModalCorte(producto);
    } else {
        // Para todos los demás productos (bebidas, etc.), agregar directamente
        agregarProductoDirecto(producto);
    }
}

// Agregar producto directo al pedido
function agregarProductoDirecto(producto) {
    // Detectar si el producto tiene acompañamientos obligatorios (ensalada y porción adicional)
    let item = {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1, // Siempre agregamos cantidad 1
        detalles: producto.descripcion || '',
        timestamp: Date.now() // Agregamos timestamp para diferenciar productos idénticos
    };
    
    // Verificar si el producto está marcado para no incluir acompañamientos obligatorios
    const productosEspeciales = ['Asado Completo', 'Picaditas de Carne', 'Seco de Gallina', 'Arroz con Camarón', 'Arroz Mariscos'];
    const esProductoEspecial = productosEspeciales.includes(producto.nombre) || producto.sinAcompanamientosObligatorios === true;
    
    // Si el producto tiene acompañamientos obligatorios y no es un producto especial, agregarlos al item
    if (producto.acompanamientosObligatorios && !esProductoEspecial) {
        item.acompanamientos = producto.acompanamientosObligatorios;
    }
    
    agregarItemPedido(item);
}

// Mostrar modal de opciones para cortes
function mostrarModalCorte(producto) {
    // Establecer nombre del producto
    document.getElementById('nombre-corte').textContent = producto.nombre;
    
    // Verificar si el producto requiere término
    const productosConTermino = ['Picaña', 'Ribye', 'Lomo fino', 'Costillas ahumadas'];
    const requiereTermino = productosConTermino.includes(producto.nombre);
    
    // Llenar opciones de términos
    const terminosContainer = document.getElementById('terminos-opciones');
    terminosContainer.innerHTML = '';
    
    // Si el producto no requiere término, agregar opción "Sin término"
    if (!requiereTermino) {
        const sinTerminoElement = crearElemento('div', { 
            class: 'opcion-item active', // Activado por defecto
            'data-id': '0' 
        }, 'Sin término');
        
        sinTerminoElement.addEventListener('click', () => {
            // Desactivar todos los términos
            document.querySelectorAll('#terminos-opciones .opcion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Activar término seleccionado
            sinTerminoElement.classList.add('active');
        });
        
        terminosContainer.appendChild(sinTerminoElement);
    }
    
    // Agregar opciones de término normales
    terminosCorte.forEach(termino => {
        const terminoElement = crearElemento('div', { 
            class: 'opcion-item' + (requiereTermino && termino.id === 1 ? ' active' : ''), // Activar el primer término por defecto para productos que requieren término
            'data-id': termino.id 
        }, termino.nombre);
        
        terminoElement.addEventListener('click', () => {
            // Desactivar todos los términos
            document.querySelectorAll('#terminos-opciones .opcion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Activar término seleccionado
            terminoElement.classList.add('active');
        });
        
        terminosContainer.appendChild(terminoElement);
    });
    
    // Llenar opciones de porciones adicionales
    const porcionesContainer = document.getElementById('porciones-opciones');
    porcionesContainer.innerHTML = '';
    
    // Agregar opción "Sin porción adicional"
    const sinPorcionElement = crearElemento('div', { 
        class: 'opcion-item active', // Activado por defecto
        'data-id': '0',
        'data-precio': '0'
    }, 'Sin acompañamientos');
    
    sinPorcionElement.addEventListener('click', () => {
        // Desactivar todas las opciones
        document.querySelectorAll('#porciones-opciones .opcion-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Activar opción seleccionada
        sinPorcionElement.classList.add('active');
    });
    
    porcionesContainer.appendChild(sinPorcionElement);
    
    // Agregar opciones de porciones adicionales normales
    opcionesAdicionales.forEach(opcion => {
        const opcionElement = crearElemento('div', { 
            class: 'opcion-item', 
            'data-id': opcion.id,
            'data-precio': opcion.precio
        }, opcion.nombre);
        
        opcionElement.addEventListener('click', () => {
            // Desactivar todas las opciones
            document.querySelectorAll('#porciones-opciones .opcion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Activar opción seleccionada
            opcionElement.classList.add('active');
        });
        
        porcionesContainer.appendChild(opcionElement);
    });
    
    // Eliminamos los botones de cantidad ya que ahora cada selección agregará un producto individual
    
    // Eliminar event listener anterior para evitar duplicaciones
    const btnAgregarCorte = document.getElementById('btn-agregar-corte');
    const nuevoBtn = btnAgregarCorte.cloneNode(true);
    btnAgregarCorte.parentNode.replaceChild(nuevoBtn, btnAgregarCorte);
    
    // Configurar botón de agregar con un nuevo event listener
    nuevoBtn.addEventListener('click', () => {
        // Obtener término seleccionado
        const terminoSeleccionado = document.querySelector('#terminos-opciones .opcion-item.active');
        if (!terminoSeleccionado) {
            alert('Seleccione un término para el corte');
            return;
        }
        
        // Obtener porción adicional seleccionada
        const porcionSeleccionada = document.querySelector('#porciones-opciones .opcion-item.active');
        if (!porcionSeleccionada) {
            alert('Seleccione una porción adicional');
            return;
        }
        
        // Obtener datos del término y porción
        const terminoId = parseInt(terminoSeleccionado.getAttribute('data-id'));
        const porcionId = parseInt(porcionSeleccionada.getAttribute('data-id'));
        const porcionPrecio = parseFloat(porcionSeleccionada.getAttribute('data-precio') || '0');
        
        // Verificar si el producto requiere término
        const productosConTermino = ['Picaña', 'Ribye', 'Lomo fino', 'Costillas ahumadas'];
        const requiereTermino = productosConTermino.includes(producto.nombre);
        
        // Obtener término y porción
        let termino;
        if (terminoId === 0) {
            // Opción "Sin término"
            termino = { nombre: 'Sin término', descripcion: 'Sin término' };
        } else {
            termino = encontrarTerminoCortePorId(terminoId);
        }
        
        let porcion;
        if (porcionId === 0) {
            // Opción "Sin acompañamientos"
            porcion = { 
                nombre: 'Sin acompañamientos', 
                descripcion: 'Sin acompañamientos', 
                precio: 0,
                sinAcompanamientos: true // Marcar que no lleva acompañamientos
            };
        } else {
            porcion = encontrarOpcionAdicionalPorId(porcionId);
        }
        
        // Calcular precio final
        let precioFinal = producto.precio;
        if (porcion.nombre === 'Arroz Moro') {
            precioFinal += porcionPrecio;
        }
        
        // Crear detalles (texto más corto para la factura)
        let detalles = '';
        if (requiereTermino || terminoId !== 0) {
            if (porcion.sinAcompanamientos) {
                detalles = termino.nombre;
            } else {
                detalles = `${termino.nombre}, ${porcion.nombre}`;
            }
        } else {
            if (porcion.sinAcompanamientos) {
                detalles = ''; // Sin detalles si no hay término ni acompañamientos
            } else {
                detalles = porcion.nombre;
            }
        }
        
        // Verificar si el producto está marcado para no incluir acompañamientos obligatorios
        const productosEspeciales = ['Asado Completo', 'Picaditas de Carne', 'Seco de Gallina', 'Arroz con Camarón', 'Arroz Mariscos'];
        const esProductoEspecial = productosEspeciales.includes(producto.nombre) || producto.sinAcompanamientosObligatorios === true;
        
        // Crear objeto de producto para agregar al pedido
        const productoParaAgregar = {
            id: generarId(),
            nombre: producto.nombre,
            precio: precioFinal,
            cantidad: 1,
            detalles: detalles,
            tipo: producto.tipo
        };
        
        // Agregar acompañamientos solo si no se seleccionó "Sin acompañamientos"
        if (!porcion.sinAcompanamientos) {
            productoParaAgregar.acompañamientos = [
                { nombre: 'Ensalada', precio: 0 },
                { nombre: porcion.nombre, precio: porcion.precio }
            ];
        }
        // Si se seleccionó "Sin acompañamientos", no agregamos ningún acompañamiento
        
        // Agregar al pedido
        agregarItemPedido(productoParaAgregar);
        
        // Cerrar modal
        cerrarModal('modal-opciones-corte');
    });
    
    // Mostrar modal
    mostrarModal('modal-opciones-corte');
}

// Mostrar modal de opciones para pizzas
function mostrarModalPizza(producto) {
    // Establecer nombre del producto
    document.getElementById('nombre-pizza').textContent = producto.nombre;
    
    // Configurar tipo de pizza
    const tiposBtns = document.querySelectorAll('.tipo-pizza-btn');
    tiposBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Desactivar todos los botones
            tiposBtns.forEach(b => b.classList.remove('active'));
            
            // Activar botón seleccionado
            btn.classList.add('active');
            
            // Mostrar/ocultar opciones de mitades
            const tipo = btn.getAttribute('data-tipo');
            if (tipo === 'mitad') {
                document.getElementById('mitades-opciones').style.display = 'block';
            } else {
                document.getElementById('mitades-opciones').style.display = 'none';
            }
        });
    });
    
    // Llenar opciones de sabores para mitades
    const primeraMitadSelect = document.getElementById('primera-mitad');
    const segundaMitadSelect = document.getElementById('segunda-mitad');
    
    primeraMitadSelect.innerHTML = '';
    segundaMitadSelect.innerHTML = '';
    
    saboresPizza.forEach(sabor => {
        const option1 = crearElemento('option', { value: sabor.id }, sabor.nombre);
        const option2 = crearElemento('option', { value: sabor.id }, sabor.nombre);
        
        primeraMitadSelect.appendChild(option1);
        segundaMitadSelect.appendChild(option2);
    });
    
    // Llenar opciones de extras
    const extrasContainer = document.getElementById('extras-pizza');
    extrasContainer.innerHTML = '';
    
    extrasPizza.forEach(extra => {
        const extraElement = crearElemento('div', { 
            class: 'opcion-item', 
            'data-id': extra.id,
            'data-precio': extra.precio
        }, `${extra.nombre} (+$${extra.precio.toFixed(2)})`);
        
        extraElement.addEventListener('click', () => {
            // Toggle selección
            extraElement.classList.toggle('active');
        });
        
        extrasContainer.appendChild(extraElement);
    });
    
    // Eliminamos los botones de cantidad ya que ahora cada selección agregará un producto individual
    
    // Eliminar event listener anterior para evitar duplicaciones
    const btnAgregarPizza = document.getElementById('btn-agregar-pizza');
    const nuevoBtnPizza = btnAgregarPizza.cloneNode(true);
    btnAgregarPizza.parentNode.replaceChild(nuevoBtnPizza, btnAgregarPizza);
    
    // Configurar botón de agregar con un nuevo event listener
    nuevoBtnPizza.addEventListener('click', () => {
        // Obtener tipo de pizza
        const tipoPizza = document.querySelector('.tipo-pizza-btn.active').getAttribute('data-tipo');
        
        // Obtener extras seleccionados
        const extrasSeleccionados = Array.from(document.querySelectorAll('#extras-pizza .opcion-item.active')).map(extra => {
            const extraId = parseInt(extra.getAttribute('data-id'));
            const extraPrecio = parseFloat(extra.getAttribute('data-precio'));
            const extraObj = encontrarExtraPizzaPorId(extraId);
            return {
                id: extraId,
                nombre: extraObj.nombre,
                precio: extraPrecio
            };
        });
        
        // Calcular precio con extras
        let precioFinal = producto.precio;
        extrasSeleccionados.forEach(extra => {
            precioFinal += extra.precio;
        });
        
        // Crear detalles
        let detalles = '';
        
        if (tipoPizza === 'mitad') {
            // Obtener sabores de mitades
            const primeraMitadId = parseInt(document.getElementById('primera-mitad').value);
            const segundaMitadId = parseInt(document.getElementById('segunda-mitad').value);
            
            const primeraMitad = encontrarSaborPizzaPorId(primeraMitadId);
            const segundaMitad = encontrarSaborPizzaPorId(segundaMitadId);
            
            // Crear un solo item con ambas mitades
            detalles = `Mitad ${primeraMitad.nombre} y mitad ${segundaMitad.nombre}`;
            
            // Agregar extras al detalle si hay
            if (extrasSeleccionados.length > 0) {
                const extrasTexto = extrasSeleccionados.map(extra => `${extra.nombre} (+$${extra.precio.toFixed(2)})`).join(', ');
                detalles += `, ${extrasTexto}`;
            }
            
            // Crear item para el pedido con ambas mitades
            const item = {
                productoId: producto.id,
                nombre: producto.nombre,
                precio: precioFinal,
                cantidad: 1, // Siempre agregamos cantidad 1
                detalles: detalles,
                timestamp: Date.now(), // Agregamos timestamp para diferenciar productos idénticos
                esMitad: true,  // Marcar que es una pizza por mitades
                mitades: [primeraMitad.nombre, segundaMitad.nombre]  // Guardar los nombres de las mitades
            };
            
            // Agregar al pedido
            agregarItemPedido(item);
        } else {
            // Para pizzas normales (no mitad y mitad)
            // Agregar extras al detalle
            if (extrasSeleccionados.length > 0) {
                const extrasTexto = extrasSeleccionados.map(extra => `${extra.nombre} (+$${extra.precio.toFixed(2)})`).join(', ');
                detalles = extrasTexto;
            }
            
            // Crear item para el pedido
            const item = {
                productoId: producto.id,
                nombre: producto.nombre,
                precio: precioFinal,
                cantidad: 1, // Siempre agregamos cantidad 1
                detalles: detalles,
                timestamp: Date.now() // Agregamos timestamp para diferenciar productos idénticos
            };
            
            // Agregar al pedido
            agregarItemPedido(item);
        }
        
        // Cerrar modal
        cerrarModal('modal-opciones-pizza');
    });
    
    // Mostrar modal
    mostrarModal('modal-opciones-pizza');
}

// Inicializar modales
function inicializarModales() {
    // Configurar botones de cierre
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            cerrarModal(modal.id);
        });
    });
    
    // Configurar cierre al hacer clic fuera del contenido
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal(modal.id);
            }
        });
    });
    
    // Configurar botones específicos de modales
    document.getElementById('btn-cancelar-opciones').addEventListener('click', () => cerrarModal('modal-opciones-corte'));
    document.getElementById('btn-cancelar-pizza').addEventListener('click', () => cerrarModal('modal-opciones-pizza'));
    document.getElementById('btn-cerrar-comprobante').addEventListener('click', () => cerrarModal('modal-comprobante'));
    
    // Configurar botones de comprobante
    document.getElementById('btn-guardar-comprobante').addEventListener('click', guardarComprobante);
    document.getElementById('btn-descargar-comprobante').addEventListener('click', descargarComprobante);
    document.getElementById('btn-whatsapp-comprobante').addEventListener('click', enviarComprobanteWhatsApp);
    
    // Configurar modal de venta libre
    document.getElementById('btn-cancelar-venta-libre').addEventListener('click', () => cerrarModal('modal-venta-libre'));
    document.getElementById('btn-agregar-venta-libre').addEventListener('click', agregarVentaLibre);
}

// Inicializar botones principales
function inicializarBotones() {
    // Botón de generar pedido
    document.getElementById('btn-generar-pedido').addEventListener('click', generarPedidoFinal);
    
    // Botón de guardar pedido
    document.getElementById('btn-guardar-pedido').addEventListener('click', guardarPedidoActual);
    
    // Botón de venta libre
    document.getElementById('btn-venta-libre').addEventListener('click', () => mostrarModal('modal-venta-libre'));
}

// Agregar venta libre
function agregarVentaLibre() {
    // Obtener datos del formulario
    const nombre = document.getElementById('nombre-producto-libre').value.trim();
    const precio = parseFloat(document.getElementById('precio-producto-libre').value);
    const cantidad = parseInt(document.getElementById('cantidad-producto-libre').value);
    
    // Validar datos
    if (!nombre || isNaN(precio) || precio <= 0 || isNaN(cantidad) || cantidad <= 0) {
        alert('Ingrese datos válidos para la venta libre');
        return;
    }
    
    // Crear item para el pedido
    const item = {
        nombre: nombre,
        precio: precio,
        cantidad: cantidad,
        detalles: 'Venta libre'
    };
    
    // Agregar al pedido
    agregarItemPedido(item);
    
    // Limpiar formulario
    document.getElementById('nombre-producto-libre').value = '';
    document.getElementById('precio-producto-libre').value = '';
    document.getElementById('cantidad-producto-libre').value = '1';
    
    // Cerrar modal
    cerrarModal('modal-venta-libre');
}

// Descargar comprobante como imagen
function descargarComprobante() {
    const contenidoComprobante = document.getElementById('comprobante-contenido');
    const pedidoId = document.getElementById('modal-comprobante').dataset.pedidoId;
    
    // Convertir a imagen
    convertirHTMLaImagen(contenidoComprobante)
        .then(imagen => {
            // Descargar imagen
            descargarImagen(imagen, `comprobante-${pedidoId}.png`);
        })
        .catch(error => {
            console.error('Error al generar imagen:', error);
            alert('Error al generar la imagen del comprobante');
        });
}

// Enviar comprobante por WhatsApp
function enviarComprobanteWhatsApp() {
    const contenidoComprobante = document.getElementById('comprobante-contenido');
    const pedidoId = document.getElementById('modal-comprobante').dataset.pedidoId;
    
    // Obtener datos del pedido
    const cliente = contenidoComprobante.querySelector('.comprobante-info-col:nth-child(2)').textContent;
    const mesa = contenidoComprobante.querySelector('.comprobante-subtitulo').textContent;
    const total = contenidoComprobante.querySelector('.comprobante-total-valor').textContent;
    
    // Crear mensaje
    const mensaje = `*${mesa}*\n${cliente}\nTotal: ${total}\n\n¡Gracias por su preferencia!`;
    
    // Convertir a imagen y enviar por WhatsApp
    convertirHTMLaImagen(contenidoComprobante)
        .then(imagen => {
            // Enviar mensaje e imagen por WhatsApp
            enviarPorWhatsApp(mensaje, imagen);
        })
        .catch(error => {
            console.error('Error al generar imagen para WhatsApp:', error);
            // Si falla la generación de imagen, enviar solo el mensaje
            enviarPorWhatsApp(mensaje);
        });
}

// Guardar comprobante sin descargar ni enviar
function guardarComprobante() {
    const pedidoId = document.getElementById('modal-comprobante').dataset.pedidoId;
    
    // Verificar que haya un ID de pedido
    if (!pedidoId) {
        alert('No se pudo guardar el comprobante');
        return;
    }
    
    // Cargar comprobantes guardados
    let comprobantesGuardados = cargarDatos('comprobantes_guardados') || [];
    
    // Verificar si ya existe un comprobante con este ID
    const existeComprobante = comprobantesGuardados.some(comp => comp.id === pedidoId);
    
    if (existeComprobante) {
        alert('Este comprobante ya está guardado');
        return;
    }
    
    // Obtener el HTML del comprobante
    const htmlComprobante = document.getElementById('comprobante-contenido').innerHTML;
    
    // Crear objeto de comprobante guardado
    const comprobanteGuardado = {
        id: pedidoId,
        html: htmlComprobante,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString()
    };
    
    // Agregar a la lista de comprobantes guardados
    comprobantesGuardados.push(comprobanteGuardado);
    
    // Guardar en localStorage
    guardarDatos('comprobantes_guardados', comprobantesGuardados);
    
    // Mostrar mensaje de éxito
    alert('Comprobante guardado correctamente');
}

// Guardar pedido actual sin generar comprobante
function guardarPedidoActual() {
    // Verificar que haya items en el pedido
    if (pedidoActual.items.length === 0) {
        alert('No hay productos en el pedido');
        return;
    }
    
    // Verificar datos del cliente
    const nombreCliente = document.getElementById('nombre-cliente').value.trim();
    const numeroMesa = document.getElementById('mesa-numero').value.trim();
    
    if (!nombreCliente || !numeroMesa) {
        alert('Ingrese el nombre del cliente y número de mesa');
        return;
    }
    
    // Actualizar datos del cliente
    pedidoActual.cliente = nombreCliente;
    pedidoActual.mesa = numeroMesa;
    
    // Crear copia del pedido para guardar
    const pedidoGuardar = { ...pedidoActual };
    
    // Guardar en historial para que aparezca en la lista de historial
    guardarPedidoEnHistorial(pedidoGuardar);
    
    // Guardar en cocina si hay productos de cocina
    const productosCocina = obtenerProductosCocina(pedidoGuardar.items);
    if (productosCocina.length > 0) {
        guardarPedidoEnCocina(pedidoGuardar);
    }
    
    // Guardar en pagos
    guardarPedidoEnPagos(pedidoGuardar);
    
    // Mostrar mensaje de éxito
    alert('Pedido guardado correctamente');
    
    // Inicializar nuevo pedido
    inicializarPedidoActual();
}
