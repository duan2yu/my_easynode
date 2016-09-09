var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');

(function () {
        /**
         * Class CCMS3Message0x000A0800
         *
         * @class beneverse.ccms.terminal.connector.v20.messages.CCMS3Message0x000A0800
         * @extends beneverse.ccms.terminal.connector.v20.messages.CCMS3Message
         * @since 1.0.0
         * @author duansj
         * */
        class CCMS3Message0x000A0800 extends CCMS3Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 1.0.0
                 * @author duansj
                 * */
                constructor() {
                        super(0x000A0800);
                        //调用super()后再定义子类成员。
                }


                getStructDescription(msg) {
                        return [
                                'spacer:BYTES:12',
                                'tid:STRING:8'
                        ];
                }

                getAckMsgId() {
                        return CCMS3Message.NO_ACK;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3Message0x000A0800;
})();