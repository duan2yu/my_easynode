var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x8002
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x8002
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x8002 extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x8002);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        var v0 = [
                                'loginACK:BYTE',
                                'serviceExpired:BYTES:3',
                                'simExpired:BYTES:3',
                                'serverTime:BYTES:6',
                                'redirectFlag:BYTE',
                                'redirectServer:DWORD',
                                'redirectPort:WORD',
                                'userPWD:STRING:10'
                        ];

                        var v1 = [
                                'loginACK:BYTE',
                                'serviceExpired:BYTES:3',
                                'simExpired:BYTES:3',
                                'serverTime:BYTES:6',
                                'redirectFlag:BYTE',
                                'redirectServer:DWORD',
                                'redirectPort:WORD',
                                'userPWD:BYTES:10',
                                'micSensibility:BYTE',
                                'alarmType:BYTE',
                                'maxSMS:WORD',
                                'reportIntervalM:BYTE',
                                'reportIntervalS:BYTE',
                                'gpsTimeOffset:WORD',
                                'workMode:BYTE',
                                'reportGPS:BYTE',
                                'g2SleepMinutes:WORD',                          //CBB-100G2专用，睡眠时长，单位分钟，实现定时上报
                                'g2KeepAliveMinutes:WORD',                  //CBB-100G2专用，打开时长，单位分钟，实现保持在线，为0时表示立即关闭
                                'maxPhoneCall:BYTE',
                                'reversed_0x8002:BYTES:7'
                        ];

                        const V0_LEN = 0;
                        const V1_LEN = 1;
                        switch (msg['msgVersion']) {
                                case V0_LEN :
                                        return v0;
                                case V1_LEN :
                                        return v1;
                                default :
                                {
                                        throw new Error(`Invalid message version => [${msg['msgVersion']}]`);
                                }
                        }
                }

                getAckMsgId() {
                        return CBB100Message.NO_ACK;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x8002;
})();