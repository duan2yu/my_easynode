var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var MessageHandler = using('easynode.framework.server.tcp.MessageHandler');
var StringUtil = using('easynode.framework.util.StringUtil');
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');
var co = require('co');
var _ = require('underscore');

(function () {
        /**
         * Class CBB100MessageHandler
         *
         * @class beneverse.ccms.terminal.connector.v20.CCMS3MessageHandler
         * @extends easynode.framework.server.tcp.MessageHandler
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3MessageHandler extends MessageHandler {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(server) {
                        super(server);
                        //调用super()后再定义子类成员。
                }

                handleMessage(msg, client) {
                        var me = this;
                        return function * () {
                                var hexMsgId = StringUtil.int2Hex(msg['msgId']);
                                if(!_.contains(CCMS3Message.SUPPORTED_CMDS, msg['msgId'])) {
                                        logger.warn(`Unsupported cmd -> [0x${hexMsgId}]`);
                                        return null;
                                }
                                EasyNode.DEBUG && logger.debug(`handle message -> 0x${hexMsgId}`);
                                var handlerClassName = 'beneverse.ccms.terminal.connector.v20.handlers.CCMS3Handler0x' + hexMsgId;
                                var message = CCMS3Message.createMessageById(msg['msgId']);
                                if(message) {
                                        msg = message.convert(msg, client);
                                }
                                EasyNode.DEBUG && logger.debug(`request message : ` + JSON.stringify(msg));
                                var Handler = using(handlerClassName, false);
                                var eventName = 'msg-handle-able-0x' + hexMsgId;
                                EasyNode.DEBUG && logger.debug(`trigger event [${eventName}]`);
                                if (!Handler) {
                                        logger.warn(`message handler class for [0x${hexMsgId}] is not found -> [${handlerClassName}]`);
                                        process.nextTick(function(){
                                                client.trigger(eventName, null, msg);         //thunkify 兼容，第一个消息参数null表示一个Error实例，第二个消息参数表示实际值
                                        });
                                }
                                else {
                                        var handler = new Handler(client, me.server);
                                        process.nextTick(function(){
                                                client.trigger(eventName, null, msg);         //thunkify 兼容，第一个消息参数null表示一个Error实例，第二个消息参数表示实际值
                                        });
                                        var retMsg = yield handler.handleMessage(msg);
                                        EasyNode.DEBUG && logger.debug('response message -> ' + JSON.stringify(retMsg));
                                        return retMsg;
                                }
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3MessageHandler;
})();