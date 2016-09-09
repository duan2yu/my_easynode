var assert = require('assert');
var GenericObject = using('easynode.GenericObject');
var AbstractPlugin = using('easynode.framework.plugin.AbstractPlugin');

(function () {
        var logger = AbstractPlugin.getPluginLogger('test@1.0.1', __filename);
        /**
         * Class PluginEntry
         *
         * @class PluginEntry
         * @extends easynode.framework.plugin.AbstractPlugin
         * @since 0.1.0
         * @author zlbbq
         * */
        class PluginEntry extends AbstractPlugin {
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

                initialize(options) {
                        logger.info('initialize');
                        logger.info(JSON.stringify(options));
                }

                finalize() {
                        logger.info('finalize');
                }

                sayHello() {
                        logger.info('HELLO, PLUGIN');
                        logger.error(this.config('plugin.test.abc'));
                        logger.error(this.config('aaaaa'));
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = PluginEntry;
})();