var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x8204
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x8204
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x8204 extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x8204);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        return [
                                'resultCode_0x8204:BYTE'                                       //结果应答
                        ];
                }

                getAckMsgId() {
                        return CBB100Message.NO_ACK;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        CBB100Message0x8204.RESULT_CODE_CONFIRMED = 0;
        CBB100Message0x8204.RESULT_CODE_FAIL = 1;
        CBB100Message0x8204.RESULT_CODE_INVALID_MESSAGE = 2;
        CBB100Message0x8204.RESULT_CODE_UNSUPPORTED = 3;

        module.exports = CBB100Message0x8204;
})();