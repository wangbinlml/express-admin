$(function () {
    $('#menus').DataTable({
        'paging': true,
        'lengthChange': true,
        'searching': true,
        'info': true,
        'autoWidth': true,
        "ajax": "/menus/load",
        "ordering": false,
        "columns": [
            {"data": "id"},
            {"data": "menu_name"},
            {"data": "menu_url"},
            {"data": "menu_icon"},
            {"data": "is"}
        ],
    })
});