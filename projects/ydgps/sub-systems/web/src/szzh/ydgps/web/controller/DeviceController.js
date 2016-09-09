var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var BeanFactory = using('easynode.framework.BeanFactory');
var thunkify = require('thunkify');

(function () {
        const MONGODB_URL = EasyNode.config('mongodb.url');
        const COLLECTION_DATA = EasyNode.config('mongodb.collection.data', 'CBB100DATA');
        var fnConnect = thunkify(MongoClient.connect);
        var deviceControlMethod = EasyNode.config('service.deviceControl.method', 'GET');
        var timeout = parseInt(EasyNode.config('service.deviceControl.timeout', '5000'));
        /**
         * Class DeviceController
         *
         * @class #NAMESPACE#.DeviceController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class DeviceController extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super();
                        //调用super()后再定义子类成员。
                        this.bookshelf = null;                          //IoC injection
                        this.cache = null;
                }

                /**
                 * @api {post} /api/device/create 创建新设备
                 * @apiName createDevice
                 * @apiGroup Device
                 *
                 * @apiParam {String} imei * 设备IMEI号
                 * @apiParam {String} regCode 设备密码，默认123456
                 * @apiParam {String} deviceType * 设备型号
                 * @apiParam {String} firmware 设备固件版本号
                 * @apiParam {String} phone SIM卡号
                 * @apiParam {String} deviceName 设备名称
                 * @apiParam {String} batch 批次号
                 * @apiParam {Number} groupId * 集团ID，未分配的设备为0
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                // TEST http://localhost:10000/api/device/create?imei=000000000000124&deviceType=TEST&groupId=1&deviceName=aaa&phone=12345678999
                create() {
                        var me = this;
                        return function * () {
                                this.validator.check('imei').necessary().end();
                                this.validator.check('deviceType').necessary().end();
                                this.validator.check('groupId').necessary().end();
                                this.validator.check('imei').optional().length(me.util.constants.IMEI_LENGTH).end();
                                this.validator.check('batch').optional().end();
                                this.validator.check('expireTime').optional().date().end();
                                this.validator.check('phone').optional().match(me.util.getRegExps().mobile).end();
                                // this.validator.check('comment').optional().end();

                                if (this.validator.isValid()) {
                                        var inventoryInId = new Date().toFormat('YYYYMMDD');
                                        for (var i = 0; i < 8; i++) {
                                                inventoryInId += parseInt(Math.random() * 10);
                                        }
                                        var regCode = this.p('regCode') || '123456';
                                        var groupId = this.p('groupId');
                                        var expireTime = this.p('expireTime') != null ? this.parameter.dateParam('expireTime').getTime() : 0;

                                        var now = new Date().getTime();
                                        var device = {
                                                imei: this.p('imei'),
                                                imsi: '',
                                                regCode: regCode,
                                                groupId: groupId,
                                                phone: this.p('phone'),
                                                deviceName: this.p('deviceName'),
                                                deviceType: this.p('deviceType'),
                                                batch: this.p('batch'),
                                                firmwareVersion: this.p('firmware'),
                                                inventoryInId: inventoryInId,
                                                installed: me.util.constants.UNINSTALLED_DEVICE,
                                                expireTime: expireTime,
                                                updateTime: now,
                                                createTime: now
                                        };
                                        try {
                                                var ret = yield me.bookshelf.knex.insert(device)
                                                        .into('motor_device')
                                                return ActionResult.createSuccessResult({}).setMsg('设备入库成功');
                                        } catch (err) {
                                                if (err.message.match(/.*ER_DUP_ENTRY.*/)) {
                                                        logger.error('设备IMEI号重复[' + this.p('imei') + ']');
                                                        return ActionResult.createErrorResult({}).setMsg('设备IMEI号重复');
                                                }
                                                else {
                                                        throw err;
                                                }
                                        }
                                }
                        };
                }

                /**
                 * @api {get} /api/device/read/:deviceId 读取设备信息
                 * @apiName readDevice
                 * @apiGroup Device
                 *
                 * @apiParam {Number} deviceId 设备ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                read() {
                        var me = this;
                        return function * () {
                                var userGroup = this.session.USER.groupId;
                                var deviceId = parseInt(this.params.deviceId);
                                if (isNaN(deviceId) || deviceId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }
                                var ret = yield me.bookshelf.knex('motor_device').where({
                                        id: deviceId,
                                        groupId: userGroup
                                }).select();
                                if (ret.length === 0) {
                                        return ActionResult.createValidateFailResult('设备不属于当前登录的集团用户');
                                }

                                var ret = yield  me.bookshelf.knex('motor_device')
                                        .leftJoin('device_config', 'motor_device.id', 'device_config.deviceId')
                                        .leftJoin('device_group_relation', 'motor_device.id', 'device_group_relation.deviceId')
                                        .leftJoin('device_group', 'device_group.id', 'device_group_relation.deviceGroupId')
                                        .leftJoin('motor_user','motor_device.masterId','motor_user.id')
                                        .where('motor_device.id', deviceId)
                                        .select('motor_device.id as deviceId', 'motor_device.imei','motor_device.deviceType', 'motor_device.phone',
                                        'motor_device.motorBrand', 'motor_device.motorModel', 'motor_device.motorColor', 'motor_device.motorEnginCode','motor_device.vin','motor_device.sn',
                                        'motor_device.installPosition','motor_device.installTime','motor_device.installAddress','motor_device.previousMaintainTime','motor_device.nextMaintainTime','motor_device.driverName','motor_device.driverMobile','motor_device.driverMobileShort','motor_device.driverLicenseExpire',
                                        'motor_user.nickname','motor_user.email','motor_user.remark',
                                        'device_config.masterMobile',
                                        'device_config.vehicleNumber',
                                        'device_group.id as deviceGroupId','device_group.name as deviceGroupName')
                                if (ret.length == 0) {
                                        return ActionResult.createErrorResult('设备不存在');
                                }

                                return ActionResult.createSuccessResult(ret[0]);
                        };
                }





                /**
                 * @api {get} /api/device/readDevices 车辆点名
                 * @apiName readDevice
                 * @apiGroup Device
                 *
                 * @apiParam {Number} deviceId 设备ID,以逗号分隔
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                readDevices() {
                        var me = this;
                        return function * () {
                                var userGroup = this.session.USER.groupId;
                                var deviceId = this.p('deviceId');
                                if(!deviceId)
                                {
                                        return ActionResult.createValidateFailResult('请输入需要查询的设备');
                                }
                                var arr=deviceId.split(',')
                                if(arr.length<=0)
                                {
                                        return ActionResult.createValidateFailResult('请至少输入一个设备');
                                }
                                /*    if (isNaN(deviceId) || deviceId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }
                               var ret = yield me.bookshelf.knex('motor_device').where({
                                        id: deviceId,
                                        groupId: userGroup
                                }).select();
                                if (ret.length === 0) {
                                        return ActionResult.createValidateFailResult('设备不属于当前登录的集团用户');
                                }*/

                                var ret = yield  me.bookshelf.knex('motor_device')
                                        .leftJoin('device_config', 'motor_device.id', 'device_config.deviceId')
                                        .leftJoin('device_group_relation', 'motor_device.id', 'device_group_relation.deviceId')
                                        .leftJoin('device_group', 'device_group.id', 'device_group_relation.deviceGroupId')
                                        .leftJoin('motor_user','motor_device.masterId','motor_user.id')
                                        .whereIn('motor_device.id',arr)
                                        .select('motor_device.id as deviceId', 'motor_device.imei','motor_device.deviceType', 'motor_device.phone',
                                        'motor_device.motorBrand', 'motor_device.motorModel', 'motor_device.motorColor','motor_device.vin','motor_device.sn',
                                        'motor_device.installPosition','motor_device.installTime','motor_device.installAddress','motor_device.previousMaintainTime','motor_device.nextMaintainTime','motor_device.driverName','motor_device.driverMobile','motor_device.driverMobileShort','motor_device.driverLicenseExpire',
                                        'motor_user.nickname','motor_user.email','motor_user.remark',
                                        'device_config.masterMobile',
                                        'device_config.vehicleNumber',
                                'device_group.id as deviceGroupId','device_group.name as deviceGroupName')
                                //'motor_device.motorEnginCode' 字段被删除 需要确认　　todo

                                for(var i=0;i<ret.length;i++)
                                {
                                        var snapshot = yield me.cache.get("SD-" + ret[i].imei);
                                        ret[i].snapshot=snapshot;

                                        ret[i].motorEnginCode=null;
                                }

                                if (ret.length == 0) {
                                        return ActionResult.createErrorResult('未找到设备');
                                }
                                return ActionResult.createSuccessResult(ret);
                        };
                }


                /**
                 * @api {post} /api/device/delete/:deviceId 删除设备
                 * @apiName deleteDevice
                 * @apiGroup Device
                 *
                 * @apiParam {Number} deviceId * 设备ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                delete () {
                        var me=this;
                        return function * () {
                                var deviceId = parseInt(this.params.deviceId);
                                if (isNaN(deviceId) || deviceId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }

                                var ret = yield me.bookshelf.knex('motor_device')
                                        .where('motor_device.id', deviceId)
                                        .andWhere('motor_device.groupId',this.session.USER.groupId)
                                        .delete();
                                if (ret == 1) {
                                        return ActionResult.createSuccessResult({}).setMsg('设备删除成功');
                                }
                                return ActionResult.createErrorResult('设备不属于当前集团或不存在');
                        };
                }

                /**
                 * @api {get} /api/device/list 查询设备列表
                 * @apiName listDevice
                 * @apiGroup Device
                 *
                 * @apiParam {String} deviceGroupName 设备分组名称
                 * @apiParam {String} vehicleNumber 车牌号码,like
                 * @apiParam {String} masterMobile 车主电话
                 * @apiParam {String} deviceType 设备型号
                 * @apiParam {Number} page 页号，默认1
                 * @apiParam {Number} rpp 每页记录数，系统默认值
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                list() {
                        var me = this;
                        return function * () {
                                this.validator.check('deviceGroupName').optional().end();
                                this.validator.check('masterMobile').optional().end();
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();
                                var deviceType = this.p('deviceType');
                                var vehicleNumber=this.p('vehicleNumber');
                                var deviceGroupName=this.p('deviceGroupName');
                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var groupId = this.session.USER.groupId;

                                        var masterMobile = this.parameter.param('masterMobile');
                                        var builder = me.bookshelf.knex('motor_device')
                                                .leftJoin('device_config', 'motor_device.id', 'device_config.deviceId')
                                                .leftJoin('device_state', 'motor_device.id', 'device_state.deviceId')
                                                .leftJoin('device_group_relation', 'motor_device.id', 'device_group_relation.deviceId')
                                                .leftJoin('device_group', 'device_group.id', 'device_group_relation.deviceGroupId')

                                        builder.andWhere('motor_device.groupId', groupId);

                                        if (vehicleNumber) {
                                                builder.andWhere('device_config.vehicleNumber', 'like', `%${vehicleNumber}%`);
                                        }
                                        if (deviceGroupName) {
                                                builder.andWhere('device_group.name', deviceGroupName);
                                        }
                                        if (masterMobile) {
                                                builder.andWhere('device_config.masterMobile', masterMobile);
                                        }
                                        if (deviceType) {
                                                builder.andWhere('motor_device.deviceType', deviceType);
                                        }
                                        var ret = yield me.util.countAndQuery(builder, page, rpp, null,
                                                        'motor_device.id as deviceId', 'motor_device.imei','motor_device.deviceType', 'motor_device.phone',
                                                        'device_config.masterMobile',
                                                        'device_config.smsDevice','device_config.smsCenter','device_config.simExpire', 'device_config.serviceExpire',
                                                        'device_config.vehicleNumber', 'device_state.state as onlineState',
                                                        'device_group.id as deviceGroupId','device_group.name as deviceGroupName'
                                                        );
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                /**
                 * @api {post} /api/device/simCharge/:deviceId sim卡充值
                 * @apiName simCharge
                 * @apiGroup Device
                 *
                 * @apiParam {Number} deviceId * 设备ID
                 * @apiParam {Number} money * 充值金额，单位：元
                 * @apiParam {String} simExpire * 充值后套餐到期日期，yyyy-MM-dd
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */

                simCharge() {
                        var me = this;
                        return function * () {
                                // this.validator.check('deviceId').necessary().end();
                                this.validator.check('money').necessary().isInt().min(0).end();
                                this.validator.check('simExpire').necessary().date().end();

                                var deviceId = this.params.deviceId;
                                if (!deviceId) {
                                        return ActionResult.createValidateFailResult('必须传递deviceId');
                                }

                                var userGroup = this.session.USER.groupId;
                                var ret = yield me.bookshelf.knex('motor_device').where({
                                        id: deviceId,
                                        groupId: userGroup
                                }).select();
                                if (ret.length === 0) {
                                        return ActionResult.createValidateFailResult('设备不属于当前登录的集团用户');
                                }

                                if (this.validator.isValid()) {
                                        var tran = yield me.bookshelf.knex.transaction();
                                        try {
                                                var ret = yield me.bookshelf.knex('motor_device')
                                                        .where({
                                                                id: this.p('deviceId')
                                                        })
                                                        .select('*');
                                                if (ret.length == 0) {
                                                        logger.error(ret);
                                                        tran.rollback();
                                                        return ActionResult.createErrorResult('设备不存在');
                                                }
                                        }
                                        catch (err) {
                                                tran.rollback();                                              //exception caused??
                                                throw err;
                                        }
                                }
                        };
                }


                /**
                 * @api {get} /api/device/config/read/:deviceId 读取设备配置信息
                 * @apiName readDeviceConfig
                 * @apiGroup Device
                 *
                 * @apiParam {Number} deviceId 设备ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                readConfig() {
                        var me = this;
                        return function * () {
                                var deviceId = parseInt(this.params.deviceId);
                                if (isNaN(deviceId) || deviceId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }

                                var userGroup = this.session.USER.groupId;
                                var ret = yield me.bookshelf.knex('motor_device').where({
                                        id: deviceId,
                                        groupId: userGroup
                                }).select();
                                if (ret.length === 0) {
                                        return ActionResult.createValidateFailResult('设备不属于当前登录的集团用户');
                                }

                                var ret = yield me.bookshelf.knex('device_config')
                                        .where('deviceId', deviceId)
                                if (ret.length == 0) {
                                        return ActionResult.createErrorResult('设备配置信息不存在');
                                }
                                return ActionResult.createSuccessResult(ret[0]);
                        };
                }

                /**
                 * @api {post} /api/device/config/update/:deviceId 更新设备配置信息
                 * @apiName updateDeviceConfig
                 * @apiGroup Device
                 *
                 * @apiParam {Number} deviceId 设备ID *
                 * @apiParam {Number} redirectConnector 是否转向$host:$port，０否１是
                 * @apiParam {String} host connector主机IP地址
                 * @apiParam {Number} port connector服务端口
                 * @apiParam {Number} micSensitivity micphone灵敏度
                 * @apiParam {String} reportGPS 是否上报GPS状态，0：保留；1：轨迹上报；2：轨迹不上报；3：轨迹上报，但设置位置隐藏标志；
                 * @apiParam {String} workMode 工作模式，0：保留；1：省电工作模式；2：正常工作模式
                 * @apiParam {Number} reportIntervalM 运动时上报间隔，单位：秒
                 * @apiParam {Number} reportIntervalS 静止时上报间隔，单位：秒
                 * @apiParam {String} alarmProcessCenter 报警时中心处理方式
                 * @apiParam {String} alarmProcessDevice  0：表示电话+短信；1：表示纯短信；2：表示纯电话；3：不报警；默认3
                 * @apiParam {Number} phoneCallCenter 中心每月最大拔出电话数
                 * @apiParam {Number} phoneCallDevice 设备每月最大拔出电话数
                 * @apiParam {Number} smsCenter 中心每月最大发出短信数
                 * @apiParam {Number} smsDevice 设备每月最大发出短信数
                 * @apiParam {String} g2ReportTime CBB-100G2设备专用参数，每天上报时间点，格式：HH24:MI,HH24:MI,HH24:MI
                 * @apiParam {String} g2KeepOnline CBB-100G2设备专用参数，保持设备在线直至此时刻，格式：yyyy-MM-dd HH:mm:ss
                 * @apiParam {String} vehicleNumber 车牌号
                 * @apiParam {String} masterMobile 车主手机号
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                updateConfig() {
                        var me = this;
                        return function * () {
                                var deviceId = parseInt(this.params.deviceId);
                                if (isNaN(deviceId) || deviceId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }
                                this.validator.check('redirectConnector').optional().enum(['0', '1']).end();
                                this.validator.check('host').optional().rangeLength(0, 15).end();
                                this.validator.check('port').optional().isInt().end();
                                this.validator.check('micSensitivity').optional().isInt().max(9999).end();
                                this.validator.check('reportGPS').optional().enum(['0', '1', '2', '3']).end();
                                this.validator.check('workMode').optional().enum(['0', '1', '2']).end();
                                this.validator.check('reportIntervalM').optional().isInt().end();
                                this.validator.check('reportIntervalS').optional().isInt().end();
                                this.validator.check('alarmProcessCenter').rangeLength(0, 3).end();
                                this.validator.check('alarmProcessDevice').enum(['0', '1', '2', '3']).end();
                                this.validator.check('phoneCallCenter').isInt().max(9999).end();
                                this.validator.check('phoneCallDevice').isInt().max(9999).end();
                                this.validator.check('smsCenter').isInt().max(9999).end();
                                this.validator.check('smsDevice').isInt().max(9999).end();
                                this.validator.check('g2ReportTime').optional().end();
                                this.validator.check('g2KeepOnline').optional().datetime().end();
                                this.validator.check('vehicleNumber').optional().rangeLength(0, 10).end();
                                this.validator.check('masterMobile').optional().match(me.util.getRegExps().mobile).end();
                                var g2KeepOnline = this.p('g2KeepOnline') != null ? this.parameter.datetimeParam('g2KeepOnline').getTime() : null;
                                if (this.validator.isValid()) {
                                        var userGroup = this.session.USER.groupId;
                                        var ret = yield me.bookshelf.knex('motor_device').where({
                                                id: deviceId,
                                                groupId: userGroup
                                        }).select();
                                        if (ret.length === 0) {
                                                return ActionResult.createValidateFailResult('设备不属于当前登录的集团用户');
                                        }
                                        var obj =
                                        {
                                                deviceId: deviceId,
                                                redirectConnector: this.p('redirectConnector'),
                                                host: this.p('host'),
                                                port: this.p('port'),
                                                micSensitivity: this.p('micSensitivity'),
                                                reportGPS: this.p('reportGPS'),
                                                workMode: this.p('workMode'),
                                                reportIntervalM: this.p('reportIntervalM'),
                                                reportIntervalS: this.p('reportIntervalS'),
                                                alarmProcessCenter: this.p('alarmProcessCenter'),

                                                alarmProcessDevice: this.p('alarmProcessDevice'),
                                                phoneCallCenter: this.p('phoneCallCenter'),
                                                phoneCallDevice: this.p('phoneCallDevice'),
                                                smsCenter: this.p('smsCenter'),
                                                smsDevice: this.p('smsDevice'),
                                                g2ReportTime: this.p('g2ReportTime'),
                                                g2KeepOnline: g2KeepOnline,
                                                vehicleNumber: this.p('vehicleNumber'),
                                                masterMobile: this.p('masterMobile')
                                        }
                                        for (var attr in obj) {
                                                if (!obj[attr]) delete obj[attr];
                                        }
                                        yield me.bookshelf.knex('device_config')
                                                .where('deviceId', deviceId)
                                                .update(obj);
                                        return ActionResult.createSuccessResult({});
                                };

                        }
                }




                /**
                 * @api {post} /api/device/config/g2ReportTime/:deviceId g2设备定时上报
                 * @apiName g2ReportTime
                 * @apiGroup Device
                 *
                 * @apiParam {Number} deviceId 设备ID *
                 * @apiParam {String} g2ReportTime CBB-100G2设备专用参数，每天上报时间点，格式：HH24:MI,HH24:MI,HH24:MI *
                 * @apiParam {String} g2KeepOnline CBB-100G2设备专用参数，持续时间 单位分钟
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                g2ReportTime() {
                        var me = this;
                        return function * () {
                                var deviceId = parseInt(this.params.deviceId);
                                if (isNaN(deviceId) || deviceId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }
                                this.validator.check('g2ReportTime').necessary().end();
                                if (this.validator.isValid()) {
                                        var userGroup = this.session.USER.groupId;
                                        var ret = yield me.bookshelf.knex('motor_device').where({
                                                id: deviceId,
                                                groupId: userGroup
                                        }).select();
                                        if (ret.length === 0) {
                                                return ActionResult.createValidateFailResult('设备不属于当前登录的集团用户');
                                        }

                                         ret=yield me.bookshelf.knex('device_config')
                                        .where('deviceId',deviceId)

                                        var obj =
                                        {
                                                deviceId: deviceId,
                                                g2ReportTime: this.p('g2ReportTime'),
                                                g2KeepOnline:this.p('g2KeepOnline')
                                        }

                                        for (var attr in obj) {
                                                if (!obj[attr]) delete obj[attr];
                                        }

                                        if(ret.length==0)
                                        {
                                                obj.g2KeepOnline=10
                                                ret=yield me.bookshelf.knex('device_config')
                                                .insert(
                                                        obj
                                                )
                                        }
                                        else
                                        {
                                                yield me.bookshelf.knex('device_config')
                                                        .where('deviceId', deviceId)
                                                        .update(obj);
                                        }
                                        return ActionResult.createSuccessResult({});
                                };

                        }
                }


                /**
                 * @api {get} /api/device/snapshot/:imei 读取设备实时信息
                 * @apiName queryDeviceSnapshot
                 * @apiGroup Device
                 *
                 * @apiParam {String} imei 设备IMEI号
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                snapshot() {
                        var me = this;
                        return function * () {
                                var imei = this.params.imei;
                                if (imei.length != me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('非法的imei');
                                }
                                var ret = yield me.cache.get("SD-" + imei);
                                if (ret == null) {
                                        return ActionResult.createErrorResult('未找到实时数据');
                                }
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                /**
                 * @api {get} /api/device/track/:imei 读取设备轨迹数据
                 * @apiName queryDeviceTrack
                 * @apiGroup Device
                 *
                 * @apiParam {String} imei 设备IMEI号
                 * @apiParam {String} beginTime 轨迹开始时间，yyyy-MM-dd HH:mm:ss
                 * @apiParam {String} endTime 轨迹结束时间，yyyy-MM-dd HH:mm:ss
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                track() {
                        var me = this;
                        return function * () {
                                var userGroup = this.session.USER.groupId;
                                var imei = this.p('imei');
                                var nowTime = new Date().getTime();
                                if (!imei || imei.length !== me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                }

                                this.validator.check('beginTime').necessary().datetime().end();
                                this.validator.check('endTime').optional().datetime().end();
                                if (this.validator.isValid()) {
                                var condition = {
                                        '$gte' : this.parameter.datetimeParam('beginTime').getTime()
                                };
                                if(this.parameter.hasParam('endTime')) {
                                        condition['$lt'] = this.parameter.datetimeParam('endTime').getTime();
                                        if(condition['$lt'] > nowTime) {
                                                condition['$lt'] = nowTime;
                                        }
                                }
                                else {
                                        condition['$lt'] = nowTime;
                                }

                                if(condition['$lt'] < condition['$gte']) {
                                        return ActionResult.createValidateFailResult('错误的查询条件:起止时间');
                                }
                                //只能查询一周范围
                                if(condition['$lt'] - condition['$gte'] > 86400000 * 7) {
                                        return ActionResult.createValidateFailResult('查询条件时间跨度太大,最多7天');
                                }

                                        var ret = yield me.bookshelf.knex('motor_device').where({
                                                imei: imei,
                                                groupId: userGroup
                                        }).select();
                                        if (ret.length === 0) {
                                                return ActionResult.createValidateFailResult('设备[' + imei + ']不属于当前登录的集团用户');
                                        }
                                        if(this.parameter.hasParam('endTime')) {
                                                ret = yield me.cache.get('TRACK-DC-' + imei + '-' + condition['$gte'] + '-' + condition['$lt']);
                                                if (ret) {
                                                        return ActionResult.createSuccessResult(ret);
                                                }
                                        }

                                        var mongodbOpts = BeanFactory.get('mongodbOpts').opts;
                                        logger.error('正在连接mongodb -> ' + MONGODB_URL);
                                        var db = yield fnConnect.call(null, MONGODB_URL, mongodbOpts);
                                        if(!db) {
                                                logger.error('连接mongodb失败 -> ' + MONGODB_URL);
                                                return ActionResult.createErrorResult('GPS轨迹数据查询失败');
                                        }
                                        try {
                                                var collection = db.collection(COLLECTION_DATA);
                                                var pointsDataCursor = collection.find({
                                                        IMEI: imei,
                                                        dt: condition
                                                });
                                                var fnToArray = thunkify(pointsDataCursor.toArray);
                                                var data = yield fnToArray.call(pointsDataCursor);
                                                if(this.parameter.hasParam('endTime')) {
                                                        yield me.cache.set('TRACK-DC-' + imei + '-' + condition['$gte'] + '-' + condition['$lt'], data, 600);                //缓存10分钟
                                                }
                                                return ActionResult.createSuccessResult(data);
                                        }catch(err) {
                                                logger.error(err);
                                        }
                                        finally {
                                                try {
                                                        db.close();
                                                }catch(err) {}
                                        }
                                }
                        };
                }

                /**
                 * @api {get} /api/device/alarm 查询设备报警记录
                 * @apiName queryDeviceAlarm
                 * @apiGroup Device
                 *
                 * @apiParam {Number} imei 设备IMEI号
                 * @apiParam {String} vehicleNumber 车牌号,like
                 * @apiParam {String} alarm 告警编码,1-7依次为：非法位移报警(1)、断电报警(2)、震动报警(3)、超速报警(4)、开门报警(5)、进入电子围栏区域报警(6)、离开电子围栏区域报警(7)
                 * @apiParam {String} alarmType 报警类型 0解除报警,1报警
                 * @apiParam {String} beginTime 报警开始时间，yyyy-MM-dd HH:mm:ss
                 * @apiParam {String} endTime 报警结束时间，yyyy-MM-dd HH:mm:ss
                 * @apiParam {Number} page 页号，默认1
                 * @apiParam {Number} rpp 每页记录数，系统默认值
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                alarm() {
                        var me = this;
                        return function * () {
                                var groupId=this.session.USER.groupId;
                                this.validator.check('alarm').optional().enum([ '1', '2','3','4','5','6','7']).end();
                                this.validator.check('alarmType').optional().enum([ '1', '0']).end();
                                this.validator.check('beginTime').optional().datetime().end();
                                this.validator.check('endTime').optional().datetime().end();
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();

                                if (this.validator.isValid()) {
                                        var imei=this.p('imei');
                                        var vehicleNumber=this.p('vehicleNumber');
                                        var alarm=this.p('alarm');
                                        var alarmType=this.p('alarmType');
                                        if(imei)
                                        {
                                                if ( imei.length !== me.util.constants.IMEI_LENGTH) {
                                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                                }
                                                var ret = yield me.bookshelf.knex('motor_device').where({
                                                        imei: imei,
                                                        groupId:groupId
                                                }).select();
                                                if (ret.length === 0) {
                                                        return ActionResult.createValidateFailResult('设备[' + imei + ']不属于用户当前集团');
                                                }
                                        }

                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var beginTime = this.p('beginTime') != null ? this.parameter.datetimeParam('beginTime').getTime() : null;
                                        var endTime = this.p('endTime') != null ? this.parameter.datetimeParam('endTime').getTime() : null;

                                        var builder = me.bookshelf.knex('device_alarm')
                                                .innerJoin('motor_device', 'motor_device.id','device_alarm.deviceId')
                                                .leftJoin('device_config', 'motor_device.id','device_config.deviceId')
                                                 .where('motor_device.groupId',groupId)


                                        if(imei)
                                        {
                                                builder.andWhere('motor_device.imei', imei);
                                        }
                                        if(vehicleNumber)
                                        {
                                                builder.andWhere('device_config.vehicleNumber', 'like', `%${vehicleNumber}%`);
                                        }
                                        if(alarm)
                                        {
                                                builder.andWhere('device_alarm.alarm',alarm);
                                        }
                                        if(alarmType)
                                        {
                                                builder.andWhere('device_alarm.alarmType',alarmType);
                                        }
                                        if (beginTime) {
                                                builder.andWhere('device_alarm.deviceTime', '>=', beginTime);
                                        }
                                        if (endTime) {
                                                builder.andWhere('device_alarm.deviceTime', '<', endTime);
                                        }
                                        ret = yield me.util.countAndQuery(builder, page, rpp, null, 'device_alarm.*',
                                                'motor_device.imei', 'motor_device.deviceType', 'motor_device.phone', 'device_config.masterMobile',
                                                'device_config.vehicleNumber');
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                /**
                 * @api {post} /api/device/control/:imei 下发控制指令
                 * @apiName deviceControl
                 * @apiGroup Device
                 *
                 * @apiParam {Number} imei 设备imei
                 * @apiParam {String} cmd 控制指令
                 *                                      '0': '撤销断油断电',
                                                         '1': '执行断油断电',
                                                         '2': '撤防；（电动车用）',
                                                         '3': '设防；（电动车用）',
                                                         '5': '静音；（电动车用）',
                                                         '7': '免钥匙启动；（电动车用）',
                                                         '9': '寻车；（电动车用）',
                                                         '10': '电击模式；（宠物用）',
                                                         '11': '马达震动模式；（宠物用）',
                                                         '12': '蜂鸣器模式；（宠物用）',
                                                         '13': 'led闪烁模式；（宠物用）',
                                                         '14': '汽车远程启动；（德贝兴）',
                                                         '15': '汽车远程熄火；（德贝兴）',
                                                         '16': '汽车远程锁车；（德贝兴）',
                                                         '17': '汽车远程开锁；（德贝兴）',
                                                         '18': '汽车远程寻车；（德贝兴）',
                                                         '19': '监听；（儿童机）'
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                control() {
                        var me = this;
                        return function * () {
                                var groupId=this.session.USER.groupId;
                                var imei = this.params.imei;
                                if (imei.length != me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('非法的imei');
                                }
                                this.validator.check('cmd').necessary().isInt().end();
                                if (this.validator.isValid()) {
                                        try {
                                                var ret = yield me.bookshelf.knex('motor_device').where({
                                                        imei: imei,
                                                        groupId:groupId
                                                }).select();
                                                if (ret.length === 0) {
                                                        return ActionResult.createValidateFailResult('设备[' + imei + ']不属于当前集团');
                                                }
                                                var snapshot = yield me.cache.get('SD-' + imei);
                                                if (!snapshot) {
                                                        return ActionResult.createErrorResult('设备未在平台登录');
                                                }
                                                var deviceControlServiceURL = snapshot['rcBaseURL'];
                                                var url = deviceControlServiceURL + '?IMEI=' + imei + '&cmd=' + this.p('cmd');
                                                EasyNode.DEBUG && logger.debug(`call deviceControl service URL -> ` + url);
                                                var ret = yield HTTPUtil.getJSON(url, timeout, deviceControlMethod);
                                                EasyNode.DEBUG && logger.debug(`received from deviceControl service : ` + JSON.stringify(ret));
                                                return ret;
                                        } catch (e) {
                                                return ActionResult.createErrorResult('终端控制服务连接失败:' + deviceControlServiceURL);
                                        }

                                }
                        };
                }


                /**
                 * @api {get} /api/device/count 设备统计(在线状态)
                 * @apiName deviceCount
                 * @apiGroup Device
                 *
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                count() {
                        var me = this;
                        return function * () {
                                var groupId=this.session.USER.groupId;
                                if (this.validator.isValid()) {
                                                var ret = yield me.bookshelf.knex('motor_device')
                                                        .leftJoin('device_state', 'motor_device.id', 'device_state.deviceId')
                                                        .where('groupId',groupId)
                                                        .count('id as count')

                                        var total=ret[0].count||0;

                                        ret = yield me.bookshelf.knex('motor_device')
                                                .leftJoin('device_state', 'motor_device.id', 'device_state.deviceId')
                                                .where('groupId',groupId)
                                                .where('device_state.state','1')
                                                .count('id as count')
                                        var online=ret[0].count||0;

                                        var offline=total-online;

                                        return ActionResult.createSuccessResult(
                                                {
                                                        total:total,
                                                        online:online,
                                                        offline:offline
                                                }
                                        );
                                }
                        };
                }



                /**
                 * @api {get} /api/device/queryDeviceWithOutGroup 查询未分组设备列表
                 * @apiName queryDeviceWithOutGroup
                 * @apiGroup Device
                 *
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                queryDeviceWithOutGroup() {
                        var me = this;
                        return function * () {
                                var groupId=this.session.USER.groupId;
                                if (this.validator.isValid()) {
                                        var ret = yield me.bookshelf.knex('motor_device')
                                                .where('groupId',groupId)
                                                .select('id','imei','deviceName');

                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }


                /**
                 * @api {get} /api/device/deviceTypes 查询设备类型列表清单
                 * @apiName queryDeviceTypes
                 * @apiGroup Device
                 *
                 * @apiParam {String} name 设备类型名称, like
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                queryDeviceTypes() {
                        var me = this;
                        return function * () {
                                this.validator.check('name').optional().end();
                                var groupId=this.session.USER.groupId;
                                if (this.validator.isValid()) {
                                        var name = this.parameter.param('name');
                                        var builder = me.bookshelf.knex('motor_device')
                                                .where('groupId',groupId)
                                        if (name) {
                                                builder.andWhere('motor_device.deviceType', 'like', `%${name}%`);
                                        }
                                        var ret = yield builder.distinct('deviceType').select();
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }


                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = DeviceController;
})();