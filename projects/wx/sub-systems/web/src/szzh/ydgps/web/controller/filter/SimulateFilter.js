var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var IRouteFilter = using('easynode.framework.server.http.IRouteFilter');
var fs = require('co-fs');

(function () {
        /**
         * Class SimulateFilter
         *
         * @class szzh.motor.console.controllers.filters.SimulateFilter
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class SimulateFilter extends IRouteFilter {
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
                                logger.warn(`do simulate [${ctx.routeId}]`);
                                var content = yield fs.readFile(EasyNode.real('projects/ydgps/sub-systems/web/simulates/' + ctx.routeId + '.json'));
                                var ret = JSON.parse(content.toString());
                                return ret;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = SimulateFilter;
})();