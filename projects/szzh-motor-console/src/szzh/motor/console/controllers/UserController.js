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
                        this.util = null;                                      //IoC injection, MotorConsoleUtil
                }

                updateUserInfo() {
                        var me = this;
                        return function * () {
                                var id = parseInt(this.params.id);
                                if (isNaN(id) || id < 0) {
                                        return ActionResult.createValidateFailResult('非法的用户ID');
                                }

                                this.validator.check('realName').necessary().end();
                                this.validator.check('phoneNumber').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('password').optional().rangeLength(6, 20).end();
                                if (this.validator.isValid()) {
                                        var obj = {
                                                realName: this.parameter.param('realName'),
                                                phoneNumber: this.parameter.param('phoneNumber')
                                        };
                                        if (this.parameter.param('password')) {
                                                var salt = crypto.randomBytes(16).toString('hex');
                                                var sha = utility.sha1(this.parameter.param('password') + salt);
                                                obj.salt = salt;
                                                obj.password_sha = sha;
                                        }
                                        yield me.bookshelf.knex('motor_vendor_user')
                                                .where('id', this.session.USER.id)
                                                .update(obj);
                                        return ActionResult.createSuccessResult({});
                                }
                        };
                }

                listUsers() {
                        var me = this;
                        return function * () {
                                this.validator.check('type').optional().enum(['0', '1']).end();
                                this.validator.check('vendorId').optional().isInt().end();
                                this.validator.check('realName').optional().end();
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();
                                if (this.validator.isValid()) {
                                        var type = this.parameter.param('type') || '0';         // 0: 系统管理员，1: 其他厂商用户
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var vendorId = this.parameter.intParam('vendorId', 'all', false);
                                        var realName = this.parameter.param('realName');
                                        var builder = me.bookshelf.knex('motor_vendor_user')
                                                .innerJoin('motor_vendor', 'motor_vendor_user.vendorId', 'motor_vendor.id');
                                        if (type === '0') {
                                                if (vendorId > 0) {
                                                        return ActionResult.createValidateFailResult('请不要在设置type=0时传递vendorId');
                                                }
                                                builder.where('motor_vendor_user.vendorId', me.util.constants.ADMIN_VENDOR);
                                        }
                                        else {
                                                builder.whereNot('motor_vendor_user.vendorId', me.util.constants.ADMIN_VENDOR);
                                        }
                                        if (vendorId > 0) {
                                                builder.andWhere('motor_vendor_user.vendorId', vendorId);
                                        }
                                        if (realName) {
                                                builder.andWhere('motor_vendor_user.realName', 'like', `%${realName}%`);
                                        }
                                        var ret = yield me.util.countAndQuery(builder, page, rpp, null, 'motor_vendor_user.id', 'motor_vendor_user.name', 'motor_vendor_user.realName', 'motor_vendor_user.phoneNumber', 'motor_vendor_user.vendorId', 'motor_vendor.name as vendorName');
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                createUser() {
                        var me = this;
                        return function * () {
                                this.validator.check('name').necessary().rangeLength(5, 32).end();
                                this.validator.check('vendorId').necessary().isInt().min(0).end();
                                this.validator.check('realName').necessary().end();
                                this.validator.check('password').necessary().rangeLength(6, 20).end();
                                this.validator.check('phoneNumber').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('privileges').optional().end();
                                if (this.validator.isValid()) {
                                        var ret = yield me.bookshelf.knex('motor_vendor')
                                                .where('id', this.parameter.intParam('vendorId'))
                                                .select();
                                        if (ret && ret.length === 1) {
                                                ret = ret[0];
                                                if (ret.status !== 0) {
                                                        return ActionResult.createErrorResult('厂商已被锁定');
                                                }
                                                var salt = crypto.randomBytes(16).toString('hex');
                                                var sha = utility.sha1(this.parameter.param('password') + salt);
                                                ret = yield me.bookshelf.knex('motor_vendor_user')
                                                        .insert({
                                                                name: this.parameter.param('name'),
                                                                realName: this.parameter.param('realName'),
                                                                password_sha: sha,
                                                                salt: salt,
                                                                phoneNumber: this.parameter.param('phoneNumber'),
                                                                vendorId: this.parameter.param('vendorId'),
                                                                privileges : this.parameter.param('privileges')
                                                        });
                                                if (ret && ret.length > 0) {
                                                        return ActionResult.createSuccessResult({id: ret[0]}).setMsg('创建用户成功');
                                                }
                                                return ActionResult.createErrorResult().setMsg('创建用户失败');
                                        }
                                        return ActionResult.createErrorResult('厂商不存在');
                                }
                        };
                }

                deleteUser() {
                        var me = this;
                        return function * () {
                                var id = parseInt(this.params.id);
                                if (isNaN(id) || id < 0) {
                                        return ActionResult.createValidateFailResult('非法的用户ID');
                                }
                                var ret = yield me.bookshelf.knex('motor_vendor_user')
                                        .where('id', id)
                                        .delete();
                                if (ret == 1) {
                                        return ActionResult.createSuccessResult({}).setMsg('用户删除成功');
                                }
                                return ActionResult.createErrorResult('用户不存在');
                        };
                }

                readUserInfo() {
                        var me = this;
                        return function * () {
                                var id = parseInt(this.params.id);
                                if (isNaN(id) || id < 0) {
                                        return ActionResult.createValidateFailResult('非法的用户ID');
                                }
                                var ret = yield me.bookshelf.knex('motor_vendor_user')
                                        .innerJoin('motor_vendor', 'motor_vendor_user.vendorId', 'motor_vendor.id')
                                        .where('motor_vendor_user.id', id)
                                        .andWhere('motor_vendor.status', 0)
                                        .select('motor_vendor_user.id', 'motor_vendor_user.name', 'motor_vendor_user.realName', 'motor_vendor_user.phoneNumber', 'motor_vendor_user.vendorId', 'motor_vendor.name as vendorName');
                                if (ret.length == 0) {
                                        return ActionResult.createErrorResult('用户不存在或厂商已经被锁定');
                                }
                                return ActionResult.createSuccessResult(ret[0]);
                        };
                }

                listVisibleVendors() {
                        var me = this;
                        return function * () {
                                if (!me.util.isAdmin(this)) {
                                        return ActionResult.createSuccessResult([{
                                                id: this.session.USER.vendorId,
                                                name: this.session.USER.vendorName
                                        }]);
                                }

                                var ret = yield me.bookshelf.knex('motor_vendor')
                                        .where('status', 0)
                                        .select('id', 'name');
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = UserController;
})();