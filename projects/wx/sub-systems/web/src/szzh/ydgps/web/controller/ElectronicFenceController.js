var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');

(function () {
        /**
         * Class ElectronicFenceController
         *
         * @class #NAMESPACE#.ElectronicFenceController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class ElectronicFenceController extends GenericObject {
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
                        this.cache = null;
                }

                /**
                 * @api {post} /api/electronic-fence/create 创建电子围栏区域
                 * @apiName createElectronicFence
                 * @apiGroup ElectronicFence
                 *
                 * @apiParam {String} name * 电子围栏区域名称
                 * @apiParam {String} type * 电子围栏区域类型，0：离开报警；1：进入报警；；2：进入离开均报警
                 * @apiParam {String} address * 中心点地址
                 * @apiParam {String} lat * 中心点纬度
                 * @apiParam {String} lng * 中心点经度
                 * @apiParam {Number} radius * 区域半径，单位：米
                 * @apiParam {Number} maxSpeed * 最大速度，单位：Km/h，0 - 120之间，０表示不限速
                 * @apiParam {String} devices * 该电子围栏区域应用的设备ID列表，多个设备使用","分隔
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                create () {
                        var me = this;
                        return function * () {
                                this.validator.check('name').necessary().end();
                                this.validator.check('type').necessary().enum(['0','1','2']).end();
                                this.validator.check('address').necessary().end();
                                this.validator.check('lat').necessary().isNumber().end();
                                this.validator.check('lng').necessary().isNumber().end();
                                this.validator.check('radius').necessary().isInt().end();
                                this.validator.check('maxSpeed').necessary().isInt().range(0, 120).end();
                                this.validator.check('devices').necessary().end();

                                var userGroup = this.session.USER.groupId;

                                if(this.validator.isValid()) {
                                        var tran = yield me.bookshelf.knex.transaction();
                                        try{
                                                var ret = null;
                                                var efData = {
                                                        groupId : userGroup,
                                                        name : this.p('name'),
                                                        type : this.p('type'),
                                                        address : this.p('address'),
                                                        lat : this.p('lat'),
                                                        lng : this.p('lng'),
                                                        radius : this.parameter.intParam('radius'),
                                                        maxSpeed : this.parameter.intParam('maxSpeed'),
                                                        createTime : new Date().getTime()
                                                };
                                                ret = yield me.bookshelf.knex.insert(efData)
                                                        .into('electronic_fence')
                                                        .transacting(tran);
                                                var efId = ret[0];
                                                var deviceList = this.p('devices').split(',');
                                                var dirtyEFIMEIs = [];
                                                for(var i = 0;i<deviceList.length;i++) {
                                                        if(!deviceList[i]) continue;
                                                        var deviceId = parseInt(deviceList[i]);
                                                        if(isNaN(deviceId)) {
                                                                throw new Error('设备ID错误');
                                                        }
                                                        ret = yield me.bookshelf.knex('motor_device').where({
                                                                id : deviceId,
                                                                groupId : userGroup
                                                        }).select();
                                                        if(ret.length === 0) {
                                                                throw new Error('设备['+deviceId+']不属于当前登录的集团用户');
                                                        }
                                                        dirtyEFIMEIs.push(ret[0].imei);
                                                        var efDeviceObj = {
                                                                efId : efId,
                                                                deviceId : deviceId
                                                        };
                                                        yield me.bookshelf.knex.insert(efDeviceObj)
                                                                .into('electronic_fence_devices')
                                                                .transacting(tran);
                                                }
                                                tran.commit();
                                                //通知设备更新电子围栏配置，参考CBB100Handler0x0001（心跳包时检查电子围栏更新）
                                                for(var i = 0;i<dirtyEFIMEIs.length;i++) {
                                                        yield me.cache.set('EF-DIRTY-' + dirtyEFIMEIs[i], '1');
                                                }
                                                return ActionResult.createSuccessResult().setMsg('创建电子围栏成功');
                                        }catch(err){
                                                //tran.rollback();
                                                return ActionResult.createErrorResult(err.message);
                                        }
                                }
                        };
                }

                /**
                 * @api {post} /api/electronic-fence/update/:efId 更新电子围栏区域
                 * @apiName updateElectronicFence
                 * @apiGroup ElectronicFence
                 *
                 * @apiParam {Number} efId * 电子围栏区域ID
                 * @apiParam {String} name * 电子围栏区域名称
                 * @apiParam {String} type * 电子围栏区域类型，0：离开报警；1：进入报警；2：进入离开均报警
                 * @apiParam {String} address * 中心点地址
                 * @apiParam {String} lat * 中心点纬度
                 * @apiParam {String} lng * 中心点经度
                 * @apiParam {Number} radius * 区域半径，单位：米
                 * @apiParam {Number} maxSpeed * 最大速度，单位：Km/h，0 - 120之间，０表示不限速
                 * @apiParam {String} devices * 该电子围栏区域应用的设备ID列表，多个设备使用","分隔
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                update () {
                        var me = this;
                        return function * () {
                                this.validator.check('name').necessary().end();
                                this.validator.check('type').necessary().enum(['0','1','2']).end();
                                this.validator.check('address').necessary().end();
                                this.validator.check('lat').necessary().isNumber().end();
                                this.validator.check('lng').necessary().isNumber().end();
                                this.validator.check('radius').necessary().isInt().end();
                                this.validator.check('maxSpeed').necessary().isInt().range(0, 120).end();
                                this.validator.check('devices').necessary().end();

                                var efId = parseInt(this.p('efId'));
                                if(isNaN(efId)) {
                                        return ActionResult.createErrorResult('错误的电子围栏ID');
                                }

                                var userGroup = this.session.USER.groupId;

                                var ret  = yield me.bookshelf.knex('electronic_fence').where({
                                        id : efId,
                                        groupId : userGroup
                                }).select();

                                if(ret.length === 0) {
                                        return ActionResult.createErrorResult('要修改的电子围栏ID不属于当前登录的集团用户');
                                }

                                var tran = yield me.bookshelf.knex.transaction();
                                try{
                                        var efData = {
                                                id : efId,
                                                groupId : userGroup,
                                                name : this.p('name'),
                                                type : this.p('type'),
                                                address : this.p('address'),
                                                lat : this.p('lat'),
                                                lng : this.p('lng'),
                                                radius : this.parameter.intParam('radius'),
                                                maxSpeed : this.parameter.intParam('maxSpeed'),
                                                createTime : new Date().getTime()
                                        };
                                        var dirtyEFIMEIs = [];
                                        //查询当前电子围栏、设备关系数据，通知设备更新
                                        ret = yield me.bookshelf.knex('electronic_fence_devices')
                                        .innerJoin('motor_device', 'electronic_fence_devices.deviceId', 'motor_device.id')
                                        .where({
                                                efId : efId
                                        }).select('motor_device.imei');
                                        for(var i = 0;i<ret.length;i++) {
                                                dirtyEFIMEIs.push(ret[i].imei);
                                        }
                                        //删除电子围栏、设备关系表
                                        yield me.bookshelf.knex('electronic_fence_devices').where({
                                                efId : efId
                                        }).transacting(tran).del();
                                        //更新电子围栏数据
                                        yield me.bookshelf.knex('electronic_fence')
                                                .update(efData)
                                                .transacting(tran);
                                        var deviceList = this.p('devices').split(',');
                                        //插入电子围栏、设备关系数据
                                        for(var i = 0;i<deviceList.length;i++) {
                                                if(!deviceList[i]) continue;
                                                var deviceId = parseInt(deviceList[i]);
                                                if(isNaN(deviceId)) {
                                                        throw new Error('设备ID错误');
                                                }
                                                ret = yield me.bookshelf.knex('motor_device').where({
                                                        id : deviceId,
                                                        groupId : userGroup
                                                }).select();
                                                if(ret.length === 0) {
                                                        throw new Error('设备['+deviceId+']不属于当前登录的集团用户');
                                                }
                                                dirtyEFIMEIs.push(ret[0].imei);
                                                var efDeviceObj = {
                                                        efId : efId,
                                                        deviceId : deviceId
                                                };
                                                yield me.bookshelf.knex.insert(efDeviceObj)
                                                        .into('electronic_fence_devices')
                                                        .transacting(tran);
                                        }
                                        tran.commit();
                                        //通知设备更新电子围栏配置，参考CBB100Handler0x0001（心跳包时检查电子围栏更新）
                                        for(var i = 0;i<dirtyEFIMEIs.length;i++) {
                                                yield me.cache.set('EF-DIRTY-' + dirtyEFIMEIs[i], '1');
                                        }
                                        return ActionResult.createSuccessResult().setMsg('更新电子围栏信息成功');
                                }catch(err){
                                        //tran.rollback();
                                        return ActionResult.createErrorResult(err.message);
                                }
                        };
                }

                /**
                 * @api {post} /api/electronic-fence/delete/:efId 删除电子围栏区域
                 * @apiName deleteElectronicFence
                 * @apiGroup ElectronicFence
                 *
                 * @apiParam {Number} efId * 电子围栏区域ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                delete () {
                        var me = this;
                        return function * () {
                                var efId = parseInt(this.p('efId'));
                                if(isNaN(efId)) {
                                        return ActionResult.createErrorResult('错误的电子围栏ID');
                                }
                                var userGroup = this.session.USER.groupId;

                                var ret  = yield me.bookshelf.knex('electronic_fence').where({
                                        id : efId,
                                        groupId : userGroup
                                }).select();

                                if(ret.length === 0) {
                                        return ActionResult.createErrorResult('要删除的电子围栏ID不属于当前登录的集团用户');
                                }

                                var tran = yield me.bookshelf.knex.transaction();
                                try{
                                        //删除电子围栏、设备关系表
                                        yield me.bookshelf.knex('electronic_fence_devices').where({
                                                efId : efId
                                        }).transacting(tran).del();
                                        //删除电子围栏表
                                        yield me.bookshelf.knex('electronic_fence').where({
                                                id : efId
                                        }).transacting(tran).del();

                                        tran.commit();
                                        return ActionResult.createSuccessResult().setMsg('删除电子围栏信息成功');
                                }catch(err){
                                        //tran.rollback();
                                        return ActionResult.createErrorResult(err.message);
                                }
                        };
                }

                /**
                 * @api {post} /api/electronic-fence/list 查询集团电子围栏区域列表
                 * @apiName listElectronicFence
                 * @apiGroup ElectronicFence
                 *
                 * @apiParam {Number} page 页号，默认1
                 * @apiParam {Number} rpp 每页记录数，系统默认值
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                list () {
                        var me = this;
                        return function * () {
                                this.validator.check('page').optional().isInt().min(1).end();
                                this.validator.check('rpp').optional().isInt().min(5).end();

                                var page = this.parameter.intParam('page', 'all', false) || 1;
                                var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;

                                var userGroup = this.session.USER.groupId;
                                var qb = me.bookshelf.knex('electronic_fence')
                                                        .where('groupId', userGroup);
                                var columns = [ '*' ];
                                var ret = yield me.util.countAndQuery(qb, page, rpp, null, columns);
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                /**
                 * @api {post} /api/electronic-fence/:efId/devices 查询电子围栏关联的设备列表
                 * @apiName queryElectronicFenceDevices
                 * @apiGroup ElectronicFence
                 *
                 * @apiParam {Number} efId * 电子围栏ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                queryEFDevices() {
                        var me = this;
                        return function * () {
                                var efId = parseInt(this.p('efId'));
                                if(isNaN(efId)) {
                                        return ActionResult.createErrorResult('错误的电子围栏ID');
                                }
                                var userGroup = this.session.USER.groupId;
                                var ret  = yield me.bookshelf.knex('electronic_fence').where({
                                        id : efId,
                                        groupId : userGroup
                                }).select();

                                if(ret.length === 0) {
                                        return ActionResult.createErrorResult('要查询的电子围栏ID不属于当前登录的集团用户');
                                }

                                ret = yield me.bookshelf.knex('electronic_fence_devices')
                                                .innerJoin('electronic_fence', 'electronic_fence_devices.efId', 'electronic_fence.id')
                                                .leftJoin('device_config', 'electronic_fence_devices.deviceId', 'device_config.deviceId')
                                                .leftJoin('device_group_relation', 'electronic_fence_devices.deviceId', 'device_group_relation.deviceId')
                                                .leftJoin('device_group', 'device_group.id', 'device_group_relation.deviceGroupId')
                                                .where(
                                                {
                                                        'electronic_fence.groupId' : userGroup
                                                })
                                                .orderBy('device_group.id')
                                                .select('electronic_fence_devices.*', 'device_config.vehicleNumber', 'device_group.id as deviceGroupId', 'device_group.name as deviceGroupName');
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                /**
                 * @api {post} /api/electronic-fence/toggle/:id/:flag 启用/禁用车辆电子围栏功能
                 * @apiName toggleDeviceElectronicFence
                 * @apiGroup ElectronicFence
                 *
                 * @apiParam {String} imei * 设备IMEI号
                 * @apiParam {String} flag * 启用/停用标识, "enabled"/"disabled"
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                toggleDeviceEF() {
                        var me = this;
                        return function * () {
                                var imei = this.params.imei;
                                if (imei.length != me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('非法的imei');
                                }
                                var flag = this.params.flag;
                                if(flag !== 'enabled' || flag !== 'disabled') {
                                        return ActionResult.createValidateFailResult('非法的toggle状态，enabled/disabled');
                                }
                                yield me.knex('device_config')
                                        .innerJoin('motor_device', 'device_config.deviceId', 'motor_device.id')
                                        .where('motor_device.imei', imei)
                                        .update({
                                                'device_config.efEnabled' : this.p('flag') == 'enabled' ? '1' : '0'
                                        });

                        };
                }

                /**
                 * @api {post} /api/electronic-fence/sync/:imei 同步设备的电子围栏配置到设备
                 * @apiName syncElectronicFence
                 * @apiGroup ElectronicFence
                 *
                 * @apiParam {String} imei * 设备IMEI号
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                syncDeviceElectronicFence () {
                        var me = this;
                        return function * () {
                                var imei = this.params.imei;
                                if (imei.length != me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('非法的imei');
                                }
                                yield me.cache.set('EF-DIRTY-' + imei, '1');
                                return ActionResult.createSuccessResult('已将设备['+imei+']电子围栏同步请求发送至队列，设备在线时将自动同步');
                        };
                }

                /**
                 * @api {post} /api/electronic-fence/device-fences/:imei 查询设备的电子围栏配置
                 * @apiName listDeviceElectronicFence
                 * @apiGroup ElectronicFence
                 *
                 * @apiParam {String} imei * 设备IMEI号
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                listDeviceElectronicFences () {
                        var me = this;
                        return function * () {
                                var userGroup = this.session.USER.groupId;
                                var imei = this.p('imei');
                                if (!imei || imei.length !== me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                }
                                var ret  = yield me.bookshelf.knex('electronic_fence_devices')
                                .innerJoin('electronic_fence', 'electronic_fence.id', 'electronic_fence_devices.efId')
                                .innerJoin('motor_device', 'motor_device.id', 'electronic_fence_devices.deviceId')
                                .where({
                                        'motor_device.imei' : imei,
                                        'motor_device.groupId' : userGroup
                                }).select('electronic_fence.*');
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = ElectronicFenceController;
})();