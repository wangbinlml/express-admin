var datatables = $('#menus').DataTable({
    'paging': true,
    'lengthChange': true,
    'searching': true,
    'info': true,
    'ajax': '/menus/load',
    'autoWidth': true,
    "ordering": false,
    "columns": [
        {
            "data": "id",
            "render": function (data, type, full, meta) {
                return '<input type="checkbox" name="menu_id_' + data + '" value="' + data + '">';
            }
        },
        {"data": "menu_name"},
        {"data": "parent_menu_name"},
        {"data": "menu_url"},
        {
            "data": "menu_icon",
            render: function (data, type, row, meta) {
                return '<span class="glyphicon ' + row.menu_icon + '">' + (row.menu_icon != "" ? '(' + row.menu_icon + ')</span>' : "无");
            }
        },
        {"data": "created_at"},
        {"data": "modified_at"},
        {
            "data": "is",
            render: function (data, type, row, meta) {
                return '<a class="" data-toggle="modal" id="menu_id_' + row.id + '" data-target="#e-dialog-menu" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-edit icon-white"></i> 编辑</a>&nbsp;&nbsp;<a data-toggle="modal" onclick="removeData(' + row.id + ')" data-target="#dialog_menu_delete" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-remove icon-white"></i> 删除</a>';
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
        "search": "搜索菜单名称：",
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

//编辑
$('#e-dialog-menu').on('show.bs.modal', function (event) {
    var modal = $(this);
    var button = $(event.relatedTarget);// Button that triggered the modal
    var data = button.data('whatever'); // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    initForm(modal, data);
});
var initForm = function (modal, data) {
    $.ajax({
        type: "get",
        url: "/menus/getParentMenu",
        asyc: false,
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
                    text: result.msg || '保存角色失败',
                    timeout: '5000'
                }).show();
            } else {
                var res = result.data;
                var auxArr = [];
                auxArr[0] = "<option value='0'>==请选择父级菜单==</option>";

                // 创建select
                $("div.parent_id").html("<select class=\"form-control\" id=\"e_parent_id\" name=\"e_parent_id\"></select>");
                // 添加选项
                for (var i = 0; i < res.length; i++) {
                    var menu_id = res[i]['menu_id'];
                    auxArr[i + 1] = "<option value='" + menu_id + "'>" + res[i]['menu_name'] + "</option>";
                }
                $('#e_parent_id').html(auxArr.join(''));

                if (data) {
                    modal.find('.modal-body input#e_id').val(data.id);
                    modal.find('.modal-body input#e_menu_name').val(data.menu_name);
                    modal.find('.modal-body input#e_menu_url').val(data.menu_url);
                    modal.find('.modal-body input#e_menu_icon').val(data.menu_icon);
                    // 设置默认选项
                    modal.find('.modal-body select#e_parent_id').val(data.parent_id || 0);
                } else {
                    modal.find('.modal-body form input').val("");
                    modal.find('.modal-body form select').val("0");
                }
            }
        }
    });
};

$('#e-dialog-menu').find('.modal-footer #saveMenu').click(function () {
    $.ajax({
        type: "get",
        url: "/menus/save",
        asyc: false,
        data: $("#e-menu-form").serialize(),
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
                    text: result.msg || '保存角色失败',
                    timeout: '2000'
                }).show();
            } else {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    text: result.msg || '保存成功',
                    timeout: '2000'
                }).show();
                $('#e-dialog-menu').modal('hide');
                datatables.ajax.url('/menus/load').load();
            }
        }
    });
});
$("#menu_refresh").on("click", function () {
    datatables.ajax.url('/menus/load').load();
});
$("#menu_edit").on("click", function () {
    var ids = getIds();
    if (ids.length != 1) {
        new Noty({
            type: 'warning',
            layout: 'topCenter',
            text: '请选择一条记录',
            timeout: '2000'
        }).show();
        return;
    }
    var id = ids[0];
    var data = $("a#menu_id_" + id).attr("data-whatever");
    var modal = $('#e-dialog-menu');
    $('#e-dialog-menu').modal({
        keyboard: true
    });
    initForm(modal, JSON.parse(data));
});
var deleteMenuData = function (ids) {
    $.ajax({
        type: "delete",
        url: "/menus/delete",
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
                    text: result.msg || '删除菜单失败',
                    timeout: '2000'
                }).show();
            } else {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    text: result.msg || '删除菜单成功',
                    timeout: '2000'
                }).show();
                datatables.ajax.url('/menus/load').load();
            }
        }
    });
};
//批量删除
$("#menu_batch_remove").on("click", function () {
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
                deleteMenuData(id);
                n.close();
            }, {id: 'button1', 'data-status': 'ok'}),

            Noty.button('NO', 'btn btn-error btn-confirm', function () {
                n.close();
            })
        ]
    }).show();
};