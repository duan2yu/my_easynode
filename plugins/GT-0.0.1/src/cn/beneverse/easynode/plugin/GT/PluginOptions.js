var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class PluginOptions
         *
         * @class cn.beneverse.easynode.plugin.GT.PluginOptions
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class PluginOptions extends GenericObject {
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

                        /**
                         *  个推APP_ID。
                         *
                         * @property APP_ID
                         * @type String
                         * @public
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.APP_ID = null;

                        /**
                         *  个推APP_KEY。
                         *
                         * @property APP_KEY
                         * @type String
                         * @public
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.APP_KEY = null;

                        /**
                         *  个推MASTER_SECRET。
                         *
                         * @property MASTER_SECRET
                         * @type String
                         * @public
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.MASTER_SECRET = null;

                        /**
                         *  消息离线存储时间，默认24小时。单位：毫秒
                         *
                         * @property offlineExpireTime
                         * @type int
                         * @default
                         * @public
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.offlineExpireTime = PluginOptions.OFFLINE_EXPIRE_24H;

                        /**
                         *  透传消息类型，TRANSMISSION_TYPE_AUTO_OPEN_APP或TRANSMISSION_TYPE_WAIT_APP_OPEN
                         *
                         * @property transmissionType
                         * @type int
                         * @default TRANSMISSION_TYPE_WAIT_APP_OPEN
                         * @public
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.transmissionType = PluginOptions.TRANSMISSION_TYPE_WAIT_APP_OPEN;

                        /**
                         *  cache实例，用于指定客户端缓存
                         *
                         * @property cache
                         * @type easynode.framework.cache.ICache
                         * @public
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.cache = null;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        PluginOptions.TRANSMISSION_TYPE_AUTO_OPEN_APP = 1;
        PluginOptions.TRANSMISSION_TYPE_WAIT_APP_OPEN = 2;
        PluginOptions.OFFLINE_EXPIRE_24H = 24 * 3600 * 1000;

        module.exports = PluginOptions;
})();