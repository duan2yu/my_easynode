var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var StringUtil = using('easynode.framework.util.StringUtil');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var BeanFactory = using('easynode.framework.BeanFactory');
var ActionResult = using('easynode.framework.mvc.ActionResult');

(function () {
        const REVERSE_GEOCODING_SWITCH = EasyNode.config('reverseGeocoding.switch', '0');
        const REVERSE_GEOCODING_URL = EasyNode.config('reverseGeocoding.URL');
        const CALCULATE_DISTANCE_SWITCH = EasyNode.config('calculateDistance.switch', '0');
        const CALCULATE_DISTANCE_URL = EasyNode.config('calculateDistance.URL');
        const RECTIFICATION_SWITCH = EasyNode.config('rectification.switch', '1');
        const VALID_GPS_MIN_LAT = parseFloat(EasyNode.config('rectification.gps.lat.min'));
        const VALID_GPS_MIN_LNG = parseFloat(EasyNode.config('rectification.gps.lng.min'));
        const VALID_GPS_MIN_SPEED = parseFloat(EasyNode.config('rectification.gps.speed.min'));
        const BAIDU_API_KEYS = EasyNode.config('api.baidu.keys').split(',');
        const DEVICE_CONFIG_URL = EasyNode.config('service.deviceConfig.URL');
        const DEVICE_CONFIG_KEY_PREFIX = EasyNode.config('redis.cache.deviceConfig.prefix', 'CFG-');
        const DEVICE_CONFIG_TTL = parseInt(EasyNode.config('redis.cache.deviceConfig.ttl', '3600'));

        var _connection = null;

        /**
         * Class CCMS3DWMain
         *
         * @class beneverse.ccms.terminal.dw.CCMS3DWMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3DWMain extends GenericObject {
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
                        yield BeanFactory.initialize('projects/ccms3-terminal-dw/etc/ccms3-terminal-dw-beans.json');
                        var mq = BeanFactory.get('mq');
                        var cache = BeanFactory.get('cache');
                        const SNAPSHOT_PREFIX = EasyNode.config('redis.device.snapshot.prefix', 'SD-');
                        var l = {
                                pause: false,
                                onMessage: function * (queueName, m) {
                                        logger.error(JSON.stringify(m));
                                        var conn = yield CCMS3DWMain.getConnection();
                                        if (m) {
                                                var tid = m.tid;
                                                //获取cache里的原始数据
                                                var oldData = yield cache.get(SNAPSHOT_PREFIX + tid);
                                                //获取设备配置
                                                var deviceConfig = yield CCMS3DWMain.getDeviceConfig(tid);
                                                //标准化数据
                                                yield CCMS3DWMain.normalizeDeviceData(m, oldData, deviceConfig);
                                                EasyNode.DEBUG && logger.debug('message received -> ' + JSON.stringify(m));
                                                //写入snapshot缓存
                                                yield cache.set(SNAPSHOT_PREFIX + tid, m);
                                                //写入数据库，直接写，不用batch
                                                if (conn) {
                                                        yield CCMS3DWMain.write2DB(conn, m, deviceConfig);
                                                }
                                                else {
                                                        logger.error('database connection lost!');
                                                }
                                        }
                                },

                                onError: function (err) {
                                        logger.error(err);
                                }
                        };
                        yield mq.subscribe(EasyNode.config('redis.data.queueName', 'CCMS3-DATA-QUEUE'), {}, l);
                }

                static getConnection() {
                        return function * () {
                                if (!_connection) {
                                        _connection = yield BeanFactory.get('datasource').getConnection();
                                        _connection.on('error', function (err) {
                                                co(function * () {
                                                        logger.error('database connection error : ');
                                                        logger.error(err);
                                                        try {
                                                                yield BeanFactory.get('datasource').releaseConnection(_connection);
                                                        } catch (e) {
                                                        }
                                                        _connection = null;
                                                });
                                        });
                                }
                                return _connection;
                        };
                }

                static write2DB(connection, m, deviceConfig) {
                        return function * () {
                                yield CCMS3DWMain.writeData2DB(connection, m, deviceConfig);
                                yield CCMS3DWMain.writeAlarm2DB(connection, m, deviceConfig);
                                yield CCMS3DWMain.sendAlarmNotification(connection, m, deviceConfig);
                        };
                }

                //逻辑：直接写数据库，如果设备有多条绑定关系，则插入多条数据
                static writeData2DB(connection, m, deviceConfig) {
                        return function * () {
                                logger.error('write data to database ....');
                        };
                }

                //逻辑：直接写数据库，如果设备有多条绑定关系，则插入多条告警数据
                static writeAlarm2DB(connection, m, deviceConfig) {
                        return function * () {
                                logger.error('write alarm to database ....');
                        };
                }

                //逻辑：从cache里取设备的告警数据并累加更新，如果某个告警选项超过告警阀值，则下发告警短信
                //车辆的告警数据2小时过期删除，每种告警下发的间隔时间可配置
                static sendAlarmNotification(connection, m, deviceConfig) {
                        return function * () {
                                logger.error('check and send alarm notification');
                        };
                }

                //获取终端配置，主要是温湿度路数和通道名配置
                //先从Cache取，如果没有，则从接口读取后缓存到cache
                static getDeviceConfig(tid) {
                        return function * () {
                                var cache = BeanFactory.get('cache');
                                var cfg = yield cache.get(DEVICE_CONFIG_KEY_PREFIX + tid);
                                if(!cfg) {
                                        cfg = yield HTTPUtil.getJSON(DEVICE_CONFIG_URL, 2000, 'GET', {tid : tid});
                                        EasyNode.DEBUG && logger.debug('device config service response -> ' + JSON.stringify(cfg));
                                        if(cfg.code === ActionResult.CODE_SUCC) {
                                                cfg = cfg.result;
                                                yield cache.set(DEVICE_CONFIG_KEY_PREFIX + tid, cfg, DEVICE_CONFIG_TTL);
                                        }
                                }
                                return cfg;
                        };
                }

                //去除无用字段
                static normalizeDeviceData(m, oldData, deviceConfig) {
                        const IGNORED_FIELDS = [
                                'length',
                                'msgId',
                                'dayStr',
                                'timeStr',
                                '__original__',
                                '__decodeTime'
                        ];
                        return function * () {
                                m.serverTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
                                IGNORED_FIELDS.forEach(f => {
                                        delete m[f];
                                });
                                //纠编
                                if (oldData && StringUtil.switchState(RECTIFICATION_SWITCH)) {
                                        if (m['gpsState'] === 1 && m['speed'] < VALID_GPS_MIN_SPEED && m['lat'] - oldData['lat'] < VALID_GPS_MIN_LAT && m['lng'] - oldData['lng'] < VALID_GPS_MIN_LAT) {
                                                EasyNode.DEBUG && logger.debug('rectification GPS ...');
                                                m['lat'] = oldData['lat'];
                                                m['lng'] = oldData['lng'];
                                                m['speed'] = 0;
                                        }
                                }
                                //反转地址
                                if (StringUtil.switchState(REVERSE_GEOCODING_SWITCH)) {
                                        m['address'] = yield CCMS3DWMain.reverseGeocoding(m);
                                }
                                //测距
                                if (oldData && StringUtil.switchState(CALCULATE_DISTANCE_SWITCH)) {
                                        m['distance'] = yield CCMS3DWMain.calculateDistance(m, oldData);
                                }
                                else {
                                        m['distance'] = 0;
                                }

                                return m;
                        };
                }

                static reverseGeocoding(m) {
                        return function * () {
                                try {
                                        var url = REVERSE_GEOCODING_URL.replace(/\$\{lng\}/, m['lng']).replace(/\$\{lat\}/, m['lat']);
                                        var key = CCMS3DWMain.getBaiduAPIKey();
                                        url = url.replace(/\$\{ak\}/, key);
                                        var ret = yield HTTPUtil.getJSON(url, 2000);
                                        EasyNode.DEBUG && logger.debug('baidu reverse geocoding -> ' + JSON.stringify(ret));
                                        if (ret && ret.status == 'Success') {
                                                return ret.description;
                                        }
                                } catch (err) {
                                        logger.error(err);
                                }
                        };
                }

                static calculateDistance(m, oldData) {
                        return function * () {
                                if (m['lat'] == oldData['lat'] && m['lng'] == oldData['lng']) {
                                        return 0;
                                }
                                try {
                                        var points = `${m['lng']},${m['lat']};${oldData['lng']},${oldData['lat']}`;
                                        var url = CALCULATE_DISTANCE_URL.replace(/\$\{points\}/, points);
                                        var key = CCMS3DWMain.getBaiduAPIKey();
                                        url = url.replace(/\$\{ak\}/, key);
                                        var ret = yield HTTPUtil.getJSON(url, 2000);
                                        EasyNode.DEBUG && logger.debug('baidu distance -> ' + JSON.stringify(ret));
                                        if (ret && ret.status == 'Success') {
                                                return parseInt(ret.results[0]);
                                        }
                                } catch (err) {
                                        logger.error(err);
                                }
                                return 0;
                        };
                }

                static getBaiduAPIKey() {
                        var max = BAIDU_API_KEYS.length;
                        var n = parseInt(Math.random() * max);
                        return BAIDU_API_KEYS[n];
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3DWMain;
})();