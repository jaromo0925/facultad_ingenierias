$(document).ready(function () {
    // Inicializar DataTable
    const tabla = $('#miTabla').DataTable({
        ajax: {
            url: '/data/Concertación_Propositos.json', // URL correcta
            dataSrc: ''
        },
        columns: [
            { data: 'NOMBRE COLABORADOR' },
            { data: 'Proyectos estratégicos de seccional Medellín' },
            { data: 'Microproyectos estratégicos seccional Medellín' },
            { data: 'Línea estratégica corporativa' },
            { data: 'Aporte de valor: ¿cómo contribuyo a los proyectos estratégicos?' },
            { data: 'Actividades específicas' },
            { data: 'Indicador de resultado o producto' },
            { data: 'Estado de seguimiento' },
            {
                data: 'Porcentaje de seguimiento',
                render: function (data) {
                    return (data * 100).toFixed(1) + '%';
                }
            },
            { data: 'Observación de seguimiento' },
            {
                data: 'Link Evidencia',
                render: function (data) {
                    return data ? `<a href="${data}" target="_blank">Ver Evidencia</a>` : 'N/A';
                }
            }
        ],
        responsive: true,
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
        }
    });

    ///////////////////////////////
    // Inicializar Radar de Proyectos
    const radarChartProyectos = echarts.init(document.getElementById('graficoRadarProyectos'));
    const radarOptionsProyectos = {
        title: { text: 'Contribución Docente - Proyectos Estratégicos' },
        tooltip: {},
        legend: { data: ['Proyectos'], top: 'bottom' },
        radar: { indicator: [] },
        series: [{ name: 'Proyectos', type: 'radar', data: [] }]
    };
    radarChartProyectos.setOption(radarOptionsProyectos);

    ///////////////////////////////
    // Inicializar Radar de Microproyectos
    const radarChartMicroproyectos = echarts.init(document.getElementById('graficoRadarMicroproyectos'));
    const radarOptionsMicroproyectos = {
        title: { text: 'Contribución Docente -Microproyectos Estratégicos' },
        tooltip: {},
        legend: { data: ['Microproyectos'], top: 'bottom' },
        radar: { indicator: [] },
        series: [{ name: 'Microproyectos', type: 'radar', data: [] }]
    };
    radarChartMicroproyectos.setOption(radarOptionsMicroproyectos);

    ///////////////////////////////
    // Inicializar Gráfico de Barras por Estado
const barChartEstados = echarts.init(document.getElementById('graficoBarrasEstados'));
const barOptionsEstados = {
    title: { text: 'Proyectos por Estado' },
    tooltip: { trigger: 'axis' },
    xAxis: {
        type: 'category',
        data: [] // Se llenará dinámicamente
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        name: 'Cantidad',
        type: 'bar',
        data: [] // Se llenará dinámicamente
    }]
};
barChartEstados.setOption(barOptionsEstados);

    
    // Función para actualizar Radar de Proyectos
    function actualizarRadarProyectos(datos) {
        if (datos.length === 0) {
            radarChartProyectos.setOption({ radar: { indicator: [] }, series: [{ data: [] }] });
            return;
        }

        const conteoProyectos = {};
        datos.forEach(fila => {
            const categoria = fila['Proyectos estratégicos de seccional Medellín'];
            if (categoria) {
                conteoProyectos[categoria] = (conteoProyectos[categoria] || 0) + 1;
            }
        });

        const indicadores = Object.keys(conteoProyectos).map(categoria => ({
            name: categoria,
            max: Math.max(...Object.values(conteoProyectos)) + 1
        }));
        const valores = Object.values(conteoProyectos);

        radarChartProyectos.setOption({
            radar: { indicator: indicadores },
            series: [{ data: [{ value: valores, name: 'Proyectos' }] }]
        });
    }


    // Inicializar Gráfico de Red
