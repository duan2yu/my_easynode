var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100AbstractHandler = using('szzh.cbb100.protocol.handlers.CBB100AbstractHandler');
var BeanFactory = using('easynode.framework.BeanFactory');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        const CONNECTOR_ID = EasyNode.config('connector.id', '000');
        const ENTER_ELECTRONIC_FENCE = '6';
        const LEAVE_ELECTRONIC_FENCE = '7';
        var queue = BeanFactory.get('redisQueue');
        /**
         * Class CBB100Handler0x0210
         *
         * @class szzh.cbb100.protocol.handlers.CBB100Handler0x0210
         * @extends szzh.cbb100.protocols.handlers.CBB100AbstractHandler
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Handler0x0210 extends CBB100AbstractHandler {
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
                                me.client.deviceData(msg, '0x0210');
                                //将报警通知放入队列
                                var data = {
                                        __type__ : 'alarm',
                                        __connector__ : CONNECTOR_ID,
                                        IMEI : me.client.IMEI,
                                        alarmType : msg['efDirection'] === 0 ? ENTER_ELECTRONIC_FENCE : LEAVE_ELECTRONIC_FENCE,
                                        alarmState : '1',                       //固定为1，报警
                                        efId : msg['efId'],
                                        deviceTime : msg['deviceTime']
                                };
                                EasyNode.DEBUG && logger.info('report device ['+me.client.IMEI+'] electronic fence alarm -> ' + JSON.stringify(data));
                                yield queue.publish(DEVICE_STATE_SYNC_QUEUE_NAME, {}, data);
                                var message = CBB100Message.createMessageById(0x0210);
                                var ackMessage = message.ackNotation(msg, me.client);
                                ackMessage['efId'] = msg['efId'];
                                ackMessage['efAlarmResult'] = 0;                             //成功确认
                                return ackMessage;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Handler0x0210;
})();