$(document).ready(function () {
    // Inicializar DataTable
    const tabla = $('#miTabla').DataTable({
        ajax: {
            url: '/data/Revista.json', // URL correcta
            dataSrc: ''
        },
        columns: [
            { data: 'ID del artículo' },
            { data: 'Título del artículo' },
            { data: 'Número' },
            { data: 'Fecha de publicación' },
            { data: 'Vistas del resumen' },
            { data: 'Total de vistas de la galerada' },
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
