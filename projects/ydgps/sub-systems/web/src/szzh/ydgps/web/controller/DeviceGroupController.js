var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');

(function () {
        /**
         * Class DeviceGroupController
         *
         * @class #NAMESPACE#.DeviceGroupController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class DeviceGroupController extends GenericObject {
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
                 * @api {post} /api/deviceGroup/create 创建新设备分组
                 * @apiName createDeviceGroup
                 * @apiGroup DeviceGroup
                 *
                 * @apiParam {String} name * 设备分组名称
                 * @apiParam {Number} parentId  父分组ID 不传表示创建根集团
                 * @apiParam {Number} sortFactor * 排序因子，大->小排序
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                create () {
                        var me=this;
                        return function * () {
                             //   this.validator.check('groupId').necessary().isInt().min(0).end();
                                this.validator.check('name').necessary().rangeLength(0, 30).end();
                                this.validator.check('parentId').optional().isInt().min(0).end();
                                this.validator.check('sortFactor').necessary().isInt().min(0).end();
                                var parentId=this.parameter.intParam('parentId')||0;
                               // var groupId=this.parameter.intParam('groupId');
                                var groupId = this.session.USER.groupId;
                                if (this.validator.isValid()) {
                                        var  ret = yield me.bookshelf.knex('group_info')
                                                .where('id', groupId)
                                                .select();
                                        if(!ret||ret.length==0)
                                        {
                                                return ActionResult.createErrorResult('集团不存在');
                                        }
                                        ret = ret[0];
                                        if (ret.status != me.util.constants.STATUS_ENABLE) {
                                                return ActionResult.createErrorResult('集团已被锁定');
                                        }

                                        var parentCode='';

                                        if(parentId!=0)
                                        {
                                                ret = yield me.bookshelf.knex('device_group')
                                                        .where('id',parentId)
                                                        .select();
                                                if(!ret||ret.length==0)
                                                {
                                                        return ActionResult.createErrorResult('父分组不存在');
                                                }
                                                ret = ret[0];

                                                parentCode=ret.code;
                                        }

                                        ret = yield me.bookshelf.knex('device_group')
                                                .where('groupId', groupId)
                                                .andWhereRaw('LENGTH(code)=?',[parentCode.length+3])
                                                .andWhere('code', 'like', `${parentCode}%`)
                                                .max('code as code');

                                        var nextCode;
                                        if(ret[0].code==null)
                                        {
                                                nextCode=parentCode+'001';
                                        }
                                        else
                                        {
                                                var temp=ret[0].code.substring(parentCode.length);
                                               temp=parseInt(temp)+1;
                                                if(temp<10) temp='00'+temp;
                                                else  if(10<temp<100) temp='0'+temp;
                                                else  if(1000>temp>=100) temp=temp;
                                                else
                                                return ActionResult.createErrorResult('分组已满'+parentCode);

                                                nextCode=parentCode+temp;
                                        }
                                       ret= yield me.bookshelf.knex('device_group').insert(
                                                {
                                                        name:this.p('name'),
                                                        groupId:groupId,
                                                        parentId:parentId,
                                                        code:nextCode,
                                                        sortFactor:this.p('sortFactor'),
                                                        createTime:new Date().getTime()
                                                })

                                        if (ret && ret.length > 0) {
                                                return ActionResult.createSuccessResult({id: ret[0]}).setMsg('创建设备分组成功');
                                        }
                                }
                        };
                }

                /**
                 * @api {get} /api/deviceGroup/read/:deviceGroupId 读取设备分组信息
                 * @apiName readDeviceGroup
                 * @apiGroup DeviceGroup
                 *
                 * @apiParam {Number} deviceGroupId * 设备分组ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                read() {
                        var me = this;
                        return function * () {
                                var groupId = this.session.USER.groupId;
                                var deviceGroupId = parseInt(this.params.deviceGroupId);
                                if (isNaN(deviceGroupId) || deviceGroupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备分组ID');
                                }
                                var ret= yield me.bookshelf.knex('device_group')
                                        .leftJoin('device_group as p','device_group.parentId','p.id')
                                .where('device_group.groupId',groupId)
                                .where('device_group.id',deviceGroupId)
                                        .select('device_group.*','p.name as parentName');
                                if (ret.length === 0) {
                                        return ActionResult.createValidateFailResult('设备分组不存在或不属于当前登录的集团用户');
                                }

                                var deviceGroup=ret[0];

                                ret=yield me.bookshelf.knex('device_group_relation')
                                .leftJoin('motor_device','device_group_relation.deviceId','motor_device.id').where('device_group_relation.deviceGroupId',deviceGroupId)
                                .select('motor_device.id','motor_device.imei','motor_device.deviceName')

                                deviceGroup.devices=ret;
                                return ActionResult.createSuccessResult(deviceGroup);
                        };
                }

                /**
                 * @api {post} /api/deviceGroup/update/:deviceGroupId 更新设备分组信息
                 * @apiName updateDeviceGroup
                 * @apiGroup DeviceGroup
                 *
                 * @apiParam {String} name  设备分组名称
                 * @apiParam {Number} sortFactor  排序因子，大->小排序
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * */
                update () {
                        var me=this;
                        return function * () {
                                var deviceGroupId = parseInt(this.params.deviceGroupId);
                                if (isNaN(deviceGroupId) || deviceGroupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备分组ID');
                                }
                                this.validator.check('name').optional().rangeLength(0, 30).end();
                                this.validator.check('sortFactor').optional().isInt().min(0).end();
                                var obj={
                                        id:deviceGroupId,
                                        name:this.p('name'),
                                        sortFactor:this.p('sortFactor')
                                }
                                for(var attr in obj)
                                {
                                        if(!obj[attr]) delete obj[attr];
                                }
                                yield me.bookshelf.knex('device_group')
                                        .where('id', deviceGroupId)
                                        .update(obj);
                                return ActionResult.createSuccessResult({});
                        };
                }

                /**
                 * @api {post} /api/deviceGroup/delete/:deviceGroupId 删除设备分组
                 * @apiName deleteDeviceGroup
                 * @apiGroup DeviceGroup
                 *
                 * @apiParam {Number} deviceGroupId * 设备分组ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                delete () {
                        var me=this;
                        return function * () {
                                var deviceGroupId = parseInt(this.params.deviceGroupId);
                                if (isNaN(deviceGroupId) || deviceGroupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备分组ID');
                                }

                                var ret= yield me.bookshelf.knex('device_group')
                                        .where('parentId', deviceGroupId)
                                        .count('id as count')
                                if(ret[0].count>0)
                                {
                                        return ActionResult.createErrorResult('设备分组下有子分组,无法删除');
                                }

                                 ret= yield me.bookshelf.knex('device_group_relation')
                                        .where('deviceGroupId', deviceGroupId)
                                        .count('id as count')

                                if(ret[0].count>0)
                                {
                                        return ActionResult.createErrorResult('设备分组下已存在设备,无法删除');
                                }

                                 ret = yield me.bookshelf.knex('device_group')
                                        .where('id', deviceGroupId)
                                        .delete();
                                if (ret == 1) {
                                        return ActionResult.createSuccessResult({}).setMsg('设备分组删除成功');
                                }
                                return ActionResult.createErrorResult('设备分组不存在');
                        };
                }

                /**
                 * @api {get} /api/deviceGroup/list 查询设备分组列表
                 * @apiName listDeviceGroup
                 * @apiGroup DeviceGroup
                 *
                 * @apiParam {String} name  设备分组名称 like
                  * @apiParam {String} code  设备分组code like
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
                                this.validator.check('groupId').optional().isInt().end();
                                this.validator.check('name').optional().end();
                                this.validator.check('code').optional().end();
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();

                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var name = this.parameter.param('name');
                                        var code = this.parameter.param('code');
                                        var builder = me.bookshelf.knex('device_group')

                                        builder.andWhere('device_group.groupId', this.session.USER.groupId);

                                        if (name) {
                                                builder.andWhere('device_group.name', 'like', `%${name}%`);
                                        }
                                        if (code) {
                                                builder.andWhere('device_group.code', 'like', `${code}%`);
                                        }
                                        var ret = yield me.util.countAndQuery(builder, page, rpp, null, 'device_group.*');
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }




                /**
                 * @api {get} /api/deviceGroup/listDetail 查询集团用户下所有设备分组及分组下设备
                 * @apiName listDetail
                 * @apiGroup DeviceGroup
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                listDetail () {
                        var me=this;
                        return function * () {
                                if (this.validator.isValid()) {
                                        var sql=" select device_group.* , group_concat(CONCAT(device_group_relation.deviceId,';',motor_device.imei,';',"+
                                                        " case when motor_device.deviceName is NULL  then 'null'  else motor_device.deviceName   end )) as devices"+
                                       " from device_group left JOIN   device_group_relation  on device_group.id=device_group_relation.deviceGroupId"+
                                                        "     left JOIN motor_device on device_group_relation.deviceId=motor_device.id   where device_group.groupId ="+ this.session.USER.groupId+" GROUP BY  device_group.id"
                                        var  ret=yield me.bookshelf.knex.schema.raw(sql);
                                        ret=ret[0];
                                        logger.error(JSON.stringify(ret));
                                        if(ret&&ret.length>0)
                                        {
                                                for(var i=0;i<ret.length;i++)
                                                {
                                                        var devices=ret[i].devices;
                                                        ret[i].devices=[];

                                                        if(devices==null)
                                                                continue;
                                                        var array=devices.split(",");
                                                        var obj;
                                                        for(var j=0;j<array.length;j++)
                                                        {
                                                                var str=array[j].split(";");
                                                                obj={
                                                                        deviceId:str[0],
                                                                        imei:str[1],
                                                                        deviceName:str[2]
                                                                }
                                                                ret[i].devices.push(obj)
                                                        }
                                                }
                                        }
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }


                /**
                 * @api {post} /api/deviceGroup/updateDevice/:deviceGroupId 更新设备分组和设备绑定关系
                 * @apiName updateDevice
                 * @apiGroup DeviceGroup
                 *
                 * @apiParam {Number} deviceGroupId * 设备分组ID
                 * @apiParam {String } deviceId * 设备ID列表，多个ID使用","分隔
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                updateDevice () {
                        var me=this;
                        return function * () {
                                var deviceGroupId = parseInt(this.params.deviceGroupId);
                                if (isNaN(deviceGroupId) || deviceGroupId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备分组ID');
                                }
                                this.validator.check('deviceId').necessary().end();
                                if(this.validator.isValid())
                                {
                                        var deviceId=this.p('deviceId');
                                        var array=deviceId.split(',');
                                        if(!deviceId||deviceId=='')
                                        {
                                                array=[];
                                        }
                                     /*   if(array.length<0)
                                        {
                                                return  ActionResult.createErrorResult('请至少添加一个设备');
                                        }
                                        var  ret = yield me.bookshelf.knex('device_group_relation')
                                                .where('deviceGroupId',deviceGroupId)
                                                .andWhere('deviceId','in',this.p('deviceId'))
                                                .count('id as count');
                                        if(ret[0].count>0)
                                        {
                                                return ActionResult.createErrorResult('设备列表中已有设备加入分组');
                                        }*/
                                        var failures=[];
                                        var tran = yield me.bookshelf.knex.transaction();
                                        var  ret = yield me.bookshelf.knex('device_group_relation')
                                                .where('deviceGroupId',deviceGroupId)
                                                .transacting(tran).del();
                                        for(var i=0;i<array.length;i++)
                                        {
                                                ret = yield me.bookshelf.knex('device_group_relation')
                                                        .insert({
                                                                deviceGroupId: deviceGroupId,
                                                                deviceId:array[i]
                                                        })
                                                        .transacting(tran);
                                                        if(!ret||ret.length==0)
                                                                failures.push(array[i])
                                        }

                                        if (failures.length == 0) {
                                                tran.commit();
                                                return ActionResult.createSuccessResult({});
                                        }
                                        else {
                                                tran.rollback();
                                                return ActionResult.createErrorResult('添加设备失败').setResult(failures);
                                        }

                                }
                        };
                }


                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = DeviceGroupController;
})();