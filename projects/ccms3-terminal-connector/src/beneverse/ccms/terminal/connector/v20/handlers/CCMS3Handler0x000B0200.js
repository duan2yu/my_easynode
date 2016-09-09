var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CCMS3AbstractHandler = using('beneverse.ccms.terminal.connector.v20.handlers.CCMS3AbstractHandler');
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');

(function () {
        /**
         * Class CCMS3Handler0x000B0200
         *
         * @class beneverse.ccms.terminal.connector.v20.handlers.CCMS3Handler0x000B0200
         * @extends beneverse.ccms.terminal.connector.v20.handlers.CCMS3AbstractHandler
         * @since 0.1.0
         * @author duansj
         * */
        class CCMS3Handler0x000B0200 extends CCMS3AbstractHandler {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(client, server) {
                        super(client, server);
                        //调用super()后再定义子类成员。
                }

                //处理消息, 这里的msg是processMessage处理过的消息
                handleMessage(msg) {
                        var me = this;
                        return function * () {
                                if(me.client.getAlias())
                                logger.debug('收到一条来自'+me.client.getAlias()+'的心跳包');
                            //    me.client.deviceData(msg, '0x000B0200');
                           //     var message = CCMS3Message.createMessageById(0x000B0200);
                            //    var ackMessage = message.ackNotation(msg, me.client);
                                return null;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3Handler0x000B0200;
})();