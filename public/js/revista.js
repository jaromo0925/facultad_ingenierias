$(document).ready(function () {
    // Inicializar DataTable
    const tabla = $('#miTabla').DataTable({
        ajax: {
            url: '/data/Revista.json', // URL correcta
            dataSrc: ''
        },
      columns: [
            { data: 'ID_del_articulo' },
            { data: 'Titulo_del_articulo' },
            { data: 'Numero' },
            { data: 'Fecha_de_publicacion' },
            { data: 'Vistas_del_resumen' },
            { data: 'Total_de_vistas_de_la_galerada' }
          ],
        responsive: true,
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
        }
    });
    
});
