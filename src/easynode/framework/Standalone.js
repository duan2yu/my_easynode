var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var BeanFactory = using('easynode.framework.BeanFactory');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var Plugin = using('easynode.framework.plugin.*');

(function () {
        /**
         * Class Standalone
         *
         * @class easynode.framework.Standalone
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class Standalone extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super();
                        //调用super()后再定义子类成员。
                }

                static main () {
                        return function * () {
                                var httpServer = BeanFactory.get('httpServer');
                                httpServer.setSessionStorage(BeanFactory.get('sessionStorage').type, BeanFactory.get('sessionStorage').opts);
                                yield Plugin.EasyNodePlugin.load({
                                        koaHttpServer : httpServer
                                });
                                yield httpServer.start();
                        }
                }

                sayHello () {
                        return function * () {
                                return ActionResult.createSuccessResult('Hello, EasyNode!');
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = Standalone;
})();