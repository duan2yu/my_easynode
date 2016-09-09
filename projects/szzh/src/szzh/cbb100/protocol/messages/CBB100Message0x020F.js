var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x020F
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x020F
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x020F extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x020F);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        return [
                                'syncEFResult:BYTE',                                                //设置电子围栏应答结果
                                'version0x020F:DWORD'                                          //设备动作对应的版本号
                        ];
                }

                getAckMsgId() {
                        return CBB100Message.NO_ACK;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x020F;
})();