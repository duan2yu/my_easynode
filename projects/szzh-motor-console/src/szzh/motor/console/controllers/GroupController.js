var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var excel = require('excel');
var thunkify = require('thunkify');
var utility = require('utility');

(function () {
        const UPLOAD_DIR = EasyNode.config('easynode.servers.koa-HttpServer.uploadDir', 'www/uploads');
        excel = thunkify(excel);
        /**
         * Class GroupController
         *
         * @class #NAMESPACE#.GroupController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class GroupController extends GenericObject {
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
                 * @api {post} /api/group/create 创建新集团用户
                 * @apiName createGroup
                 * @apiGroup Group
                 *
                 * @apiParam {String} name * 集团名称
                 * @apiParam {String} fullName 集团全名
                 * @apiParam {String} address 集团地址
                 * @apiParam {String} tel 集团联系电话
                 * @apiParam {String} fax 集团传真
                 * @apiParam {String} linkman 联系人
                 * @apiParam {String} linkmanMobile 联系人电话
                 * @apiParam {String} status  状态，0无效，1有效 默认有效
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                create() {
                        var me = this;
                        return function * () {
                                this.validator.check('name').necessary().rangeLength(0, 30).end();
                                this.validator.check('fullName').optional().rangeLength(0, 255).end();
                                this.validator.check('address').optional().rangeLength(0, 255).end();
                                this.validator.check('tel').optional().match(me.util.getRegExps().tel).end();
                                this.validator.check('fax').optional().rangeLength(0, 30).end();
                                this.validator.check('linkman').optional().rangeLength(0, 30).end();
                                this.validator.check('linkmanMobile').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('status').optional().enum(['0', '1']).end();
                                var status = this.parameter.intParam('status') || me.util.constants.STATUS_ENABLE;
                                if (this.validator.isValid()) {
                                        var ret = yield me.bookshelf.knex('group_info')
                                                .insert({
                                                        name: this.parameter.param('name'),
                                                        fullName: this.parameter.param('fullName'),
                                                        address: this.parameter.param('address'),
                                                        tel: this.parameter.param('tel'),
                                                        fax: this.parameter.param('fax'),
                                                        linkman: this.parameter.param('linkman'),
                                                        linkmanMobile: this.parameter.param('linkmanMobile'),
                                                        status: status,
                                                        createTime: new Date().getTime()
                                                });
                                        if (ret && ret.length > 0) {
                                                return ActionResult.createSuccessResult({id: ret[0]}).setMsg('创建集团成功');
                                        }
                                }
                        };
                }

                /**
                 * @api {get} /api/group/read/:groupId 读取集团信息
                 * @apiName readGroup
                 * @apiGroup Group
                 *
                 * @apiParam {Number} groupId 集团ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                read() {
                        var me = this;
                        return function * () {
                                var groupId = parseInt(this.params.groupId);
                                if (isNaN(groupId) || groupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的集团ID');
                                }
                                var ret = yield me.bookshelf.knex('group_info')
                                        .where('group_info.id', groupId)
                                        .select();
                                if (ret.length == 0) {
                                        return ActionResult.createErrorResult('集团不存在');
                                }
                                return ActionResult.createSuccessResult(ret[0]);
                        };
                }

                /**
                 * @api {post} /api/group/update/:groupId 更新集团资料
                 * @apiName updateGroup
                 * @apiGroup Group
                 *
                 * @apiParam {String} groupId * 集团ID
                 * @apiParam {String} name * 集团名称
                 * @apiParam {String} fullName 集团全名
                 * @apiParam {String} address 集团地址
                 * @apiParam {String} tel 联系电话
                 * @apiParam {String} fax 传真
                 * @apiParam {String} linkman 联系人
                 * @apiParam {String} linkmanMobile 联系人电话
                 * @apiParam {String} status 状态，0无效，1有效
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * */
                update() {
                        var me = this;
                        return function * () {
                                var groupId = parseInt(this.params.groupId);
                                if (isNaN(groupId) || groupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的集团ID');
                                }
                                this.validator.check('name').optional().rangeLength(0, 30).end();
                                this.validator.check('fullName').optional().rangeLength(0, 255).end();
                                this.validator.check('address').optional().rangeLength(0, 255).end();
                                this.validator.check('tel').optional().match(me.util.getRegExps().tel).end();
                                this.validator.check('fax').optional().rangeLength(0, 30).end();
                                this.validator.check('linkman').optional().rangeLength(0, 30).end();
                                this.validator.check('linkmanMobile').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('status').optional().enum(['0', '1']).end();
                                if (this.validator.isValid()) {
                                        var obj =
                                        {
                                                id: groupId,
                                                name: this.p('name'),
                                                fullName: this.p('fullName'),
                                                address: this.p('address'),
                                                tel: this.p('tel'),
                                                fax: this.p('fax'),
                                                linkman: this.p('linkman'),
                                                linkmanMobile: this.p('linkmanMobile'),
                                                status: this.p('status')
                                        }
                                        for (var attr in obj) {
                                                if (!obj[attr]) delete obj[attr];
                                        }
                                        yield me.bookshelf.knex('group_info')
                                                .where('id', groupId)
                                                .update(obj);
                                        return ActionResult.createSuccessResult({});
                                }
                        };
                }

                /**
                 * @api {post} /api/group/delete/:groupId 删除集团
                 * @apiName deleteGroup
                 * @apiGroup Group
                 *
                 * @apiParam {Number} groupId 集团ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                delete() {
                        var me = this;
                        return function * () {
                                var groupId = parseInt(this.params.groupId);
                                if (isNaN(groupId) || groupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的集团ID');
                                }
                                var ret = yield me.bookshelf.knex('group_info')
                                        .where('id', groupId)
                                        .delete();
                                if (ret == 1) {
                                        return ActionResult.createSuccessResult({}).setMsg('集团删除成功');
                                }
                                return ActionResult.createErrorResult('集团不存在');
                        };
                }

                /**
                 * @api {get} /api/group/list 查询集团列表
                 * @apiName listGroup
                 * @apiGroup Group
                 *
                 * @apiParam {String} name 集团名称, like
                 * @apiParam {String} status 状态，0无效，1有效
                 * @apiParam {Number} page 页号，默认1
                 * @apiParam {Number} rpp 每页记录数，系统默认值
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                list() {
                        var me = this;
                        return function * () {
                                this.validator.check('status').optional().enum(['0', '1']).end();
                                this.validator.check('name').optional().end();
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();
                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var name = this.parameter.param('name');
                                        var status = this.parameter.param('status');
                                        var builder = me.bookshelf.knex('group_info')
                                        if (name) {
                                                builder.andWhere('group_info.name', 'like', `%${name}%`);
                                        }
                                        if (status) {
                                                builder.andWhere('group_info.status', status);
                                        }
                                        var ret = yield me.util.countAndQuery(builder, page, rpp, null, 'group_info.*');
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                /**
                 * @api {get} /api/group/autocomplete 查询所有集团的名称
                 * @apiName listGroupNames
                 * @apiGroup Group
                 *
                 * @apiParam {String} name 集团名称, like
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                autocomplete() {
                        var me = this;
                        return function * () {
                                this.validator.check('name').optional().end();
                                if (this.validator.isValid()) {
                                        var name = this.parameter.param('name');
                                        var builder = me.bookshelf.knex('group_info')
                                        if (name) {
                                                builder.andWhere('group_info.name', 'like', `%${name}%`);
                                        }
                                        var ret = yield builder.select('id', 'name');
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                /**
                 * @api {get} /api/group/addDevice/:groupId 分配设备给集团
                 * @apiName addGroupDevice
                 * @apiGroup Group
                 * @apiParam {Number} groupId 集团ID
                 * @apiParam {Number} imei imei字符串　以,分隔　355334050097660,355334050106016
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                addDevice() {
                        var me = this;
                        return function * () {
                                var groupId = parseInt(this.params.groupId);
                                if (isNaN(groupId) || groupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }
                                this.validator.check('imei').necessary().min(15).end();
                                if (this.validator.isValid()) {
                                        var ret = yield me.bookshelf.knex('group_info')
                                                .where('id', groupId)
                                                .select();
                                        if (ret.length == 0) {
                                                return ActionResult.createValidateFailResult('未找到集团的信息');
                                        }

                                        var array = this.p('imei').split(",");
                                        if (array.length == 0) {
                                                return ActionResult.createValidateFailResult('请至少分配一个设备');
                                        }

                                        var tran = yield me.bookshelf.knex.transaction();
                                        var failures = [];
                                        for (var i = 0; i < array.length; i++) {
                                                ret = yield me.bookshelf.knex('motor_device')
                                                        .where('imei', array[i])
                                                        .update({groupId: groupId})
                                                        .transacting(tran);
                                                if (ret != 1) {
                                                        failures.push(array[i])
                                                }
                                        }
                                        if (failures.length == 0) {
                                                tran.commit();
                                                return ActionResult.createSuccessResult({});
                                        }
                                        else {
                                                tran.rollback();
                                                return ActionResult.createErrorResult('分配设备失败,imei号不正确').setResult(failures);
                                        }
                                }
                        }
                }


                /**
                 * @api {get} /api/group/addDeviceBatch/:groupId 分配设备给集团 excle
                 * @apiName addDeviceBatch
                 * @apiGroup Group
                 * @apiParam {Number} groupId 集团ID
                 * @apiParam {Number} importFile 设备excle
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                addDeviceBatch() {
                        var me = this;
                        return function * () {
                                var groupId = parseInt(this.params.groupId);
                                if (isNaN(groupId) || groupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }
                                this.validator.check('importFile').file(true, '.xlsx').end();
                                if (this.validator.isValid()) {
                                        var ret = yield me.bookshelf.knex('group_info')
                                                .where('id', groupId)
                                                .select();
                                        if (ret.length == 0) {
                                                return ActionResult.createValidateFailResult('未找到集团的信息');
                                        }

                                        var file = yield this.parameter.fileParam('importFile');
                                        EasyNode.DEBUG && logger.debug(JSON.stringify(file));
                                        var uploadFileName = file.name;
                                        var uploadFilePath = file.path;

                                        var filePath = path.join(EasyNode.real(UPLOAD_DIR), '../../', uploadFilePath);
                                        EasyNode.DEBUG && logger.debug(filePath);
                                        var array = yield excel(filePath);
                                        EasyNode.DEBUG && logger.debug('inventory excel data : ' + JSON.stringify(array));
                                        //第一行是列标题
                                        if (array.length <= 1) {
                                                return ActionResult.createValidateFailResult('没有要分配的设备');
                                        }
                                        var tran = yield me.bookshelf.knex.transaction();
                                        var failures = [];
                                        for (var i = 1; i < array.length; i++) {
                                                ret = yield me.bookshelf.knex('motor_device')
                                                        .where(
                                                        {
                                                                groupId : 0,                                    //仅groupId为0可以批量设置
                                                                'imei': array[i]
                                                        })
                                                        .update({groupId: groupId})
                                                        .transacting(tran);
                                                if (ret != 1) {
                                                        failures.push(array[i])
                                                }
                                        }
                                        if (failures.length == 0) {
                                                tran.commit();
                                                return ActionResult.createSuccessResult({});
                                        }
                                        else {
                                                tran.rollback();
                                                return ActionResult.createErrorResult('分配设备失败,imei号不正确').setResult(failures);
                                        }
                                }
                        }
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = GroupController;
})();