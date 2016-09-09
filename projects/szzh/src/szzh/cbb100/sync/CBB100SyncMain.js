var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var thunkify = require('thunkify');
var BeanFactory = using('easynode.framework.BeanFactory');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var StringUtil = using('easynode.framework.util.StringUtil');
var Scheduler = using('easynode.framework.schedule.Scheduler');
var _ = require('underscore');

(function () {
        const ONLINE = 'online';
        const OFFLINE = 'offline';
        const MESSAGE = 'message';
        const ALARM = 'alarm';
        const QUERY_LBS_ON_GPS_FAIL = parseInt(EasyNode.config('lbs.switch', '0'));
        const LBS_SERVICE_URL = EasyNode.config('lbs.service.URL', 'http://127.0.0.1:7000/lbs?plmn=$plmn&lac=$lac&cellId=$cellId');
        const ALARM_TIMEOUT = parseInt(EasyNode.config('service.alarmNote.timeout', '3000'));
        const LOG_HEX = StringUtil.switchState(EasyNode.config('message.logHex', 'true'));
        const EXEC_DAILY_STAT = StringUtil.switchState(EasyNode.config('stat.daily.scheduled', 'false'));

        /**
         * Class CBB100SyncMain
         *
         * @class szzh.cbb100.CBB100SyncMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100SyncMain extends GenericObject {
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
                }

                static * main() {
                        var redisQueue = BeanFactory.get('redisQueue');
                        var snapshotCache = BeanFactory.get('snapshotCache');
                        var knex = BeanFactory.get('bookshelf').knex;
                        var snapshotKeyPrefix = EasyNode.config('snapshot.cache.prefix', 'SD-');
                        if(EXEC_DAILY_STAT) {
                                yield Scheduler.loadSchedule('projects/szzh/etc/sync/sync-schedules.json');
                        }

                        var l = {
                                pause: false,
                                onMessage: function * (queueName, m) {
                                        var IMEI = m['IMEI'];
                                        EasyNode.DEBUG && logger.debug('SYNC_QUEUE received a message: ' + JSON.stringify(m));
                                        var info = yield CBB100SyncMain.getDeviceInfo(IMEI, snapshotCache, knex);

                                        if(!info) {
                                                logger.error('Invalid device ['+IMEI+'], sync type ['+m['__type__']+'], connector -> ' + m['__connector__']);
                                                return;
                                        }

                                        if(m['__type__'] === ONLINE) {
                                                logger.info('device ['+IMEI+'] online, connector -> ' + m['__connector__']);
                                                yield CBB100SyncMain.syncState(IMEI, ONLINE, m['__connector__'], info, knex);
                                        }
                                        else if(m['__type__'] === OFFLINE) {
                                                logger.info('device ['+IMEI+'] offline, connector -> ' + m['__connector__']);
                                                yield CBB100SyncMain.syncState(IMEI, OFFLINE, m['__connector__'], info, knex);
                                        }
                                        else if(m['__type__'] === MESSAGE) {
                                                logger.info('received device ['+IMEI+'] message 0x'+m['cmd']+', connector -> ' + m['__connector__']);
                                                yield CBB100SyncMain.logDeviceMessage(IMEI, m['sessionId'], m['__connector__'], m['cmd'], m['hex'], info, knex);
                                        }
                                        else if(m['__type__'] === ALARM) {
                                                logger.info('device ['+IMEI+'] alarm, connector -> ' + m['__connector__'] + ' -> ' + JSON.stringify(m));
                                                //存储报警
                                                yield CBB100SyncMain.saveAlarm(m, info, knex);
                                        }
                                        else {
                                                logger.error('Invalid queue configuration!');
                                                return ;
                                                //GPS定位失败时，使用LBS定位
                                                var gpsState = m['gpsState'];
                                                if(gpsState !== 1 && gpsState !== 2 && QUERY_LBS_ON_GPS_FAIL === 1) {
                                                        EasyNode.DEBUG && logger.debug('gps positioning fail, positioning by LBS [' + IMEI + ']');
                                                        var url = LBS_SERVICE_URL.replace(/\$plmn/, m.plmn).replace(/\$lac/, m.lac).replace(/\$cellId/, m.cellId);
                                                        try {
                                                                var lbsResult = yield HTTPUtil.getJSON(url);
                                                                if (lbsResult && lbsResult['code'] == 1) {
                                                                        m['gpsState'] = 3;
                                                                        m.lat = lbsResult.data['lat'];
                                                                        m.lng = lbsResult.data['lng'];
                                                                }
                                                        }catch(e) {
                                                                logger.error('call LBS service error -> ' + e);
                                                                m['gpsState'] = 5;
                                                        }
                                                }
                                                else {
                                                        m['gpsState'] = 4;
                                                }
                                                //更新缓存数据
                                                EasyNode.DEBUG && logger.debug('updating snapshot data [' + IMEI + ']');
                                                yield snapshotCache.set(snapshotKeyPrefix + IMEI, m);
                                                //存储数据
                                                EasyNode.DEBUG && logger.debug('saving device data [' + IMEI + ']');
                                                yield CBB100SyncMain.saveData(m, info, knex);
                                        }
                                },

                                onError: function (err) {
                                        logger.error(err);
                                }
                        };

                        yield redisQueue.subscribe(EasyNode.config('device.stateSync.queueName', 'CBB100-STATE-SYNC-QUEUE'), {}, l);
                }

                static saveData(m, info, knex) {
                        return function * () {
                                var dataObj = {
                                        deviceId : info.id,
                                        groupId : info.groupId,
                                        vehicleNumber : info.vehicleNumber,
                                        gpsState : m.gpsState,
                                        lat : m.lat,
                                        lng : m.lng,
                                        alt : m.altitude,
                                        speed : m.speed,
                                        direction : m.direction,
                                        plmn : parseInt(m.plmn),
                                        lac : m.lac,
                                        cellId : m.cellId,
                                        odometer : m.odometerOfDay,
                                        driveTime : m.rideTimeOfDay,
                                        temperature : m.temperature,
                                        movingState : m.movement,
                                        deviceState : m.vehicleState === 0 ? 0 : 1,     //０撤防状态，１布防状态
                                        displayState : m.reportState === 1 ? 0 : 1,     //显示状态，０隐藏，１正常显示
                                        accState : m.ACCState,
                                        alarmMoving : m.alarmMovement,
                                        alarmPower : m.alarmPowerOff,
                                        alarmShock : m.alarmQuake,
                                        alarmSpeed : m.alarmSpeedy,
                                        alarmDoor : m.alarmDoor,
                                        i2cState : m.i2cState,
                                        serialPortStateR : m.rs232StateR,
                                        serialPortStateW : m.rs232StateW,
                                        btState : m.btState,
                                        simState : m.call112State,
                                        netState : m.networkState,                                      //网络状态永远正常?
                                        call112State : m.call112State,
                                        gpsSerialPortState : m.gpsRS232State,
                                        simSignal : m.networkSignal,
                                        power : m.power,
                                        powerBT : m.powerBT,
                                        SMSSent : m.SMSSent,
                                        phoneCallAnswered : m.phoneCallAnswered,
                                        deviceTime : new Date(m.deviceTime).getTime(),
                                        createTime : new Date().getTime()
                                };
                                yield knex('device_data').insert(dataObj);
                        };
                }

                static saveAlarm(m, info, knex) {
                        return function * () {
                                var dataObj = {
                                        deviceId : info.id,
                                        alarm : m.alarmType,
                                        alarmType : m.alarmState,
                                        efId : m.efId || 0,
                                        lat : m.lat,
                                        lng : m.lng,
                                        deviceTime : new Date(m.deviceTime).getTime(),
                                        createTime : new Date().getTime()
                                };
                                yield knex('device_alarm').insert(dataObj);
                        };
                }

                static syncState(IMEI, state, connector, info, knex) {
                        return function * () {
                                if(IMEI === '*') {
                                        yield knex.raw('update device_state set state = ?, updateTime = ? where connectorId = ?', ['0', new Date().getTime(), connector]);
                                }
                                else {
                                        var args = [
                                                info.id,
                                                connector,
                                                state === ONLINE ? '1' : '0',
                                                new Date().getTime()
                                        ];
                                        yield knex.raw('replace into device_state(deviceId, connectorId, state, updateTime) values (?,?,?,?)', args);
                                }
                        };
                }

                static logDeviceMessage(IMEI, sessionId, connector, hexMsgId, hex, info, knex) {
                        return function * () {
                                var logInfo = {
                                        deviceId : info.id,
                                        connectorId : connector,
                                        cmd : '0x' + hexMsgId,
                                        sessionId : sessionId,
                                        hex : LOG_HEX ? hex : '',
                                        logTime : new Date().getTime()
                                };
                                yield knex.insert(logInfo).into('device_msg_log');
                        };
                }

                //注意：修改设备信息不会立即生效，需要清除"DI-$imei"的缓存项才能使之立即生效
                static getDeviceInfo(IMEI, cache, knex) {
                        return function * () {
                                if(IMEI === '*') return {
                                        id : 0
                                };

                                var info = yield cache.get('CBB100-SYNC-DI-' + IMEI);
                                if (info) {
                                        if(info === 'NOT-FOUND') {
                                                return null;
                                        }
                                        return info;
                                }
                                info = yield knex('motor_device')
                                        .leftJoin('device_config', 'motor_device.id', 'device_config.deviceId')
                                        .where('motor_device.imei', IMEI)
                                        .select('motor_device.id', 'motor_device.groupId', 'motor_device.imei', 'device_config.vehicleNumber');
                                if(info.length !== 1) {
                                        //没有查到设备数据时，缓存5分钟。
                                        yield cache.set('CBB100-SYNC-DI-' + IMEI, 'NOT-FOUND', 300);                              //缓存5分钟
                                        return null;
                                }
                                yield cache.set('CBB100-SYNC-DI-' + IMEI, info[0], 86400);                              //缓存24小时
                                return info[0];
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100SyncMain;
})();