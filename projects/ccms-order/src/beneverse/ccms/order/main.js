var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var BeanFactory = using('easynode.framework.BeanFactory');

(function () {
        /**
         * Class MotorConsoleMain
         *
         * @class #NAMESPACE#.MotorConsoleMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class MotorConsoleMain extends GenericObject {
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

                static main() {
                        return function * () {
                                var koaHttpServer = BeanFactory.get('httpServer');
                                koaHttpServer.addWebDirs('projects/ccms-order/www/');
                                yield koaHttpServer.start();
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = MotorConsoleMain;
})();