function cargarDatos() {
    fetch('/data/Revista.json')
        .then(response => response.json())
        .then(datos => {
            inicializarTabla(datos);    // Inicializa la tabla con los datos
            inicializarGraficos(datos); // Genera los gráficos
        })
        .catch(error => console.error('Error cargando los datos:', error));
}

// Función para inicializar la tabla interactiva con DataTables
let tabla; // Variable global para la tabla
function inicializarTabla(datos) {
    tabla = $('#tablaDatos').DataTable({
        data: datos,
        columns: [
            { data: "ID del artículo", title: "ID" },
            { data: "Título del artículo", title: "Título" },
            { data: "Número", title: "Número" },
            { 
                data: "Fecha de publicación", 
                title: "Fecha de Publicación",
                render: (data) => data ? new Date(data).toLocaleDateString("es-ES") : "Sin fecha"
            },
            { data: "Vistas del resumen", title: "Vistas Resumen" },
            { data: "Total de vistas de la galerada", title: "Vistas Galerada" }
        ]
    });

    // Actualiza los gráficos al filtrar o paginar la tabla
    $('#tablaDatos').on('draw.dt', () => {
        const datosFiltrados = tabla.rows({ search: 'applied' }).data().toArray();
        actualizarGraficos(datosFiltrados);
    });
}

// Función para inicializar gráficos con ECharts
let graficos = {}; // Variable global para los gráficos
function inicializarGraficos(datos) {
    // Crear los gráficos
    graficos.colaboradorTipoProducto = echarts.init(document.getElementById('graficoColaboradorTipoProducto'));
    graficos.colaboradorProducto = echarts.init(document.getElementById('graficoColaboradorProducto'));
    graficos.colaboradorCofinanciado = echarts.init(document.getElementById('graficoColaboradorCofinanciado'));
    graficos.nodoProductos = echarts.init(document.getElementById('graficoNodoProductos'));

    // Configurar los gráficos iniciales con los datos completos
    actualizarGraficos(datos);
}

// Llamar a la función de carga al iniciar la página
document.addEventListener('DOMContentLoaded', cargarDatos);
