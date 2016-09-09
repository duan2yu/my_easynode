var assert = require('assert');
var Logger = using('easynode.framework.Logger');
var logger = Logger.forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var thunkify = require('thunkify');
var CBB100HttpServiceRoutes = using('szzh.cbb100.service.CBB100HttpServiceRoutes');
var CBB100Events = using('szzh.cbb100.CBB100Events');
var BeanFactory = using('easynode.framework.BeanFactory');
var co = require('co');
var StringUtil = using('easynode.framework.util.StringUtil');
var dataLogger = Logger.getLogger('dataLogger');

(function () {
        const CONNECTOR_ID = EasyNode.config('connector.id', '000');
        const DEVICE_STATE_SYNC_QUEUE_NAME = EasyNode.config('device.stateSync.queueName', 'CBB100-STATE-SYNC-QUEUE');
        const SYNC_STATE = StringUtil.switchState(EasyNode.config('device.stateSync', 'false'));
        /**
         * Class CBB100ServerMain
         *
         * @class szzh.cbb100.CBB100ServerMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100ServerMain extends GenericObject {
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
                        yield BeanFactory.initialize('projects/szzh/etc/cbb100-server/cbb100-server-beans.json');
                        BeanFactory.init('redisQueue');

                        //重新启动时，将所有连接到此Connector的在线状态全部置为离线。
                        yield  CBB100ServerMain.syncDeviceState2Offline();

                        //TCP Server
                        var TCPServer = using('easynode.framework.server.tcp.TCPServer');
                        var CBB = using('szzh.cbb100.protocol.*');
                        var port = S(EasyNode.config('tcp.server.port', '6001')).toInt();
                        var server = new TCPServer(port);
                        server.setClientFactory(CBB.CBB100Client);
                        var decoder = new CBB.CBB100Decoder(server);
                        var encoder = new CBB.CBB100Encoder(server);
                        var messageHandler = new CBB.CBB100MessageHandler(server);
                        server.name = EasyNode.config('tcp.server.name', 'CBB100-Server');
                        server.setDecoder(decoder).setEncoder(encoder).setMessageHandler(messageHandler);

                        //HTTP Server
                        var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                        var httpPort = S(EasyNode.config('http.server.port', '6002')).toInt();
                        var httpServer = new KOAHttpServer(httpPort);
                        httpServer.name = EasyNode.config('http.server.name', 'CBB100-Control-HTTP-Server');
                        CBB100HttpServiceRoutes.defineRoutes(httpServer, server);
                        yield httpServer.loadRouteMap('projects/szzh/etc/cbb100-server/cbb100-server-routes.json');

                        //可以通过BeanFactory访问tcp server和http server实例
                        BeanFactory.put('cbb100TCPServer', server);
                        BeanFactory.put('cbb100HTTPServer', httpServer);

                        //设备上线、下线、报警状态同步
                        server.on(CBB100Events.DEVICE_ONLINE, CBB100ServerMain.onCBB100DeviceOnline);
                        server.on(TCPServer.EVENT_CLIENT_DISCONNECT, CBB100ServerMain.onCBB100DeviceOffline);
                        server.on(CBB100Events.DEVICE_ALARM, CBB100ServerMain.onCBB100DeviceAlarm);
                        server.on(CBB100Events.DEVICE_MSG_RECEIVED, CBB100ServerMain.onCBB100DeviceMsgReceived);
                        server.on(CBB100Events.DEVICE_REPORT_DATA, CBB100ServerMain.onCBB100DeviceReportData);

                        yield server.start();
                        yield httpServer.start();
                }

                //将所有的连接到此connector的设备全部置为离线
                static syncDeviceState2Offline() {
                        return function * () {
                                logger.info('sync state of devices which connected to Connector-'+CONNECTOR_ID+' to offline');
                                var data = {
                                        __type__ : 'offline',
                                        __connector__ : CONNECTOR_ID,
                                        IMEI : '*'
                                };
                                if(SYNC_STATE) {
                                        var queue = BeanFactory.get('redisQueue');
                                        yield queue.publish(DEVICE_STATE_SYNC_QUEUE_NAME, {}, data);
                                }
                        };
                }

                static onCBB100DeviceOnline(client) {
                        co(function * () {
                                logger.info('device online -> ' + client.IMEI);
                                var data = {
                                        __type__ : 'online',
                                        __connector__ : CONNECTOR_ID,
                                        IMEI : client.IMEI
                                };
                                if(SYNC_STATE) {
                                        logger.info('sync device ['+client.IMEI+'] to online');
                                        var queue = BeanFactory.get('redisQueue');
                                        yield queue.publish(DEVICE_STATE_SYNC_QUEUE_NAME, {}, data);
                                }
                        }).catch(function(err){
                                logger.error(err);
                        });
                }

                static onCBB100DeviceOffline (client) {
                        co(function * () {
                                if(!client.IMEI) {
                                        return;
                                }
                                logger.info('device offline -> ' + client.IMEI);
                                var data = {
                                        __type__ : 'offline',
                                        __connector__ : CONNECTOR_ID,
                                        IMEI : client.IMEI
                                };
                                var dataOfflineLog = {
                                        __type__ : 'message',
                                        __connector__ : CONNECTOR_ID,
                                        IMEI : client.IMEI,
                                        sessionId : client.getSocketId(),
                                        cmd : '0000',                                           //offline 虚拟命令字
                                        hex : ''
                                };
                                if(SYNC_STATE) {
                                        logger.info('sync device ['+client.IMEI+'] to offline');
                                        var queue = BeanFactory.get('redisQueue');
                                        yield queue.publish(DEVICE_STATE_SYNC_QUEUE_NAME, {}, data);
                                        yield queue.publish(DEVICE_STATE_SYNC_QUEUE_NAME, {}, dataOfflineLog);
                                }
                        }).catch(function(err){
                                logger.error(err);
                        });
                }

                static onCBB100DeviceAlarm(client, msg) {
                        co(function * () {
                                logger.info('device alarm -> ' + client.IMEI);
                                var data = {
                                        __type__ : 'alarm',
                                        __connector__ : CONNECTOR_ID,
                                        IMEI : client.IMEI,
                                        alarmType : msg.alarmType,
                                        alarmState : msg.alarmState,
                                        deviceTime : msg.deviceTime,
                                        lat : msg.lat,
                                        lng : msg.lng
                                };
                                if(SYNC_STATE) {
                                        logger.info('report device ['+client.IMEI+'] alarm -> ' + JSON.stringify(msg));
                                        var queue = BeanFactory.get('redisQueue');
                                        yield queue.publish(DEVICE_STATE_SYNC_QUEUE_NAME, {}, data);
                                }
                        }).catch(function(err){
                                logger.error(err);
                        });
                }

                static onCBB100DeviceMsgReceived(client, IMEI, hexMsgId, msg) {
                        co(function * () {
                                logger.info(`received device [${IMEI}] message -> 0x${hexMsgId}`);
                                var data = {
                                        __type__ : 'message',
                                        __connector__ : CONNECTOR_ID,
                                        IMEI : IMEI,
                                        sessionId : client.getSocketId(),
                                        cmd : hexMsgId,
                                        hex : msg.__original__
                                };
                                if(SYNC_STATE) {
                                        logger.info('log device ['+IMEI+'] message -> 0x' + hexMsgId);
                                        var queue = BeanFactory.get('redisQueue');
                                        yield queue.publish(DEVICE_STATE_SYNC_QUEUE_NAME, {}, data);
                                }
                        }).catch(function(err){
                                logger.error(err);
                        });
                }

                static onCBB100DeviceReportData(client, data) {
                        co(function * () {
                                logger.info('device ['+client.IMEI+'] report data');
                                EasyNode.DEBUG && logger.debug('device ['+client.IMEI+'] data -> ' + JSON.stringify(data));
                                dataLogger.info(JSON.stringify(data));
                        }).catch(function(err){
                                logger.error(err);
                        });
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100ServerMain;
})();