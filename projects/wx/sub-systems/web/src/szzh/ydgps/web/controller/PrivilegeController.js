var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');
var crypto = require('crypto');

(function () {
        /**
         * Class RoleController
         *
         * @class #NAMESPACE#.RoleController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class PrivilegeController extends GenericObject {
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
                        this.rbacPlugin=null;
                }

                /**
                 * @api {get} /api/privilege/list 查询权限列表
                 * @apiName listPrivilege
                 * @apiGroup Privilege
                 *
                 * @apiParam {String} privilegeName  权限名称 like
                 * @apiParam {Number} page 页号，默认1
                 * @apiParam {Number} rpp 每页记录数，系统默认值
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                list () {
                        var me=this;
                        return function * () {
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();

                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var privilegeName = this.parameter.param('privilegeName');
                                        var ret=yield me.rbacPlugin.listPrivileges(privilegeName,page,rpp)
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }



                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = PrivilegeController;
})();