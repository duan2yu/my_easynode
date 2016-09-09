var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var thunkify = require('thunkify');
var BeanFactory = using('easynode.framework.BeanFactory');
var CBB100HttpServiceRoutes = using('szzh.cbb100.service.CBB100HttpServiceRoutes');
var mongodb = require('mongodb');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var _ = require('underscore');
var StringUtil = using('easynode.framework.util.StringUtil');

(function () {
        var _connection = null;
        var MongoClient = mongodb.MongoClient;
        var fnConnect = thunkify(MongoClient.connect);
        const SAFE_MODE = parseInt(EasyNode.config('mongodb.writeMode.safe', '1'));
        const CLEAR_SNAPSHOT = parseInt(EasyNode.config('mongodb.snapshot.clear', '0'));
        const TRACK_MAX_DURATION = parseInt(EasyNode.config('track.max.duration', '0'));
        const QUERY_LBS_ON_GPS_FAIL = parseInt(EasyNode.config('lbs.switch', '0'));
        const LBS_SERVICE_URL = EasyNode.config('lbs.service.URL', 'http://127.0.0.1:7000/lbs?plmn=$plmn&lac=$lac&cellId=$cellId');
        const ALARM_TIMEOUT = parseInt(EasyNode.config('service.alarmNote.timeout', '3000'));
        const REDUNDANT_TRACK_DATA = parseInt(EasyNode.config('track.data.redundant', '1'));
        const ALARM_NOTE_SERVICE_SUCC = EasyNode.config('service.alarmNote.response.succ.msg', '推送成功');
        const CBB100H_AUTO_FENCE = StringUtil.switchState(EasyNode.config('device.CBB-100H.autoFence', '1'));
        const ONE_DAY_IN_MS = 86400000;

        var __TEST_COUNTER = 1;

        /**
         * Class CBB100DWMain
         *
         * @class szzh.cbb100.CBB100DWMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100DWMain extends GenericObject {
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

                static getMongoConnection() {
                        return function * () {
                                if (!_connection) {
                                        var mongodbOpts = BeanFactory.get('mongodbOpts').opts;
                                        try {
                                                var url = EasyNode.config('mongodb.url');
                                                logger.info('connecting to mongodb : ' + url);
                                                var db = yield fnConnect.call(null, url, mongodbOpts);
                                                if (db) {
                                                        logger.info('mongodb connected');
                                                        db.on('error', function (err) {
                                                                logger.error('MongoDB Error :' + err);
                                                                try {
                                                                        db.close();
                                                                } catch (e) {
                                                                }
                                                                _connection = null;
                                                        });
                                                        db.on('close', function () {
                                                                logger.error('mongodb connection lost');
                                                                _connection = null;
                                                        });
                                                        _connection = db;
                                                }
                                        } catch (err) {
                                                logger.error(err);
                                        }
                                }
                                return _connection;
                        };
                }

                static * main() {
                        yield BeanFactory.initialize('projects/szzh/etc/cbb100-dw/cbb100-dw-beans.json');
                        var redisQueue = BeanFactory.get('redisQueue');
                        var snapshotCache = BeanFactory.get('snapshotCache');
                        yield CBB100DWMain.getMongoConnection();

                        var dateRegExp = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/;
                        var collectionName = EasyNode.config('mongodb.collection');
                        var snapshotKeyPrefix = EasyNode.config('snapshot.cache.prefix', 'SD-');
                        var trackBeginTimePrefix = EasyNode.config('track.cache.begin.prefix', 'TRACK-BT-');

                        var alarmNoteServiceURL = EasyNode.config('service.alarmNote.URL', '');
                        var alarmNoteServiceMethod = EasyNode.config('service.alarmNote.method', 'GET');
                        var writeAlarmData2DB = EasyNode.config('alarm.write2DB', '1');
                        var alarmDataCollection =  EasyNode.config('alarm.data.collection', 'CBB100ALARM');

                        var l = {
                                pause: false,
                                onMessage: function * (queueName, m) {
                                        var connection = yield CBB100DWMain.getMongoConnection();
                                        if (!connection) {
                                                this.pause = true;
                                                return ;
                                        }
                                        else {
                                                this.pause = false;
                                        }

                                        var nowTime = new Date().getTime();
                                        var oldData = null;
                                        var dst = null;
                                        var ddt = null;
                                        var ddtStr = null;
                                        var snapshotData = null;
                                        var key = snapshotKeyPrefix + m['IMEI'];                                        //Snapshot key
                                        //=====================写Cache数据===================/
                                        if (m) {
                                                /*
                                                 *      ACC状态变化测试
                                                */
                                                //m['ACCState'] = (__TEST_COUNTER % 2 == 0) ? 0 : 1;
                                                //__TEST_COUNTER ++;
                                                //m['ACCState'] = 1;
                                                //m['gpsState'] = 0;
                                                /*
                                                *     ACC状态变化测试结束
                                                * */
                                                EasyNode.DEBUG && logger.debug(`received data ${JSON.stringify(m)}`);
                                                var [p, year, month, date, hours, minutes, seconds] = dateRegExp.exec(m['updateTime']);
                                                dst = new Date(year, month - 1, date, hours, minutes, seconds);
                                                [p, year, month, date, hours, minutes, seconds] = dateRegExp.exec(m['deviceTime']);
                                                ddt = new Date(year, month - 1, date, hours, minutes, seconds);
                                                ddtStr = ddt.toFormat('YYYY-MM-DD');
                                                //获取缓存中存储的设备的上一次存储的数据
                                                oldData = yield snapshotCache.get(key);
                                                EasyNode.DEBUG && oldData && logger.debug(`old data ${JSON.stringify(oldData)}`);
                                                //将新数据写入缓存
                                                EasyNode.DEBUG && logger.debug('cache snapshot data');
                                                yield snapshotCache.set(key, m);
                                        }
                                        //=====================写轨迹点数据===================/
                                        //ACCState = 1时写入或ACC关闭后写入1次。
                                        //if (connection && m && (m['ACCState'] == 1 || (oldData && oldData['ACCState'] == 1))) {
                                        const WRITE_DATA = true;
                                        if(WRITE_DATA) {
                                                //写入snapshot数据
                                                var o = {
                                                        IMEI: m['IMEI'],                                   //终端IMEI号
                                                        st: dst.getTime(),                                  //ServerTime => st
                                                        dt: ddt.getTime(),                                 //DeviceTime => dt
                                                        gps: m['gpsState'],                             //GPS状态，1或2时有lat, lng, alt, speed数据，0或3时有plmn, lac和cellId数据用于基站定位
                                                        movement: m['movement'],             //移动状态
                                                        odometer : m['odometerOfDay']    //当天行驶距离，单位，百米
                                                };

                                                if (m['gpsState'] == 1 || m['gpsState'] == 2) {
                                                        o.lat = parseFloat(m['lat']);
                                                        o.lng = parseFloat(m['lng']);
                                                        o.alt = parseFloat(m['altitude']);
                                                        o.speed = m['speed'];
                                                }
                                                else {
                                                        o.plmn = m['plmn'];
                                                        o.lac = m['lac'];
                                                        o.cellId = m['cellId'];
                                                        //Call LBS Service to query GPS
                                                        if(QUERY_LBS_ON_GPS_FAIL === 1) {
                                                                var url = LBS_SERVICE_URL.replace(/\$plmn/, o.plmn).replace(/\$lac/, o.lac).replace(/\$cellId/, o.cellId);
                                                                try {
                                                                        var lbsResult = yield HTTPUtil.getJSON(url);
                                                                        if (lbsResult && lbsResult['code'] == 1) {
                                                                                o.lbs = 1;
                                                                                o.lat = lbsResult.data['lat'];
                                                                                o.lng = lbsResult.data['lng'];
                                                                        }
                                                                }catch(e) {
                                                                        logger.error('call LBS service error -> ' + e);
                                                                }
                                                        }
                                                }

                                                snapshotData = o;

                                                //save snapshot data
                                                var collection = connection.collection(collectionName);
                                                logger.info(`write device [${m['IMEI']}] snapshot data to database`);
                                                if (SAFE_MODE == 1) {
                                                        var fnSave = thunkify(collection.save);
                                                        yield fnSave.call(collection, o, {w: 1});
                                                }
                                                else {
                                                        collection.save(o);
                                                }
                                        }
                                        //=====================写当日里程和时间统计数据（cache, KEY->DAI）============================
                                        if(m) {
                                                var dailyStat = yield snapshotCache.get('DAILY-STAT-' + ddtStr + '-' + m['IMEI']);
                                                if(!dailyStat) {
                                                        dailyStat = {
                                                                date : ddtStr,
                                                                distance : 0,
                                                                time : 0,
                                                                stop : 0,
                                                                alarmMovement : 0,
                                                                alarmPowerOff : 0,
                                                                alarmShock : 0,
                                                                alarmSpeedy : 0,
                                                                alarmDoorOpened : 0,
                                                                alarmEnterEF : 0,
                                                                alarmLeaveEF : 0
                                                        };
                                                }
                                                if(oldData) {
                                                        var distance = m['odometerOfDay'] - oldData['odometerOfDay'];              //单位，百米(1/10千米)。
                                                        var rideTime = m['rideTimeOfDay'] - oldData['rideTimeOfDay'];
                                                        if(distance < 0) {
                                                                distance = m['odometerOfDay'];                                     //硬件重置了行驶距离
                                                        }
                                                        if(rideTime < 0) {
                                                                rideTime = m['rideTimeOfDay'];                                    //硬件重置了行驶距离
                                                        }
                                                        dailyStat.distance += distance;
                                                        dailyStat.time += rideTime;
                                                        if(oldData['movement'] == 1 && m['movement'] == 0) {
                                                                dailyStat.stop = dailyStat.stop || 0;
                                                                dailyStat.stop ++;
                                                        }
                                                }
                                                else {
                                                        dailyStat.distance += m['odometerOfDay']
                                                        dailyStat.time += m['rideTimeOfDay'];
                                                }
                                                //====================统计报警次数======================

                                                if(m['alarmMovement']) {
                                                        dailyStat.alarmMovement ++ ;
                                                }
                                                if(m['alarmPowerOff']) {
                                                        dailyStat.alarmPowerOff ++;
                                                }
                                                if(m['alarmQuake']) {
                                                        dailyStat.alarmShock ++;
                                                }
                                                if(m['alarmSpeedy']) {
                                                        dailyStat.alarmSpeedy ++;
                                                }
                                                if(m['alarmDoorOpened']) {
                                                        dailyStat.alarmDoorOpened ++ ;
                                                }
                                                if(m['efAlarmType']) {
                                                        if(m['efDirection'] === 0) {
                                                                dailyStat.alarmEnterEF ++;
                                                        }
                                                        else if(m['efDirection'] === 1) {
                                                                dailyStat.alarmLeaveEF ++;
                                                        }
                                                }
                                                EasyNode.DEBUG && logger.debug(`cache device [${m['IMEI']}], device type [${m['deviceModel']}], daily stat -> ${JSON.stringify(dailyStat)}`);
                                                yield snapshotCache.set('DAILY-STAT-' + ddtStr + '-' + m['IMEI'], dailyStat, 604800);                 //缓存一星期
                                        }
                                        //============================CBB100H 5分钟自动设防===========================
                                        if(CBB100H_AUTO_FENCE && m['deviceModel'] == 'CBB-100H') {
                                                var accOffCount = 0;
                                                var accOffBeginTime = 0;
                                                if(oldData) {
                                                        accOffCount = oldData['accOffCount'] || 0;
                                                        accOffBeginTime = oldData['accOffBeginTime'] || 0;
                                                        if(oldData['ACCState'] === 0 && m['ACCState'] === 0) {
                                                                accOffCount ++;                                 //连续为关闭，计１次
                                                                if(accOffCount === 1) {
                                                                        m['accOffBeginTime'] = nowTime;
                                                                }
                                                        }
                                                        else {
                                                                accOffCount = 0;                                //归０
                                                                m['accOffBeginTime'] = 0;
                                                        }

                                                        if(accOffBeginTime !== 0 && (nowTime - accOffBeginTime >= 300000)) {            //5分钟自动设防
                                                                //下发设防指令到CBB-100H
                                                                m['accOffCount'] = accOffCount;
                                                                m['accOffBeginTime'] = 0;                                               //重置，不重复下发指令
                                                                CBB100DWMain.autoFence(m['rcBaseURL'], m['IMEI']);
                                                        }
                                                }
                                                m['accOffCount'] = accOffCount;
                                        }

                                        //=====================写轨迹数据===================/
                                        if (oldData) {
                                                /*
                                                 轨迹写入逻辑。
                                                 １、从ACC=0变更为ACC=1，记录起始时间点
                                                 ２、从ACC=1变更为ACC=0，记录结束时间点统计mongodb中存储的数据并转换成Track数据
                                                 */
                                                if (oldData['ACCState'] == 0 && m['ACCState'] == 1) {
                                                        //ACC 0->1, Track Begin，Track开始时间写入cache
                                                        logger.info('['+m['IMEI']+'], device type ['+m['deviceModel']+']' + ', begin track, ACC 0->1');
                                                        var tbtKey = trackBeginTimePrefix + m['IMEI'];
                                                        yield snapshotCache.set(tbtKey, ddt.getTime());
                                                }
                                                else if (oldData['ACCState'] == 1 && m['ACCState'] == 0) {
                                                        //ACC 1->0, Track End, statistics，统计本次TRACK数据
                                                        var tbtKey = trackBeginTimePrefix + m['IMEI'];
                                                        var trackStartTime = yield snapshotCache.get(tbtKey);
                                                        var trackEndTime = ddt.getTime();

                                                        //如果轨迹跨天，则写入两段统计数据（仅限跨一天，也不会有车子开超过24小时不熄火）
                                                        if(parseInt(trackStartTime / ONE_DAY_IN_MS)  !=  parseInt(trackEndTime / ONE_DAY_IN_MS)) {
                                                                logger.info('[' + m['IMEI'] + '], device type [' + m['deviceModel'] + ']' + ', end track, ACC 1->0, start : ' + trackStartTime + ', end : ' + trackEndTime + ', duration: ' + (parseInt((trackEndTime - trackStartTime) / 1000)) + 'seconds, 2 phases');
                                                                if(connection) {
                                                                        try {
                                                                                yield CBB100DWMain.statisticTrackData(connection, collectionName, m['IMEI'], trackStartTime, (parseInt(trackStartTime / ONE_DAY_IN_MS) + 1) * ONE_DAY_IN_MS - 1);
                                                                                yield CBB100DWMain.statisticTrackData(connection, collectionName, m['IMEI'], parseInt(trackEndTime / ONE_DAY_IN_MS) * ONE_DAY_IN_MS, trackEndTime);
                                                                        } catch (err) {
                                                                                logger.error(err);
                                                                        }
                                                                        //清除轨迹开始时间Cache
                                                                        yield snapshotCache.del(tbtKey);
                                                                }
                                                                else {
                                                                        logger.error('***LOST TRACK STATISTIC***' + JSON.stringify({
                                                                                        IMEI: m['IMEI'],
                                                                                        trackStartTime: trackStartTime,
                                                                                        trackEndTime: trackEndTime
                                                                                }));
                                                                }
                                                        }
                                                        else {
                                                                logger.info('[' + m['IMEI'] + '], device type [' + m['deviceModel'] + ']' + ', end track, ACC 1->0, start : ' + trackStartTime + ', end : ' + trackEndTime + ', duration: ' + (parseInt((trackEndTime - trackStartTime) / 1000)) + 'seconds');
                                                                if (connection) {
                                                                        try {
                                                                                yield CBB100DWMain.statisticTrackData(connection, collectionName, m['IMEI'], trackStartTime, trackEndTime);
                                                                        } catch (err) {
                                                                                logger.error(err);
                                                                        }
                                                                        //清除轨迹开始时间Cache
                                                                        yield snapshotCache.del(tbtKey);
                                                                }
                                                                else {
                                                                        logger.error('***LOST TRACK STATISTIC***' + JSON.stringify({
                                                                                        IMEI: m['IMEI'],
                                                                                        trackStartTime: trackStartTime,
                                                                                        trackEndTime: trackEndTime
                                                                                }));
                                                                }
                                                        }
                                                }
                                                else if (oldData['ACCState'] == 0 && m['ACCState'] == 0) {
                                                        //ACC keep off
                                                        logger.info('['+m['IMEI']+'], ' + 'ACC 0->0');
                                                }
                                                else if (oldData['ACCState'] == 1 && m['ACCState'] == 1) {
                                                        //ACC keep on
                                                        logger.info('['+m['IMEI']+'], ' + 'ACC 1->1');
                                                }
                                        }
                                        else if(m && m['ACCState'] == 1) {
                                                //视为：ACC 0->1, Track Begin
                                                logger.info('begin track2, ACC 0->1');
                                                var tbtKey = trackBeginTimePrefix + m['IMEI'];
                                                yield snapshotCache.set(tbtKey, ddt.getTime());
                                        }
                                        //=====================发送告警通知===================/
                                        if(m) {
                                                var changed = false;
                                                var oldAlarmData = {
                                                        alarmDoorOpened : 0,
                                                        alarmMovement : 0,
                                                        alarmQuake : 0,
                                                        alarmSpeedy : 0,
                                                        alarmPowerOff : 0
                                                };
                                                if(oldData) {
                                                        CBB100DWMain.fieldCopy(oldAlarmData, oldData);
                                                }
                                                changed = CBB100DWMain.isDifferent(oldAlarmData, m);
                                                if(changed) {
                                                        var newAlarmData = _.clone(oldAlarmData);
                                                        CBB100DWMain.fieldCopy(newAlarmData, m);
                                                        EasyNode.DEBUG && logger.debug(`device [${m['IMEI']}] alarm state changed`);
                                                        if(connection && writeAlarmData2DB == '1') {
                                                                yield CBB100DWMain.writeAlarmData(connection, alarmDataCollection, m['IMEI'], ddt, oldAlarmData, newAlarmData, snapshotData);
                                                        }
                                                        else {
                                                                EasyNode.DEBUG && logger.debug('mongodb connection lost or write alarm to database is OFF');
                                                        }
                                                }
                                                if(m.alarmMovement || m.alarmPowerOff || m.alarmQuake || m.alarmDoorOpened || m.alarmSpeedy) {
                                                        var alarmType = m.alarmMovement + ',' + m.alarmPowerOff + ',' + m.alarmQuake + ',' + m.alarmDoorOpened + ',' + m.alarmSpeedy;
                                                        if(alarmNoteServiceURL) {
                                                                try {
                                                                        var ret = yield HTTPUtil.getJSON(alarmNoteServiceURL, ALARM_TIMEOUT, alarmNoteServiceMethod, {
                                                                                IMEI: m['IMEI'],
                                                                                type: alarmType
                                                                        });
                                                                        /*
                                                                        if(ret && ret.msg == ALARM_NOTE_SERVICE_SUCC) {
                                                                                //清除报警标识
                                                                                m['alarmDoorOpened'] = 0;
                                                                                m['alarmMovement'] = 0;
                                                                                m['alarmQuake'] = 0;
                                                                                m['alarmSpeedy'] = 0;
                                                                                m['alarmPowerOff'] = 0;
                                                                                yield snapshotCache.set(key, m);
                                                                        }
                                                                        else {
                                                                                EasyNode.DEBUG && logger.debug('alarm notification fail -> ' + JSON.stringify(ret));
                                                                        }
                                                                        */
                                                                }catch(err) {
                                                                        logger.error(err);
                                                                }
                                                        }
                                                }
                                        }

                                        //=====================数据库挂逼===================/
                                        if (!connection) {
                                                logger.error('mongodb connection lost');
                                                if (m) {
                                                        logger.error('***LOST TRACK DATA***' + JSON.stringify(m));
                                                }
                                        }
                                },

                                onError: function (err) {
                                        logger.error(err);
                                }
                        };

                        yield redisQueue.subscribe(EasyNode.config('redis.queueName'), {}, l);
                }

                static fieldCopy(dest, src) {
                        if(dest && src) {
                                for(var key in dest) {
                                        if(src.hasOwnProperty(key)) {
                                                dest[key] = src[key];
                                        }
                                }
                        }
                        return dest;
                }

                static autoFence(rcBaseURL, IMEI) {
                        co(function * (){
                                var url = rcBaseURL + '?IMEI=' + IMEI + '&cmd=3';
                                yield HTTPUtil.getJSON(url, 10000);
                        }).catch(function(err){
                                logger.error(err);
                        });
                }

                static isDifferent(dest, src) {
                        if(dest && src) {
                                for(var key in dest) {
                                        if(dest[key] != src[key]) {
                                                return true;
                                        }
                                }
                        }
                        return false;
                }

                static writeAlarmData(connection, alarmDataCollectionName, IMEI, ddt, oldAlarmData, newAlarmData, snapshotData) {
                        return function * () {
                                EasyNode.DEBUG && logger.debug(`writing alarm data to mongodb...`);
                                var alarmCollection = connection.collection(alarmDataCollectionName);
                                var doc = {
                                        IMEI : IMEI,
                                        deviceTime : ddt.getTime(),
                                        serverTime : new Date().getTime(),
                                        oldAlarmData: oldAlarmData,
                                        newAlarmData : newAlarmData,
                                        snapshotData : snapshotData
                                };
                                if (SAFE_MODE == 1) {
                                        var fnSave = thunkify(alarmCollection.save);
                                        yield fnSave.call(alarmCollection, doc, {w: 1});
                                }
                                else {
                                        alarmCollection.save(doc);
                                }
                        };
                }

                static statisticTrackData(connection, snapshotCollectionName, IMEI, trackStartTime, trackEndTime) {
                        return function * () {
                                EasyNode.DEBUG && logger.debug('statistic track data...');
                                //最大Track时间，单位，分钟
                                if (TRACK_MAX_DURATION > 0) {
                                        if ((trackEndTime - trackStartTime) > (TRACK_MAX_DURATION * 60000)) {
                                                EasyNode.DEBUG && EasyNode.debug('ignored track data, exceed track max duration...');
                                                return;
                                        }
                                }
                                var snapshotCollection = connection.collection(snapshotCollectionName);
                                var trackCollection = connection.collection(EasyNode.config('mongodb.track.collection', 'CBB100TRACK'));
                                var pointsDataCursor = snapshotCollection.find({
                                        IMEI: IMEI,
                                        dt: {
                                                '$gte': trackStartTime,
                                                '$lte': trackEndTime
                                        }
                                });
                                var fnToArray = thunkify(pointsDataCursor.toArray);
                                var data = yield fnToArray.call(pointsDataCursor);
                                if (data.length > 0) {
                                        var pauseTimes = 0;
                                        //计算停车次数,　数据中movement = 0的次数
                                        //Location Schema转换
                                        for (var i = 0; i < data.length; i++) {
                                                var o = data[i];
                                                if (o['movement'] == 0) {
                                                        pauseTimes++;
                                                }
                                                var location = {                                                      //Location Schema
                                                        gps: o['gps'],                                       //GPS定位标识，１表示正确定位
                                                        movement: o['movement'],                     //移动状态，１表示移动中，０表示静止状态
                                                        time: o['dt'],                                                 //数据发生时间（终端设备时间）
                                                        odometer: o['odometer']                         //当日里程，单位：百米(1/10千米)
                                                };
                                                location.lat = o['lat'] || 0;
                                                location.lng = o['lng'] || 0;
                                                location.alt = o['alt'] || 0;
                                                location.speed = o['speed'] || 0;
                                                if(location.gps === 0) {
                                                        location.plmn = o['plmn'];
                                                        location.lac = o['lac'];
                                                        location.cellId = o['cellId'];
                                                }
                                                data[i] = location;
                                        }
                                        var first = data[0];
                                        var last = data[data.length - 1];
                                        var distance = last['odometer'] - first['odometer'];              //单位，百米(1/10千米)。
                                        var rideTime = parseInt((trackEndTime - trackStartTime) / 1000);
                                        var trackData = {
                                                deviceId: IMEI,
                                                startTime: trackStartTime,
                                                startLocation: first,
                                                endTime: trackEndTime,
                                                endLocation: last,
                                                pauseTimes: pauseTimes,
                                                distance: distance,
                                                createAt: new Date().getTime(),
                                                locations: data
                                        };
                                        //写入trackData
                                        logger.info(`write [${IMEI}] track data to database ${JSON.stringify(trackData)}`);
                                        if (SAFE_MODE === 1) {
                                                var fnSave = thunkify(trackCollection.save);
                                                yield fnSave.call(trackCollection, trackData, {w: 1});
                                        }
                                        else {
                                                trackCollection.save(trackData);
                                        }
                                        //插入或更新设备骑行时间和骑行距离统计数据
                                        var trackStat = EasyNode.config('track.statistic', '1');
                                        if(trackStat == '1') {
                                                var trackStatisticCollectionName = EasyNode.config('track.statistic.collection', 'CBB100TRACKSTAT');
                                                EasyNode.DEBUG && logger.debug(`writing device statistic data to collection [${trackStatisticCollectionName}]...`);
                                                var filter = {
                                                        IMEI : IMEI
                                                };
                                                var trackStatisticCollection = connection.collection(trackStatisticCollectionName);
                                                var deviceStatDataCursor = trackStatisticCollection.find(filter);
                                                fnToArray = thunkify(deviceStatDataCursor.toArray);
                                                data = yield fnToArray.call(deviceStatDataCursor);
                                                if(data.length == 1) {
                                                        var totalRideTime = data[0].totalRideTime + rideTime;
                                                        var totalDistance = data[0].totalDistance + distance;
                                                        var fnUpdate = thunkify(trackStatisticCollection.findOneAndUpdate);
                                                        yield fnUpdate.call(trackStatisticCollection, filter, {
                                                                $set : {
                                                                        totalRideTime : totalRideTime,
                                                                        totalDistance : totalDistance,
                                                                        updateTime : new Date().getTime()
                                                                }
                                                        });
                                                }
                                                else if(data.length == 0) {
                                                        var statData =  {
                                                                IMEI : IMEI,
                                                                totalRideTime : rideTime,
                                                                totalDistance : distance,
                                                                updateTime : new Date().getTime()
                                                        };
                                                        if (SAFE_MODE === 1) {
                                                                var fnSave = thunkify(trackStatisticCollection.save);
                                                                yield fnSave.call(trackStatisticCollection, statData, {w: 1});
                                                        }
                                                        else {
                                                                trackCollection.save(statData);
                                                        }
                                                }
                                                else {
                                                        logger.warn(`duplicated statistics data, unique key of collection [${trackStatisticCollectionName}.IMEI] is not set`)
                                                }
                                        }
                                }
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100DWMain;
})();