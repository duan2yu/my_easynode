-- 角色表
CREATE TABLE RBAC_ROLE (
     id bigint(20) not null auto_increment comment '角色ID',
     roleGroup bigint(20) not null default 0 comment '角色组',
     roleName varchar(30) not null comment '角色名称',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 用户角色表
CREATE TABLE RBAC_USER_ROLE (
     id bigint(20) not null auto_increment comment '用户角色ID',
     userId bigint(20) not null comment '用户ID',
     roleId bigint(20) not null comment '角色ID',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色表';

-- 权限表
CREATE TABLE RBAC_PRIVILEGE (
     id bigint(20) not null auto_increment comment '权限ID',
     privilegeCode  varchar(30) not null comment '权限编码（英文助记）',
     privilegeName  varchar(30) not null comment '权限名称',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 角色权限表
CREATE TABLE RBAC_ROLE_PRIVILEGE (
     id bigint(20) not null auto_increment comment '角色权限ID',
     roleId bigint(20) not null comment '角色ID',
     privilegeId bigint(20) not null comment '权限ID',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限表';