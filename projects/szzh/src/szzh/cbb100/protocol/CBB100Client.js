var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var TCPClient = using('easynode.framework.server.tcp.TCPClient');
var BeanFactory = using('easynode.framework.BeanFactory');
var CBB100Events = using('szzh.cbb100.CBB100Events');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
var _ = require('underscore');
var co = require('co');
var thunkify = require('thunkify');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');

(function () {
        const IP = EasyNode.getLocalIP();
        const PORT = EasyNode.config('http.server.port');
        const PROTOCOL = 'http';
        const CONTROL_URI = EasyNode.config('http.server.services.control.URI');
        const CONTROL_TIMEOUT = parseInt(EasyNode.config('http.server.services.control.timeout', '5000'));
        const APP_ID = EasyNode.config('easynode.app.id', 'UNTITLED');
        const DT_2_ST = parseInt(EasyNode.config('time.dt2st', '0'));
        const TRIGGER_EVENTS = EasyNode.config('device.data.event.triggers', '*').split(',');
        const QUERY_DEVICE_FENCE_URL = EasyNode.config('service.queryDeviceEF.URL');
        var cache = BeanFactory.get('cache');

        /**
         * Class CBB100Client
         *
         * @class szzh.cbb100.protocol.CBB100Client
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Client extends TCPClient {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(socket, server) {
                        super(socket, server);
                        //调用super()后再定义子类成员。
                        socket.setEncoding('hex');
                        this.IMEI = null;
                        this._deviceData = null;
                        this.deviceData();
                        var me = this;
                        //上报的数据变更事件，发送当前状态到队列，由CBB100DataWriter进程写入数据库或缓存
                        this.on(CBB100Client.EVENT_CLIENT_DATA_CHANGED, function(data) {
                                co(function * (){
                                        //push to redis queue
                                        var redisQueue = BeanFactory.get('redisQueue');
                                        logger.info(`push data IMEI -> [${data.IMEI}]`);
                                        var redisQueueName = EasyNode.config('redis.queueName');
                                        yield redisQueue.publish(redisQueueName, {}, data);
                                        server.trigger(CBB100Events.DEVICE_REPORT_DATA, me, data);
                                }).catch(function(err){
                                        logger.error(err);
                                });
                        });
                        //同步电子围栏事件
                        this.on(CBB100Client.EVENT_SYNC_EF_CONFIG, function(client) {
                                if(!client.IMEI) return ;
                                co(function * () {
                                        var efAreas = [];
                                        try {
                                                var ret = yield HTTPUtil.getJSON(QUERY_DEVICE_FENCE_URL, 3000, 'GET', {
                                                        IMEI: client.IMEI
                                                });
                                                if(ret && ret.code === 0 && ret.result) {
                                                        for(var i = 0;i<ret.result.length;i++) {
                                                                efAreas.push({
                                                                        efAreaId : (i+1),
                                                                        efAreaProperty_ByTime : 0,                      //不根据时间报警
                                                                        efAreaProperty_AlarmEnter : 1,              //进入区域报警
                                                                        efAreaProperty_AlarmLeave : 1,             //离开区域报警
                                                                        efAreaCenterLat : parseInt(parseFloat(ret.result[i].lat) * 10000),  //中心点纬度
                                                                        efAreaCenterLng: parseInt(parseFloat(ret.result[i].lng) * 10000),  //中心点经度
                                                                        efAreaRadius : ret.result[i].radius,
                                                                        efAreaSpeedLimit : ret.result[i].maxSpeed,                         //最大速度
                                                                        efAreaSpeedSustained : 30                                                    //超过maxSpeed行驶30秒报警
                                                                });
                                                        }
                                                }
                                        }catch(err) {
                                                logger.error(err);
                                        }
                                        var msg = CBB100Message.createMessageById(0x820F).notation(client);
                                        logger.info(`sync electronic-fence IMEI -> [${client.IMEI}]`);
                                        var version = parseInt(new Date().getTime() / 1000);
                                        msg['version0x820F'] = version;
                                        msg['areaCount'] = efAreas.length;
                                        msg['areaData'] = efAreas;
                                        /*
                                        msg['areaCount'] = 2;
                                        msg['areaData'] = [{
                                                efAreaId : 1,
                                                efAreaProperty_ByTime : 0,
                                                efAreaProperty_AlarmEnter : 1,
                                                efAreaProperty_AlarmLeave : 1,
                                                efAreaCenterLat : 3945679,
                                                efAreaCenterLng: 11512345,
                                                efAreaRadius : 255,
                                                efAreaSpeedLimit : 120,
                                                efAreaSpeedSustained : 30
                                        },
                                                {
                                                        efAreaId : 2,
                                                        efAreaProperty_ByTime : 0,
                                                        efAreaProperty_AlarmEnter : 1,
                                                        efAreaProperty_AlarmLeave : 1,
                                                        efAreaCenterLat : 3945680,
                                                        efAreaCenterLng: 11512346,
                                                        efAreaRadius : 254,
                                                        efAreaSpeedLimit : 121,
                                                        efAreaSpeedSustained : 29
                                                }
                                        ];
                                        */
                                        client.getSocket().encodeAndSend(msg, client);
                                        var fnOnce = thunkify(client.once);
                                        var ackMsg = null;
                                        setTimeout(function () {
                                                if (ackMsg == null) {
                                                        client.trigger('msg-handle-able-0x020F', null, 'TIMEOUT');                      //超时响应
                                                }
                                        }, CONTROL_TIMEOUT);
                                        ackMsg = yield fnOnce.call(client, 'msg-handle-able-0x020F');
                                        if (ackMsg == 'TIMEOUT') {
                                                logger.info(`sync electronic-fence [TIMEOUT], IMEI -> [${client.IMEI}]`);
                                        }
                                        else {
                                                if(ackMsg['syncEFResult'] === 0) {
                                                        if(ackMsg['version0x020F'] === version) {
                                                                logger.info(`sync electronic-fence IMEI -> [${client.IMEI}] successfully`);
                                                                yield cache.del('EF-DIRTY-' + client.IMEI);
                                                        }
                                                        else {
                                                                logger.info(`sync electronic-fence IMEI -> [${client.IMEI}] fail, versions are not matched`);
                                                        }
                                                }
                                                else {
                                                        logger.info(`sync electronic-fence IMEI -> [${client.IMEI}] fail, syncEFResult -> [${ackMsg['syncEFResult']}]`);
                                                }
                                        }
                                }).catch(function(err){
                                        logger.error(err);
                                });
                        });
                }

                destroy() {
                        super.destroy();
                        delete this.recvBuf;
                }

                deviceData(merge=null, triggerCmd=null) {
                        if(this._deviceData == null) {
                                this._deviceData = {
                                        IMEI : this.IMEI,
                                        updateTime : new Date().toFormat('YYYY-MM-DD HH24:MI:SS'),
                                        rcBaseURL : this.getDeviceRCBaseURL(),
                                        serviceAppId : APP_ID,
                                        //from 0x0002
                                        deviceTime : 'UNKNOWN',
                                        deviceModel : 'UNKNOWN',
                                        softwareVersion : 'UNKNOWN',
                                        //from 0x0001
                                        i2cState : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        rs232StateR : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        rs232StateW : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        btState : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        reverseState : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        simState : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        networkState : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        call112State : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        gpsRS232State : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        networkSignal : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        //from 0x0200
                                        gpsState : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        lat : 'UNKNOWN',
                                        lng : 'UNKNOWN',
                                        altitude : CBB100Client.DEVICE_DATA_INVALID_ALTITUDE,
                                        vehicleState : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        movement : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        reportState : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        ACCState  : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        odometerOfDay : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        rideTimeOfDay : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        temperature : CBB100Client.DEVICE_DATA_INVALID_TEMPERATURE,
                                        speed : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        direction : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        plmn : 'UNKNOWN',
                                        lac : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        cellId : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        //from 0x0206
                                        power : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        powerBT : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        SMSSent : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        phoneCallAnswered : CBB100Client.DEVICE_DATA_UNINITIALIZED,
                                        //from 0x0202
                                        alarmDoorOpened : CBB100Client.DEVICE_DATA_NO_ALARM,
                                        alarmMovement : CBB100Client.DEVICE_DATA_NO_ALARM,
                                        alarmQuake : CBB100Client.DEVICE_DATA_NO_ALARM,
                                        alarmSpeedy : CBB100Client.DEVICE_DATA_NO_ALARM,
                                        alarmPowerOff : CBB100Client.DEVICE_DATA_NO_ALARM,
                                        //from 0x0210
                                        efAlarmType : CBB100Client.DEVICE_DATA_NO_ALARM,
                                        efDirection : CBB100Client.DEVICE_DATA_UNINITIALIZED
                                        //TEST FIELDS
                                        //,lat1 : 1
                                        //,lng1 : 1
                                        //,lat2 : 1
                                        //,lng2 : 1
                                };
                        }
                        if(merge && typeof merge == 'object') {
                                var updateFlag = false;
                                for(var key  in merge) {
                                        if(this._deviceData.hasOwnProperty(key)) {
                                                updateFlag = true;
                                                this._deviceData[key] = merge[key];
                                        }
                                }
                                if(updateFlag) {
                                        var sNowTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
                                        this._deviceData.updateTime = sNowTime;
                                        if(DT_2_ST === 1) {
                                                this._deviceData.deviceTime = sNowTime;
                                        }
                                        var triggerEvent = false;
                                        if((TRIGGER_EVENTS.length == 1 && TRIGGER_EVENTS[0] == '*')) {
                                                triggerEvent = true;
                                        }
                                        if(triggerCmd && _.contains(TRIGGER_EVENTS, triggerCmd)) {
                                                triggerEvent = true;
                                        }
                                        //如果不是0x0202，则清除客户端的报警（报警仅一次有效）
                                        if(triggerCmd !== '0x0202') {
                                                this._deviceData.alarmDoorOpened = CBB100Client.DEVICE_DATA_NO_ALARM;
                                                this._deviceData.alarmMovement = CBB100Client.DEVICE_DATA_NO_ALARM;
                                                this._deviceData.alarmPowerOff = CBB100Client.DEVICE_DATA_NO_ALARM;
                                                this._deviceData.alarmQuake = CBB100Client.DEVICE_DATA_NO_ALARM;
                                                this._deviceData.alarmSpeedy = CBB100Client.DEVICE_DATA_NO_ALARM;
                                        }
                                        if(triggerCmd !== '0x0210') {
                                                this._deviceData.efAlarmType = CBB100Client.DEVICE_DATA_NO_ALARM;
                                        }
                                        if(triggerEvent) {
                                                var me = this;
                                                EasyNode.DEBUG && logger.debug(`trigger event [${CBB100Client.EVENT_CLIENT_DATA_CHANGED}]`);
                                                //process.nextTick(function(){
                                                //        me.trigger(CBB100Client.EVENT_CLIENT_DATA_CHANGED, _.clone(me._deviceData));
                                                //});
                                                //立即触发事件，每次0x0202事件触发前都会上报一条0x0200包，nextTick将导致_clientData被覆盖，发送重复告警通知
                                                //克隆的目的在于能够保持事件发生时的瞬时数据，使用me._deviceData会导至两次连续的数据包会引用到相同的数据
                                                //事件触发等同于nextTick
                                                me.trigger(CBB100Client.EVENT_CLIENT_DATA_CHANGED, _.clone(me._deviceData));
                                        }
                                }
                        }
                        return _.clone(this._deviceData);
                }

                getDeviceData(name, defaultData) {
                        return this._deviceData[name] || defaultData;
                }

                getDeviceRCBaseURL () {
                        return `${PROTOCOL}://${IP}:${PORT}${CONTROL_URI}`;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        CBB100Client.DEVICE_DATA_UNINITIALIZED = -1;
        CBB100Client.DEVICE_DATA_INVALID_TEMPERATURE = 99999;
        CBB100Client.DEVICE_DATA_INVALID_ALTITUDE = Infinity;
        CBB100Client.DEVICE_DATA_NO_ALARM = 0;
        CBB100Client.EVENT_CLIENT_DATA_CHANGED = 'client-data-changed';
        CBB100Client.EVENT_SYNC_EF_CONFIG = 'sync-ef-config';

        module.exports = CBB100Client;
})();