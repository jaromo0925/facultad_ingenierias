function cargarDatosProductos() {
    fetch('/data/Productos.json')
        .then(response => response.json())
        .then(datos => {
            inicializarGraficosProductos(datos);
        })
        .catch(error => console.error('Error cargando los datos:', error));
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

    const datosPorCategoriaYTipo = datos.reduce((acc, curr) => {
        if (!acc[curr.Categoria]) acc[curr.Categoria] = {};
        acc[curr.Categoria][curr["Tipo de producto"]] = curr.Cantidad;
        return acc;
    }, {});

    const seriesData = tipos.map(tipo => ({
        name: tipo,
        type: 'bar',
        stack: 'total',
        data: categorias.map(cat => datosPorCategoriaYTipo[cat]?.[tipo] || 0)
    }));

    graficoTiposDeProductos.setOption({
        title: { text: "Tipos de Productos por Categoría", left: "center" },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: categorias },
        yAxis: { type: 'value' },
        legend: { data: tipos, top: 20 },
        series: seriesData
    });
}

// Llamar a la función de carga al iniciar la página
document.addEventListener('DOMContentLoaded', cargarDatos);
