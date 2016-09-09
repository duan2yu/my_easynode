var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class IRouteFilter
         *
         * @class easynode.framework.server.http.IRouteFilter
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class IRouteFilter extends GenericObject {
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
                 * 过滤方法。
                 *
                 * @method filter
                 * @param {koaCtx} ctx
                 * @param {generator} next 下一个过滤方法。
                 * @return {Object}
                 * @since 0.1.0
                 * @async
                 * @author zlbbq
                 * */
                filter(ctx, next) {
                        return function * () {
                                throw new Error('Abstract Method');
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = IRouteFilter;
})();