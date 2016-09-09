var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ISessionStore = using('easynode.framework.server.http.ISessionStore');

(function () {
        /**
         * KOAHttpServer session的内存存储，注意，内存存储仅供开发使用，并且不支持TTL，线上产品请使用redis或后续将支持的memcached等 。
         *
         * @class easynode.framework.server.KOACacheSessionStorage
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */

        class KOACacheSessionStorage extends ISessionStore {
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
                         * sentinel redis实例
                         *
                         * @property cache
                         * @type easynode.framework.cache.ICache
                         * @public
                         *
                         * */
                        this.cache = null;
                }

                /**
                 *  get函数，获取一个session。
                 *
                 * @method get
                 * @param {string} sid session id
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                get (sid) {
                        var me = this;
                        return function * () {
                                return yield me.cache.get(sid);
                        };
                }

                /**
                 *  set函数，获取一个session。
                 *
                 * @method set
                 * @async
                 * @param {string} sid session id
                 * @param {object} sess session 对象
                 * @param {int} ttl, 超时时间，单位：秒
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                set (sid, sess, ttl) {
                        var me = this;
                        return function * () {
                                yield me.cache.set(sid, sess, ttl);
                        };
                }

                /**
                 *  destroy函数，销毁一个session。
                 *
                 * @method destroy
                 * @async
                 * @param {string} sid session id
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                destroy (sid) {
                        var me = this;
                        return function * () {
                                return yield me.cache.del(sid);
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = KOACacheSessionStorage;
})();