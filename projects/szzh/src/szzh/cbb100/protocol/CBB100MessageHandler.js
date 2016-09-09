var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var MessageHandler = using('easynode.framework.server.tcp.MessageHandler');
var StringUtil = using('easynode.framework.util.StringUtil');
var co = require('co');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
var CBB100Events = using('szzh.cbb100.CBB100Events');
var _ = require('underscore');

(function () {
        /**
         * Class CBB100MessageHandler
         *
         * @class szzh.cbb100.protocol.CBB100MessageHandler
         * @extends easynode.framework.server.tcp.MessageHandler
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100MessageHandler extends MessageHandler {
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
                                var IMEI = client.IMEI || client.getSocketId();
                                var hexMsgId = StringUtil.short2Hex(msg['msgId']);
                                if(!_.contains(CBB100Message.SUPPORTED_CMDS, msg['msgId'])) {
                                        logger.warn(`Unsupported cmd [${IMEI}] -> [0x${hexMsgId}]`);
                                        return null;
                                }
                                logger.info(`handling message [${IMEI}] -> 0x${hexMsgId}`);
                                var handlerClassName = 'szzh.cbb100.protocol.handlers.CBB100Handler0x' + hexMsgId;
                                var message = CBB100Message.createMessageById(msg['msgId']);
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
                                        //触发msg-handle-able事件
                                        process.nextTick(function(){
                                                client.trigger(eventName, null, msg);         //thunkify 兼容，第一个消息参数null表示一个Error实例，第二个消息参数表示实际值
                                        });
                                        IMEI = client.IMEI || msg['IMEI'] || client.getSocketId();
                                        //触发device-msg-received事件
                                        me.server.trigger(CBB100Events.DEVICE_MSG_RECEIVED, client, IMEI, hexMsgId, msg);
                                        var retMsg = yield handler.handleMessage(msg);
                                        logger.info(`handled message [${IMEI}] -> 0x${hexMsgId}`);
                                        EasyNode.DEBUG && logger.debug('response message ['+IMEI+'] -> ' + JSON.stringify(retMsg));
                                        return retMsg;
                                }
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100MessageHandler;
})();