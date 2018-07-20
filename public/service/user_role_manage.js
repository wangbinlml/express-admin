$("#e_roles").selectpicker();
$('#dialog_user_role').on('show.bs.modal', function (event) {
    $("#e_roles").empty();
    var modal = $(this);
    var button = $(event.relatedTarget);// Button that triggered the modal
    var data = button.data('whatever'); // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    //var data = JSON.parse(recipient);
    var role_id = data.role_id + "";
    $.ajax({
        type: "get",
        url: "/user_role/getRole",
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
                    text: result.msg || '获取角色失败',
                    timeout: '5000'
                }).show();
                $('#dialog_user_role').modal('hide');
            } else {
                var tempAjax = "";
                var data = result.data;
                $.each(data, function (i, n) {
                    tempAjax += "<option value='" + n.role_id + "'>" + n.role_name + "</option>";
                });
                $("#e_roles").empty();
                $("#e_roles").append(tempAjax);
                //更新内容刷新到相应的位置
                $('#e_roles').selectpicker('render');
                $('#e_roles').selectpicker('refresh');
                if (role_id != "") {
                    $('#e_roles').selectpicker('val', role_id.indexOf(",") != -1 ? role_id.split(",") : role_id);
                }
            }
        }
    });
    modal.find('.modal-body input#e_id').val(data.id);
    modal.find('.modal-body label#e_user_name').html(data.name);
    modal.find('.modal-body input#e_role').val(data.role_name);
});
$('#dialog_user_role').find('.modal-footer #saveUserRole').on("click", function () {
    var data = $("#e-user-role-form").serialize();
    $.ajax({
        type: "post",
        url: "/user_role/setRole",
        data: data,
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
                    text: result.msg || '设置角色失败',
                    timeout: '5000'
                }).show();
            } else {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    text: '设置角色成功',
                    timeout: '2000'
                }).show();
                $('#dialog_user_role').modal('hide');
                window.location.href='/user_role';
            }
        }
    });
});
var datatable = $('#users').DataTable({
    'bProcessing': true,
    'paging': true,
    'lengthChange': true,
    'searching': false,
    'info': true,
    'ajax': '/user_role/load',
    'autoWidth': true,
    "ordering": false,
    "columns": [
        {"data": "id"},
        {"data": "name"},
        {"data": "user_name"},
        {"data": "role_name"},
        {
            "data": "is",
            render: function (data, type, row, meta) {
                return '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#dialog_user_role" data-whatever=\'' + JSON.stringify(row) + '\'><i class="glyphicon glyphicon-edit icon-white"></i> 角色管理</button>'
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
//搜索
$("#user-search").on("click", function () {
    datatable.ajax.url('/user_role/load?s_user_name=' + $("#s_user_name").val() + '&s_name=' + $("#s_name").val()).load();
});