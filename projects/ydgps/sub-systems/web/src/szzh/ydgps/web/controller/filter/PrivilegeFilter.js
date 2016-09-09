var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var IRouteFilter = using('easynode.framework.server.http.IRouteFilter');

(function () {
        const PRIVILEGES = [];
        const WHITELIST = [
                'userLogin'
        ];

        /**
         * Class PrivilegeFilter
         *
         * @class szzh.motor.console.controllers.filters.PrivilegeFilter
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class PrivilegeFilter extends IRouteFilter {
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

                filter (ctx, next) {
                        var me = this;
                        return function * () {
                                EasyNode.DEBUG && logger.debug(`checking privilege [${ctx.routeId}][${JSON.stringify(ctx.session.USER)}]`);
                                if(WHITELIST.indexOf(ctx.routeId)==-1&&ctx.session.USER == null) {
                                        return ActionResult.createErrorResult('用户未登录');
                                }

                             /*   logger.error(JSON.stringify(this.params));
                                logger.error(JSON.stringify(this.parameter.paramNames()));
                                logger.error(JSON.stringify(this.p('userId')));
                                logger.error(JSON.stringify(this.p('roleId')));
                                logger.error(JSON.stringify(ctx.p('userId')));
*/
                                var fn = me[ctx.routeId];
                                if(typeof fn == 'function') {
                                        var ret  = fn.call(me, ctx);
                                        if(ret) {
                                                return ret;
                                        }
                                }
                                return yield next;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = PrivilegeFilter;
})();