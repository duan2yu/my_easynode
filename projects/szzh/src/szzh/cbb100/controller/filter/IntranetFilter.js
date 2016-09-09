var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var IRouteFilter = using('easynode.framework.server.http.IRouteFilter');
var fs = require('co-fs');
var StringUtil = using('easynode.framework.util.StringUtil');

(function () {
        const INTRANET_ONLY = StringUtil.switchState(EasyNode.config('http.service.control.intranetOnly', '1'));
        /**
         * Class IntranetFilter
         *
         * @class szzh.motor.console.controllers.filters.IntranetFilter
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class IntranetFilter extends IRouteFilter {
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
                                if(INTRANET_ONLY) {
                                        var remoteAddr = this.remoteAddress;
                                        logger.error(remoteAddr);
                                        var intranetIPRegExp = new RegExp("^((192\.168|172\.([1][6-9]|[2]\d|3[01]))(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){2}|10(\.([2][0-4]\d|[2][5][0-5]|[01]?\d?\d)){3})$");
                                        if (!intranetIPRegExp.test(remoteAddr)) {
                                                return ActionResult.createErrorResult('只能通过局域网调用此接口');
                                        }
                                }
                                return yield next;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = IntranetFilter;
})();