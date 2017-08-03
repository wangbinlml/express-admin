var getIds = function () {
    var ids = [];
    $(".datatable :checked").each(function () {
        var id = $(this).val();
        if (id === "all")    return true;
        ids.push(id);
    });
    return ids;
};
