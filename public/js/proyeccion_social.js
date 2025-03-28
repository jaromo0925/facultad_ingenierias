// Función para cargar datos desde un archivo JSON y ejecutar la lógica
function cargarDatosProyeccionSocial() {
    fetch('/data/Proyección_Social.json')
        .then(response => response.json())
        .then(datos => {
            inicializarTablaProyeccionSocial(datos);
            inicializarGraficosProyeccionSocial(datos);
        })
        .catch(error => console.error('Error cargando los datos:', error));
}

// Variable global para la tabla
let tablaProyeccionSocial;

// Función para inicializar la tabla interactiva con DataTables
function inicializarTablaProyeccionSocial(datos) {
    tablaProyeccionSocial = $('#tablaProyeccionSocial').DataTable({
        data: datos,
        columns: [
            { data: "NOMBRE COLABORADOR" },
            { data: "Entidad -  Sector" },
            { data: "Tipo de Proyecto " },
            { data: "Nombre del Proyecto " },
            { data: "Valor " },
            { data: "Estado " },
            { data: "Observaciones" },
            { 
                data: "Link Evidencia",
                render: data => `<a href="${data}" target="_blank">Ver Evidencia</a>`
            }
        ]
    });

    // Actualizar gráficos al filtrar la tabla
    $('#tablaProyeccionSocial').on('draw.dt', () => {
        const datosFiltrados = tablaProyeccionSocial.rows({ search: 'applied' }).data().toArray();
        actualizarGraficosProyeccionSocial(datosFiltrados);
    });
}

// Variables globales para los gráficos
let graficoTipoProyecto, graficoProyectosPorColaborador, graficoValorPorEntidad;

// Función para inicializar gráficos con ECharts
function inicializarGraficosProyeccionSocial(datos) {
    graficoTipoProyecto = echarts.init(document.getElementById('graficoTipoProyecto'));
    graficoProyectosPorColaborador = echarts.init(document.getElementById('graficoProyectosPorColaborador'));
    graficoValorPorEntidad = echarts.init(document.getElementById('graficoValorPorEntidad'));

    actualizarGraficosProyeccionSocial(datos);
}

// Función para actualizar los gráficos
function actualizarGraficosProyeccionSocial(datos) {
    // Gráfico: Pie con cantidad de proyectos por tipo
    const proyectosPorTipo = datos.reduce((acc, curr) => {
        const tipo = curr["Tipo de Proyecto "];
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {});
    graficoTipoProyecto.setOption({
        title: { text: "Distribución de Proyectos por Tipo", left: "center" },
        tooltip: { trigger: 'item' },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: Object.keys(proyectosPorTipo).map(key => ({
                    name: key,
                    value: proyectosPorTipo[key]
                })),
            label: {
                show: true,         // Muestra etiquetas
                position: "outside", // Coloca las etiquetas fuera del segmento
                formatter: "{b}: {c}" // Muestra el nombre y el valor
            },
            labelLine: {
                show: true // Muestra líneas de guía para conectar etiquetas
            }
            }
        ]
    });

    // Gráfico: Barras Apiladas por Colaborador y Estado
    const estados = [...new Set(datos.map(d => d["Estado "]))]; // Estados únicos
    const colaboradores = [...new Set(datos.map(d => d["NOMBRE COLABORADOR"]))]; // Colaboradores únicos
    const datosPorColaboradorYEstado = datos.reduce((acc, curr) => {
        const colaborador = curr["NOMBRE COLABORADOR"];
        const estado = curr["Estado "];
        if (!acc[colaborador]) acc[colaborador] = {};
        acc[colaborador][estado] = (acc[colaborador][estado] || 0) + 1;
        return acc;
    }, {});

    const seriesEstado = estados.map(estado => ({
        name: estado,
        type: 'bar',
        stack: 'total',
        data: colaboradores.map(col => datosPorColaboradorYEstado[col]?.[estado] || 0)
    }));

    graficoProyectosPorColaborador.setOption({
        title: { text: "Proyectos por Colaborador y Estado (Apilado)", left: "center", top: 20 },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: estados },
    grid: { 
        top: 80,  
        left: '10%', 
        right: '10%', 
        bottom: 50 
    },
        xAxis: { type: 'category', data: colaboradores, axisLabel: { rotate: 0 },
        textStyle: { 
            fontWeight: "bold",  // Hace el texto en negrita
            color: "#FF5733",     // Cambia el color de la etiqueta
            fontSize: 12          // Ajusta el tamaño del texto
        },align: "center" },
        yAxis: { type: 'value' },
        series: seriesEstado,
        label: {
            show: true,          // Muestra etiquetas en cada barra
            position: "inside",  // Ubica las etiquetas dentro de las barras
            formatter: "{c}"     // Muestra solo el valor numérico
        }
    });

    // Gráfico: Barras por Entidad y Valor Total
    const valorPorEntidad = datos.reduce((acc, curr) => {
        const entidad = curr["Entidad -  Sector"];
        const valor = parseFloat(curr["Valor "].replace(/[^0-9.-]+/g, '')) || 0; // Convertir a número
        acc[entidad] = (acc[entidad] || 0) + valor;
        return acc;
    }, {});
    graficoValorPorEntidad.setOption({
        title: { text: "Valor Total por Entidad", left: "center" },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: Object.keys(valorPorEntidad), axisLabel: { rotate: 45 } },
        yAxis: { type: 'value', name: "Valor ($)" },
        series: [
            {
                type: 'bar',
                data: Object.values(valorPorEntidad),
                name: 'Valor Total'
            }
        ]
    });
}

// Llamar a la función de carga al iniciar la página
document.addEventListener('DOMContentLoaded', cargarDatosProyeccionSocial);
