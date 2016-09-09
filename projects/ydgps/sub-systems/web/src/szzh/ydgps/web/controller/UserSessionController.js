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
                        this.bookshelf = null;
                        this.rbacPlugin=null; //IoC injection
                }

                /**
                 * @api {post} /api/user/login 用户登录
                 * @apiName UserLogin
                 * @apiGroup User
                 *
                 * @apiParam {String} name *  用户名
                 * @apiParam {String} pwd * 用户密码
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result 登录用户的信息
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                //http://localhost:10000/api/user/login?name=admin&pwd=123456
                login() {
                        var me = this;
                        return function * () {
                                this.validator.check('name').necessary().end();
                                this.validator.check('pwd').necessary().end();
                                if (this.validator.isValid()) {
                                        var user = yield me.bookshelf.knex('group_user_info')
                                                .leftJoin('group_info', 'group_user_info.groupId', 'group_info.id')
                                                .leftJoin('rbac_role','group_user_info.roleId','rbac_role.id')
                                                .where('group_user_info.name', this.p('name'))
                                                .select('group_user_info.*','group_info.name  as groupName','rbac_role.roleName');
                                        if(user.length == 0) {
                                                return ActionResult.createErrorResult('用户账户或密码错误');
                                        }
                                        user = user[0];
                                        if(utility.sha1(this.parameter.param('pwd') + (user.salt || '')) !== user.pwd) {
                                                return ActionResult.createErrorResult('用户账户或密码错误');
                                        }
                                        delete user.pwd;
                                        delete user.salt;

                                        //查询权限列表
                                      var privileges=yield me.rbacPlugin.queryBindPrivileges(user.roleId);
                                       user.privileges=privileges;


                                        var ret=yield me.bookshelf.knex('user_deviceGroup')
                                                .leftJoin('device_group','user_deviceGroup.deviceGroupId','device_group.id')
                                                .where('user_deviceGroup.userId',user.id)
                                                .select('device_group.*');

                                        user.deviceGroups=ret;

                                        this.session.USER =user;
                                        return ActionResult.createSuccessResult(this.session.USER);
                                }
                        };
                }

                /**
                 * @api {get/post} /api/user/logout 用户登出
                 * @apiName UserLogout
                 * @apiGroup User
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                logout() {
                        return function * () {
                                delete this.session.USER;
                                return ActionResult.createSuccessResult();
                        };
                }

                /**
                 * @api {get} /api/user/getLoginUser 获取系统登录的用户
                 * @apiName GetLoginUser
                 * @apiGroup User
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result 登录用户的信息
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
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