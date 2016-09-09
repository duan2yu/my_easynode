var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100AbstractHandler = using('szzh.cbb100.protocol.handlers.CBB100AbstractHandler');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
var Binary = using('easynode.framework.util.Binary');
var _ = require('underscore');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var thunkify = require('thunkify');
var CBB100Events = using('szzh.cbb100.CBB100Events');
var BeanFactory = using('easynode.framework.BeanFactory');
var StringUtil = using('easynode.framework.util.StringUtil');

(function () {
        var cachedDevices = {};
        const CACHE_EXPIRED = parseInt(EasyNode.config('service.queryDevice.cache.expired', '3600'));        //缓存1小时
        const CACHE_LOGIN_INFO = StringUtil.switchState(EasyNode.config('service.queryDevice.cache.enabled', 'false'));
        const DO_REDIRECT = StringUtil.switchState(EasyNode.config('device.login.redirect', 'true'));
        var cache = BeanFactory.get('cache');
        /**
         * Class CBB100Handler0x0002
         *
         * @class szzh.cbb100.protocol.handlers.CBB100Handler0x0002
         * @extends szzh.cbb100.protocols.handlers.CBB100AbstractHandler
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Handler0x0002 extends CBB100AbstractHandler {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(client, server) {
                        super(client, server);
                        //调用super()后再定义子类成员。
                }

                //处理消息
                handleMessage(msg) {
                        var me = this;
                        return function * () {
                                var message = CBB100Message.createMessageById(0x0002);
                                var ackMessage = message.ackNotation(msg, me.client);
                                var deviceInfo = yield me.queryDeviceInfo(msg['IMEI'], msg);
                                ackMessage['loginACK'] = deviceInfo.loginACK;
                                if (deviceInfo.loginACK == 1) {
                                        me.client.IMEI = msg['IMEI'];
                                        me.server.setClientAlias(msg['IMEI'], me.client);
                                        me.client.deviceData(msg, '0x0002');
                                        //设备Connector重定向
                                        ackMessage['redirectFlag'] = parseInt(deviceInfo['redirectConnector']);
                                        if(DO_REDIRECT && ackMessage['redirectFlag'] === 1) {
                                                var encoded = CBB100Handler0x0002.encodeIP(deviceInfo.host);
                                                if(encoded) {
                                                        ackMessage['redirectServer'] = encoded;
                                                        ackMessage['redirectPort'] = deviceInfo['port'];
                                                }
                                                else {
                                                        ackMessage['redirectFlag'] = 0;         //IP设置错误时不作重定向，否则设备可能找不到
                                                }
                                        }
                                        ackMessage['serviceExpired'] = Binary.date2Bytes(deviceInfo.serviceExpired || new Date());
                                        ackMessage['simExpired'] = Binary.date2Bytes(deviceInfo.simExpired || new Date());
                                        ackMessage['serverTime'] = Binary.datetime2Bytes();
                                        //ackMessage['userPWD'] = deviceInfo.password;
                                        /*
                                        if(deviceInfo['serviceExpired']) {
                                                ackMessage['serviceExpired'] = Binary.date2Bytes(new Date(deviceInfo['serviceExpired']));
                                        }
                                        if(deviceInfo['simExpired']) {
                                                ackMessage['simExpired'] = Binary.date2Bytes(new Date(deviceInfo['simExpired']));
                                        }
                                        */
                                        //写入设备配置默认值
                                        ackMessage['micSensibility'] = deviceInfo['micSensibility'] || 50;                   //麦克风灵敏度
                                        ackMessage['alarmType'] = deviceInfo['alarmType'] || 3;                            //不使用短信和电话报警
                                        ackMessage['maxSMS'] = deviceInfo['maxSMS'] || 0;                                //不报警
                                        ackMessage['reportIntervalM'] = deviceInfo['reportIntervalM'] || 30;               //移动时报警间隔，默认30秒
                                        ackMessage['reportIntervalS'] = deviceInfo['reportIntervalS'] || 10;                //静止时报警间隔，默认10分钟
                                        ackMessage['gpsTimeOffset'] = 480;                // 北京时间，+8时区，480分钟，？GPS是UTC时间？
                                        ackMessage['workMode'] = deviceInfo['workMode'] || 2;                            //正常工作模式
                                        ackMessage['reportGPS'] = deviceInfo['reportGPS'] || 1;                            //上报轨迹
                                        //CBB-100G2专用参数，其他型号为默认值：0
                                        if(msg['deviceModel'] == 'CBB-100G2') {
                                                ackMessage['g2SleepMinutes'] = deviceInfo['g2SleepMinutes'] || 60;      //默认1小时上报一次
                                                ackMessage['g2KeepAliveMinutes'] = deviceInfo['g2KeepAliveMinutes'] || 0;       //上报完立即断线
                                        }
                                        ackMessage['maxPhoneCall'] = deviceInfo['maxPhoneCall'] || 0;                    //默认不通过设备报警
                                        me.server.trigger(CBB100Events.DEVICE_ONLINE, me.client);
                                        logger.info(`device [${msg['IMEI']}], device type [${msg['deviceModel']}], login successfully`);
                                }
                                else {
                                        logger.info(`device [${msg['IMEI']}], device type [${msg['deviceModel']}], login fail, disconnect from server`);
                                        me.server.disconnect(me.client.getSocketId(), 'LOGIN-FAIL');
                                        return;
                                }
                                return ackMessage;
                        };
                }

                /*
                __queryDeviceInfo(IMEI, loginMsg) {
                        var me = this;
                        return function * () {
                                var o = cachedDevices[IMEI];
                                if (o) {
                                        if (new Date() - o.cachedTime > CACHE_EXPIRED) {
                                                delete cachedDevices[IMEI];
                                        }
                                        else {
                                                return o.cachedData;
                                        }
                                }
                                var timeout = parseInt(EasyNode.config('service.queryDevice.timeout', '2000'));
                                var url = EasyNode.config('service.queryDevice.URL');
                                var method = EasyNode.config('service.queryDevice.httpMethod', 'POST');
                                if (method.toLowerCase() != 'post') {
                                        method = 'GET';
                                }
                                EasyNode.DEBUG && logger.debug(`device login service URL -> ` + url);
                                //var dateRegExp = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/;
                                //var [p, year, month, date, hours, minutes, seconds] = dateRegExp.exec(m['deviceTime']);
                                var loginArgs = {
                                        IMEI: IMEI,
                                        //time : new Date(year, month - 1, date, hours, minutes, seconds).getTime(),
                                        time : new Date().getTime(),
                                        modal : loginMsg['deviceModel'],
                                        sw : loginMsg['softwareVersion']
                                };
                                EasyNode.DEBUG && logger.debug('request device login -> ' + JSON.stringify(loginArgs));
                                var ret = yield HTTPUtil.getJSON(url, timeout, method, loginArgs);
                                EasyNode.DEBUG && logger.debug(`received from queryDevice service : ` + JSON.stringify(ret));
                                cachedDevices[IMEI] = {
                                        cachedTime: new Date(),
                                        cachedData: ret
                                };
                                return ret;
                        };
                }
                */

                static encodeIP(ip) {
                        if(ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                                var parts = ip.split('.');
                                return parseInt(parts[3]) + parseInt(parts[2]) * 255 + parseInt(parts[1]) * 255 * 255 + parseInt(parts[0]) * 255 * 255 * 255;
                        }
                        logger.error('invalid ip address -> ' + ip);
                }

                queryDeviceInfo(IMEI, loginMsg) {
                        var me = this;
                        return function * () {
                                var o = null;
                                if(CACHE_LOGIN_INFO) {
                                        o = yield cache.get('DLI-' + IMEI);
                                        if(o) {
                                                return o;
                                        }
                                }
                                var timeout = parseInt(EasyNode.config('service.queryDevice.timeout', '2000'));
                                var url = EasyNode.config('service.queryDevice.URL');
                                var method = EasyNode.config('service.queryDevice.httpMethod', 'POST');
                                if (method.toLowerCase() != 'post') {
                                        method = 'GET';
                                }
                                EasyNode.DEBUG && logger.debug(`device login service URL -> ` + url);
                                //var dateRegExp = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/;
                                //var [p, year, month, date, hours, minutes, seconds] = dateRegExp.exec(m['deviceTime']);
                                var loginArgs = {
                                        IMEI: IMEI,
                                        //time : new Date(year, month - 1, date, hours, minutes, seconds).getTime(),
                                        time : new Date().getTime(),
                                        modal : loginMsg['deviceModel'],
                                        sw : loginMsg['softwareVersion']
                                };
                                EasyNode.DEBUG && logger.debug('request device login -> ' + JSON.stringify(loginArgs));
                                var ret = yield HTTPUtil.getJSON(url, timeout, method, loginArgs);
                                EasyNode.DEBUG && logger.debug(`received from queryDevice service : ` + JSON.stringify(ret));
                                if(ret && CACHE_LOGIN_INFO) {
                                        yield cache.set('DLI-' + IMEI, ret, CACHE_EXPIRED);
                                }
                                return ret;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Handler0x0002;
})();