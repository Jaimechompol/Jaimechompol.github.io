// Definición de categorías de productos
const CATEGORIAS = {
    CORTES: 'cortes',
    MARISCOS: 'mariscos',
    BANDEJAS: 'bandejas',
    PIZZAS: 'pizzas',
    PLATOS: 'platos',
    PORCIONES_ADICIONALES: 'porciones_adicionales',
    BEBIDAS: 'bebidas',
    OTROS: 'otros'
};

// Definición de tipos de productos
const TIPOS_PRODUCTO = {
    CORTE: 'corte',
    CORTE_TERMINO: 'corte_termino',
    MARISCO_ENSALADA: 'marisco_ensalada',
    BANDEJA_ENSALADA: 'bandeja_ensalada',
    PIZZA: 'pizza',
    PLATO: 'plato',
    ACOMPAÑAMIENTO: 'acompanamiento',
    BEBIDA: 'bebida',
    REGULAR: 'regular'
};

// Definición de productos
const productos = [
    // PIZZAS
    {
        id: 1,
        nombre: "Pizza Hawaiana",
        precio: 6.5,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, piña - Pequeña"
    },
    {
        id: 2,
        nombre: "Pizza Hawaiana",
        precio: 8.5,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, piña - Mediana"
    },
    {
        id: 3,
        nombre: "Pizza Hawaiana",
        precio: 10.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, piña - Grande"
    },
    {
        id: 4,
        nombre: "Pizza Margarita",
        precio: 6.5,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, champiñones - Pequeña"
    },
    {
        id: 5,
        nombre: "Pizza Margarita",
        precio: 8.5,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, champiñones - Mediana"
    },
    {
        id: 6,
        nombre: "Pizza Margarita",
        precio: 10.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, champiñones - Grande"
    },
    {
        id: 7,
        nombre: "Pizza 4 Estaciones",
        precio: 10.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, peperoni, salame, champiñones, aceitunas, pimiento, tomate - Mediana"
    },
    {
        id: 8,
        nombre: "Pizza 4 Estaciones",
        precio: 12.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, peperoni, salame, champiñones, aceitunas, pimiento, tomate - Grande"
    },
    {
        id: 9,
        nombre: "Pizza Americana",
        precio: 10.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, tocino, salame - Mediana"
    },
    {
        id: 45,
        nombre: "Pizza Campestre",
        precio: 8.5,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, champiñones, pimientos, cebolla, aceitunas - Mediana"
    },
    {
        id: 46,
        nombre: "Pizza Campestre",
        precio: 10.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, champiñones, pimientos, cebolla, aceitunas - Grande"
    },
    {
        id: 10,
        nombre: "Pizza Americana",
        precio: 12.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, jamón, tocino, salame - Grande"
    },
    {
        id: 11,
        nombre: "Pizza Campestre",
        precio: 10.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, maíz dulce, salame, champiñones, cebolla perla, aceituna, tomate, pimiento - Mediana"
    },
    {
        id: 12,
        nombre: "Pizza Campestre",
        precio: 12.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, maíz dulce, salame, champiñones, cebolla perla, aceituna, tomate, pimiento - Grande"
    },
    {
        id: 13,
        nombre: "Pizza de la Casa",
        precio: 10.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, tocino, longaniza, chicharrón, pimiento, champiñones - Mediana"
    },
    {
        id: 14,
        nombre: "Pizza de la Casa",
        precio: 12.0,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, tocino, longaniza, chicharrón, pimiento, champiñones - Grande"
    },
    {
        id: 15,
        nombre: "Pizza Kids",
        precio: 6.5,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, peperoni, porción de papas fritas"
    },
    {
        id: 16,
        nombre: "Pizza Emmy",
        precio: 6.5,
        categoria: CATEGORIAS.PIZZAS,
        tipo: TIPOS_PRODUCTO.PIZZA,
        descripcion: "Queso, salchicha, peperoni"
    },
    
    // PLATOS
    {
        id: 17,
        nombre: "Asado Completo",
        precio: 5.0,
        categoria: CATEGORIAS.PLATOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: ""
    },
    {
        id: 18,
        nombre: "Picadita de carnes",
        precio: 5.0,
        categoria: CATEGORIAS.PLATOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: "Carne ahumada, longaniza, cuero asado, chuleta, maduro o verde"
    },
    {
        id: 19,
        nombre: "Seco de gallina",
        precio: 6.0,
        categoria: CATEGORIAS.PLATOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: ""
    },
    {
        id: 20,
        nombre: "Bandeja Parrillera",
        precio: 7.5,
        categoria: CATEGORIAS.PLATOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: "Carne, cuero, chuleta, longaniza, ubre, pollo, chorizo paisa"
    },
    {
        id: 21,
        nombre: "Pechuga asada",
        precio: 5.0,
        categoria: CATEGORIAS.PLATOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: " ",
        acompanamientosObligatorios: [
            { nombre: 'Ensalada', cantidad: 1 },
            { nombre: 'Porción adicional', cantidad: 1 }
        ]
    },
    {
        id: 22,
        nombre: "Ubre asada",
        precio: 5.0,
        categoria: CATEGORIAS.PLATOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: " ",
        acompanamientosObligatorios: [
            { nombre: 'Ensalada', cantidad: 1 },
            { nombre: 'Porción adicional', cantidad: 1 }
        ]
    },
    
    // MARISCOS
    {
        id: 23,
        nombre: "Pescado filete",
        precio: 7.0,
        categoria: CATEGORIAS.MARISCOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: "Incluye ensalada y una porción adicional (obligatorios)",
        acompanamientosObligatorios: [
            { nombre: 'Ensalada', cantidad: 1 },
            { nombre: 'Porción adicional', cantidad: 1 }
        ]
    },
    {
        id: 24,
        nombre: "Camarón a la Plancha",
        precio: 8.0,
        categoria: CATEGORIAS.MARISCOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: "Incluye ensalada y una porción adicional (obligatorios)",
        acompanamientosObligatorios: [
            { nombre: 'Ensalada', cantidad: 1 },
            { nombre: 'Porción adicional', cantidad: 1 }
        ]
    },
    {
        id: 25,
        nombre: "Conchas Asadas",
        precio: 8.0,
        categoria: CATEGORIAS.MARISCOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: "Incluye ensalada y una porción adicional (obligatorios)",
        acompanamientosObligatorios: [
            { nombre: 'Ensalada', cantidad: 1 },
            { nombre: 'Porción adicional', cantidad: 1 }
        ]
    },
    
    {
        id: 27,
        nombre: "Bandeja de mariscos + Bandeja Parrillera",
        precio: 18.0,
        categoria: CATEGORIAS.MARISCOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: ""
    },
    {
        id: 28,
        nombre: "Langostinos a la plancha",
        precio: 10.0,
        categoria: CATEGORIAS.MARISCOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: ""
    },
    {
        id: 29,
        nombre: "Arroz con Camarón",
        precio: 8.0,
        categoria: CATEGORIAS.MARISCOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: ""
    },
    {
        id: 30,
        nombre: "Tres mariscos",
        precio: 10.0,
        categoria: CATEGORIAS.MARISCOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: ""
    },
    
    // CORTES
    {
        id: 31,
        nombre: "Picaña",
        precio: 12.0,
        categoria: CATEGORIAS.CORTES,
        tipo: TIPOS_PRODUCTO.CORTE_TERMINO,
        descripcion: "Corte de res, incluye ensalada y porción adicional"
    },
    {
        id: 32,
        nombre: "Ribye",
        precio: 9.0,
        categoria: CATEGORIAS.CORTES,
        tipo: TIPOS_PRODUCTO.CORTE_TERMINO,
        descripcion: "Corte de res jugoso, incluye guarnición"
    },
    {
        id: 33,
        nombre: "Bife de chorizo",
        precio: 12.0,
        categoria: CATEGORIAS.CORTES,
        tipo: TIPOS_PRODUCTO.CORTE_TERMINO,
        descripcion: "Corte grueso de res, acompañado de porción adicional",
        acompanamientosObligatorios: [
            { nombre: 'Ensalada', cantidad: 1 },
            { nombre: 'Porción adicional', cantidad: 1 }
        ]
    },
    {
        id: 34,
        nombre: "Lomo fino",
        precio: 10.0,
        categoria: CATEGORIAS.CORTES,
        tipo: TIPOS_PRODUCTO.CORTE_TERMINO,
        descripcion: "Lomo de res selecto, incluye acompañamiento",
        acompanamientosObligatorios: [
            { nombre: 'Ensalada', cantidad: 1 },
            { nombre: 'Porción adicional', cantidad: 1 }
        ]
    },
    {
        id: 35,
        nombre: "Costillas ahumadas",
        precio: 8.0,
        categoria: CATEGORIAS.CORTES,
        tipo: TIPOS_PRODUCTO.CORTE_TERMINO,
        descripcion: "Costillas de cerdo cocinadas al humo, con guarnición",
        acompanamientosObligatorios: [
            { nombre: 'Ensalada', cantidad: 1 },
            { nombre: 'Porción adicional', cantidad: 1 }
        ]
    },
    {
        id: 36,
        nombre: "Chorizo Paisa",
        precio: 6.0,
        categoria: CATEGORIAS.CORTES,
        tipo: TIPOS_PRODUCTO.CORTE_TERMINO,
        descripcion: "Chorizo tradicional colombiano",
        acompanamientosObligatorios: [
            { nombre: 'Ensalada', cantidad: 1 },
            { nombre: 'Porción adicional', cantidad: 1 }
        ]
    },
    
    // PORCIONES ADICIONALES
    {
        id: 37,
        nombre: "Ensaladas",
        precio: 1.5,
        categoria: CATEGORIAS.PORCIONES_ADICIONALES,
        tipo: TIPOS_PRODUCTO.ACOMPAÑAMIENTO,
        descripcion: "Porción adicional de ensalada fresca"
    },
    {
        id: 38,
        nombre: "Papas fritas",
        precio: 1.5,
        categoria: CATEGORIAS.PORCIONES_ADICIONALES,
        tipo: TIPOS_PRODUCTO.ACOMPAÑAMIENTO,
        descripcion: "Porción adicional de papas fritas"
    },
    {
        id: 39,
        nombre: "Patacones",
        precio: 1.5,
        categoria: CATEGORIAS.PORCIONES_ADICIONALES,
        tipo: TIPOS_PRODUCTO.ACOMPAÑAMIENTO,
        descripcion: "Porción adicional de patacones"
    },
    {
        id: 40,
        nombre: "Yuca Frita",
        precio: 1.5,
        categoria: CATEGORIAS.PORCIONES_ADICIONALES,
        tipo: TIPOS_PRODUCTO.ACOMPAÑAMIENTO,
        descripcion: "Porción adicional de yuca frita"
    },
    {
        id: 41,
        nombre: "Arroz y menestra",
        precio: 1.5,
        categoria: CATEGORIAS.PORCIONES_ADICIONALES,
        tipo: TIPOS_PRODUCTO.ACOMPAÑAMIENTO,
        descripcion: "Porción adicional de arroz con menestra"
    },
    {
        id: 42,
        nombre: "Arroz moro de lentejas o choclo",
        precio: 2.5,
        categoria: CATEGORIAS.PORCIONES_ADICIONALES,
        tipo: TIPOS_PRODUCTO.ACOMPAÑAMIENTO,
        descripcion: "Arroz moro con lentejas o choclo"
    },
    
    // BEBIDAS
    {
        id: 43,
        nombre: "Coca Cola personal",
        precio: 0.5,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Botella personal de Coca Cola"
    },
    {
        id: 44,
        nombre: "Cola 1LT",
        precio: 1.00,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Botella de cola de 1 litro"
    },
    {
        id: 45,
        nombre: "Cola 1.5 LT",
        precio: 1.50,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Botella de cola de 1.5 litro"
    },
    {
        id: 46,
        nombre: "Agua aromática",
        precio: 0.75,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Agua infusionada con hierbas"
    },
    {
        id: 47,
        nombre: "Fuze tea personal",
        precio: 1.0,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Bebida de té saborizado individual"
    },
    {
        id: 48,
        nombre: "Cerveza club Verde 1LT",
        precio: 3.5,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Cerveza Club Verde botella 1 litro"
    },
    {
        id: 49,
        nombre: "Cerveza personal",
        precio: 1.5,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Botella personal de cerveza"
    },
    {
        id: 50,
        nombre: "Jarra de limonada",
        precio: 3.5,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Jarra de jugo natural"
    },
    {
        id: 51,
        nombre: "Jarra de Maracuya",
        precio: 3.5,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Jarra de sangría con vino y frutas"
    },
    {
        id: 52,
        nombre: "Jarra de Guanabana",
        precio: 3.5,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: " "
    },
    {
        id: 53,
        nombre: "Jarra de Sangría",
        precio: 16.0,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Jarra de sangría con vino y frutas"
    },
    
    {
        id: 54,
        nombre: "Vino _ Champán",
        precio: 12.0,
        categoria: CATEGORIAS.BEBIDAS,
        tipo: TIPOS_PRODUCTO.BEBIDA,
        descripcion: "Botella de vino espumante tipo champán"
    },
    
    // PLATOS ESPECIALES SIN ACOMPAÑAMIENTOS OBLIGATORIOS
    
    {
        id: 56,
        nombre: "Asado medio",
        precio: 3.5,
        categoria: CATEGORIAS.PLATOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: "Plato de asado completo sin acompañamientos obligatorios",
        sinAcompanamientosObligatorios: true
    },
    {
        id: 57,
        nombre: "Picaditas de Carne",
        precio: 8.0,
        categoria: CATEGORIAS.PLATOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: "Picaditas de carne sin acompañamientos obligatorios",
        sinAcompanamientosObligatorios: true
    },
    {
        id: 58,
        nombre: "Seco de Gallina",
        precio: 7.5,
        categoria: CATEGORIAS.PLATOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: "Seco de gallina tradicional ",
        sinAcompanamientosObligatorios: true
    },
    
    {
        id: 59,
        nombre: "Arroz Mariscos",
        precio: 10.0,
        categoria: CATEGORIAS.MARISCOS,
        tipo: TIPOS_PRODUCTO.PLATO,
        descripcion: "Arroz con variedad de mariscos sin acompañamientos obligatorios",
        sinAcompanamientosObligatorios: true
    }
];

