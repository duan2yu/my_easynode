var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var BeanFactory = using('easynode.framework.BeanFactory');
var thunkify = require('thunkify');
var _ = require('underscore');

(function () {
        const ACCOUNT = EasyNode.config('api.account', 'zlbbq');
        const CONTROL_TIMEOUT = parseInt(EasyNode.config('http.server.services.control.timeout', '5000'));
        const PWD = EasyNode.config('api.pwd', 'zlbbq99');
        const SNAPSHOT_PREFIX = EasyNode.config('device.snapshot.key.prefix', 'SD-');
        const CMD_NAMES = {
                '0': '撤销断油断电',
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
        };
        var CMD_DESC = '';
        for (var key in CMD_NAMES) {
                CMD_DESC += (key + ':' + CMD_NAMES[key]) + ';';
        }
        const MODEL_CMDS = {
                'CBB-100': [],
                'CBB-100F': [],
                'CBB-100D': [],
                'CBB-100G': [],
                'CBB-100G1': [],
                'CBB-100G2': [],
                'CBB-100G4': [],
                'CBB-100H': [],
                'Q007': [],
                'CBB-100M': [],
                'F205': [],
                'Q7244': [],
                'UNKNOWN': []
        };
        /**
         * Class CBB100Controller
         *
         * @class #NAMESPACE#.CBB100Controller
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Controller extends GenericObject {
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
                        this.cache = null;
                        this.bookshelf = null;
                }

                /**
                 * @api {post} /onlineDevices 在线设备列表
                 * @apiName OnlineDevices
                 * @apiGroup CBB100Controller
                 *
                 * @apiParam {String} account *  账号
                 * @apiParam {String} pwd * 密码
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result 在线设备列表
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */

                onlineDevices() {
                        var me = this;
                        return function * () {
                                if (this.validator.isValid()) {
                                        var tcpServer = BeanFactory.get('cbb100TCPServer');
                                        var clients = tcpServer.getClients();
                                        var clientIMEIs = [];
                                        for (var i = 0; i < clients.length; i++) {
                                                clientIMEIs.push(clients[i].IMEI || clients[i].getId());
                                        }
                                        return ActionResult.createSuccessResult(clientIMEIs).setMsg('共[' + clients.length + ']台设备连接到Connector -> ' + (EasyNode.config('connector.id', '000')));
                                }
                        };
                }

                /**
                 * @api {get/post} /remoteControl 远程控制
                 * @apiName RemoteControl
                 * @apiGroup CBB100Controller
                 *
                 * @apiParam {String} IMEI 设备IMEI号,必须为15位数字
                 * @apiParam {Number} cmd 控制命令
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
                 * @apiSuccess {Object} result 远程控制结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                remoteControl() {
                        var me = this;
                        return function * () {
                                this.validator.check('IMEI').necessary().match(/^\d{15}$/).end();
                                this.validator.check('cmd').necessary().isInt().range(0, 19, '错误的控制命令 - ' + CMD_DESC).end();
                                if (this.validator.isValid()) {
                                        var tcpServer = BeanFactory.get('cbb100TCPServer');
                                        var client = tcpServer.getClientByAlias(this.p('IMEI'));
                                        if (!client) {
                                                return ActionResult.createErrorResult('设备没有连接到此Connector进程');
                                        }
                                        var modelCmds = MODEL_CMDS[client.getDeviceData('deviceModel', 'UNKNOWN').toUpperCase()];
                                        var cmd = parseInt(this.p('cmd'));
                                        if (!_.contains(modelCmds, cmd)) {
                                                return ActionResult.createErrorResult('此设备不支持远程控制命令[' + cmd + '](' + CMD_NAMES['' + cmd] + ')');
                                        }
                                        var ret = {};
                                        var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
                                        var msg = CBB100Message.createMessageById(0x820E).notation(client);
                                        msg['controlType'] = cmd;
                                        msg['modeLevel'] = 1;                             //模式级别，1 - 100??
                                        client.getSocket().encodeAndSend(msg, client);
                                        var fnOnce = thunkify(client.once);
                                        var ackMsg = null;
                                        setTimeout(function () {
                                                if (ackMsg == null) {
                                                        client.trigger('msg-handle-able-0x020E', null, 'TIMEOUT');                      //超时响应
                                                }
                                        }, CONTROL_TIMEOUT);
                                        ackMsg = yield fnOnce.call(client, 'msg-handle-able-0x020E');
                                        if (ackMsg == 'TIMEOUT') {
                                                ret.code = 4;
                                                ret.msg = '指令执行超时';
                                        }
                                        else {
                                                //logger.error(JSON.stringify(ackMsg));
                                                ret.code = ackMsg['controlResult'];
                                                ret.msg = '指令执行完成(0：成功/确认；1：失败；2：消息有误；3：不支持)';
                                        }
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                /**
                 * @api {get/post} /config 远程配置
                 * @apiName Config
                 * @apiGroup CBB100Controller
                 *
                 * @apiParam {String} IMEI  * 设备IMEI号,必须为15位数字
                 * @apiParam {String} clearSMSHistory 是否清除短信发送记录，０否１是
                 * @apiParam {String} clearPhoneCallHistory 是否清除拨打电话记录，０否１是
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result 下发配置结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                config() {
                        var me = this;
                        return function * () {
                                this.validator.check('IMEI').necessary().match(/^\d{15}$/).end();

                                if (this.validator.isValid()) {
                                        var tcpServer = BeanFactory.get('cbb100TCPServer');
                                        var client = tcpServer.getClientByAlias(this.p('IMEI'));
                                        if (!client) {
                                                return ActionResult.createErrorResult('设备没有连接到此Connector进程');
                                        }

                                        var config = yield me.bookshelf.knex('motor_device')
                                                .leftJoin('device_config', 'motor_device.id', 'device_config.deviceId')
                                                .where('motor_device.imei', this.p('IMEI'))
                                                .select('device_config.*');
                                        //默认配置
                                        var deviceConfig = config.length > 0 ? config[0] : {};

                                        var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
                                        var deviceModel = client.getDeviceData('deviceModel', 'UNKNOWN').toUpperCase();
                                        var msg = CBB100Message.createMessageById(0x820A).notation(client);
                                        msg['workModeMask'] = 1;
                                        msg['reportGPSMask'] = 1;
                                        msg['alarmMobileMask'] = 1;
                                        msg['alarmSpeedyMask'] = 1;
                                        if(this.p('clearSMSHistory') === '1' || this.p('clearPhoneCallHistory') === '1') {
                                                msg['clearHistoryMask'] = 1;
                                        }
                                        else {
                                                msg['clearHistoryMask'] = 0;                    //不清除短信和电话历史
                                        }
                                        msg['alarmTypeMask'] = 1;
                                        var defaultWorkMode = 2;             //默认正常工作模式
                                        if (/^CBB\-100G\d?$/.test(deviceModel)) {
                                                defaultWorkMode = 1;            //CBB-100G默认省电模式
                                        }
                                        msg['workMode'] = deviceConfig.workMode || defaultWorkMode;
                                        msg['reportGPS'] = deviceConfig.reportGPS || 1;                 //默认正常上报GPS
                                        msg['alarmMobile'] = deviceConfig.masterMobile || '';
                                        msg['speedLimit'] = deviceConfig.speedLimit || 0;
                                        msg['speedyDuration'] = deviceConfig.speedyDuration || 0;
                                        if(this.p('clearSMSHistory') === '1') {
                                                msg['clearSMSHistory'] = 1;
                                        }
                                        else {
                                                msg['clearSMSHistory'] = 0;
                                        }

                                        if(this.p('clearPhoneCallHistory') === '1') {
                                                msg['clearPhoneCallHistory'] = 1;
                                        }
                                        else {
                                                msg['clearPhoneCallHistory'] = 0;
                                        }

                                        if (deviceConfig.alarmProcessFrom === '1') {
                                                msg['alarmType'] = parseInt(deviceConfig.alarmProcessDevice || '3');   //默认电话＋短信
                                        }
                                        else {
                                                msg['alarmType'] = 3;
                                        }
                                        var ret = null;
                                        client.getSocket().encodeAndSend(msg, client);
                                        var fnOnce = thunkify(client.once);
                                        var ackMsg = null;
                                        setTimeout(function () {
                                                if (ackMsg == null) {
                                                        client.trigger('msg-handle-able-0x020A', null, 'TIMEOUT');                      //超时响应
                                                }
                                        }, CONTROL_TIMEOUT);
                                        ackMsg = yield fnOnce.call(client, 'msg-handle-able-0x020A');
                                        if (ackMsg == 'TIMEOUT') {
                                                ret = ActionResult.createErrorResult('下发配置时设备响应超时');
                                        }
                                        else {
                                                ret = ActionResult.createSuccessResult('下发配置成功');
                                        }
                                        return ret;
                                }
                        };
                }

                /**
                 * @api {get/post} /deviceState 设备状态查询
                 * @apiName DeviceState
                 * @apiGroup CBB100Controller
                 *
                 * @apiParam {String} IMEI 设备IMEI号,必须为15位数字
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result 设备状态数据
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                deviceState() {
                        var me = this;
                        return function * () {
                                this.validator.check('IMEI').necessary().match(/^\d{15}$/).end();
                                if (this.validator.isValid()) {
                                        var ret = yield me.cache.get(SNAPSHOT_PREFIX + this.p('IMEI'));
                                        if (ret == null) {
                                                ret = '无设备状态数据';
                                        }
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                /**
                 * @api {get/post} /deviceLogin 设备登录
                 * @apiName DeviceLogin
                 * @apiGroup CBB100Controller
                 *
                 * @apiParam {String} IMEI 设备IMEI号,必须为15位数字
                 * @apiParam {Number} time 登录时间
                 * @apiParam {String} modal 设备型号
                 * @apiParam {String} sw 固件版本
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result 设备配置
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                deviceLogin() {
                        var me = this;
                        return function * () {
                                this.validator.check('IMEI').necessary().match(/^\d{15}$/).end();
                                if (this.validator.isValid()) {
                                        var ret = yield me.bookshelf.knex('motor_device')
                                                .leftJoin('device_config', 'motor_device.id', 'device_config.deviceId')
                                                .where(
                                                {
                                                        'motor_device.imei': this.parameter.param('IMEI'),
                                                        'motor_device.activate': 1
                                                })
                                                .select();
                                        var response = {};
                                        response.loginACK = 0;
                                        var fullDeviceInfo = null;
                                        /*
                                         0：表示中心没有该设备或设备未启用；
                                         1：表示成功；
                                         2：表示服务费到期；
                                         3：SIM卡费用到期；（车台如果看到非1的结果，登录的时间间隔应该修改为10分钟1次）
                                         */
                                        var now = new Date().getTime();
                                        if (ret.length === 1) {
                                                fullDeviceInfo = ret[0];
                                                //SIM卡到期时间/服务到期时间为0时，表示不过期
                                                if (now > fullDeviceInfo.serviceExpire ? fullDeviceInfo.serviceExpire : Infinity) {
                                                        response.loginACK = 2;
                                                }
                                                else if (now > fullDeviceInfo.simExpire ? fullDeviceInfo.simExpire : Infinity) {
                                                        response.loginACK = 3;
                                                }
                                                else {
                                                        response.loginACK = 1;
                                                }
                                        }

                                        if (response.loginACK === 1) {
                                                response.redirectConnector = fullDeviceInfo.redirectConnector;          //'0'不迁connector，'1'迁connector
                                                if (response.redirectConnector === '1') {
                                                        response.host = fullDeviceInfo.host;
                                                        response.port = fullDeviceInfo.port;
                                                }
                                                if (fullDeviceInfo.serviceExpire) {
                                                        response.serviceExpired = new Date(fullDeviceInfo.serviceExpire);
                                                }
                                                if (fullDeviceInfo.simExpire) {
                                                        response.simExpired = new Date(fullDeviceInfo.simExpire);
                                                }
                                                response.micSensibility = fullDeviceInfo.micSensitivity;
                                                response.alarmType = fullDeviceInfo.alarmProcessDevice; //报警时，设备处理方式，0：表示电话+短信；1：表示纯短信；2：表示纯电话；3：不报警；默认3
                                                if (response.alarmType === '0' || response.alarmType === '1') {
                                                        response.maxSMS = fullDeviceInfo.smsDevice;
                                                }
                                                if (response.alarmType === '0' || response.alarmType === '2') {
                                                        response.maxPhoneCall = fullDeviceInfo.phoneCallDevice;
                                                }
                                                response.reportIntervalM = fullDeviceInfo.reportIntervalM;
                                                response.reportIntervalS = fullDeviceInfo.reportIntervalS;
                                                if (fullDeviceInfo.deviceType.match(/^CBB-100G\d*$/)) {
                                                        response.workMode = fullDeviceInfo.workMode;
                                                }
                                                response.reportGPS = fullDeviceInfo.reportGPS;
                                                if (fullDeviceInfo.deviceType == 'CBB-100G2') {
                                                        if (!fullDeviceInfo.g2ReportTime) {
                                                                //没配置就１小时上报一次
                                                                fullDeviceInfo.g2ReportTime = '00:00,01:00,02:00,03:00,04:00,05:00,06:00,07:00,08:00,09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00,18:00,19:00,20:00,21:00,22:00,23:00';
                                                        }
                                                        var reportTimes = fullDeviceInfo.g2ReportTime.split(',');
                                                        var today = now - now % 86400000;
                                                        var nextReportTime = 0;
                                                        for (var i = 0; i < reportTimes.length; i++) {
                                                                var [hour,minute] = reportTimes[i].split(':');
                                                                hour = parseInt(hour);
                                                                minute = parseInt(minute);
                                                                var tempT = today + (hour - 8) * 3600000 + minute * 60000;                      //配置的是北京时间，所以-8小时
                                                                if (tempT > now) {
                                                                        nextReportTime = tempT;
                                                                        break;
                                                                }
                                                        }
                                                        //当天最后一次上报，计算次日第一次上报间隔
                                                        if (nextReportTime === 0) {
                                                                var [hour,minute] = reportTimes[0].split(':');
                                                                hour = parseInt(hour);
                                                                minute = parseInt(minute);
                                                                var tempT = today + 86400000 + (hour - 8) * 3600000 + minute * 60000;  //配置的是北京时间，所以-8小时
                                                                nextReportTime = tempT;
                                                        }
                                                        response.g2SleepMinutes = parseInt((nextReportTime - now) / 60000);                            //计算下次上报时间
                                                        if (fullDeviceInfo.g2KeepOnline > now) {
                                                                //ms to seconds
                                                                response.g2KeepAliveMinutes = parseInt((fullDeviceInfo.g2KeepOnline - now) / 60000);                    //计算保持在线时间
                                                        }
                                                        else {
                                                                response.g2KeepAliveMinutes = 0;
                                                        }
                                                }
                                        }
                                        return response;
                                }
                        };
                }

                /**
                 * @api {get} /queryDeviceFence 查询设备的电子围栏配置
                 * @apiName listDeviceElectronicFence
                 * @apiGroup ElectronicFence
                 *
                 * @apiParam {String} IMEI * 设备IMEI号
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                deviceFence() {
                        var me = this;
                        return function * () {
                                this.validator.check('IMEI').necessary().match(/^\d{15}$/).end();
                                if (this.validator.isValid()) {
                                        var imei = this.p('imei');
                                        var ret = yield me.bookshelf.knex('electronic_fence_devices')
                                                .innerJoin('electronic_fence', 'electronic_fence.id', 'electronic_fence_devices.efId')
                                                .innerJoin('motor_device', 'motor_device.id', 'electronic_fence_devices.deviceId')
                                                .leftJoin('device_config', 'device_config.deviceId', 'motor_device.id')
                                                .where({
                                                        'motor_device.imei': imei,
                                                        'device_config.efEnabled' : '1'
                                                }).select('electronic_fence.*');
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Controller;
})();