var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x0206
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x0206
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x0206 extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x0206);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        return [
                                'power:BYTE',                                                              //电量1-5, 5表示最大
                                'powerBT:BYTE',                                                         //蓝牙感应器电量
                                'SMSSent:WORD',                                                       //当月发送的短信条数
                                'phoneCallAnswered:BYTE',                                    //当月车主接听电话次数
                                'reversed_0x0206:BYTES:19'                                   //保留字段
                        ];
                }

                getAckMsgId() {
                        return 0x8206;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x0206;
})();