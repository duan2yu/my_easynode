var assert = require('assert');
var GenericObject = using('easynode.GenericObject');
var AbstractPlugin = using('easynode.framework.plugin.AbstractPlugin');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');

(function () {
        var logger = AbstractPlugin.getPluginLogger('lbs@0.0.1', __filename);
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
                 *  初始化LBS插件。
                 *
                 * @method initialize
                 * @param {Object} options 初始化参数。
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                initialize(options) {
                        this.config(options);
                        this.bookshelf = options.bookshelf;                             // database support
                        this.cache = options.cache;                                             // cache support
                }

                lbsGRPS(plmn, lac, cellId) {
                        var me = this;
                        return function * () {
                        };
                }

                lbsCMDA() {
                        var me = this;
                        return function * () {
                        };
                }

                lbsIP(ip) {
                        var me = this;
                        return function * () {
                        };
                }

                agps(lat, lng, alt) {
                        var me = this;
                        return function * () {
                        };
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