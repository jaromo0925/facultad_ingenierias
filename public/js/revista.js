$(document).ready(function () {
    // Inicializar DataTable
    const tabla = $('#miTabla').DataTable({
        ajax: {
            url: 'http://localhost:3000/data/Concertación_Propositos.json', // URL correcta
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
