var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');

(function () {
        /**
         * Class CCMS3Message0x00010500
         *
         * @class beneverse.ccms.terminal.connector.v20.messages.CCMS3Message0x00010500
         * @extends beneverse.ccms.terminal.connector.v20.messages.CCMS3Message
         * @since 1.0.0
         * @author duansj
         * */
        class CCMS3Message0x00010500 extends CCMS3Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 1.0.0
                 * @author duansj
                 * */
                constructor() {
                        super(0x00010500);
                        //调用super()后再定义子类成员。
                }


                getStructDescription(msg) {
                        return [
                                'spacer:BYTES:2',
                                '$dynamic:getResponseMsg',
                                'endFlag:BYTES:2'
                        ];
                }

                getAckMsgId() {
                        return CCMS3Message.NO_ACK;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3Message0x00010500;
})();