var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');
var MysqlModelGenerator = using('easynode.framework.mvc.spi.MysqlModelGenerator');
var StringUtil = using('easynode.framework.util.StringUtil');
var fs = require('co-fs');

(function () {
        /**
         * Class QueryDeviceInfo
         *
         * @class beneverse.ccms.service.actions.intranet.QueryDeviceInfo
         * @extends easynode.framework.mvc.Action
         * @since 0.1.0
         * @author zlbbq
         * */
        class QueryDeviceInfo extends Action {
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
                        this.addArg('tid string 终端编号');
                }

                authorize(ctx) {
                        return function * () {
                                //限制只能通过局域网IP调用
                                return StringUtil.isIntranet(ctx.remoteAddress);
                        };
                }

                process(ctx) {
                        return function * () {
                                //确认cache中是否存在(CFG-${DEVICE_ID})

                                //查询终端基础数据

                                //查询终端绑定关系数据

                                //查询终端配置数据

                                //写入cache, TTL 1小时

                                var f = EasyNode.real('projects/ccms3-service/www/ccms3-service/simulate/query-device.json');
                                f = yield fs.readFile(f);
                                var o = JSON.parse(f.toString());
                                return ActionResult.createSuccessResult(o);
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }

        }
        module.exports = QueryDeviceInfo;
})();