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
                    return '<button type="button" class="btn btn-info" data-toggle="modal" data-target="#e-dialog-user" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-edit icon-white"></i> 编辑</button> <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#dialog_user_delete" data-whatever=\'' + JSON.stringify(row) + '\'><i class="fa fa-remove icon-white"></i> 删除</button>'
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
    //Date picker
    $( "#birthday" ).datepicker();
    //搜索
    $("#user-search").on("click", function () {
        var s_user_name = $("#s_user_name").val();
        var s_name = $("#s_name").val();
        datatable.ajax.url('/users/load?s_user_name=' + s_user_name + '&s_name=' + s_name).load();
    });
    //删除
    $("#user-remove").on("click", function () {
        var s_user_name = $("#s_user_name").val();
        var s_name = $("#s_name").val();
        datatable.ajax.url('/users/load?s_user_name=' + s_user_name + '&s_name=' + s_name).load();
    });

    //编辑
    $('#e-dialog-user').on('show.bs.modal', function (event) {
        var modal = $(this);
        var button = $(event.relatedTarget);// Button that triggered the modal
        var data = button.data('whatever'); // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        modal.find('.modal-body input#e_id').val(data.id);
        modal.find('.modal-body input#e_user_name').val(data.user_name);
        modal.find('.modal-body input#e_name').val(data.name);
        /*$.ajax({
            type: "get",
            url: "/menu_role/get_menu?role_id=" + role_id,
            asyc: false,
            error: function (error) {
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: '内部错误，请稍后再试',
                    timeout: '5000'
                }).show();
                $('#dialog_user_role').modal('hide');
            },
            success: function (result) {
                if (result.error) {
                    new Noty({
                        type: 'error',
                        layout: 'topCenter',
                        text: result.msg || '获取菜单角色失败',
                        timeout: '5000'
                    }).show();
                    $('#dialog_user_role').modal('hide');
                } else {
                    initTreeViewDom(result.data, targetTreeView);//根据数据完成tree view dom 的拼接
                    //刷新bonsai插件(每次重新获得数据之后，再次刷新一下tree view 插件)
                    targetTreeView.bonsai('update');
                }
            }
        });*/
    });
    $('#e-dialog-user').find('.modal-footer #saveUser').click(function () {
        var check = getTreeViewCheckedData(targetTreeView);
        console.log($("#e-menu-role-form").serialize());
    });
});