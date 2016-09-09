var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var MessageHandler = using('easynode.framework.server.ws.MessageHandler');

(function () {
        /**
         * Class DemoWSMessageHandler
         *
         * @class #NAMESPACE#.DemoWSMessageHandler
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class DemoWSMessageHandler extends MessageHandler {
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
                        return function * () {
                                return new Buffer('123');
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = DemoWSMessageHandler;
})();