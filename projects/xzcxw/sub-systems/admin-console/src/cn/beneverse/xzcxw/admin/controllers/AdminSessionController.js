var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var BasicController = using('cn.beneverse.xzcxw.admin.controllers.BasicController');
var utility = require('utility');

(function () {
        /**
         * Class AdminSessionController
         *
         * @class #NAMESPACE#.AdminSessionController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class AdminSessionController extends BasicController {
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
                 * @api {get/post} /api/admin/login 管理员登录
                 * @apiName adminLogin
                 * @apiGroup Session Management
                 * @apiParam {String} adminId 管理员用户名
                 * @apiParam {String} adminPwd 管理员密码
                 * @apiParam {String} smsCaptcha 短信验证码（调用前请先使用短信验证码下发接口下发短信验证码）
                 *
                 * @apiSuccess {Number} id 管理员用户ID
                 * @apiSuccess {String} name 管理员用户名
                 * @apiSuccess {String} realName 管理员姓名
                 * @apiSuccess {String} mobile 管理员手机号码
                 * @apiSuccess {Array} privileges 管理员权限，字符串数组
                 *
                 * */

                login() {
                        var me = this;
                        return function * () {
                                //this.validator.check('adminId').necessary().end();
                                //this.validator.check('adminPwd').necessary().end();
                                //this.validator.check('smsCaptcha').necessary().end();

                                if(this.validator.isValid()) {
                                        return ActionResult.createNoImplementationError();
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

        module.exports = AdminSessionController;
})();