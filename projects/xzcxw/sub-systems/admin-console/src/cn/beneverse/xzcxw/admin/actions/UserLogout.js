var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');
var MysqlModelGenerator = using('easynode.framework.mvc.spi.MysqlModelGenerator');

(function () {
        /**
         * Class UserLogout
         *
         * @class easynode.plugin.rbac.actions.UserLogout
         * @extends easynode.framework.mvc.Action
         * @since 0.1.0
         * @author zlbbq
         * */
        class UserLogout extends Action {
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

                process(ctx) {
                        return function * () {
                                delete ctx.session.USER;
                                return ActionResult.createSuccessResult();
                        };
                }

                datasourceSupport () {
                        return false;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }

        }
        module.exports = UserLogout;
})();