var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class CBB100AbstractHandler
         *
         * @class szzh.cbb100.protocols.handlers.CBB100AbstractHandler
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100AbstractHandler extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(client, server) {
                        super();
                        //调用super()后再定义子类成员。
                        this.client = client;
                        this.server = server;
                        this.redis = null;      //TODO inject redis instance
                }

                //预处理消息，通常是消息字段再计算和值转换，甚至是对象转换
                convertMessage(msg) {
                        return function * () {
                                return msg;
                        };
                }

                //处理消息, 这里的msg是processMessage处理过的消息
                handleMessage(msg) {
                        return function * () {
                                return null;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100AbstractHandler;
})();