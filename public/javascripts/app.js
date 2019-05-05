var getIds = function () {
    var ids = [];
    $(".datatable :checked").each(function () {
        var id = $(this).val();
        if (id === "all")    return true;
        ids.push(id);
    });
    return ids;
};
function showSidebarMenu() {
    $.ajax({
        type: "get",
        url: "/sidebar",
        error: function (error) {
            $(".login-box-msg").text('内部错误，请稍后再试');
            new Noty({
                type: 'error',
                layout: 'topCenter',
                text: '内部错误，请稍后再试',
                timeout: '2000'
            }).show();
        },
        success: function (result) {
            if (result.error) {
                $(".login-box-msg").text(result.msg || '获取菜单失败   ');
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    text: result.msg || '获取菜单失败',
                    timeout: '2000'
                }).show();
            } else {
                $('.sidebar-menu').sidebarMenu({data: result.data});
            }
        }
    })
}
