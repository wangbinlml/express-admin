var datatables = $('#loginLogs').DataTable({
    'paging': true,
    'lengthChange': true,
    'searching': true,
    'info': true,
    'ajax': '/operation_log/load',
    'autoWidth': true,
    "ordering": false,
    "columns": [
        {
            "data": "id",
            "render": function (data, type, full, meta) {
                return '<input type="checkbox" name="id_' + data + '" value="' + data + '">';
            }
        },
        {"data": "user_name"},
        {"data": "name"},
        {"data": "operations"},
        {"data": "operate_time"},
        {
            "data": "is",
            render: function (data, type, row, meta) {
                return '<a data-toggle="modal" onclick="removeData(' + row.id + ')" data-target="#dialog_operation_delete" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-remove icon-white"></i> 删除</a>'
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
$("#operation_log_refresh").on("click", function () {
    datatables.ajax.url('/operation_log/load').load();
});
var deleteOperationLogData = function (ids) {
    $.ajax({
        type: "delete",
        url: "/operation_log/delete",
        asyc: false,
        data: {ids: ids},
        error: function (error) {
            new Noty({
                type: 'error',
                layout: 'topCenter',
                text: '内部错误，请稍后再试',
                timeout: '5000'
            }).show();
        },
        success: function (result) {
            if (result.error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: result.msg || '删除角色失败',
                    timeout: '2000'
                }).show();
            } else {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    text: result.msg || '删除角色成功',
                    timeout: '2000'
                }).show();
                datatables.ajax.url('/operation_log/load').load();
            }
        }
    });
};
//批量删除
$("#operation_log_batch_remove").on("click", function () {
    var ids = getIds();
    if (ids.length == 0) {
        new Noty({
            type: 'warning',
            layout: 'topCenter',
            text: '至少要选择一条记录',
            timeout: '2000'
        }).show();
        return;
    }
    removeData(ids.join(","));
});
var removeData = function (id) {
    var n = new Noty({
        text: '你要继续吗?',
        type: 'info',
        closeWith: ['button'],
        layout: 'topCenter',
        buttons: [
            Noty.button('YES', 'btn btn-success', function () {
                deleteOperationLogData(id);
                n.close();
            }, {id: 'button1', 'data-status': 'ok'}),

            Noty.button('NO', 'btn btn-error btn-confirm', function () {
                n.close();
            })
        ]
    }).show();
};
