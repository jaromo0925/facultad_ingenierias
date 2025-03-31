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
                data: null,
                render: function (data, type, row) {
                    return `<a href="#" class="btn btn-primary">Ver Evidencia</a>`;
                }
            }
          ],
        responsive: true,
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
        }
    });
    
});
