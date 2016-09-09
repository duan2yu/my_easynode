var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100AbstractHandler = using('szzh.cbb100.protocol.handlers.CBB100AbstractHandler');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
var BeanFactory = using('easynode.framework.BeanFactory');
var CBB100Client = using('szzh.cbb100.protocol.CBB100Client');

(function () {
        var cache = BeanFactory.get('cache');
        /**
         * Class CBB100Handler0x0001
         *
         * @class szzh.cbb100.protocol.handlers.CBB100Handler0x0001
         * @extends szzh.cbb100.protocols.handlers.CBB100AbstractHandler
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Handler0x0001 extends CBB100AbstractHandler {
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
                                me.client.deviceData(msg, '0x0001');
                                var message = CBB100Message.createMessageById(0x0001);
                                var ackMessage = message.ackNotation(msg, me.client);
                                //确认是否电子围栏配置需要下发，如果需要下发，触发电子围栏下发事件
                                //写入cache的代码，见电子围栏的新增和修改代码
                                if(me.client.IMEI) {
                                        var dirtyFlag = yield cache.get('EF-DIRTY-' + me.client.IMEI);
                                        if(dirtyFlag === '1') {
                                                logger.info('sync electronic-fence config to device ['+me.client.IMEI+']');
                                                me.client.trigger(CBB100Client.EVENT_SYNC_EF_CONFIG, me.client);                                   //在CBB100Client类中统一处理
                                        }
                                }
                                return ackMessage;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Handler0x0001;
})();