const graphChart = echarts.init(document.getElementById('graficoRed'));
const graphOptions = {
    title: { text: 'Relaciones entre Proyectos y Colaboradores' },
    tooltip: {},
    legend: [{ data: ['Proyectos', 'Colaboradores', 'Estados'] }],
    series: [
        {
            type: 'graph',
            layout: 'force',
            roam: true,
            label: {
                show: true
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            force: {
                repulsion: 1000,
                edgeLength: [50, 200]
            },
            categories: [
                { name: 'Proyectos', itemStyle: { color: '#5470C6' } },
                { name: 'Colaboradores', itemStyle: { color: '#91CC75' } },
                { name: 'Estados', itemStyle: { color: '#FAC858' } }
            ],
            data: [], // Se llenará dinámicamente
            links: [] // Se llenará dinámicamente
        }
    ]
};
graphChart.setOption(graphOptions);

    ///////////////////////////////
    // Función para actualizar Radar de Microproyectos
    function actualizarRadarMicroproyectos(datos) {
        if (datos.length === 0) {
            radarChartMicroproyectos.setOption({ radar: { indicator: [] }, series: [{ data: [] }] });
            return;
        }

        const conteoMicroproyectos = {};
        datos.forEach(fila => {
            const categoria = fila['Microproyectos estratégicos seccional Medellín'];
            if (categoria) {
                conteoMicroproyectos[categoria] = (conteoMicroproyectos[categoria] || 0) + 1;
            }
        });

        const indicadores = Object.keys(conteoMicroproyectos).map(categoria => ({
            name: categoria,
            max: Math.max(...Object.values(conteoMicroproyectos)) + 1
        }));
        const valores = Object.values(conteoMicroproyectos);

        radarChartMicroproyectos.setOption({
            radar: { indicator: indicadores },
            series: [{ data: [{ value: valores, name: 'Microproyectos' }] }]
        });
    }

    ///////////////////////////////
    function actualizarBarChartEstados(datos) {
        if (datos.length === 0) {
            barChartEstados.setOption({
                xAxis: { data: [] },
                series: [{ data: [] }]
            });
            return;
        }
    
        const conteoEstados = {};
        datos.forEach(fila => {
            const estado = fila['Estado de seguimiento'];
            if (estado) {
                conteoEstados[estado] = (conteoEstados[estado] || 0) + 1;
            }
        });
    
        const categorias = Object.keys(conteoEstados);
        const valores = Object.values(conteoEstados);
    
        barChartEstados.setOption({
            xAxis: { data: categorias },
            series: [{ data: valores }]
        });
    }
    

    function actualizarGraph(datos) {
        if (datos.length === 0) {
            graphChart.setOption({ series: [{ data: [], links: [] }] });
            return;
        }
    
        const nodos = [];
        const enlaces = [];
        const colaboradores = new Set();
        const estados = new Set();
    
        datos.forEach(fila => {
            const proyecto = fila['Proyectos estratégicos de seccional Medellín'];
            const colaborador = fila['NOMBRE COLABORADOR'];
            const estado = fila['Estado de seguimiento'];
    
            // Crear nodo para el proyecto
            if (proyecto) {
                nodos.push({
                    name: proyecto,
                    category: 'Proyectos',
                    value: 1
                });
            }
    
            // Crear nodo para el colaborador
            if (colaborador && !colaboradores.has(colaborador)) {
                colaboradores.add(colaborador);
                nodos.push({
                    name: colaborador,
                    category: 'Colaboradores',
                    value: 1
                });
            }
    
            // Crear nodo para el estado
            if (estado && !estados.has(estado)) {
                estados.add(estado);
                nodos.push({
                    name: estado,
                    category: 'Estados',
                    value: 1
                });
            }
    
            // Crear enlaces entre nodos
            if (proyecto && colaborador) {
                enlaces.push({ source: colaborador, target: proyecto });
            }
            if (proyecto && estado) {
                enlaces.push({ source: proyecto, target: estado });
            }
        });
    
        graphChart.setOption({
            series: [
                {
                    data: nodos,
                    links: enlaces
                }
            ]
        });
    }
    
// Función para actualizar Gráfico de Red
function actualizarGraph(datos) {
    const nodos = [];
    const enlaces = [];
    const nodosSet = new Set();

    datos.forEach(fila => {
        const persona = fila['NOMBRE COLABORADOR'];
        const proyecto = fila['Proyectos estratégicos de seccional Medellín'];
        const microproyecto = fila['Microproyectos estratégicos seccional Medellín'];
        const linea = fila['Línea estratégica corporativa'];

        if (persona && !nodosSet.has(persona)) {
            nodosSet.add(persona);
            nodos.push({ name: persona, category: 0 });
        }
        if (proyecto && !nodosSet.has(proyecto)) {
            nodosSet.add(proyecto);
            nodos.push({ name: proyecto, category: 1 });
        }
        if (microproyecto && !nodosSet.has(microproyecto)) {
            nodosSet.add(microproyecto);
            nodos.push({ name: microproyecto, category: 2 });
        }
        if (linea && !nodosSet.has(linea)) {
            nodosSet.add(linea);
            nodos.push({
                name: linea,
                category: 3,
                actividades: fila['Actividades específicas'] || 'N/A',
                aportes: fila['Aporte de valor: ¿cómo contribuyo a los proyectos estratégicos?'] || 'N/A',
                resultado: fila['Indicador de resultado o producto'] || 'N/A'
            });
        }

        if (persona && proyecto) {
            enlaces.push({ source: persona, target: proyecto });
        }
        if (proyecto && microproyecto) {
            enlaces.push({ source: proyecto, target: microproyecto });
        }
        if (microproyecto && linea) {
            enlaces.push({ source: microproyecto, target: linea });
        }
    });

    graphChart.setOption({
        series: [
            {
                type: 'graph',
                layout: 'force',
                data: nodos,
                links: enlaces,
                categories: [
                    { name: 'Personas' },
                    { name: 'Proyectos' },
                    { name: 'Microproyectos' },
                    { name: 'Líneas Estratégicas' }
                ],
                roam: true
            }
        ]
    });
}
    ////////////////////////

    
    
    // Manejar eventos de DataTable
    tabla.on('draw', function () {
        const datosFiltrados = tabla.rows({ search: 'applied' }).data().toArray();
        actualizarRadarProyectos(datosFiltrados);
        actualizarRadarMicroproyectos(datosFiltrados);
        actualizarBarChartEstados(datosFiltrados); // Nuevo gráfico
        actualizarGraph(datosFiltrados);
    });
    
    tabla.on('init', function () {
        const datosIniciales = tabla.rows({ search: 'applied' }).data().toArray();
        actualizarRadarProyectos(datosIniciales);
        actualizarRadarMicroproyectos(datosIniciales);
        actualizarBarChartEstados(datosIniciales); // Nuevo gráfico
        
    });
    
});

