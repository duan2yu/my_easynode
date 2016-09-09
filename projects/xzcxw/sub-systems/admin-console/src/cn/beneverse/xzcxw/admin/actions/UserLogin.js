var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');
var MysqlModelGenerator = using('easynode.framework.mvc.spi.MysqlModelGenerator');
var utility=require('utility');

(function () {
        /**
         * Class UserLogin
         *
         * @class easynode.plugin.rbac.actions.UserLogin
         * @extends easynode.framework.mvc.Action
         * @since 0.1.0
         * @author zlbbq
         * */
        class UserLogin extends Action {
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
                        this.addArg({name : 'name', type : 'string',comment:'用户登录名'})
                        this.addArg({name : 'pwd', type : 'string',comment:'用户密码'})
                }

                process(ctx) {
                        return function * () {
                                if(!ctx.args.name) {
                                        return ActionResult.createErrorResult('需要登录帐号');
                                }
                                if(!ctx.args.pwd) {
                                        return ActionResult.createErrorResult('需要登入密码');
                                }

                                //验证用户名和密码
                                var sql='select * from xzcxw_user where name="'+ctx.args.name+'"';
                                var result=yield ctx.connection.execQuery(sql);
                                if(!result||result.length==0)
                                {
                                        return ActionResult.createErrorResult('用户名不存在!');
                                }
                                var user = result[0];
                                if(user.pwd != utility.sha1(ctx.args.pwd + user.salt)) {
                                        return ActionResult.createErrorResult('密码错误');
                                }
                                if(user.status !== '1') {
                                        return ActionResult.createErrorResult('用户已被禁用');
                                }
                                ctx.session.USER = user;
                                EasyNode.DEBUG && logger.debug(JSON.stringify(user));
                                return ActionResult.createSuccessResult(user);
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }

        }
        module.exports = UserLogin;
})();