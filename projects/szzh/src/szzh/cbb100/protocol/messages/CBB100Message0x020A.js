var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x020A
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x020A
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x020A extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x020A);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        return [
                                'paramACKMask:DWORD',
                                'workModeMask:BIT:BIT($paramACKMask,1)',
                                'reportGPSMask:BIT:BIT($paramACKMask,2)',
                                'alarmMobileMask:BIT:BIT($paramACKMask,3)',
                                'alarmSpeedyMask:BIT:BIT($paramACKMask,4)',
                                'clearHistoryMask:BIT:BIT($paramACKMask,5)',
                                'alarmTypeMask:BIT:BIT($paramACKMask,6)',
                                'workMode:BYTE',
                                'reportGPS:BYTE',
                                'alarmMobile:BYTE',
                                'speedyLimit:BYTE',
                                'clearHistory:BYTE',
                                'alarmType:BYTE',
                                'reserved_0x020A:BYTES:46'
                        ];
                }

                getAckMsgId() {
                        return CBB100Message.NO_ACK;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x020A;
})();