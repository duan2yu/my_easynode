var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');

(function () {
        /**
         * Class UserSessionController
         *
         * @class #NAMESPACE#.UserSessionController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class UserSessionController extends GenericObject {
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
                        this.bookshelf = null;                          //IoC injection
                        this.util = null;                                      //IoC injection, MotorConsoleUtil
                }

                login() {
                        var me = this;
                        return function * () {
                                this.validator.check('userId').necessary().end();
                                this.validator.check('userPwd').necessary().end();
                                if(this.validator.isValid()) {
                                        var user = yield me.bookshelf.knex('motor_vendor_user')
                                                .innerJoin('motor_vendor', 'motor_vendor_user.vendorId', 'motor_vendor.id')
                                                .where('motor_vendor_user.name', this.parameter.param('userId'))
                                                .andWhere('motor_vendor.status', me.util.constants.VENDOR_ENABLED)
                                                .select('motor_vendor_user.*', 'motor_vendor.name as vendorName');
                                        if(user.length == 0) {
                                                return ActionResult.createErrorResult('用户账户或密码错误');
                                        }

                                        user = user[0];
                                        if(user.vendorId != me.util.constants.ADMIN_VENDOR) {
                                                return ActionResult.createErrorResult('您不是展华用户，请在厂商管理后台登录');
                                        }
                                        if(utility.sha1(this.parameter.param('userPwd') + (user.salt || '')) !== user.password_sha) {
                                                return ActionResult.createErrorResult('用户账户或密码错误');
                                        }
                                        this.session.USER = {
                                                id : user.id,
                                                name : user.name,
                                                realName : user.realName,
                                                vendorId : user.vendorId,
                                                vendorName : user.vendorName,
                                                privileges : user.privileges || []
                                        };

                                        return ActionResult.createSuccessResult(this.session.USER);
                                }
                        };
                }

                logout() {
                        return function * () {
                                delete this.session.USER;
                                return ActionResult.createSuccessResult();
                        };
                }

                getLoginUser() {
                        return function * () {
                                return ActionResult.createSuccessResult(this.session.USER);
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = UserSessionController;
})();