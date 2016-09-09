var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');

(function () {
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
                 * @api {get} /api/group/read/:groupId 读取集团信息(用户所属集团)
                 * @apiName readGroup
                 * @apiGroup Group
                 *
                 * @apiParam {Number} groupId 集团ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                read () {
                        var me = this;
                        return function * () {
                                var groupId = parseInt(this.params.groupId);
                                if (isNaN(groupId) || groupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的集团ID');
                                }
                                if(this.session.USER.groupId!=groupId)
                                {
                                        return ActionResult.createValidateFailResult('无法读取其他集团的资料');
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
                 * @api {post} /api/group/update/:groupId 修改集团信息(当前用户所属集团)
                 * @apiName updateGroup
                 * @apiGroup Group
                 *
                 * @apiParam {String} groupId * 集团ID
                 * @apiParam {String} name * 集团名称
                 * @apiParam {String} fullName 集团全名
                 * @apiParam {String} address 集团地址
                 * @apiParam {String} lat 纬度
                 * @apiParam {String} lng 经度
                 * @apiParam {String} tel 联系电话
                 * @apiParam {String} fax 传真
                 * @apiParam {String} linkman 联系人
                 * @apiParam {String} linkmanMobile 联系人电话
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * */
                update () {
                        var me=this;
                        return function * () {
                                var groupId = parseInt(this.params.groupId);
                                if (isNaN(groupId) || groupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的集团ID');
                                }
                                if(this.session.USER.groupId!=groupId)
                                {
                                        return ActionResult.createValidateFailResult('无法修改其他集团的资料');
                                }
                                this.validator.check('name').optional().rangeLength(0, 30).end();
                                this.validator.check('fullName').optional().rangeLength(0, 255).end();
                                this.validator.check('address').optional().rangeLength(0, 255).end();
                                this.validator.check('lat').optional().rangeLength(0, 10).end();
                                this.validator.check('lng').optional().rangeLength(0, 10).end();
                                this.validator.check('tel').optional().match(me.util.getRegExps().tel).end();
                                this.validator.check('fax').optional().rangeLength(0, 30).end();
                                this.validator.check('linkman').optional().rangeLength(0, 30).end();
                                this.validator.check('linkmanMobile').optional().match(me.util.getRegExps().mobile).end();
                                if(this.validator.isValid())
                                {
                                        var obj=
                                        {
                                                id:groupId,
                                                name:this.p('name'),
                                                fullName:this.p('fullName'),
                                                address:this.p('address'),
                                                tel:this.p('tel'),
                                                fax:this.p('fax'),
                                                lat:this.p('lat'),
                                                lng:this.p('lng'),
                                                linkman:this.p('linkman'),
                                                linkmanMobile:this.p('linkmanMobile')
                                        }
                                        for(var attr in obj)
                                        {
                                                if(!obj[attr]) delete obj[attr];
                                        }
                                        yield me.bookshelf.knex('group_info')
                                                .where('id', groupId)
                                                .update(obj);
                                        return ActionResult.createSuccessResult({});
                                }
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = GroupController;
})();