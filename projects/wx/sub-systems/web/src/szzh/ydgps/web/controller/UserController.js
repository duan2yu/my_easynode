var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');
var crypto = require('crypto');

(function () {
        /**
         * Class UserController
         *
         * @class #NAMESPACE#.UserController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class UserController extends GenericObject {
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
                }

                /**
                 * @api {post} /api/user/changePwd/:userId 修改用户密码
                 * @apiName changeUserPassword
                 * @apiGroup User
                 *
                 * @apiParam {String} userId * 用户ID
                 * @apiParam {String} oldPwd * 旧密码 明文
                 * @apiParam {String} newPwd * 新密码　明文
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result 登录用户的信息
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                //http://localhost:10000/api/user/changePwd/7?oldPwd=123456789&newPwd=123321
                changeUserPassword () {
                        var me=this;
                        return function * () {
                                var userId = parseInt(this.params.userId);
                                if (isNaN(userId) || userId < 0) {
                                        return ActionResult.createValidateFailResult('非法的用户ID');
                                }
                                this.validator.check('oldPwd').necessary().rangeLength(6, 20).end();
                                this.validator.check('newPwd').necessary().rangeLength(6, 20).end();
                                if(this.validator.isValid())
                                {
                                        var ret = yield me.bookshelf.knex('group_user_info')
                                                .where('group_user_info.id', userId)
                                                .select();
                                        if(!ret||ret.length==0)
                                        {
                                                return ActionResult.createErrorResult('用户不存在');
                                        }
                                        logger.error(JSON.stringify(ret));
                                        ret = ret[0];
                                        var sha = utility.sha1(this.parameter.param('oldPwd') + ret.salt);
                                        if (sha!=ret.pwd) {
                                                return ActionResult.createErrorResult('旧密码错误');
                                        }
                                        var salt = crypto.randomBytes(16).toString('hex');
                                         sha = utility.sha1(this.parameter.param('newPwd') + salt);
                                       var obj={
                                               pwd: sha,
                                               salt: salt
                                       }
                                        yield me.bookshelf.knex('group_user_info')
                                                .where('id', userId)
                                                .update(obj);
                                        return ActionResult.createSuccessResult({}).setMsg('密码修改成功');
                                }
                        };
                }

                /**
                 * @api {post} /api/user/create 创建新用户
                 * @apiName createUser
                 * @apiGroup User
                 *
                 * @apiParam {String} name * 用户名
                 * @apiParam {String} realName 真实姓名
                 * @apiParam {String} mobile * 手机号码
                 * @apiParam {String} email 邮箱地址
                 * @apiParam {Number} groupId * 集团ID，管理员为0
                 * @apiParam {String} pwd * 明文密码
                 * @apiParam {String} status  状态，0无效，1有效 默认有效
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                //http://localhost:10000/api/user/create?name=ddd1dd&mobile=18658473333&pwd=123456&groupId=0
                create () {
                                var me=this;
                                return function * () {
                                        this.validator.check('name').necessary().rangeLength(5, 32).end();
                                        this.validator.check('realName').optional().rangeLength(0, 20).end();
                                        this.validator.check('mobile').necessary().match(me.util.getRegExps().mobile).end();
                                        this.validator.check('email').optional().match(me.util.getRegExps().email).end();
                                        this.validator.check('status').optional().enum(['0', '1']).end();
                                        this.validator.check('pwd').necessary().rangeLength(6, 20).end();
                                        this.validator.check('groupId').necessary().isInt().min(0).end();
                                        var groupId= this.parameter.intParam('groupId');
                                        var status= this.parameter.intParam('status')||me.util.constants.STATUS_ENABLE;
                                        if (this.validator.isValid()) {
                                                var ret=[];
                                                if(groupId==0) ret=[{status:me.util.constants.STATUS_ENABLE}];
                                                else
                                                 ret = yield me.bookshelf.knex('group_info')
                                                        .where('id', groupId)
                                                        .select();
                                                if (ret && ret.length === 1) {
                                                        ret = ret[0];
                                                        if (ret.status !== me.util.constants.STATUS_ENABLE) {
                                                                return ActionResult.createErrorResult('集团已被锁定');
                                                        }
                                                        ret = yield me.bookshelf.knex('group_user_info')
                                                                .where('name', this.p('name'))
                                                                .select();
                                                        if(ret&&ret.length>0)
                                                        {
                                                                return ActionResult.createErrorResult('用户名已存在');
                                                        }
                                                        var salt = crypto.randomBytes(16).toString('hex');
                                                        var sha = utility.sha1(this.parameter.param('pwd') + salt);
                                                        ret = yield me.bookshelf.knex('group_user_info')
                                                                .insert({
                                                                        name: this.parameter.param('name'),
                                                                        realName: this.parameter.param('realName'),
                                                                        pwd: sha,
                                                                        salt: salt,
                                                                        mobile: this.parameter.param('mobile'),
                                                                        email: this.parameter.param('email'),
                                                                        groupId: groupId,
                                                                        status:status,
                                                                        createTime:new Date().getTime()
                                                                });
                                                        if (ret && ret.length > 0) {
                                                                return ActionResult.createSuccessResult({id: ret[0]}).setMsg('创建用户成功');
                                                        }
                                                        return ActionResult.createErrorResult().setMsg('创建用户失败');
                                                }
                                                return ActionResult.createErrorResult('集团不存在');
                                        }
                                };
                }

                /**
                 * @api {get} /api/user/read/:userId 读取用户信息
                 * @apiName readUser
                 * @apiGroup User
                 *
                 * @apiParam {Number} userId * 用户ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                readUserInfo() {
                        var me = this;
                        return function * () {
                                var userId = parseInt(this.params.userId);
                                if (isNaN(userId) || userId < 0) {
                                        return ActionResult.createValidateFailResult('非法的用户ID');
                                }
                                var ret = yield me.bookshelf.knex('group_user_info')
                                        .leftJoin('group_info', 'group_user_info.groupId', 'group_info.id')
                                        .where('group_user_info.id', userId)
                                     //   .andWhere('group_info.status', 1)
                                        .select('group_user_info.*','group_info.name  as groupName');
                                if (ret.length == 0) {
                                        return ActionResult.createErrorResult('用户不存在');
                                }
                                return ActionResult.createSuccessResult(ret[0]);
                        };
                }

                /**
                 * @api {post} /api/user/update/:userId 更新用户资料
                 * @apiName updateUser
                 * @apiGroup User
                 *
                 * @apiParam {Number} userId * 用户ID
                 * @apiParam {String} name  用户名
                 * @apiParam {String} realName 真实姓名
                 * @apiParam {String} mobile  手机号码
                 * @apiParam {String} email 邮箱地址
                 * @apiParam {Number} groupId 集团ID，管理员为0
                 * @apiParam {String} status  状态，0无效，1有效
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * */
                //http://localhost:10000/api/user/update/4?name=test111122111222&email=duan2yu@163.com
                updateUserInfo() {
                        var me = this;
                        return function * () {
                                var userId = parseInt(this.params.userId);
                                if (isNaN(userId) || userId < 0) {
                                        return ActionResult.createValidateFailResult('非法的用户ID');
                                }

                                this.validator.check('name').optional().rangeLength(5, 32).end();
                                this.validator.check('realName').optional().rangeLength(0, 20).end();
                                this.validator.check('mobile').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('email').optional().match(me.util.getRegExps().email).end();
                                this.validator.check('status').optional().enum(['0', '1']).end();
                                this.validator.check('groupId').optional().isInt().min(0).end();
                                var groupId= this.parameter.intParam('groupId');

                                if (this.validator.isValid()) {
                                        if(this.p('name'))
                                        {
                                                var ret = yield me.bookshelf.knex('group_user_info')
                                                        .where('name', this.p('name'))
                                                        .select();
                                                if(ret&&ret.length>0)
                                                {
                                                        return ActionResult.createErrorResult('用户名已存在');
                                                }
                                        }
                                        if(groupId&&groupId!==0)
                                        {
                                               var  ret = yield me.bookshelf.knex('group_info')
                                                        .where('id', groupId)
                                                        .select();
                                                if(!ret||ret.length==0)
                                                {
                                                        return ActionResult.createErrorResult('集团不存在');
                                                }
                                                if (ret && ret.length === 1) {
                                                        ret = ret[0];
                                                        if (ret.status !== me.util.constants.STATUS_ENABLE) {
                                                                return ActionResult.createErrorResult('集团已被锁定');
                                                        }
                                                }
                                        }
                                        var obj = {
                                                id:userId,
                                                name: this.parameter.param('name'),
                                                realName: this.parameter.param('realName'),
                                                mobile: this.parameter.param('mobile'),
                                                email:this.parameter.param('email'),
                                                status:this.parameter.param('status'),
                                                groupId:this.parameter.param('groupId')
                                        };
                                        for(var attr in obj)
                                        {
                                                if(!obj[attr]) delete obj[attr];
                                        }
                                        yield me.bookshelf.knex('group_user_info')
                                                .where('id', userId)
                                                .update(obj);
                                        return ActionResult.createSuccessResult({});
                                }
                        };
                }

                /**
                 * @api {post} /api/user/delete/:userId 删除用户
                 * @apiName deleteUser
                 * @apiGroup User
                 *
                 * @apiParam {Number} userId * 用户ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                //http://localhost:10000/api/user/delete/4
                deleteUser() {
                        var me = this;
                        return function * () {
                                var userId = parseInt(this.params.userId);
                                if (isNaN(userId) || userId < 0) {
                                        return ActionResult.createValidateFailResult('非法的用户ID');
                                }
                                var ret = yield me.bookshelf.knex('group_user_info')
                                        .where('id', userId)
                                        .delete();
                                if (ret == 1) {
                                        return ActionResult.createSuccessResult({}).setMsg('用户删除成功');
                                }
                                return ActionResult.createErrorResult('用户不存在');
                        };
                }

                /**
                 * @api {get} /api/user/list 查询用户列表
                 * @apiName listUser
                 * @apiGroup User
                 *
                 * @apiParam {String} name 用户名, like
                 * @apiParam {String} mobile 用户手机号
                 * @apiParam {String} status  状态，0无效，1有效 默认有效
                 * @apiParam {Number} page 页号，默认1
                 * @apiParam {Number} rpp 每页记录数，系统默认值
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                //http://localhost:10000/api/user/list?rpp=1&status=1&name=dd1&mobile=18658473331
                listUsers() {
                        var me = this;
                        return function * () {
                                this.validator.check('status').optional().enum(['0', '1']).end();
                                this.validator.check('groupId').optional().isInt().end();
                                this.validator.check('name').optional().end();
                                //this.validator.check('mobile').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('mobile').optional().end();
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();
                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var groupId = this.parameter.intParam('groupId', 'all', false);
                                        var name = this.parameter.param('name');
                                        var status = this.parameter.param('status');
                                        var mobile = this.parameter.param('mobile');
                                        var builder = me.bookshelf.knex('group_user_info')
                                                .leftJoin('group_info', 'group_user_info.groupId', 'group_info.id');

                                        builder.andWhere('group_user_info.groupId',  this.session.USER.groupId);

                                        if (name) {
                                                builder.andWhere('group_user_info.name', 'like', `%${name}%`);
                                        }
                                        if (mobile) {
                                                builder.andWhere('group_user_info.mobile',mobile);
                                        }
                                        if (status) {
                                                builder.andWhere('group_user_info.status', status);
                                        }
                                        var ret = yield me.util.countAndQuery(builder, page, rpp, null, 'group_user_info.*','group_info.name  as groupName');
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }



                /**
                 * @api {post} /api/user/bindRole/:userId 用户绑定角色(覆盖原有绑定关系)
                 * @apiName bindRole
                 * @apiGroup User
                 *
                 * @apiParam {Number} userId * 用户ID
                 * @apiParam {Number} roleId 角色ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * */
                bindRole() {
                        var me = this;
                        return function * () {
                                var userId = parseInt(this.params.userId);
                                if (isNaN(userId) || userId < 0) {
                                        return ActionResult.createValidateFailResult('非法的用户ID');
                                }

                                this.validator.check('roleId').necessary().end();
                                var groupId= this.session.USER.groupId
                                var roleId=this.p('roleId');

                                if (this.validator.isValid()) {
                                                var ret = yield me.bookshelf.knex('group_user_info')
                                                        .where('id',userId)
                                                        .andWhere('groupId',groupId)
                                                        .select();
                                                if(ret&&ret.length==0)
                                                {
                                                        return ActionResult.createErrorResult('当前集团下不存在该用户');
                                                }

                                         ret = yield me.bookshelf.knex('rbac_role')
                                                .where('roleGroup',groupId)
                                                .andWhere('id',roleId)
                                                .select();
                                        if(ret&&ret.length==0)
                                        {
                                                return ActionResult.createErrorResult('当前集团下不存在该角色');
                                        }
                                        var obj = {
                                                id:userId,
                                                roleId:roleId
                                        };
                                        yield me.bookshelf.knex('group_user_info')
                                                .where('id', userId)
                                                .update(obj);
                                        return ActionResult.createSuccessResult({});
                                }
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = UserController;
})();