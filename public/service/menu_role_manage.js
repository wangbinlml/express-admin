$(function () {
    //http://blog.csdn.net/qq_27093465/article/details/53214984
    $("#menu-role-checkboxes").bonsai({
        expandAll: true,
        handleDuplicateCheckboxes: true,
        checkboxes: true, // depends on jquery.qubit plugin
        createInputs: 'checkbox' // takes values from data-name and data-value, and data-name is inherited
    });
    /**
     * 初始化 tree view dom
     */
    function initTreeViewDom(data, targetTreeView) {
        var menuData = data.menus;
        for (var i = 0; i < menuData.length; i++) {
            var temp = menuData[i];
            var liParent = $("<li class='expanded'></li>");
            liParent.attr("data-value", temp.menu_id);
            liParent.html(" " + temp.menu_name);
            var streams = temp.menu_child;
            var ol = $("<ol></ol>");
            for (var j = 0; j < streams.length; j++) {
                var li = $("<li></li>");
                li.attr("data-value", streams[j].menu_id);
                li.html(" " + streams[j].menu_name);
                ol.append(li);
            }
            liParent.append(ol);
            targetTreeView.append(liParent);
        }
        var menuId = data.menuId;
        $("#menu-role-checkboxes").find("li[data-value]").each(function () {
            var d_value = $(this).attr("data-value") + "";
            if ($.inArray(d_value, menuId) != -1) {
                console.log(d_value)
                $(this).attr("data-checked", "1");
            }
        });
    }

    $('#dialog_menu_role').on('show.bs.modal', function (event) {
        var targetTreeView = $("#menu-role-checkboxes");
        targetTreeView.html("");

        var modal = $(this);
        var button = $(event.relatedTarget);// Button that triggered the modal
        var data = button.data('whatever'); // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        //var data = JSON.parse(recipient);
        var role_id = data.role_id;
        $.ajax({
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
                $('#dialog_menu_role').modal('hide');
            },
            success: function (result) {
                if (result.error) {
                    new Noty({
                        type: 'error',
                        layout: 'topCenter',
                        text: result.msg || '获取菜单角色失败',
                        timeout: '5000'
                    }).show();
                    $('#dialog_menu_role').modal('hide');
                } else {
                    //根据数据完成tree view dom 的拼接
                    initTreeViewDom(result.data, targetTreeView);
                    //刷新bonsai插件(每次重新获得数据之后，再次刷新一下tree view 插件)
                    targetTreeView.bonsai('update');
                }
            }
        });
        modal.find('.modal-body input#e_id').val(data.role_id);
        modal.find('.modal-body label#e_role_name').html(data.role_name);
    });
    $('#dialog_menu_role').find('.modal-footer #saveMenuRole').click(function () {
        $.ajax({
            type: "post",
            url: "/menu_role/setMenu",
            data: $("#e-menu-role-form").serialize(),
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
                        text: result.msg || '菜单角色保存失败',
                        timeout: '5000'
                    }).show();
                } else {
                    new Noty({
                        type: 'success',
                        layout: 'topCenter',
                        text: '菜单角色保存成功',
                        timeout: '5000'
                    }).show();
                    $('#dialog_menu_role').modal('hide');
                    datatable.ajax.url('/menu_role/load').load();
                }
            }
        });
    });
    var datatable = $('#roles').DataTable({
        'paging': true,
        'lengthChange': true,
        'searching': true,
        'info': true,
        'ajax': '/menu_role/load',
        'autoWidth': true,
        "ordering": false,
        "columns": [
            {"data": "role_id"},
            {"data": "role_name"},
            {"data": "description"},
            {
                "data": "is",
                render: function (data, type, row, meta) {
                    return '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#dialog_menu_role" data-whatever=\'' + JSON.stringify(row) + '\'><i class="glyphicon glyphicon-edit icon-white"></i> 菜单权限</button>'
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
});