
$(function () {
    $('#roles').DataTable({
        'paging': true,
        'lengthChange': true,
        'searching': true,
        'info': true,
        'ajax':'/roles/load',
        'autoWidth': true,
        "ordering": false,
        "columns": [
            {
                "data": "id",
                "render": function (data, type, full, meta) {
                    return '<input type="checkbox" name="role_id_' + data + '" value="' + data + '">';
                }
            },
            {"data": "role_name"},
            {"data": "description"},
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
            "search": "搜索角色名称：",
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
});