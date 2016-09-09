var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100AbstractHandler = using('szzh.cbb100.protocol.handlers.CBB100AbstractHandler');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
var CBB100Events = using('szzh.cbb100.CBB100Events');

(function () {
        /**
         * Class CBB100Handler0x0202
         *
         * @class szzh.cbb100.protocol.handlers.CBB100Handler0x0202
         * @extends szzh.cbb100.protocols.handlers.CBB100AbstractHandler
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Handler0x0202 extends CBB100AbstractHandler {
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
                                me.client.deviceData(msg, '0x0202');
                                me.server.trigger(CBB100Events.DEVICE_ALARM, me.client, msg);
                                var message = CBB100Message.createMessageById(0x0202);
                                var ackMessage = message.ackNotation(msg, me.client);
                                ackMessage['ackResult'] = 0;
                                return ackMessage;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Handler0x0202;
})();