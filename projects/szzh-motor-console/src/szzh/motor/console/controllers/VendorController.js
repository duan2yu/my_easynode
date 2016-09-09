var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');

(function () {
        /**
         * Class VendorController
         *
         * @class #NAMESPACE#.VendorController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class VendorController extends GenericObject {
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

                listVendors() {
                        var me = this;
                        return function * () {
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();
                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var builder = me.bookshelf.knex('motor_vendor')
                                                .where('status', me.util.constants.VENDOR_ENABLED);
                                        var ret = yield me.util.countAndQuery(builder, page, rpp, null);
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                deleteVendor() {
                        var me = this;
                        return function * () {
                                var id = parseInt(this.params.id);
                                if (isNaN(id) || id <= 1) {
                                        return ActionResult.createValidateFailResult('非法的厂商ID');
                                }
                                var ret = yield me.bookshelf.knex('motor_vendor')
                                        .where('id', id)
                                        .update({
                                                status: 1,
                                                updateTime: new Date().getTime()
                                        });
                                if (ret == 1) {
                                        return ActionResult.createSuccessResult({}).setMsg('厂商删除成功');
                                }
                                return ActionResult.createErrorResult('厂商不存在，删除失败');
                        };
                }

                createVendor() {
                        var me = this;
                        return function * () {
                                this.validator.check('name').necessary().maxLength(45).end();
                                this.validator.check('linkman').optional().maxLength(45).end();
                                this.validator.check('phoneNumber').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('email').optional().match(me.util.getRegExps().email).end();
                                this.validator.check('status').optional().enum(['0', '1']).end();
                                var now = new Date().getTime();
                                var ret = yield me.bookshelf.knex('motor_vendor')
                                        .insert({
                                                name: this.parameter.param('name'),
                                                linkman: this.parameter.param('linkman'),
                                                phoneNumber: this.parameter.param('phoneNumber'),
                                                email: this.parameter.param('email'),
                                                website: this.parameter.param('website'),
                                                appId: this.parameter.param('appId'),
                                                appSecret: this.parameter.param('appSecret'),
                                                address: this.parameter.param('address'),
                                                status: this.parameter.intParam('status', 'all', false),
                                                createTime: now,
                                                updateTime: now
                                        });
                                if (ret && ret.length > 0) {
                                        return ActionResult.createSuccessResult({id: ret[0]}).setMsg('创建厂商成功');
                                }
                                return ActionResult.createErrorResult().setMsg('创建厂商失败');
                        };
                }

                updateVendor() {
                        var me = this;
                        return function * () {
                                var id = parseInt(this.params.id);
                                if (isNaN(id) || id < 0) {
                                        return ActionResult.createValidateFailResult('非法的厂商ID');
                                }
                                this.validator.check('name').necessary().maxLength(45).end();
                                this.validator.check('linkman').optional().maxLength(45).end();
                                this.validator.check('phoneNumber').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('email').optional().match(me.util.getRegExps().email).end();
                                this.validator.check('status').optional().enum(['0', '1']).end();

                                if(this.validator.isValid()) {
                                        var now = new Date().getTime();
                                        var ret = yield me.bookshelf.knex('motor_vendor')
                                                .where('id', id)
                                                .update({
                                                        name: this.parameter.param('name'),
                                                        linkman: this.parameter.param('linkman'),
                                                        phoneNumber: this.parameter.param('phoneNumber'),
                                                        email: this.parameter.param('email'),
                                                        website: this.parameter.param('website'),
                                                        appId: this.parameter.param('appId'),
                                                        appSecret: this.parameter.param('appSecret'),
                                                        address: this.parameter.param('address'),
                                                        status: this.parameter.intParam('status', 'all', false),
                                                        updateTime: now
                                                });
                                        if (ret > 0) {
                                                return ActionResult.createSuccessResult({vendorId: ret[0]}).setMsg('更新厂商资料成功');
                                        }
                                        return ActionResult.createErrorResult().setMsg('更新厂商资料失败');
                                }
                        };
                }

                readVendorInfo() {
                        var me = this;
                        return function * () {
                                var id = parseInt(this.params.id);
                                if (isNaN(id) || id < 0) {
                                        return ActionResult.createValidateFailResult('非法的厂商ID');
                                }
                                var ret = yield me.bookshelf.knex('motor_vendor')
                                        .where({
                                                id: id
                                        })
                                        .select();
                                if (ret && ret.length > 0) {
                                        return ActionResult.createSuccessResult({vendorId: ret[0]}).setMsg('查询厂商资料成功');
                                }
                                return ActionResult.createErrorResult().setMsg('厂商不存在');
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = VendorController;
})();