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
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                list () {
                        var me=this;
                        return function * () {

                                if (this.validator.isValid()) {
                                        var ret = yield me.bookshelf.knex('rbac_privilege')
                                                .distinct('privilegeGroup as group')
                                                .select()

                                        for(var i=0;i<ret.length;i++)
                                        {
                                             var   temp=yield me.bookshelf.knex('rbac_privilege')
                                                .where('privilegeGroup',ret[i].group)
                                                        .orderBy('privilegeIndex', 'asc')
                                                .select('privilegeName','privilegeIndex')
                                                ret[i].child=temp;
                                        }
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