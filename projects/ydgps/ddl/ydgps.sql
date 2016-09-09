-- CREATE DATABASE IF NOT EXISTS ydgps DEFAULT CHARSET utf8 COLLATE utf8_general_ci;

-- 集团用户信息表
CREATE TABLE GROUP_USER_INFO (
     id bigint(20) not null auto_increment comment '用户ID',
     name varchar(30) not null comment '管理员登录名',
     realName varchar(30) comment '真实姓名',
     mobile varchar(11) comment '联系电话',
     email varchar(30) comment '电子邮箱',
     groupId bigint(20) not null default 0 comment '用户所属集团ID，管理员为0',
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
     tel varchar(30) comment '联系电话',
     fax varchar(30) comment '传真',
     linkman varchar(30) comment '联系人姓名',
     linkmanMobile	varchar(11) comment '联系人手机号',
     status char(1) not null default '1' comment '状态，0：无效，1：有效',
     createTime bigint(20) not null comment '创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='集团信息表';

-- 设备信息表
CREATE TABLE DEVICE (
     id bigint(20) not null auto_increment comment '设备ID',
     imei varchar(15) not null comment '设备IMEI号',
     pwd varchar(6) not null default '123456' comment '设备密码',
     model varchar(20) comment '设备型号',
     firmware varchar(20) comment '固件版本号',
     simMobile varchar(11) comment 'SIM卡号',
     simSN varchar(20) comment 'SIM卡序列号',
     simExpire bigint(20) not null default 0 comment 'SIM卡套餐到期时间',
     serviceExpire bigint(20) not null default 0 comment '服务到期时间',
     groupId bigint(20) not null default 0 comment '设备所属集团ID',
     createTime bigint(20) not null comment '创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备信息表';

-- 设备信息表
CREATE TABLE SIM_CHARGE_RECORD (
     id bigint(20) not null auto_increment comment '充值记录号',
     simMobile varchar(15) not null comment '设备IMEI号',
     chargeMoney int(4) not null default 0 comment '充值金额',
     simExpire bigint(20) comment '充值后套餐到期时间',
     createTime bigint(20) not null comment '创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备信息表';

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
     host varchar(15) comment 'connector主机IP',
     port int(11) default 9000 comment 'connector TCP服务端口',
     micSensitivity int(4) comment 'micphone灵敏度',
     reportGPS char(1) comment '是否上报GPS，0否1是',
     workMode char(1) comment '工作模式，0正常模式，1省电模式',
     reportIntervalM int(4) comment '运动时GPS上报间隔，单位：秒',
     reportIntervalS int(4) comment '静止时GPS上报间隔，单位：秒',
     alarmProcessCenter char(1) comment '报警时，中心处理方式',
     alarmProcessDevice char(1) comment '报警时，设备处理方式',
     phoneCallCenter int(4) comment '中心每月最大拔出电话数',
     phoneCallDevice int(4) comment '设备每月最大拔出电话数',
     smsCenter int(4) comment '中心每月最大发出短信数',
     smsDevice int(4) comment '设备每月最大发出短信数',
     vehicleNumber varchar(10) comment '车牌号',
     masterMobile varchar(11) comment '车主手机号（即报警通知手机号）',
     updateTime bigint(20) comment '配置更新时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备配置表';

-- 设备数据表
CREATE TABLE DEVICE_DATA (
     id bigint(20) not null auto_increment comment '设备数据ID',
     deviceId bigint(20) not null comment '设备ID',
     groupId bigint(20) not null comment '数据发生时，设备所属集团ID',
     vehicleNumber varchar(10) comment '数据发生时，设备车牌号',
     gpsState char(1) not null default '0' comment 'GPS定位状态，0：所有定位方式失败，1：GPS准确定位，2：GPS粗略定位，3：基站定位，4：GPS定位失败且基站定位方式未启用，５：基站定位失败',
     lat varchar(10) comment '纬度',
     lng varchar(10) comment '经度',
     alt int(4) default 0 comment '高度',
     speed int(4) default 0 comment '车速，km/h',
     direction int(4) default 0 comment '方向，度数，正北为0度',
     plmn int(11) comment '基站定位PLMN码',
     lac int(11) comment '基站定位LAC码',
     cellId int(11) comment '基站定位cellId',
     odometer int(11) comment '当天即时里程',
     driveTime int(11) comment '当天行驶时间',
     temperature int(4) comment '温度',
     movingState char(1) default '0' comment '运动状态，0静止1运动',
     deviceState char(1) default '0' comment '设备布防状态，0撤防1布防',
     displayState char(1) default '1' comment '显示状态，0不显示1显示',
     accState char(1) default '0' comment 'ACC点火状态，0 ACC未点火 1 ACC点火',
     alarmMoving char(1) default '0' comment '非法位移报警，0未报警1报警',
     alarmPower char(1) default '0' comment '断电报警，0未报警1报警',
     alarmShock char(1) default '0' comment '震动报警，0未报警1报警',
     alarmSpeed char(1) default '0' comment '超速报警，0未报警1报警',
     alarmDoor char(1) default '0' comment '开门报警，0未报警1报警',
     i2cState char(1) default '0' comment 'I2C状态，0异常1正常',
     serialPortStateR char(1) default '0' comment '串口状态-读，0异常1正常',
     serialPortStateW char(1) default '0' comment '串口状态-写，0异常1正常',
     btState char(1) default '0' comment '蓝牙状态，0异常1正常',
     simState char(1) default '0' comment 'SIM状态，0异常1正常',
     netState char(1) default '0' comment '网络状态，0异常1正常',
     call112State char(1) default '0' comment '拨打112状态，0异常1正常',
     gpsSerialPortState char(1) default '0' comment 'GPS串口状态，0异常1正常',
     simSignal int(4) comment '网络信号强度 RSSI',
     `power` int(4) comment '设备电量',
     powerBT int(4) comment '蓝牙电量',
     SMSSent int(4) comment '当月短信下发条数',
     phoneCallAnswered int(4) comment '当月报警电话拨打接听数',
     deviceTime bigint(20) comment '数据发生时间（设备时间）',
     createTime bigint(20) comment '数据创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备数据表';

-- 设备报警记录表
CREATE TABLE DEVICE_ALARM (
     id bigint(20) not null auto_increment comment '设备报警ID',
     deviceId bigint(20) not null comment '设备ID',
     alarm char(1) not null comment '报警编码，1-5依次为：非法位移报警、断电报警、震动报警、超速报警、开门报警',
     alarmType char(1) not null default '1' comment '报警类型，0解除报警1报警',
     deviceTime bigint(20) comment '报警发生时间（设备时间）',
     createTime bigint(20) not null comment '报警创建时间',
     primary key (id)
) engine=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备报警记录表';

-- 设备在线状态表
CREATE TABLE DEVICE_STATE (
     deviceId bigint(20) not null comment '设备ID',
     connectorId char(3) not null comment 'connector编号',
     state char(1) not null comment '在线1，不在线0',
     updateTime bigint(20) not null comment '最后一次更新状态的时间',
     primary key (deviceId)
) engine=MEMORY DEFAULT CHARSET=utf8mb4 COMMENT='设备在线状态表';