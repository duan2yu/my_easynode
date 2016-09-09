var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x0002
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x0002
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x0002 extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x0002);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        var v0 = [
                                'deviceTime:BYTES:6',                                               //终端时间
                                'IMSI:STRING:17',                                                       //终端IMEI号
                                'deviceModel:STRING:15',                                       //终端型号
                                'softwareVersion:STRING:15'                                 //终端软件版本
                        ];
                        var v1 = [
                                'deviceTime:BYTES:6',
                                'IMSI:STRING:17',
                                'deviceModel:STRING:15',
                                'softwareVersion:STRING:15',
                                'reversedBytes:BYTES:20'                                        //保留字节
                        ];
                        const V0_LEN = 0;
                        const V1_LEN = 1;
                        switch (msg['msgVersion']) {
                                case V0_LEN :
                                        return v0;
                                case V1_LEN :
                                        return v1;
                        }
                }

                convert(msg, client) {
                        var buf = new Buffer(msg['deviceTime']);
                        msg['deviceTime'] = CBB100Message0x0002.clientTime2String(buf);
                        return msg;
                }

                static clientTime2String(buf) {
                        var year = '' + (2000 + buf[0]);
                        var month = buf[1] < 10 ? ('0' + buf[1]) : ('' + buf[1]);
                        var day = buf[2] < 10 ? ('0' + buf[2]) : ('' + buf[2]);
                        var hours = buf[3] < 10 ? ('0' + buf[3]) : ('' + buf[3]);
                        var minutes = buf[4] < 10 ? ('0' + buf[4]) : ('' + buf[4]);
                        var seconds = buf[5] < 10 ? ('0' + buf[5]) : ('' + buf[5]);
                        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
                }

                getAckMsgId() {
                        return 0x8002;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x0002;
})();