var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
var CBB100Encoder = using('szzh.cbb100.protocol.CBB100Encoder');
var net = require('net');
var co = require('co');
var thunkify = require('thunkify');
var Binary = using('easynode.framework.util.Binary');

(function () {
        const IMEI = '955334050097660';
        /**
         * Class CBB100DeviceSimulator
         *
         * @class szzh.cbb100.CBB100DeviceSimulator
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100DeviceSimulator extends GenericObject {
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
                        function sleep(time, cb) {
                                setTimeout(function () {
                                        cb(null, null);
                                }, time);
                        }
                        var fnSleep = thunkify(sleep);
                        co(function * () {
                                var counter = 0;
                                var max = 1;
                                var sendPackages = true;
                                var sendDataAndAlarmPackages = false;
                                while(true) {
                                        if(counter >= max) {
                                                break;
                                        }
                                        var client = net.connect(6001, function () {
                                                co(function * () {
                                                        logger.error('connected - ' + (counter + 1));
                                                        if(sendPackages) {
                                                                client.setNoDelay(true);
                                                                //client.setEncoding('hex');
                                                                var teletext = null;
                                                                teletext = CBB100DeviceSimulator.createPackage0x0002();
                                                                client.write(teletext, 'hex');
                                                                yield fnSleep(1000);
                                                                teletext = CBB100DeviceSimulator.createPackage0x0001();
                                                                client.write(teletext, 'hex');
                                                                if(sendDataAndAlarmPackages) {
                                                                        yield fnSleep(1000);
                                                                        teletext = CBB100DeviceSimulator.createPackage0x0200();
                                                                        client.write(teletext, 'hex');
                                                                        yield fnSleep(1000);
                                                                        teletext = CBB100DeviceSimulator.createPackage0x0202();
                                                                        client.write(teletext, 'hex');
                                                                        yield fnSleep(1000);
                                                                        client.destroy();
                                                                        logger.error('destroyed');
                                                                }
                                                        }
                                                }).catch(function (err) {
                                                        logger.error(err);
                                                });
                                        });
                                        client.on('error', function(err){
                                                logger.error(err);
                                        });
                                        yield fnSleep(1);
                                        counter ++;
                                }
                        }).catch(function(err){logger.error(err);});
                }

                static createPackage0x0200 () {
                        logger.info('simulating package 0x0200');
                        var msg = CBB100Message.createMessageById(0x0200);
                        msg = msg.notation({IMEI:IMEI});
                        msg['gpsState'] = 1;
                        msg['vehicleState'] = 0;
                        msg['movement'] = 1;
                        msg['reportState'] = 0;
                        msg['ACCState'] = 0;
                        msg['lat1'] = 0;
                        msg['lng1'] = 0;
                        msg['odometerOfDay'] = 300;
                        msg['rideTimeOfDay'] = 102;
                        msg['speed'] = 100;
                        msg['direction'] = 200;
                        msg['altitude'] = 34;
                        msg['lat2'] = 30.204642 * 600000;
                        msg['lng2'] = 120.206068 * 600000;
                        msg['deviceTime'] = Binary.datetime2Bytes();
                        msg['plmn'] = '46000';
                        msg['lac'] = 10001;
                        msg['cellId'] = 35673;

                        logger.error(JSON.stringify(msg));
                        var encoder = new CBB100Encoder(null);
                        msg = encoder.encode(msg, null);
                        logger.error(msg);
                        return msg;
                }

                static createPackage0x0001() {
                        logger.info('simulating package 0x0001');
                        var msg = CBB100Message.createMessageById(0x0001);
                        msg = msg.notation({IMEI:IMEI});
                        var encoder = new CBB100Encoder(null);
                        msg = encoder.encode(msg, null);
                        logger.error(msg);
                        return msg;
                }

                static createPackage0x0002() {
                        logger.info('simulating package 0x0002');
                        var msg = CBB100Message.createMessageById(0x0002);
                        msg = msg.notation({IMEI:IMEI});
                        msg['msgVersion'] = 1;
                        msg['deviceTime'] = Binary.datetime2Bytes();
                        msg['deviceModel'] = 'CBB-100H';
                        logger.error(JSON.stringify(msg));
                        var encoder = new CBB100Encoder(null);
                        msg = encoder.encode(msg, null);
                        logger.error(msg);
                        return msg;
                }

                static createPackage0x0202() {
                        logger.info('simulating package 0x0202');
                        var msg = CBB100Message.createMessageById(0x0202);
                        msg = msg.notation({IMEI:IMEI});
                        //ALARM DATA
                        msg['alarmType'] = 0x01;
                        msg['alarmState'] = 0x00;
                        //GPS DATA
                        msg['gpsState'] = 1;
                        msg['vehicleState'] = 0;
                        msg['movement'] = 1;
                        msg['reportState'] = 0;
                        msg['ACCState'] = 1;
                        msg['lat1'] = 0;
                        msg['lng1'] = 0;
                        msg['odometerOfDay'] = 300;
                        msg['rideTimeOfDay'] = 102;
                        msg['speed'] = 100;
                        msg['direction'] = 200;
                        msg['altitude'] = 34;
                        msg['lat2'] = 30.204642 * 600000;
                        msg['lng2'] = 120.206068 * 600000;
                        msg['deviceTime'] = Binary.datetime2Bytes();
                        msg['plmn'] = '46000';
                        msg['lac'] = 10001;
                        msg['cellId'] = 35673;
                        logger.error(JSON.stringify(msg));
                        var encoder = new CBB100Encoder(null);
                        msg = encoder.encode(msg, null);
                        logger.error(msg);
                        return msg;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100DeviceSimulator;
})();