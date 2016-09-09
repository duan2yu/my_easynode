var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100AbstractHandler = using('szzh.cbb100.protocol.handlers.CBB100AbstractHandler');

(function () {
        /**
         * Class CBB100Handler0x0200
         *
         * @class szzh.cbb100.protocol.handlers.CBB100Handler0x0200
         * @extends szzh.cbb100.protocols.handlers.CBB100AbstractHandler
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Handler0x0200 extends CBB100AbstractHandler {
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
                                me.client.deviceData(msg, '0x0200');
                                return null;                                                                  //0x0200无应答帧
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Handler0x0200;
})();