var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class ISessionStore
         *
         * @class easynode.framework.server.http.ISessionStore
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class ISessionStore extends GenericObject {
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
                 *  get函数，获取一个session。
                 *
                 * @method get
                 * @param {string} sid session id
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                get (sid) {
                        throw new Error('Abstract Method');
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
                        throw new Error('Abstract Method');
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
                        throw new Error('Abstract Method');
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = ISessionStore;
})();