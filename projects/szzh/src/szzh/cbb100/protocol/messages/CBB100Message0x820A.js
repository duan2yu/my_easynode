var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x820A
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x820A
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x820A extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x820A);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        return [
                                'paramMask:DWORD',
                                'workModeMask:BIT:BIT($paramMask,1)',
                                'reportGPSMask:BIT:BIT($paramMask,2)',
                                'alarmMobileMask:BIT:BIT($paramMask,3)',
                                'alarmSpeedyMask:BIT:BIT($paramMask,4)',
                                'clearHistoryMask:BIT:BIT($paramMask,5)',
                                'alarmTypeMask:BIT:BIT($paramMask,6)',
                                'workMode:BYTE',
                                'reportGPS:BYTE',
                                'alarmMobile:STRING:16',
                                'speedLimit:BYTE',
                                'speedyDuration:BYTE',
                                'clearSMSHistory:BYTE',
                                'clearPhoneCallHistory:BYTE',
                                'alarmType:BYTE',
                                'reserved_0x820A:BYTES:29'
                        ];
                }

                getAckMsgId() {
                        return 0x020A;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x820A;
})();