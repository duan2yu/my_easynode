-- 设备表，增加集团ID
ALTER TABLE MOTOR_DEVICE ADD COLUMN groupId bigint(20) not null default 0 after id;

-- 设备表，增加其他信息字段
alter table motor_device add column installPosition varchar(100) comment '安装位置' after inventoryOutId;
alter table motor_device add column installTime bigint(20) comment '装机日期' after installPosition;
alter table motor_device add column installAddress varchar(100) comment '装机地点' after installTime;
alter table motor_device add column previousMaintainTime bigint(20) comment '上次保养日期' after installAddress;
alter table motor_device add column nextMaintainTime bigint(20) comment '下次保养日期' after previousMaintainTime;
alter table motor_device add column driverName varchar(20) comment '司机姓名' after nextMaintainTime;
alter table motor_device add column driverMobile varchar(11) comment '司机手机号' after driverName;
alter table motor_device add column driverMobileShort varchar(11) comment '司机手机短号' after driverMobile;
alter table motor_device add column driverLicenseExpire bigint(20) comment '驾照到期' after driverMobileShort;
alter table motor_device add column vin varchar(20) comment '车架号' after driverLicenseExpire;
alter table motor_device add column sn varchar(20) comment 'SN号' after vin;

-- 用户表加邮箱和备注
alter table motor_user add column email varchar(50) comment '邮箱' after selectedDeviceId;
alter table motor_user add column remark varchar(50) comment '备注' after email;

