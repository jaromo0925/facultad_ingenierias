let graficoProductosPorLinea;
let graficoTiposDeProductos;

function cargarDatosProductos() {
    fetch('/data/Productos.json')
        .then(response => response.json())
        .then(datos => {
            console.log("Datos cargados:", datos);
            inicializarGraficosProductos(datos);
        })
        .catch(error => console.error('Error cargando los datos:', error));
}

function inicializarGraficosProductos(datos) {
    graficoProductosPorLinea = echarts.init(document.getElementById('graficoProductosPorLinea'));
    graficoTiposDeProductos = echarts.init(document.getElementById('graficoTiposDeProductos'));

    actualizarGraficosProductos(datos);
}

function actualizarGraficosProductos(datos) {
    // Gráfico: Cantidad de productos por categoría
    const productosPorCategoria = datos.reduce((acc, curr) => {
        acc[curr.Categoria] = (acc[curr.Categoria] || 0) + curr.Cantidad;
        return acc;
    }, {});

    graficoProductosPorLinea.setOption({
        title: { text: "Cantidad de Productos por Categoría", left: "center" },
        tooltip: { trigger: 'item' },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: Object.entries(productosPorCategoria).map(([categoria, cantidad]) => ({
                    name: categoria,
                    value: cantidad
                }))
            }
        ]
    });

    // Gráfico: Barras con cantidad de productos por tipo y categoría
const categorias = [...new Set(datos.map(d => d.Categoria))];
const tipos = [...new Set(datos.map(d => d["Tipo de producto"]))];

console.log("Categorías:", categorias);
console.log("Tipos de productos:", tipos);

const datosPorCategoriaYTipo = datos.reduce((acc, curr) => {
    if (!acc[curr.Categoria]) acc[curr.Categoria] = {};
    acc[curr.Categoria][curr["Tipo de producto"]] = curr.Cantidad;
    return acc;
}, {});

console.log("Datos por Categoría y Tipo:", datosPorCategoriaYTipo);

const seriesData = tipos.map(tipo => ({
    name: tipo,
    type: 'bar',
    stack: 'total', // Quitar esta línea si el problema persiste
    emphasis: {
        focus: 'series'
    },
    data: categorias.map(cat => datosPorCategoriaYTipo[cat]?.[tipo] ?? 0), // Reemplazar undefined por 0
    showSymbol: true, // Asegura que la serie se muestre en la leyenda
    itemStyle: { opacity: 1 } // Asegura que no estén ocultas
}));

console.log("Series Data:", JSON.stringify(seriesData, null, 2));

graficoTiposDeProductos.clear();
graficoTiposDeProductos.setOption({
    title: { text: "Tipos de Productos por Categoría", left: "center" },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: categorias },
    yAxis: { type: 'value' },
    legend: { data: tipos, 
             top: 20 },
             selected: tipos.reduce((acc, tipo) => {
        acc[tipo] = true; // Forzar que todas las series estén activadas
        return acc;
    },
              series: seriesData
});
}

// Llamar a la función de carga al iniciar la página
document.addEventListener('DOMContentLoaded', cargarDatosProductos);
