// Función para cargar datos desde un archivo JSON y ejecutar la lógica
function cargarDatos() {
    fetch('/data/Investigacion.json')
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
            { data: "NOMBRE COLABORADOR" },
            { data: "Tipo de producto" },
            { 
                data: "Fecha de inicio",
                render: (data) => data ? new Date(data).toLocaleDateString("es-ES") : "Sin fecha"
            },
            { 
                data: "Fecha de finalizacion",
                render: (data) => data ? new Date(data).toLocaleDateString("es-ES") : "Sin fecha"
            },
            { data: "Producto" },
            { data: "Cofinanciado (Si/No)" },
            { data: "Entidad Cofinanciadora" },
            { data: "Nodo" },
            { data: "Observaciones" },
            { 
                data: "Link Evidencia",
                render: (data) => data ? `<a href="#">${data}</a>` : "Sin enlace"
            }
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

function actualizarGraficos(datos) {
    // Validar datos y filtrar nulos
    const datosValidos = datos.filter(d => d["NOMBRE COLABORADOR"] && d["Tipo de producto"] && d["Producto"] && d["Nodo"]);

    // Gráfico: Colaborador vs Tipo de Producto (Barra Apilada)
    const data1 = datosValidos.reduce((acc, curr) => {
        const colaborador = curr["NOMBRE COLABORADOR"];
        const tipoProducto = curr["Tipo de producto"];
        if (!acc[colaborador]) acc[colaborador] = {};
        if (!acc[colaborador][tipoProducto]) acc[colaborador][tipoProducto] = 0;
        acc[colaborador][tipoProducto] += 1;
        return acc;
    }, {});

    const colaboradores = Object.keys(data1); // Nombres de colaboradores (Eje X)
    const tiposProductos = Array.from(new Set(datosValidos.map(d => d["Tipo de producto"]))); // Tipos únicos
    const seriesData1 = tiposProductos.map(tipo => ({
        name: tipo,
        type: 'bar',
        stack: 'total', // Apilado
        data: colaboradores.map(colaborador => data1[colaborador][tipo] || 0)
    }));

    graficos.colaboradorTipoProducto.setOption({
        title: { text: "Colaborador vs Tipo de Producto (Barra Apilada)" },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                let content = `<strong>${params[0].axisValue}</strong><br>`;
                params.forEach(item => {
                    content += `${item.marker} ${item.seriesName}: ${item.value}<br>`;
                });
                return content;
            }
        },
        xAxis: { 
            type: 'category', 
            data: colaboradores,
            axisLabel: { rotate: 45 } // Girar etiquetas
        },
        yAxis: { type: 'value' },
       // legend: { data: tiposProductos },
        series: seriesData1
    });

    // Gráfico: Colaborador vs Producto (Barra Apilada)
    const data2 = datosValidos.reduce((acc, curr) => {
        const colaborador = curr["NOMBRE COLABORADOR"];
        const producto = curr["Producto"];
        if (!acc[colaborador]) acc[colaborador] = {};
        if (!acc[colaborador][producto]) acc[colaborador][producto] = 0;
        acc[colaborador][producto] += 1;
        return acc;
    }, {});

    const productos = Array.from(new Set(datosValidos.map(d => d["Producto"]))); // Productos únicos
    const seriesData2 = productos.map(producto => ({
        name: producto,
        type: 'bar',
        stack: 'total', // Apilado
        data: colaboradores.map(colaborador => data2[colaborador][producto] || 0)
    }));

    graficos.colaboradorProducto.setOption({
        title: { text: "Colaborador vs Producto (Barra Apilada)" },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                let content = `<strong>${params[0].axisValue}</strong><br>`;
                params.forEach(item => {
                    content += `${item.marker} ${item.seriesName}: ${item.value}<br>`;
                });
                return content;
            }
        },
        xAxis: { 
            type: 'category', 
            data: colaboradores,
            axisLabel: { rotate: 45 }
        },
        yAxis: { type: 'value' },
       // legend: { data: productos },
        series: seriesData2
    });

    // Gráfico: Colaborador vs Cofinanciado o No
    const data3 = datosValidos.reduce((acc, curr) => {
        const key = `${curr["NOMBRE COLABORADOR"]} (${curr["Cofinanciado (Si/No)"] || "No especificado"})`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    graficos.colaboradorCofinanciado.setOption({
        title: { text: "Colaborador vs Cofinanciado o No" },
        tooltip: { trigger: 'axis' },
        xAxis: { 
            type: 'category', 
            data: Object.keys(data3),
            axisLabel: { rotate: 45 }
        },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: Object.values(data3) }]
    });

    // Gráfico: Número de productos por nodo (Pie)
    const data4 = datosValidos.reduce((acc, curr) => {
        const nodo = curr["Nodo"];
        acc[nodo] = (acc[nodo] || 0) + 1;
        return acc;
    }, {});
    graficos.nodoProductos.setOption({
        title: { text: "Número de Productos por Nodo", left: "center" },
        tooltip: {
            trigger: 'item',
            formatter: (params) => `${params.marker} ${params.name}: ${params.value} (${params.percent}%)`
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: Object.keys(data4).map(key => ({ name: key, value: data4[key] }))
            }
        ]
    });
}


// Llamar a la función de carga al iniciar la página
document.addEventListener('DOMContentLoaded', cargarDatos);