-- 集团用户信息表
CREATE TABLE GROUP_USER_INFO (
     id bigint(20) not null auto_increment comment '用户ID',
     name varchar(30) not null comment '管理员登录名',
     realName varchar(30) comment '真实姓名',
     mobile varchar(11) comment '联系电话',
     email varchar(30) comment '电子邮箱',
     groupId bigint(20) not null default 0 comment '用户所属集团ID，管理员为0',
     roleId bigint(20) not null default 0 comment '角色ID, 关联rbac_role表',
     pwd	varchar(50) not null comment '经sha1加密的密码',
     salt varchar(32) not null default '' comment '加密salt',
     status char(1) not null default '1' comment '状态，0：无效，1：有效',
     createTime bigint(20) not null comment '创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='集团用户信息表';

-- 集团信息表
CREATE TABLE GROUP_INFO (
     id bigint(20) not null auto_increment comment '集团ID',
     name varchar(30) not null comment '集团名称',
     fullName varchar(255) comment '全称',
     address varchar(255) comment '地址',
     lat varchar(10)  default null comment '纬度',
     lng varchar(10) default null comment '经度',
     tel varchar(30) comment '联系电话',
     fax varchar(30) comment '传真',
     linkman varchar(30) comment '联系人姓名',
     linkmanMobile	varchar(11) comment '联系人手机号',
     status char(1) not null default '1' comment '状态，0：无效，1：有效',
     createTime bigint(20) not null comment '创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='集团信息表';

-- SIM卡充值记录表
CREATE TABLE SIM_CHARGE_RECORD (
     id bigint(20) not null auto_increment comment '充值记录号',
     simMobile varchar(15) not null comment 'SIM卡号',
     chargeMoney int(4) not null default 0 comment '充值金额',
     simExpire bigint(20) comment '充值后套餐到期时间',
     createTime bigint(20) not null comment '创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SIM卡充值记录表';

-- 集团设备分组
CREATE TABLE DEVICE_GROUP (
     id bigint(20) not null auto_increment comment '设备分组ID',
     groupId bigint(20) not null default 0 comment '所属集团ID',
     name varchar(30) not null comment '分组名称',
     code varchar(100) not null comment '分组编码，00为根分组，子分组命名为：0001、000101、00010101',
     parentId bigint(20) not null default 0 comment '父分组ID',
     sortFactor int(11) not null default 0 comment '排序因子，大->小',
     createTime bigint(20) not null comment '创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='集团设备分组';

-- 集团设备分组-设备对应关系
CREATE TABLE DEVICE_GROUP_RELATION (
     id bigint(20) not null auto_increment comment '对应关系ID',
     deviceGroupId bigint(20) not null comment '设备分组ID',
     deviceId bigint(20) not null comment '设备ID',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='集团设备分组-设备对应关系';

-- 设备配置表
CREATE TABLE DEVICE_CONFIG (
     id bigint(20) not null auto_increment comment '设备配置ID',
     deviceId bigint(20) not null comment '设备ID',
     redirectConnector char(1) not null default '0' comment '是否转向$host:$port，０否１是',
     host varchar(15) comment 'connector主机IP',
     port int(11) default 0 comment 'connector TCP服务端口',
     simExpire bigint(20) not null default 0 comment 'SIM卡到期时间',
     serviceExpire bigint(20) not null default 0 comment '服务到期时间',
     micSensitivity int(4) comment 'micphone灵敏度',
     reportGPS char(1) comment '0：保留；1：轨迹上报；2：轨迹不上报；3：轨迹上报，但设置位置隐藏标志；',
     workMode char(1) comment '0：保留；1：省电工作模式；2：正常工作模式；其他：保留；备注：该参数只对CBB-100G电池版设备有作用，决定了该设备处于哪种工作模式；',
     reportIntervalM int(4) comment '运动时GPS上报间隔，单位：秒',
     reportIntervalS int(4) comment '静止时GPS上报间隔，单位：秒',
     speedLimit int(4) comment '超速阀值，单位：km/h',
     speedyDuration int(4) comment '超速持续多久报警，单位：秒',
     alarmProcessFrom char(1) not null default '0' comment '报警处理方式，０：中心报警；１：设备报警',
     alarmProcessCenter char(3) comment '报警时，中心处理方式，三个字符分别表示电话报警、短信报警和消息推送，如111表示电话＋短信＋消息推送，100表示仅电话报警',
     alarmProcessDevice char(1) comment '报警时，设备处理方式，0：表示电话+短信；1：表示纯短信；2：表示纯电话；3：不报警；默认3',
     phoneCallCenter int(4) comment '中心每月最大拔出电话数',
     phoneCallDevice int(4) comment '设备每月最大拔出电话数',
     smsCenter int(4) comment '中心每月最大发出短信数',
     smsDevice int(4) comment '设备每月最大发出短信数',
     efEnabled char(1) not null default '1' comment '是否启用设备的电子围栏功能，０否１是',
     vehicleNumber varchar(10) comment '车牌号',
     masterMobile varchar(11) comment '车主手机号（即报警通知手机号）',
     g2ReportTime varchar(255) comment 'CBB100-G2特殊参数：上报时间，格式：HH24:MI,HH24:MI,HH24:MI,HH24:MI',
     g2KeepOnline bigint(20) not null default 0 comment 'CBB100-G2特殊参数：保持在线直到此时刻',
     updateTime bigint(20) comment '配置更新时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备配置表';

ALTER TABLE DEVICE_CONFIG ADD CONSTRAINT UNIQUE KEY UK_DEVICE(deviceId);
ALTER TABLE DEVICE_CONFIG ADD INDEX IDX_DEVICE(deviceId);

-- 电子围栏表
CREATE TABLE ELECTRONIC_FENCE (
     id bigint(20) not null auto_increment comment '电子围栏ID',
     groupId bigint(20) not null comment '集团ID',
     name varchar(100) not null comment '电子围栏名称',
     type char(1) not null default '0' comment '电子围栏类型，０：离开报警；１：进入报警；2：进入离开均报警',
     address varchar(255) not null comment '中心点地址',
     lat varchar(10) not null comment '中心点纬度',
     lng varchar(10) not null comment '中心点经度',
     radius int(11) not null default 1000 comment '半径，单位：米',
     maxSpeed int(11) not null default 0 comment '最大速度，单位：Km/h，为0时表示不限速',
     createTime bigint(20) not null comment '报警创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电子围栏表';

-- 电子围栏、设备关系表
CREATE TABLE ELECTRONIC_FENCE_DEVICES (
     id bigint(20) not null auto_increment comment '数据ID',
     efId bigint(20) not null comment '电子围栏ID',
     deviceId bigint(20) not null comment '设备ID',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电子围栏、设备关系表';

ALTER TABLE ELECTRONIC_FENCE_DEVICES ADD INDEX IDX_EF(efId);
ALTER TABLE ELECTRONIC_FENCE_DEVICES ADD INDEX IDX_DEVICE(deviceId);

-- 设备报警记录表
CREATE TABLE DEVICE_ALARM (
     id bigint(20) not null auto_increment comment '设备报警ID',
     deviceId bigint(20) not null comment '设备ID',
     alarm char(1) not null comment '报警编码，1-7依次为：非法位移报警(1)、断电报警(2)、震动报警(3)、超速报警(4)、开门报警(5)、进入电子围栏区域报警(6)、离开电子围栏区域报警(7)',
     alarmType char(1) not null default '1' comment '报警类型，0解除报警，1报警',
     efId bigint(20) not null default 0 comment '电子围栏ID，当alarm为６或７时有效',
     lat varchar(10) not null default '0.00000'  comment '报警点纬度',
     lng varchar(10) not null default '0.000000'  comment '报警点经度',
     deviceTime bigint(20) comment '报警发生时间（设备时间）',
     createTime bigint(20) not null comment '报警创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备报警记录表';

ALTER TABLE DEVICE_ALARM ADD INDEX IDX_DEVICE_TIME(deviceId, deviceTime);

-- 设备在线状态表
CREATE TABLE DEVICE_STATE (
     deviceId bigint(20) not null comment '设备ID',
     connectorId char(3) not null comment 'connector编号',
     state char(1) not null comment '在线1，不在线0',
     updateTime bigint(20) not null comment '最后一次更新状态的时间',
     primary key (deviceId)
) engine=MEMORY DEFAULT CHARSET=utf8mb4 COMMENT='设备在线状态表';

ALTER TABLE DEVICE_STATE ADD INDEX IDX_ID(deviceId);
ALTER TABLE DEVICE_STATE ADD INDEX IDX_CONNECTOR(connectorId);

-- 设备在线状态表
CREATE TABLE DEVICE_STATISTICS (
     id bigint(20) not null auto_increment comment '统计ID',
     deviceId bigint(20) not null comment '设备ID',
     date char(10) not null comment '统计数据的日期',
     distance int(11) not null default 0 comment '当日里程，单位：百米',
     time int(11) not null default 0 comment '当时行驶时间，单位：秒',
     stop int(11) not null default 0 comment '当日停车次数',
     alarmMovement int(11) not null default 0 comment '非法位移报警次数',
     alarmPowerOff int(11) not null default 0 comment '断电报警次数',
     alarmShock int(11) not null default 0 comment '震动报警次数',
     alarmSpeedy int(11) not null default 0 comment '超速报警次数',
     alarmDoorOpened int(11) not null default 0 comment '非法开门报警次数',
     alarmEnterEF int(11) not null default 0 comment '进入电子围栏报警次数',
     alarmLeaveEF int(11) not null default 0 comment '离开电子围栏报警次数',
     statTime bigint(20) not null comment '统计时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备统计信息表';

ALTER TABLE DEVICE_STATISTICS ADD INDEX IDX_DEVICE_DATE(date, deviceId);
ALTER TABLE DEVICE_STATISTICS ADD CONSTRAINT UNIQUE UK_DEVICE_DATE(deviceId, date);

-- 设备消息日志表
CREATE TABLE DEVICE_MSG_LOG(
     id bigint(20) not null auto_increment comment '日志ID',
     deviceId bigint(20) not null comment '设备ID',
     connectorId char(3) not null comment 'connector编号',
     sessionId  varchar(36) not null comment '会话ID',
     cmd varchar(10) not null default '0x0000' comment '消息命令字,0x0000表示虚拟命令字disconnect',
     hex varchar(400) comment '完整消息的HEX字符串',
     logTime bigint(20) not null comment '日志记录时间，服务器时间',
     primary key (id)
) engine=MYISAM DEFAULT CHARSET=utf8mb4 COMMENT='设备消息日志表';

ALTER TABLE DEVICE_MSG_LOG ADD INDEX IDX_DEVICE_TIME(deviceId, logTime);

-- 网上充值订单表
CREATE TABLE CHARGE_ORDER (
     id bigint(20) not null auto_increment comment '充值订单ID',
     orderNo varchar(24) not null comment '充值订单码, 2位支付平台编号+14位时间+8位随机数',
     groupId bigint(20) not null comment '充值集团ID',
     totalAmount int(11) not null default 0 comment '充值总金额，单位：分',
     paymentPlatform int(4) not null comment '支付平台，1-5分别为：支付宝、中国工商银行、中国农业银行、中国银行 、中国建设银行',
     paymentState char(1) not null default 0 comment '0:待确认；1:支付成功；2:支付失败；3:订单超时',
     paymentPlatformArgs text comment '向支付平台发送的参数, JSON',
     createTime bigint(20) not null comment '充值订单创建时间',
     confirmTime bigint(20) not null default 0 comment '充值确认时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网上充值订单表';

ALTER TABLE CHARGE_ORDER ADD CONSTRAINT UNIQUE KEY UK_ORDER_NO(orderNo);

-- 充值订单详细信息表
CREATE TABLE CHARGE_ORDER_DETAIL (
     id bigint(20) not null auto_increment comment '数据ID',
     chargeOrderId bigint(20) not null comment '充值订单ID',
     deviceId bigint(20) not null comment '充入的设备ID',
     amount int(11) not null default 0 comment '充值金额',
     serviceExpireBefore bigint(20) not null default 0 comment '充值前服务到期时间',
     serviceExpireAfter bigint(20) not null default 0 comment '充值后服务到期时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值订单详细信息表';

-- 角色和权限数据

--用户所能操作的设备分组
CREATE TABLE `user_devicegroup` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `userId` bigint(20) NOT NULL COMMENT '用户ID',
  `deviceGroupId` bigint(20) NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COMMENT='用户绑定的设备分组表';

-- 服务器列表
CREATE TABLE SERVERS (
  id bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  serverNo varchar(20) NOT NULL COMMENT '服务器编号',
  ip varchar(15) NOT NULL COMMENT 'IP地址',
  port int(11) NOT NULL COMMENT '端口',
  fixed int(1) NOT NULL COMMENT '是否限制配置到此服务器的只能在此服务器登录',
  name varchar(50) COMMENT '服务器名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务器列表';

ALTER TABLE SERVERS ADD CONSTRAINT UNIQUE KEY UK_NO(serverNo);

-- 设备服务器映射表
CREATE TABLE DEVICE_SERVER_MAPPING (
  id bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  deviceId bigint(20) not null comment '设备ID',
  serverId bigint(20) not null default 0 comment '服务器ID',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备服务器映射表';

ALTER TABLE DEVICE_SERVER_MAPPING ADD CONSTRAINT UNIQUE KEY UK_DEVICE_SERVER(deviceId, serverId);