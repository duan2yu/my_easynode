var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100AbstractHandler = using('szzh.cbb100.protocol.handlers.CBB100AbstractHandler');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Handler0x020A
         *
         * @class szzh.cbb100.protocol.handlers.CBB100Handler0x020A
         * @extends szzh.cbb100.protocols.handlers.CBB100AbstractHandler
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Handler0x020A extends CBB100AbstractHandler {
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
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Handler0x020A;
})();