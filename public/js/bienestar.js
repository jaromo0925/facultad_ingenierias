// Función para cargar datos desde un archivo JSON y ejecutar la lógica
function cargarDatosBienestar() {
    fetch('/data/Bienestar.json')
        .then(response => response.json())
        .then(datos => {
            // Filtrar datos para omitir campos Unnamed y ajustar claves
            const datosFiltrados = datos.map(item => ({
                NOMBRE_COLABORADOR: item["NOMBRE COLABORADOR"],
                TIPO_ACOMPANAMIENTO: item["Tpo de Acompañamiento "],
                CURSOS_TEMAS: item["Cursos o temas acompañados"] || "No especificado",
                NUM_ESTUDIANTES: item["Numero de estudiantes acompañados "] || 0,
                IMPACTO: item["Impacto "] || "No especificado",
                OBSERVACIONES: item["Observaciones"] || "Sin observaciones",
                LINK_EVIDENCIA: item["Link Evidencia"] || "Sin enlace"
            }));

            inicializarTablaBienestar(datosFiltrados);
            inicializarGraficosBienestar(datosFiltrados);
        })
        .catch(error => console.error('Error cargando los datos:', error));
}

// Función para inicializar la tabla interactiva con DataTables
let tablaBienestar;
function inicializarTablaBienestar(datos) {
    tablaBienestar = $('#tablaBienestar').DataTable({
        data: datos,
        columns: [
            { data: "NOMBRE_COLABORADOR" },
            { data: "TIPO_ACOMPANAMIENTO" },
            { data: "CURSOS_TEMAS" },
            { data: "NUM_ESTUDIANTES" },
            { data: "IMPACTO" },
            { data: "OBSERVACIONES" },
            { 
                data: "LINK_EVIDENCIA",
                render: data => `<a href="${data}" target="_blank">Ver Evidencia</a>`
            }
        ]
    });

    // Actualiza los gráficos al filtrar o paginar la tabla
    $('#tablaBienestar').on('draw.dt', () => {
        const datosFiltrados = tablaBienestar.rows({ search: 'applied' }).data().toArray();
        actualizarGraficosBienestar(datosFiltrados);
    });
}

// Función para inicializar gráficos con ECharts
let graficosBienestar = {};
function inicializarGraficosBienestar(datos) {
    graficosBienestar.tipoAcompanamiento = echarts.init(document.getElementById('graficoTipoAcompanamiento'));
    graficosBienestar.barraDocente = echarts.init(document.getElementById('graficoBarraDocente'));

    actualizarGraficosBienestar(datos);
}

// Función para actualizar los gráficos
function actualizarGraficosBienestar(datos) {
    // Gráfico: Pie por Tipo de Acompañamiento y Estudiantes
    const data1 = datos.reduce((acc, curr) => {
        const tipo = curr["TIPO_ACOMPANAMIENTO"];
        acc[tipo] = (acc[tipo] || 0) + curr["NUM_ESTUDIANTES"];
        return acc;
    }, {});
    graficosBienestar.tipoAcompanamiento.setOption({
        title: { text: "Estudiantes por Tipo de Acompañamiento", left: "center" },
        tooltip: { trigger: 'item' },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: Object.keys(data1).map(key => ({ name: key, value: data1[key] }))
            }
        ]
    });

    // Gráfico: Barras Apiladas por Docente y Tipo de Acompañamiento
    const docentes = [...new Set(datos.map(d => d["NOMBRE_COLABORADOR"]))];
    const tiposAcompanamiento = [...new Set(datos.map(d => d["TIPO_ACOMPANAMIENTO"]))];
    const seriesData = tiposAcompanamiento.map(tipo => ({
        name: tipo,
        type: 'bar',
        stack: 'total',
        data: docentes.map(docente => {
            const docenteData = datos.filter(d => d["NOMBRE_COLABORADOR"] === docente && d["TIPO_ACOMPANAMIENTO"] === tipo);
            return docenteData.reduce((sum, curr) => sum + curr["NUM_ESTUDIANTES"], 0);
        })
    }));

    graficosBienestar.barraDocente.setOption({
        title: { text: "Distribución por Docente y Tipo de Acompañamiento", left: "center" },
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
        xAxis: { 
            type: 'category', 
            data: docentes,
            axisLabel: { rotate: 45 }
        },
        yAxis: { type: 'value' },
        legend: { data: tiposAcompanamiento },
        series: seriesData
    });
}

// Llamar a la función de carga al iniciar la página
document.addEventListener('DOMContentLoaded', cargarDatosBienestar);
