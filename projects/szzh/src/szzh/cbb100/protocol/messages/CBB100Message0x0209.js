var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x0209
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x0209
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x0209 extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x0209);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        return [
                                'reversed_0x0209:BYTES:20'                                   //保留字段
                        ];
                }

                getAckMsgId() {
                        return 0x8209;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x0209;
})();