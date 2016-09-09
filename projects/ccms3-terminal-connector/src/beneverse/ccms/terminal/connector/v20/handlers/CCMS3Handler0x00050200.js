var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CCMS3AbstractHandler = using('beneverse.ccms.terminal.connector.v20.handlers.CCMS3AbstractHandler');
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');
var BeanFactory = using('easynode.framework.BeanFactory');

(function () {
        var mq = BeanFactory.get('mq');
        const queueName = EasyNode.config('app.mq.gspQueueName');
        /**
         * Class CCMS3Handler0x00050200
         *
         * @class beneverse.ccms.terminal.connector.v20.handlers.CCMS3Handler0x00050200
         * @extends beneverse.ccms.terminal.connector.v20.handlers.CCMS3AbstractHandler
         * @since 0.1.0
         * @author duansj
         * */
        class CCMS3Handler0x00050200 extends CCMS3AbstractHandler {
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
                                //push to redis queue
                                if(msg.tid!=me.client.getAlias())
                                {
                                        logger.warn("收到一条来自["+msg.tid+"]的GPS数据包,但会话中没有该终端的登录信息,丢弃报文并断开连接!")
                                        me.server.disconnect(me.client.socket.SOCKET_ID,'上报数据中的终端编号['+msg.tid+']和会话中的编号['+me.client.getAlias()+']不一致');
                                        return null;
                                }
                                logger.info(`push gps data tid -> [${msg.tid}]`);
                                msg.rcURL = me.client.getDeviceRCBaseURL();
                                yield mq.publish(queueName, {}, msg);
                                var message = CCMS3Message.createMessageById(0x00050200);
                                message.result='OK';
                                message.end=[0x0D,0X0A];
                                message.setDirection('D');
                                return message;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3Handler0x00050200;
})();