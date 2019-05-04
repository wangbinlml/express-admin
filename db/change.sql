ALTER TABLE bs_menu ADD type tinyint DEFAULT 0 NULL COMMENT '类型（0：菜单，1：按钮）';
ALTER TABLE bs_menu ADD menu_flag varchar(16) DEFAULT "" NULL COMMENT '唯一标示';
ALTER TABLE bs_menu
  MODIFY COLUMN is_del tinyint(1) DEFAULT '0' AFTER type;
ALTER TABLE bs_menu MODIFY menu_url varchar(50);
ALTER TABLE bs_menu MODIFY menu_icon varchar(50);


INSERT INTO `bs_menu` (`parent_id`, `menu_name`, `menu_url`, `menu_icon`, `creator_id`, `created_at`, `modified_id`, `modified_at`, `type`, `is_del`, `menu_flag`) VALUES (6, '新增', '#', null, DEFAULT, DEFAULT, DEFAULT, DEFAULT, 1, DEFAULT, 'add');
INSERT INTO `bs_menu` (`parent_id`, `menu_name`, `menu_url`, `menu_icon`, `creator_id`, `created_at`, `modified_id`, `modified_at`, `type`, `is_del`, `menu_flag`) VALUES (6, '删除', '#', null, DEFAULT, DEFAULT, DEFAULT, DEFAULT, 1, DEFAULT, 'delete');
INSERT INTO `bs_menu` (`parent_id`, `menu_name`, `menu_url`, `menu_icon`, `creator_id`, `created_at`, `modified_id`, `modified_at`, `type`, `is_del`, `menu_flag`) VALUES (6, '修改', '#', null, DEFAULT, DEFAULT, DEFAULT, DEFAULT, 1, DEFAULT, 'update');

ALTER TABLE bs_operation_logs MODIFY operations varchar(512) NOT NULL;
