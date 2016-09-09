var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');
var CCMS3Encoder = using('beneverse.ccms.terminal.connector.v20.CCMS3Encoder');
var net = require('net');
var co = require('co');
var thunkify = require('thunkify');
var Binary = using('easynode.framework.util.Binary');

(function () {
        const tid = '22345678';
        /**
         * Class CBB100DeviceSimulator
         *
         * @class beneverse.ccms.terminal.connector.v20.CCMS3Simulator
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3Simulator extends GenericObject {
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
                        var client = net.connect(10089, function () {
                                co(function * () {
                                        logger.error('connected');
                                        client.setNoDelay(true);
                                        //client.setEncoding('hex');
                                        var teletext = null;
                                        teletext = CCMS3Simulator.createLoginPacket();
                                        client.write(teletext, 'hex');
                                        logger.error(teletext);
                                        yield fnSleep(1000);
                                        //teletext = CBB100DeviceSimulator.createPackage0x0200();
                                        //client.write(teletext, 'hex');
                                   //     teletext = CCMS3Simulator.createGPSPackage();
                                     //   client.write(teletext, 'hex');
                                        yield fnSleep(3000000);
                                        client.destroy();
                                        logger.error('destroyed');
                                }).catch(function(err){
                                        logger.error(err);
                                });
                        });
                }

                static createLoginPacket () {
                        logger.info('simulating  login  package ');
                        var msg = CCMS3Message.createMessageById(0x000A0800);
                    //    msg = msg.notation({IMEI:IMEI});
                        msg['tid'] = tid;
                        msg['spacer'] = 0;

                        logger.error(JSON.stringify(msg));
                        var encoder = new CCMS3Encoder(null);
                        msg = encoder.encode(msg, null);
                        logger.error(msg);
                        return msg;
                }


                static createGPSPackage() {
                        logger.info('simulating package gps');
                        var msg = CCMS3Message.createMessageById(0x00050200);
                      //  msg = msg.notation({IMEI:IMEI});
                        msg['normalAlarm'] = 0;
                        msg['tempAlarm'] = 0;
                        msg['humAlarm'] = 0;
                        msg['humAlarm'] = 0;
                        msg['deviceTime'] = Binary.datetime2Bytes();
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

        module.exports = CCMS3Simulator;
})();