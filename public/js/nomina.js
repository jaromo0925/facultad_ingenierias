// Función para cargar datos desde un archivo JSON y ejecutar la lógica
function cargarDatosNomina() {
    fetch('/data/Nomina.json')
        .then(response => response.json())
        .then(datos => {
            // Transformar los datos para reemplazar espacios por guiones bajos en las claves
            const datosTransformados = datos.map(item => ({
                FACULTAD: item["FACULTAD"],
                CEDULA: item["CEDULA"],
                NOMBRES: item["NOMBRES"],
                TIPO_CONTRATO: item["TIPO CONTRATO"],
                ANIO: item["ANIO"],
                PERIODO: item["PERIODO"],
                DOC_PREGRADO: item["DOC. PREGRADO"],
                DOC_POSGRADOS: item["DOC. POSGRADOS"],
                INVESTIGACION: item["INVESTIGACION"],
                ACADEMICO_ADMINISTRATIVAS: item["ACADEMICO ADMINISTRATIVAS"],
                BIENESTAR: item["BIENESTAR"],
                OTRAS_ACTIVIDADES: item["OTRAS ACTIVIDADES"],
                EXTENSION: item["EXTENSION"],
                PROYECCION_SOCIAL: item["PROYECCION SOCIAL"],
                TOTAL_PERSONA_FACULTAD: item["TOTAL PERSONA FACULTAD"]
            }));

            inicializarTablaNomina(datosTransformados);
            inicializarGraficosNomina(datosTransformados);
        })
        .catch(error => console.error('Error cargando los datos:', error));
}

// Función para inicializar la tabla interactiva con DataTables
let tablaNomina;
function inicializarTablaNomina(datos) {
    tablaNomina = $('#tablaNomina').DataTable({
        data: datos,
        columns: [
            { data: "FACULTAD" },
            { data: "CEDULA" },
            { data: "NOMBRES" },
            { data: "TIPO_CONTRATO" },
            { data: "ANIO" },
            { data: "PERIODO" },
            { data: "DOC_PREGRADO" },
            { data: "DOC_POSGRADOS" },
            { data: "INVESTIGACION" },
            { data: "ACADEMICO_ADMINISTRATIVAS" },
            { data: "BIENESTAR" },
            { data: "OTRAS_ACTIVIDADES" },
            { data: "EXTENSION" },
            { data: "PROYECCION_SOCIAL" },
            { data: "TOTAL_PERSONA_FACULTAD" }
        ]
    });

    // Actualiza los gráficos al filtrar o paginar la tabla
    $('#tablaNomina').on('draw.dt', () => {
        const datosFiltrados = tablaNomina.rows({ search: 'applied' }).data().toArray();
        actualizarGraficosNomina(datosFiltrados);
    });
}

// Función para inicializar gráficos con ECharts
let graficosNomina = {};
function inicializarGraficosNomina(datos) {
    graficosNomina.tipoContrato = echarts.init(document.getElementById('graficoTipoContrato'));
    graficosNomina.horasPrePos = echarts.init(document.getElementById('graficoHorasPrePos'));
    graficosNomina.distribucionHoras = echarts.init(document.getElementById('graficoDistribucionHoras'));
    graficosNomina.barrasPorNombre = echarts.init(document.getElementById('graficoBarrasPorNombre'));

    actualizarGraficosNomina(datos);
}

// Función para actualizar los gráficos
function actualizarGraficosNomina(datos) {
    const actividades = [
        "INVESTIGACION", "ACADEMICO_ADMINISTRATIVAS", "BIENESTAR",
        "OTRAS_ACTIVIDADES", "EXTENSION", "PROYECCION_SOCIAL",
        "DOC_PREGRADO", "DOC_POSGRADOS" // Agregamos Pregrado y Posgrado
    ];
    // Gráfico: Pie por Tipo de Contrato
    const data1 = datos.reduce((acc, curr) => {
        acc[curr["TIPO_CONTRATO"]] = (acc[curr["TIPO_CONTRATO"]] || 0) + 1;
        return acc;
    }, {});
    graficosNomina.tipoContrato.setOption({
        title: { text: "Distribución por Tipo de Contrato", left: "center" },
        tooltip: { trigger: 'item' },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: Object.keys(data1).map(key => ({ name: key, value: data1[key] })),
                label: {
                show: true,
                position: "inside",// Muestra las etiquetas
                formatter: '{b}: {c}' // Muestra el nombre y el valor
            }
            }
        ]
    });

    // Gráfico: Pie por Pregrado y Posgrado
    const totalPregrado = datos.reduce((sum, curr) => sum + (curr["DOC_PREGRADO"] || 0), 0);
    const totalPosgrado = datos.reduce((sum, curr) => sum + (curr["DOC_POSGRADOS"] || 0), 0);
    graficosNomina.horasPrePos.setOption({
        title: { text: "Horas Pregrado vs Posgrado", left: "center" },
        tooltip: { trigger: 'item' },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: [
                    { name: "Pregrado", value: totalPregrado },
                    { name: "Posgrado", value: totalPosgrado }
                ],
                 label: {
                show: true,         // Muestra etiquetas
                position: "outside", // Coloca las etiquetas fuera del segmento
                formatter: "{b}: {c}" // Muestra el nombre y el valor
            },
            labelLine: {
                show: true // Muestra las líneas de guía para las etiquetas
            }
            }
        ]
    });

    // Gráfico: Pie por Actividades
    const data3 = actividades.map(actividad => ({
        name: actividad,
        value: datos.reduce((sum, curr) => sum + (curr[actividad] || 0), 0)
    }));
    graficosNomina.distribucionHoras.setOption({
        title: { text: "Distribución de Horas por Actividad", left: "center" },
        tooltip: { trigger: 'item' },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: data3
            }
        ]
    });

    // Gráfico: Barras Apiladas por Nombre
    const nombres = datos.map(d => d["NOMBRES"]);
    const seriesData = actividades.map(actividad => ({
        name: actividad,
        type: 'bar',
        stack: 'total',
        data: datos.map(d => d[actividad] || 0)
    }));
    graficosNomina.barrasPorNombre.setOption({
        title: { text: "Distribución de Horas por Nombre (Apilado)", 
                left: "center",
               top: 30},
        grid: {
        top: 120,
        left: 50,
        right: 50,
        bottom: 100
    },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const index = params[0].dataIndex;
                const colaborador = datos[index];
                let content = `<strong>${colaborador["NOMBRES"]}</strong><br>`;
                content += `Facultad: ${colaborador["FACULTAD"]}<br>`;
                content += `Cédula: ${colaborador["CEDULA"]}<br>`;
                content += `Tipo de Contrato: ${colaborador["TIPO_CONTRATO"]}<br>`;
                params.forEach(item => {
                    content += `${item.marker} ${item.seriesName}: ${item.value}<br>`;
                });
                return content;
            }
        },
        xAxis: {
            type: 'category',
            data: nombres,
            axisLabel: { rotate: 45 }
        },
        yAxis: { type: 'value' },
        legend: { data: actividades },
        series: seriesData,
        dataZoom: [
            {
                type: 'slider', // Control deslizante para desplazar
                show: true,
                xAxisIndex: 0, // Se aplica al eje X
                start: 0, // Comienza mostrando el 0%
                end: 50 // Muestra el 50% inicial del eje X
            },
            {
                type: 'inside', // Zoom interactivo con el ratón
                xAxisIndex: 0, // Se aplica al eje X
            }
        ]
    });

}

// Llamar a la función de carga al iniciar la página
document.addEventListener('DOMContentLoaded', cargarDatosNomina);
