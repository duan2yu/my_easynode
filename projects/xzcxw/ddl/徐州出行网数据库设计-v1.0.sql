-- 管理员信息表
create table xzcxw_admin (
  id bigint(20) not null auto_increment comment '管理员ID',
  name varchar(30) not null comment '管理员登录名',
  realName varchar(30) comment '真实姓名',
  mobile varchar(11) comment '联系电话',
  email varchar(30) comment '电子邮箱',
  pwd	varchar(50) not null comment '经sha1加密的密码',
  salt varchar(32) not null default '' comment 'sha1密钥',
  status char(1) not null default '1' comment '状态，0：无效，1：有效',
  createTime bigint(20) not null comment '创建时间',
  primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员信息表';

-- 系统用户表
create table xzcxw_user (
  id bigint(20) not null auto_increment comment '用户ID',
  name varchar(30) not null comment '用户登录名',
  realName varchar(30) comment '真实姓名',
  mobile varchar(11) comment '联系电话',
  email varchar(30) comment '电子邮箱',
  addr varchar(255) comment '用户详细地址',
  pwd	varchar(50) not null comment '经sha1加密的密码',
  salt varchar(32) not null default '' comment 'sha1密钥',
  status char(1) not null default '1' comment '状态，0：无效，1：有效',
  registerChannel char(1) not null default '0' comment '注册渠道：0：PC-WEB，1：微信，2：iOS终端，3：Android终端',
  registerTime bigint(20) not null comment '注册时间',
  primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

alter table xzcxw_user add index idx_name(name);
alter table xzcxw_user add index idx_mobile(mobile);

-- 用户登录记录表
create table xzcxw_user_login_record (
  id bigint(20) not null auto_increment comment '登录记录ID',
  userId bigint(20) not null comment '用户ID',
  loginChannel char(1) not null default '0' comment '登录渠道：0：PC-WEB，1：微信，2：iOS终端，3：Android终端',
  loginIP varchar(20) comment '登录的IP地址',
  loginTime bigint(20) not null comment '登录时间',
  primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户登录记录表';

alter table xzcxw_user_login_record add index idx_time(loginTime, loginChannel);

-- 内容目录表
create table xzcxw_cms_catalog (
	id bigint(20) not null auto_increment comment '目录ID',
	code varchar(30) not null comment '树型目录编码，00表示根目录，00-01表示1级子目录C, 00-01-01表示1级子目录C下的第一个子目录',
	name varchar(30) not null comment '目录名称',
	identityName varchar(30) not null comment '目录标识名',
	remark varchar(255) comment '备注',
	createTime bigint(20) not null comment '创建时间',
	status char(1) not null default '1' comment '状态，0：无效，1：有效',
	primary key (id)
)engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='内容目录表';

alter table xzcxw_cms_catalog add constraint uk_code unique key(code);
alter table xzcxw_cms_catalog add constraint uk_identityName unique key(identityName);
alter table xzcxw_cms_catalog  add  column parent BIGINT(20);

-- 内容信息表
create table xzcxw_cms_content (
	id bigint(20) not null auto_increment comment '内容ID',
	catalogId bigint(20) not null comment '内容所属目录ID',
	title varchar(100) not null comment '内容标题',
	subtitle varchar(100) not null comment '副标题',
	content text comment '内容富文本',
	sortFactor int(11) not null default 0 comment '排序因子, DESC',
	expire bigint(20) not null default 0 comment '过期时间，默认0(永不过期)',
	createTime bigint(20) not null comment '创建时间',
	creator bigint(20) not null comment '创建者管理员ID',
	primary key (id)
)engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='内容表';

alter table xzcxw_cms_content add index idx_time_catalog(createTime, catalogId);

-- 内容附件表
create table xzcxw_cms_content_attachment (
	id bigint(20) not null auto_increment comment '附件ID',
	contentId bigint(20) not null comment '附件所属内容ID',
	fileName varchar(100) not null comment '文件名',
	reservedCode varchar(100) comment '保留码，用于保存第三方平台主键',
	filePath varchar(255) not null comment '文件路径',
	mimeType varchar(50) comment 'MIME类型',
	sortFactor tinyint(4) not null default 0 comment '排序因子，倒序排序',
	uploadTime bigint(20) not null comment '文件上传时间',
	primary key (id)
)engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='内容附件表';

alter table xzcxw_cms_content_attachment add index idx_content(contentId);

-- 地图标记点分类表
create table xzcxw_map_marker_type (
	id bigint(20) not null auto_increment comment '地图标记点分类ID',
	name varchar(100) not null comment '分类名称',
	icon varchar(40) not null default 'default.png' comment '地图上的maker图标',
	status char(1) not null default '1' comment '状态，0：无效，1：有效',
	createTime bigint(20) not null comment '创建时间',
	primary key (id)
)engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地图标记点分类表';

insert into xzcxw_map_marker_type values(0, 'Y-易堵路段', 'ydld.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'C-长途客运站', 'ctkyz.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'C-城乡公交站', 'cxgjz.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'G-公交车站', 'gjcz.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'Z-自行车租赁点', 'zxczld.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'Z-自行车租赁点（可租可还）', 'zxczld-kzkh.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'Z-自行车租赁点（可租不可还）', 'zxczld-kz.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'Z-自行车租赁点（可还不可租）', 'zxczld-kh.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'T-停车场', 'tcc.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'J-加油站', 'jyz.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'G-高速公路服务区', 'gsglfwq.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'D-地铁站', 'dtz.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'D-地铁换乘站', 'dthcz.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'L-水上客运中心', 'lckyzx.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'L-轮渡（人车渡）', 'ld-rcd.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'L-轮渡（人渡）', 'ld-rd.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'L-轮渡（车渡）', 'ld-cd.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'H-货运码头', 'hymt.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'H-火车站', 'hcz.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'H-火车货运站', 'hchyz.png', '1', 1440554528000);
insert into xzcxw_map_marker_type values(0, 'L-立交导流', 'ljdl.png', '1', 1440554528000);

-- 地图标记点信息表
create table xzcxw_map_marker (
	id bigint(20) not null auto_increment comment '地图标记点ID',
	type bigint(20) not null comment '地图标记点分类ID',
	name varchar(100) not null comment '标记点名称',
	displayName char(1) not null default '1' comment '是否显示图标同时显示名称，0：不显示名称，1：显示名称',
	lat decimal(11, 6) comment 'GPS位置，纬度(百度坐标)',
	lng decimal(11, 6) comment 'GPS位置，经度(百度坐标)',
	contentId bigint(20) not null default 0 comment '描述的内容ID',
	linkCamera varchar(255) comment '关联摄像头信息',
	status char(1) not null default '1' comment '状态，0：无效，1：有效',
	attrs text comment '保留属性，使用JSON结构描述',
	createTime bigint(20) not null comment '创建时间',
	primary key (id)
)engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地图标记点信息表';

alter table xzcxw_map_marker add index idx_type_position(type, lat, lng);
alter table xzcxw_map_marker add index idx_type_name(type, name);

-- 出租车信息表
create table xzcxw_taxi (
	id bigint(20) not null auto_increment comment '出租车ID',
	vehicleNumber varchar(10) not null comment '车牌号码',
	gpsDeviceId varchar(20) comment 'GPS设备编号',
	corp varchar(100) not null comment '所属运营公司',
	drivers varchar(255) comment '司机，格式：$姓名,$身份证号;',
	status char(1) not null default '1' comment '状态，0：无效，1：有效',
	attrs text comment '保留属性，使用JSON结构描述',
	createTime bigint(20) not null comment '创建时间',
	primary key (id)
)engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出租车表';

alter table xzcxw_taxi add index idx_vn(vehicleNumber);

-- 公交线路信息表
create table xzcxw_bus_line  (
	id bigint(20) not null auto_increment comment '公交线路ID',
	busNo varchar(10) not null default 0 comment '公交线路号',
	addressFrom bigint(20) not null default 0 comment '始发站地图标记点ID',
	addressTo bigint(20) not null default 0 comment '终点站地图标记点ID',
	firstBusStartTime char(5) not null default '00:00' comment '首班车时间',
	lastBusEndTime char(5) not null default '00:00' comment '末班车时间',
	busInterval varchar(100) comment '间隔时间',
	remark varchar(255) comment '线路备注',
	beginTime bigint(20) not null default 0 comment '此线路开始运营日期',
	endTime bigint(20) not null default 0 comment '此线路结束运营日期',
	status char(1) not null default '0' comment '运营状态，０：停运；１：正在运行',
	createTime bigint(20) not null comment '创建时间',
	primary key (id)
)engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公交线路表';

-- 公交线路站台表
create table xzcxw_bus_stop  (
	id bigint(20) not null auto_increment comment '公交站台ID',
	busLineId bigint(20) not null comment '公交线路ID',
	name varchar(30) not null comment '站台名称',
	mapMarkerId bigint(20) not null default 0 comment '地图标记点ID',
	stopIndex tinyint(4) not null default 0 comment '站点顺序，ASC',
	type char(1) not null default '1' comment '站台类型，０：临时依靠站；１：公交站',
	createTime bigint(20) not null comment '创建时间',
	primary key (id)
)engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公交线路站台表';

-- 公交车表
create table xzcxw_bus  (
	id bigint(20) not null auto_increment comment '公交车ID',
	vehicleNumber varchar(10) not null comment '车牌号码',
	busNo varchar(10) not null default 0 comment '公交线路号',
	createTime bigint(20) not null comment '创建时间',
	status char(1) not null default '0' comment '运营状态，０：停运；１：正在运行',
	primary key (id)
)engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公交车表';

