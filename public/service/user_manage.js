$(function () {
    var datatable = $('#users').DataTable({
        'bProcessing': true,
        'paging': true,
        'lengthChange': true,
        'searching': false,
        'info': true,
        'ajax': '/users/load',
        'autoWidth': true,
        "ordering": false,
        "columns": [
            {
                "data": "id",
                "render": function (data, type, full, meta) {
                    return '<input type="checkbox" name="user_id_' + data + '" value="' + data + '">';
                }
            },
            {"data": "name"},
            {"data": "user_name"},
            {"data": "sex"},
            {"data": "birthday"},
            {"data": "phone"},
            {"data": "mail"},
            {
                "data": "is",
                render: function (data, type, row, meta) {
                    return '<button type="button" class="btn btn-info" data-toggle="modal" data-target="#dialog_user_edit" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-edit icon-white"></i> 编辑</button> <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#dialog_user_delete" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-remove icon-white"></i> 删除</button>'
                }
            }
        ],
        "language": {
            "emptyTable": "没有结果可以显示",
            "info": "正在显示第 _START_ 到 _END_ 条数据（共 _TOTAL_ 条）",
            "infoEmpty": "没有数据",
            "infoFiltered": "(已从 _MAX_ 条数据中过滤)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "显示 _MENU_ 条",
            "loadingRecords": "加载中...",
            "processing": "处理中...",
            "search": "搜索（任意字段）：",
            "zeroRecords": "没有匹配的数据",
            "paginate": {
                "first": "第一页",
                "last": "最后一页",
                "next": "下一页",
                "previous": "上一页"
            }
        },
        "serverSide": true
    });
    $("#user-search").on("click", function () {
        var s_user_name = $("#s_user_name").val();
        var s_name = $("#s_name").val();
        datatable.ajax.url('/users/load?s_user_name=' + s_user_name + '&s_name=' + s_name).load();
    });
});