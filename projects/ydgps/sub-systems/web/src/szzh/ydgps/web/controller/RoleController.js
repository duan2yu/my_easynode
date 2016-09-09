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
        class RoleController extends GenericObject {
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
                 * @api {post} /api/role/create 创建新角色
                 * @apiName createRole
                 * @apiGroup Role
                 *
                 * @apiParam {String} roleName 角色名称
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                create () {
                                var me=this;
                                return function * () {
                                        this.validator.check('roleName').necessary().rangeLength(0, 30).end();
                                        var groupId = this.session.USER.groupId;
                                        if (this.validator.isValid()) {
                                                //todo check user privilege
                                                var ret = yield me.rbacPlugin.createRole(groupId,this.p('roleName'));
                                                if (ret && ret.length > 0) {
                                                        return ActionResult.createSuccessResult({id: ret[0]}).setMsg('创建角色成功');
                                                }
                                                return ActionResult.createErrorResult().setMsg('创建角色失败');
                                        }
                                }
                }

                /**
                 * @api {post} /api/role/update/:roleId 修改角色信息
                 * @apiName updateRole
                 * @apiGroup Role
                 *
                 * @apiParam {String} roleId * 角色D
                 * @apiParam {String} roleName * 角色名称
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * */
                update () {
                        var me=this;
                        return function * () {
                                var roleId = parseInt(this.params.roleId);
                                if (isNaN(roleId) || roleId < 0) {
                                        return ActionResult.createValidateFailResult('非法的角色ID');
                                }
                                var groupId=this.session.USER.groupId;
                                this.validator.check('roleName').optional().rangeLength(0, 30).end();
                                if(this.validator.isValid())
                                {
                                        //todo check user privilege
                                        var ret= yield me.bookshelf.knex('rbac_role')
                                        .where('id',roleId)
                                        .where('roleGroup',groupId)
                                        .select();
                                        if(ret.length==0)
                                        {
                                                return ActionResult.createErrorResult('不允许操作其他集团的角色');
                                        }
                                        ret = yield me.rbacPlugin.updateRole(roleId,groupId,this.p('roleName'));
                                        return ActionResult.createSuccessResult({});
                                }
                        };
                }


                /**
                 * @api {post} /api/role/delete/:roleId 删除角色
                 * @apiName deleteRole
                 * @apiGroup Role
                 *
                 * @apiParam {Number} roleId * 角色ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                delete () {
                        var me=this;
                        return function * () {
                                var roleId = parseInt(this.params.roleId);
                                if (isNaN(roleId) || roleId < 0) {
                                        return ActionResult.createValidateFailResult('非法的角色ID');
                                }
                                var groupId=this.session.USER.groupId;
                                if(this.validator.isValid())
                                {
                                        //todo check user privilege
                                        var ret= yield me.bookshelf.knex('rbac_role')
                                                .where('id',roleId)
                                                .where('roleGroup',groupId)
                                                .select();
                                        if(ret.length==0)
                                        {
                                                return ActionResult.createErrorResult('不允许操作其他集团的角色');
                                        }
                                        ret=yield me.bookshelf.knex('group_user_info')
                                                .where('roleId',roleId)
                                                .select();
                                        if(ret.length>0)
                                        {
                                                return ActionResult.createErrorResult('已有用户绑定了该角色,无法删除');
                                        }

                                        ret = yield me.rbacPlugin.deleteRole(roleId);
                                        if (ret && ret > 0) {
                                                return ActionResult.createSuccessResult({id: ret[0]}).setMsg('删除角色成功');
                                        }
                                        return ActionResult.createErrorResult().setMsg('删除角色失败');
                                }
                        };
                }




                /**
                 * @api {get} /api/role/list 查询角色列表
                 * @apiName listRoles
                 * @apiGroup Role
                 *
                 * @apiParam {String} roleName  角色名称 like
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
                                var groupId=this.session.USER.groupId;
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();

                                if (this.validator.isValid()) {
                                        //todo check user privilege
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var roleName = this.parameter.param('roleName');
                                        var ret=yield me.rbacPlugin.listRoles(groupId,roleName,page,rpp);
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }


                /**
                 * @api {post} /api/role/bindPrivileges/:roleId 角色绑定权限(解除原绑定关系)
                 * @apiName bindPrivileges
                 * @apiGroup Role
                 *
                 * @apiParam {String} roleId  角色ID
                 * @apiParam {String} privilegeId * 权限列表，多个ID使用","分隔
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                bindPrivileges () {
                        var me=this;
                        return function * () {
                                var roleId = parseInt(this.params.roleId);
                                if (isNaN(roleId) || roleId < 0) {
                                        return ActionResult.createValidateFailResult('非法的角色ID');
                                }
                                var groupId=this.session.USER.groupId;
                                this.validator.check('privilegeId').necessary().end();
                                if (this.validator.isValid()) {
                                        //todo check user privilege
                                        var ret= yield me.bookshelf.knex('rbac_role')
                                                .where('id',roleId)
                                                .where('roleGroup',groupId)
                                                .select();
                                        if(ret.length==0)
                                        {
                                                return ActionResult.createErrorResult('不允许操作其他集团的角色');
                                        }
                                        var privilegeId=this.p('privilegeId');
                                        yield me.rbacPlugin.bindPrivileges(roleId,privilegeId);
                                        return ActionResult.createSuccessResult();
                                }
                        };
                }


                /**
                 * @api {get} /api/role/queryBindPrivileges/:roleId 查询角色已绑定的权限
                 * @apiName queryBindPrivileges
                 * @apiGroup Role
                 *
                 * @apiParam {String} roleId  角色ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                queryBindPrivileges () {
                        var me=this;
                        return function * () {
                                var roleId = parseInt(this.params.roleId);
                                if (isNaN(roleId) || roleId < 0) {
                                        return ActionResult.createValidateFailResult('非法的角色ID');
                                }
                                var groupId=this.session.USER.groupId;
                                if (this.validator.isValid()) {
                                        //todo check user privilege
                                        var ret= yield me.bookshelf.knex('rbac_role')
                                                .where('id',roleId)
                                                .where('roleGroup',groupId)
                                                .select();
                                        if(ret.length==0)
                                        {
                                                return ActionResult.createErrorResult('不允许操作其他集团的角色');
                                        }
                                        var ret=yield me.rbacPlugin.queryBindPrivileges(roleId);
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }






                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = RoleController;
})();