// Definición de opciones adicionales
const opcionesAdicionales = [
    { id: 1, nombre: 'Papa', precio: 0 },
    { id: 2, nombre: 'Patacón', precio: 0 },
    { id: 3, nombre: 'Yuca', precio: 0 },
    { id: 4, nombre: 'Arroz y Menestra', precio: 0 },
    { id: 5, nombre: 'Arroz Moro', precio: 2.50 }
];

// Definición de extras para pizza
const extrasPizza = [
    { id: 1, nombre: 'Extra Queso', precio: 1.00 },
    { id: 2, nombre: 'Extra Jamón', precio: 1.00 },
    { id: 3, nombre: 'Extra Piña', precio: 0.75 },
    { id: 4, nombre: 'Extra Tocino', precio: 1.50 },
    { id: 5, nombre: 'Extra Champiñones', precio: 1.00 },
    { id: 6, nombre: 'Extra Aceitunas', precio: 1.00 },
    { id: 7, nombre: 'Extra Pimientos', precio: 0.75 },
    { id: 8, nombre: 'Extra Cebolla', precio: 0.50 },
    { id: 9, nombre: 'Extra Peperoni', precio: 1.50 }
];

// Definición de sabores de pizza para mitades
const saboresPizza = [
    { id: 1, nombre: 'Hawaiana', descripcion: 'Queso, jamón, piña' },
    { id: 2, nombre: 'Margarita', descripcion: 'Queso, jamón, champiñones' },
    { id: 3, nombre: '4 Estaciones', descripcion: 'Queso, jamón, peperoni, salame, champiñones, aceitunas, pimiento, tomate' },
    { id: 4, nombre: 'Americana', descripcion: 'Queso, jamón, tocino, salame' },
    { id: 5, nombre: 'Campestre', descripcion: 'Queso, champiñones, pimientos, cebolla, aceitunas' }
];

// Definición de términos para cortes
const terminosCorte = [
    { id: 1, nombre: '1/2', descripcion: 'Término medio' },
    { id: 2, nombre: '3/4', descripcion: 'Tres cuartos' },
    { id: 3, nombre: 'Completo', descripcion: 'Bien cocido' }
];

// Exportar todas las constantes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CATEGORIAS,
        TIPOS_PRODUCTO,
        productos,
        opcionesAdicionales,
        extrasPizza,
        saboresPizza,
        terminosCorte
    };
}
