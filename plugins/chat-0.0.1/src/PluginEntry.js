var assert = require('assert');
var GenericObject = using('easynode.GenericObject');
var AbstractPlugin = using('easynode.framework.plugin.AbstractPlugin');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');

(function () {
        var logger = AbstractPlugin.getPluginLogger('chat@0.0.1', __filename);
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

                /**
                 *  初始化chat插件。
                 *
                 * @method initialize
                 * @param {Object} options 初始化参数。
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                initialize(options) {
                        this.config(options);
                        //easynode.framework.cache.ICache实例
                        this.tokenStorage = options.tokenStorage;
                }

                /**
                 *  销毁插件实例，没什么可以干的。
                 *
                 * @method finalize
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                finalize() {
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = PluginEntry;
})();