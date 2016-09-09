var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x020E
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x020E
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x020E extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x020E);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        return [
                                'controlResult:BYTE',                                                //操作结果
                                'controlType:BYTE',                                                   //模式级别，???
                                'monitorMobile:STRING:12',                                  //儿童机监听手机号
                                'reversed_0x020E:BYTES:7'                                     //保留字段
                        ];
                }

                getAckMsgId() {
                        return CBB100Message.NO_ACK;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x020E;
})();