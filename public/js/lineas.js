// Función para cargar datos desde un archivo JSON y ejecutar la lógica
function cargarDatosProductos() {
    fetch('/data/Líneas-Investigación.json')
        .then(response => response.json())
        .then(datos => {
            inicializarTablaProductos(datos);
            inicializarGraficosProductos(datos);
        })
        .catch(error => console.error('Error cargando los datos:', error));
}

// Variable global para la tabla
let tablaProductos;

// Función para inicializar la tabla interactiva con DataTables
function inicializarTablaProductos(datos) {
    tablaProductos = $('#tablaProductos').DataTable({
        data: datos,
        columns: [
            { data: "Nombre de la Línea " },
            { data: "Lider de la Línea" },
            { data: "NOMBRE COLABORADOR" },
            { data: "Tipo de producto" },
            { 
                data: "Fecha de inicio ",
                render: data => new Date(data).toLocaleDateString("es-ES")
            },
            { 
                data: "Fecha de finalizacion",
                render: data => new Date(data).toLocaleDateString("es-ES")
            },
            { data: "Producto" },
            { data: "Observaciones" },
            { 
                data: "Link Evidencia",
                render: data => `<a href="${data}" target="_blank">Ver Evidencia</a>`
            }
        ]
    });

    // Actualizar los gráficos al filtrar o paginar
    $('#tablaProductos').on('draw.dt', () => {
        const datosFiltrados = tablaProductos.rows({ search: 'applied' }).data().toArray();
        actualizarGraficosProductos(datosFiltrados);
    });
}

// Variables globales para los gráficos
let graficoProductosPorLinea, graficoTiposDeProductos;

// Función para inicializar gráficos con ECharts
function inicializarGraficosProductos(datos) {
    graficoProductosPorLinea = echarts.init(document.getElementById('graficoProductosPorLinea'));
    graficoTiposDeProductos = echarts.init(document.getElementById('graficoTiposDeProductos'));

    // Configurar gráficos iniciales
    actualizarGraficosProductos(datos);
}

// Función para actualizar los gráficos
function actualizarGraficosProductos(datos) {
    // Gráfico: Pie con cantidad de productos por línea
    const productosPorLinea = datos.reduce((acc, curr) => {
        const linea = curr["Nombre de la Línea "];
        acc[linea] = (acc[linea] || 0) + 1;
        return acc;
    }, {});
    graficoProductosPorLinea.setOption({
        title: { text: "Cantidad de Productos por Línea", left: "center" },
        tooltip: { trigger: 'item' },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: Object.keys(productosPorLinea).map(linea => ({
                    name: linea,
                    value: productosPorLinea[linea]
                }))
            }
        ]
    });

    // Gráfico: Barras Apiladas con tipos de productos por línea
    const tiposDeProductos = [...new Set(datos.map(d => d["Tipo de producto"]))]; // Tipos únicos de productos
    const datosPorLineaYTipo = datos.reduce((acc, curr) => {
        const linea = curr["Nombre de la Línea "];
        const tipo = curr["Tipo de producto"];
        if (!acc[linea]) acc[linea] = {};
        acc[linea][tipo] = (acc[linea][tipo] || 0) + 1;
        return acc;
    }, {});

    const lineas = Object.keys(datosPorLineaYTipo); // Nombres de las líneas
    const seriesData = tiposDeProductos.map(tipo => ({
        name: tipo,
        type: 'bar',
        stack: 'total',
        data: lineas.map(linea => datosPorLineaYTipo[linea][tipo] || 0)
    }));

    graficoTiposDeProductos.setOption({
        title: { 
            text: "Tipos de Productos por Línea (Apilado)", 
            left: "center",
            top: 0
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: params => {
                let content = `<strong>${params[0].axisValue}</strong><br>`;
                params.forEach(item => {
                    content += `${item.marker} ${item.seriesName}: ${item.value}<br>`;
                });
                return content;
            }
        },
        legend: { 
    data: tiposDeProductos,
    top: 20, // Sube la leyenda
    left: "center"
               },
        xAxis: {
            type: 'category',
            data: lineas,
            axisLabel: { rotate: 0, 
        fontSize: 10 }
        },
        grid: { 
    top: 80, // Deja más espacio entre la leyenda y el gráfico
    bottom: 50, 
    left: 50, 
    right: 50 
       },
        yAxis: { type: 'value' },
        legend: { data: tiposDeProductos,
            top: 40,
            left: "center"},
        series: seriesData
    });
}


// Llamar a la función de carga al iniciar la página
document.addEventListener('DOMContentLoaded', cargarDatosProductos);
