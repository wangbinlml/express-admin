var setting = {
    view: {
        addHoverDom: false,
        removeHoverDom: false,
        dblClickExpand: false, //双击的时候是否切换展开状态。true为切换，false不切换
        selectedMulti: false
    },
    check: {
        enable: true,
        chkboxType: {
            "Y": "ps",
            "N": "ps"
        }
    },
    data: {
        simpleData: {
            enable: true,
            idKey: "menu_id",//节点的id
            pIdKey: "parent_id",//节点的父节点id
        },
        key: {
            name: "menu_name" //节点显示的值
        },
    },
    edit: {
        enable: false,
        treeNodeKey: "menu_id",  //在isSimpleData格式下，当前节点id属性
        treeNodeParentKey: "parent_id",//在isSimpleData格式下，当前节点的父节点id属性
        showLine: true, //是否显示节点间的连线
    }
};

var treeObj = null;
$('#dialog_menu_role').on('show.bs.modal', function (event) {
    var modal = $(this);
    var button = $(event.relatedTarget);// Button that triggered the modal
    var data = button.data('whatever'); // Extract info from data-* attributes
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
                treeObj = $.fn.zTree.init($("#busTree"), setting, result.data);
            }
        }
    });
    modal.find('.modal-body input#e_id').val(data.role_id);
    modal.find('.modal-body label#e_role_name').html(data.role_name);
});

$('#dialog_menu_role').find('.modal-footer #saveMenuRole').click(function () {
    var menus = [];
    var nodes = treeObj.getCheckedNodes(true);
    for (var i = 0; i<nodes.length; i++) {
        menus.push(nodes[i]['menu_id']);
    }
    $.ajax({
        type: "post",
        url: "/menu_role/setMenu",
        data: {
            e_menus: menus.join(","),
            e_id: $('#e_id').val()
        },
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
                showSidebarMenu();
                //datatable.ajax.url('/menu_role/load').load();
                window.location.href = "/menu_role";
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
