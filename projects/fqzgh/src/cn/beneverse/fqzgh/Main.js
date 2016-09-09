var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var BeanFactory = using('easynode.framework.BeanFactory');

(function () {
        /**
         * Class Main
         *
         * @class #NAMESPACE#.Main
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class Main extends GenericObject {
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
                                logger.info('initializing project [fqzgh]...');
                                var koaHttpServer = BeanFactory.get('httpServer');
                                koaHttpServer.addWebDirs('projects/fqzgh/www/');
                                yield koaHttpServer.start();
                        };
                }
                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = Main;
})();