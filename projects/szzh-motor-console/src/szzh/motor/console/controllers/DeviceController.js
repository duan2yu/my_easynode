var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var crypto = require('crypto');
var fs = require('co-fs');
var path = require('path');
var excel = require('excel');
var thunkify = require('thunkify');
var Iconv = require('iconv').Iconv;
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var BeanFactory = using('easynode.framework.BeanFactory');

(function () {
        const MONGODB_URL = EasyNode.config('mongodb.url');
        const COLLECTION_DATA = EasyNode.config('mongodb.collection.data', 'CBB100DATA');
        var fnConnect = thunkify(MongoClient.connect);
        const UPLOAD_DIR = EasyNode.config('easynode.servers.koa-HttpServer.uploadDir', 'www/uploads');
        const PROJECT_UPLOAD_RELATIVE_DIR = EasyNode.real('projects/szzh-motor-console/www');
        const UTF8_2_ISO8891_1 = new Iconv('utf8', 'latin1');
        excel = thunkify(excel)
        var deviceControlMethod = EasyNode.config('service.deviceControl.method', 'GET');
        var timeout = parseInt(EasyNode.config('service.deviceControl.timeout', '5000'));


        /**
         * Class DeviceController
         *
         * @class #NAMESPACE#.DeviceController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class DeviceController extends GenericObject {
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
                        this.cache=null;                                     //IoC injection, cache
                }
                //设备库存查询
                queryInventory() {
                        var me = this;
                        return function * () {
                                this.validator.check('IMEI').optional().length(me.util.constants.IMEI_LENGTH).end();
                                this.validator.check('deviceType').optional().end();
                                this.validator.check('operatorRealName').optional().end();
                                this.validator.check('batch').optional().end();
                                this.validator.check('inventoryInTimeBegin').optional().datetime().end();
                                this.validator.check('inventoryInTimeEnd').optional().datetime().end();
                                this.validator.check('page').optional().isInt().min(1).end();
                                this.validator.check('rpp').optional().isInt().min(1).end();

                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;

                                        var qb = me.bookshelf.knex('motor_device')
                                                .leftJoin('motor_inventory_record as recordIn', 'motor_device.inventoryInId', 'recordIn.id')
                                                .leftJoin('motor_inventory_record as recordOut', 'motor_device.inventoryOutId', 'recordOut.id')
                                                .leftJoin('motor_vendor_user', 'recordIn.operatorId', 'motor_vendor_user.id');

                                        if (this.parameter.param('IMEI')) {
                                                qb.andWhere('motor_device.imei', this.parameter.param('IMEI'));
                                        }
                                        else {
                                                if (this.parameter.param('deviceType')) {
                                                        qb.andWhere('motor_device.deviceType', this.parameter.param('deviceType'));
                                                }

                                                if (this.parameter.param('operatorRealName')) {
                                                        qb.andWhere('motor_vendor_user.realName', this.parameter.param('operatorRealName'));
                                                }

                                                if (this.parameter.param('batch')) {
                                                        qb.andWhere('motor_device.batch', this.parameter.param('batch'));
                                                }

                                                if (this.parameter.param('inventoryInTimeBegin')) {
                                                        qb.andWhere('recordIn.createTime', '>=', this.parameter.datetimeParam('inventoryInTimeBegin').getTime());
                                                }

                                                if (this.parameter.param('inventoryInTimeEnd')) {
                                                        qb.andWhere('recordIn.createTime', '<', this.parameter.datetimeParam('inventoryInTimeEnd').getTime());
                                                }
                                        }

                                        var columns = [
                                                'motor_device.id', 'motor_device.imei', 'motor_device.deviceName', 'motor_device.regCode', 'motor_device.deviceType', 'motor_device.batch',
                                                'recordIn.createTime as inventoryInTime', 'recordOut.createTime as inventoryOutTime'
                                        ];

                                        var ret = yield me.util.countAndQuery(qb, page, rpp, null, columns);
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                //已装配设备查询
                queryInstalled() {
                        var me = this;
                        return function * () {
                                this.validator.check('IMEI').optional().length(me.util.constants.IMEI_LENGTH).end();
                                this.validator.check('vendorId').optional().isInt().min(0).end();
                                this.validator.check('masterMobile').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('batch').optional().end();
                                this.validator.check('bind').optional().enum(['0', '1']).end();
                                this.validator.check('page').optional().isInt().min(1).end();
                                this.validator.check('rpp').optional().isInt().min(1).end();

                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;

                                        var qb = me.bookshelf.knex('motor_device')
                                                .leftJoin('motor_user', 'motor_device.masterId', 'motor_user.id')
                                                .leftJoin('motor_vendor', 'motor_device.vendorId', 'motor_vendor.id')
                                                .leftJoin('motor_inventory_record as inventoryOut', 'motor_device.inventoryOutId', 'inventoryOut.id')
                                                .leftJoin('motor_inventory_record as inventoryIn', 'motor_device.inventoryInId', 'inventoryIn.id')
                                                .where('motor_device.installed', me.util.constants.INSTALLED_DEVICE);

                                        if (this.parameter.param('IMEI')) {
                                                qb.andWhere('motor_device.imei', this.parameter.param('IMEI'));
                                        }
                                        if (this.parameter.param('masterMobile')) {
                                                qb.andWhere('motor_user.phone', this.parameter.param('masterMobile'));
                                        }

                                        if (this.parameter.param('batch')) {
                                                qb.andWhere('motor_device.batch', this.parameter.param('batch'));
                                        }

                                        if (this.parameter.param('vendorId')) {
                                                qb.andWhere('motor_device.vendorId', this.parameter.intParam('vendorId'));
                                        }

                                        if (this.parameter.param('bind')) {
                                                qb.andWhere('motor_device.bind', this.parameter.intParam('bind'));
                                        }

                                        var columns = [
                                                'motor_device.id', 'motor_device.imei', 'motor_device.deviceName', 'motor_device.regCode', 'motor_device.deviceType',
                                                'motor_device.batch', 'motor_device.motorModel', 'motor_device.masterId','motor_device.bind',
                                                'motor_user.phone as masterMobile', 'motor_user.nickName as masterName', 'motor_vendor.name as vendorName',
                                                'inventoryIn.createTime as inventoryInTime', 'inventoryOut.createTime as inventoryOutTime'
                                        ];

                                        var ret = yield me.util.countAndQuery(qb, page, rpp, null, columns);
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                //未装配设备查询
                queryUninstalled() {
                        var me = this;
                        return function * () {
                                this.validator.check('IMEI').optional().length(me.util.constants.IMEI_LENGTH).end();
                                this.validator.check('vendorId').optional().isInt().min(0).end();
                                this.validator.check('batch').optional().end();
                                this.validator.check('inventoryOutTimeBegin').optional().datetime().end();
                                this.validator.check('inventoryOutTimeEnd').optional().datetime().end();
                                this.validator.check('page').optional().isInt().min(1).end();
                                this.validator.check('rpp').optional().isInt().min(1).end();

                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;

                                        var qb = me.bookshelf.knex('motor_device')
                                                .leftJoin('motor_vendor', 'motor_device.vendorId', 'motor_vendor.id')
                                                .leftJoin('motor_inventory_record as inventoryOut', 'motor_device.inventoryOutId', 'inventoryOut.id')
                                                .leftJoin('motor_inventory_record as inventoryIn', 'motor_device.inventoryInId', 'inventoryIn.id')
                                                .where('motor_device.installed', me.util.constants.UNINSTALLED_DEVICE);

                                        if (this.parameter.hasParam('IMEI')) {
                                                qb.andWhere('motor_device.imei', this.parameter.param('IMEI'));
                                        }
                                        else {
                                                if (this.parameter.param('batch')) {
                                                        qb.andWhere('motor_device.batch', this.parameter.param('batch'));
                                                }

                                                if (this.parameter.param('vendorId')) {
                                                        qb.andWhere('motor_device.vendorId', this.parameter.intParam('vendorId'));
                                                }

                                                if (this.parameter.param('inventoryOutTimeBegin')) {
                                                        qb.andWhere('inventoryOut.createTime', '>=', this.parameter.datetimeParam('inventoryOutTimeBegin').getTime());
                                                }

                                                if (this.parameter.param('inventoryOutTimeEnd')) {
                                                        qb.andWhere('inventoryOut.createTime', '<', this.parameter.datetimeParam('inventoryOutTimeEnd').getTime());
                                                }
                                        }

                                        var columns = [
                                                'motor_device.id', 'motor_device.imei', 'motor_device.deviceName', 'motor_device.regCode', 'motor_device.deviceType', 'motor_device.batch',
                                                'inventoryIn.createTime as inventoryInTime', 'inventoryOut.createTime as inventoryOutTime', 'motor_vendor.name as vendorName'
                                        ];

                                        var ret = yield me.util.countAndQuery(qb, page, rpp, null, columns);
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }

                singleInventoryIn() {
                        var me = this;
                        return function * () {
                                this.validator.check('IMEI').necessary().length(me.util.constants.IMEI_LENGTH).end();
                                this.validator.check('deviceType').necessary().end();
                                this.validator.check('batch').optional().end();
                                this.validator.check('regCode').optional().match(me.util.getRegExps().regCode).end();
                                this.validator.check('comment').optional().end();
                                this.validator.check('reason').optional().enum(['0', '2']).end();

                                if (this.validator.isValid()) {
                                        var regCode = this.parameter.hasParam('regCode') ? this.parameter.param('regCode') : me.util.constants.DEFAULT_REGCODE;
                                        var inventoryInId = new Date().toFormat('YYYYMMDD');
                                        for (var i = 0; i < 8; i++) {
                                                inventoryInId += parseInt(Math.random() * 10);
                                        }
                                        /*
                                         事务流程：
                                         １、获取入库id
                                          2、写入motor_device
                                          3、写入motor_inventory_record
                                         */
                                        var tran = yield me.bookshelf.knex.transaction();
                                        try {
                                                var ret = null;
                                                var now = new Date().getTime();
                                                var inventoryRecord = {
                                                        id : inventoryInId,
                                                        quantity : 1,
                                                        deviceDetail: this.parameter.param('IMEI'),
                                                        vendorFrom: this.session.USER.vendorId,
                                                        vendorTo: this.session.USER.vendorId,
                                                        operatorId: this.session.USER.id,
                                                        type: me.util.constants.INVENTORY_IN,
                                                        comment: this.parameter.param('comment'),
                                                        reason: this.parameter.intParam('reason', 'all', false),
                                                        createTime: now
                                                };
                                                yield me.bookshelf.knex.insert(inventoryRecord)
                                                        .into('motor_inventory_record')
                                                        .transacting(tran);
                                                var device = {
                                                        imei: this.parameter.param('IMEI'),
                                                        batch: this.parameter.param('batch'),
                                                        regCode: regCode,
                                                        deviceType: this.parameter.param('deviceType'),
                                                        inventoryInId: inventoryInId,
                                                        installed: me.util.constants.UNINSTALLED_DEVICE,
                                                        updateTime: now,
                                                        createTime: now
                                                };
                                                ret = yield me.bookshelf.knex.insert(device)
                                                        .into('motor_device')
                                                        .transacting(tran);
                                                var deviceId = ret[0];
                                                tran.commit();
                                                return ActionResult.createSuccessResult({id: deviceId}).setMsg('设备入库成功');
                                        } catch (err) {
                                                tran.rollback();                                              //exception caused??
                                                throw err;
                                        }
                                }
                        };
                }

                //批量入库
                batchInventoryIn() {
                        var me = this;
                        return function * () {
                                this.validator.check('deviceType').necessary().end();
                                this.validator.check('importFile').file(true, '.xlsx').end();
                                //this.validator.check('reason').enum(['1', '2']).end();
                                this.validator.check('comment').optional().end();

                                if (this.validator.isValid()) {
                                        var file = yield this.parameter.fileParam('importFile');
                                        EasyNode.DEBUG && logger.debug(JSON.stringify(file));
                                        var uploadFileName = file.name;
                                        var uploadFilePath = file.path;

                                        var filePath = path.join(EasyNode.real(UPLOAD_DIR), '../../', uploadFilePath);
                                        EasyNode.DEBUG && logger.debug(filePath);
                                        var content = yield excel(filePath);
                                        if (content.length <= 1) {
                                                return ActionResult.createValidateFailResult('没有要导入的设备');
                                        }
                                        var inventoryInId = new Date().toFormat('YYYYMMDD');
                                        for (var i = 0; i < 8; i++) {
                                                inventoryInId += parseInt(Math.random() * 10);
                                        }
                                        EasyNode.DEBUG && logger.debug('inventory excel data : ' + JSON.stringify(content));
                                        var tran = yield me.bookshelf.knex.transaction();
                                        var failures = [];
                                        var operatorId = this.session.USER.id;
                                        var quantity = 0;
                                        try {
                                                for (var i = 1; i < content.length; i++) {
                                                        var IMEI = content[i][0];
                                                        if (!IMEI) {
                                                                continue;
                                                        }
                                                        quantity++;
                                                        var regCode = content[i][1] || '123456';
                                                        var batch = content[i][2] || '';
                                                        var ret = null;
                                                        var now = new Date().getTime();
                                                        var device = {
                                                                imei: IMEI,
                                                                batch: batch,
                                                                regCode: regCode,
                                                                deviceType: this.parameter.param('deviceType'),
                                                                inventoryInId: inventoryInId,
                                                                installed: me.util.constants.UNINSTALLED_DEVICE,
                                                                updateTime: now,
                                                                createTime: now
                                                        };
                                                        try {
                                                                ret = yield me.bookshelf.knex.insert(device)
                                                                        .into('motor_device')
                                                                        .transacting(tran);
                                                        } catch (err) {
                                                                if (err.message.match(/.*ER_DUP_ENTRY.*/)) {
                                                                        logger.error('设备IMEI号重复[' + IMEI + ']');
                                                                        failures.push(IMEI);
                                                                }
                                                                else {
                                                                        throw err;
                                                                }
                                                        }
                                                }

                                                if (failures.length == 0) {
                                                        var inventoryRecord = {
                                                                id : inventoryInId,
                                                                quantity: quantity,
                                                                deviceDetail: uploadFileName + ":" + uploadFilePath,
                                                                vendorFrom: this.session.USER.vendorId,
                                                                vendorTo: this.session.USER.vendorId,
                                                                //reason: this.parameter.intParam('reason', 'all', false),
                                                                reason : 1,                             //reason 1 : 正常入库
                                                                comment: this.parameter.param('comment'),
                                                                type: me.util.constants.INVENTORY_TYPE_BATCH_IN,
                                                                operatorId: this.session.USER.id,
                                                                createTime: now
                                                        };
                                                        ret = yield me.bookshelf.knex.insert(inventoryRecord)
                                                                .into('motor_inventory_record')
                                                                .transacting(tran);
                                                        tran.commit();
                                                        return ActionResult.createSuccessResult({}).setMsg('设备批量入库成功');
                                                }
                                                else {
                                                        tran.rollback();
                                                        return ActionResult.createErrorResult('设备批量入库失败').setResult(failures);
                                                }
                                        } catch (err) {
                                                tran.rollback();                                              //exception caused??
                                                throw err;
                                        }
                                }
                        };
                }

                //批量出库
                batchInventoryOut() {
                        var me = this;
                        return function * () {
                                this.validator.check('deviceType').necessary().end();
                                this.validator.check('vendorId').necessary().isInt().min(0).end();
                                this.validator.check('importFile').file(true, '.xlsx').end();
                                this.validator.check('reason').enum(['1', '2']).end();
                                this.validator.check('comment').optional().end();

                                if (this.validator.isValid()) {
                                        var file = yield this.parameter.fileParam('importFile');
                                        EasyNode.DEBUG && logger.debug(JSON.stringify(file));
                                        var uploadFileName = file.name;
                                        var uploadFilePath = file.path;

                                        var filePath = path.join(EasyNode.real(UPLOAD_DIR), '../../', uploadFilePath);
                                        EasyNode.DEBUG && logger.debug(filePath);
                                        var content = yield excel(filePath);
                                        if (content.length <= 1) {
                                                return ActionResult.createValidateFailResult('没有要导出的设备');
                                        }
                                        EasyNode.DEBUG && logger.debug('inventory excel data : ' + JSON.stringify(content));
                                        var tran = yield me.bookshelf.knex.transaction();
                                        var failures = [];
                                        var operatorId = this.session.USER.id;
                                        var operatorVendorId = this.session.USER.vendorId;
                                        var vendorId = this.parameter.intParam('vendorId');
                                        var deviceType = this.parameter.param('deviceType');
                                        var quantity = 0;
                                        var inventoryOutId = new Date().toFormat('YYYYMMDD');
                                        for (var i = 0; i < 8; i++) {
                                                inventoryOutId += parseInt(Math.random() * 10);
                                        }
                                        try {
                                                ret = yield me.bookshelf.knex('motor_vendor')
                                                        .where({
                                                                id: vendorId,
                                                                status: me.util.constants.VENDOR_ENABLED
                                                        })
                                                        .select();
                                                if (ret.length == 0) {
                                                        tran.rollback();
                                                        return ActionResult.createErrorResult('厂商不存在或已被锁定');
                                                }
                                                for (var i = 1; i < content.length; i++) {
                                                        var IMEI = content[i][0];
                                                        if (!IMEI) {
                                                                continue;
                                                        }
                                                        quantity++;
                                                        var ret = null;
                                                        var now = new Date().getTime();
                                                        ret = yield me.bookshelf.knex.select('id')
                                                                .from('motor_device')
                                                                .where({
                                                                        imei: IMEI,
                                                                        vendorId: operatorVendorId,
                                                                        deviceType: deviceType
                                                                })
                                                                .transacting(tran);
                                                        if (ret.length == 0) {
                                                                //failures.push(`设备(IMEI:${IMEI})不存在或型号不符或操作者无权处理`);
                                                                failures.push(IMEI);
                                                                continue;
                                                        }
                                                        ret = yield me.bookshelf.knex('motor_device')
                                                                .where({imei: IMEI})
                                                                .update({
                                                                        vendorId: vendorId,
                                                                        inventoryOutId: inventoryOutId,
                                                                        updateTime: now
                                                                });
                                                }

                                                if (failures.length == 0) {
                                                        var inventoryRecord = {
                                                                id : inventoryOutId,
                                                                type: me.util.constants.INVENTORY_TYPE_BATCH_OUT,
                                                                quantity: quantity,
                                                                deviceDetail: uploadFileName + ":" + uploadFilePath,
                                                                vendorFrom: this.session.USER.vendorId,
                                                                vendorTo: vendorId,
                                                                reason: this.parameter.intParam('reason', 'all', false),
                                                                comment: this.parameter.param('comment'),
                                                                operatorId: this.session.USER.id,
                                                                createTime: now
                                                        };
                                                        ret = yield me.bookshelf.knex.insert(inventoryRecord)
                                                                .into('motor_inventory_record')
                                                                .transacting(tran);
                                                        tran.commit();
                                                        return ActionResult.createSuccessResult({}).setMsg('设备批量出库成功');
                                                }
                                                else {
                                                        tran.rollback();
                                                        return ActionResult.createErrorResult('设备批量出库失败').setResult(failures);
                                                }
                                        } catch (err) {
                                                tran.rollback();                                              //exception caused??
                                                throw err;
                                        }
                                }
                        };
                }

                //查询设备出入库记录
                queryInventoryLog() {
                        var me = this;
                        return function * () {
                                this.validator.check('type').enum(['0', '1']).end();
                                this.validator.check('vendorId').optional().isInt().min(0).end();
                                this.validator.check('beginTime').optional().datetime().end();
                                this.validator.check('endTime').optional().datetime().end();
                                this.validator.check('operatorRealName').optional().end();
                                this.validator.check('page').optional().isInt().min(1).end();
                                this.validator.check('rpp').optional().isInt().min(1).end();

                                if (this.validator.isValid()) {
                                        var opName = '入库';
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var type = this.parameter.intParam('type');
                                        var qb = me.bookshelf.knex('motor_inventory_record')
                                                .leftJoin('motor_vendor_user', 'motor_inventory_record.operatorId', 'motor_vendor_user.id')
                                                .leftJoin('motor_vendor', 'motor_inventory_record.vendorTo', 'motor_vendor.id')
                                                .where('motor_inventory_record.type', type)
                                                .andWhere('motor_inventory_record.vendorFrom', this.session.USER.vendorId);
                                        if (this.parameter.hasParam('beginTime')) {
                                                qb.andWhere('motor_inventory_record.createTime', '>=', this.parameter.datetimeParam('beginTime').getTime());
                                        }
                                        if (this.parameter.hasParam('endTime')) {
                                                qb.andWhere('motor_inventory_record.createTime', '<', this.parameter.datetimeParam('endTime').getTime());
                                        }
                                        if (this.parameter.hasParam('operatorRealName')) {
                                                qb.andWhere('motor_vendor_user.realName', 'like', '%' + this.parameter.param('operatorRealName') + '%');
                                        }

                                        if (type === me.util.constants.INVENTORY_OUT) {
                                                opName = '出库';
                                                if (this.parameter.hasParam('vendorId')) {
                                                        qb.andWhere('motor_inventory_record.vendorTo', this.parameter.intParam('vendorId'));
                                                }
                                        }

                                        var columns = [
                                                'motor_inventory_record.*',
                                                'motor_vendor_user.realName as operatorRealName',
                                                'motor_vendor.name as vendorToName'
                                        ];

                                        var ret = yield me.util.countAndQuery(qb, page, rpp, 'motor_inventory_record.createTime DESC', columns);
                                        return ActionResult.createSuccessResult(ret).setMsg(`查询${opName}记录成功`);
                                }
                        };
                }

                //查询出入库记录详情
                readInventoryLog() {
                        var me = this;
                        return function * () {
                                var id = parseInt(this.params.id);
                                if (isNaN(id) || id < 1) {
                                        return ActionResult.createValidateFailResult('非法的出入库日志ID');
                                }

                                var ret = yield me.bookshelf.knex('motor_inventory_record')
                                        .leftJoin('motor_vendor as vendorFrom', 'motor_inventory_record.vendorFrom', 'vendorFrom.id')
                                        .leftJoin('motor_vendor as vendorTo', 'motor_inventory_record.vendorTo', 'vendorTo.id')
                                        .leftJoin('motor_vendor_user', 'motor_inventory_record.operatorId', 'motor_vendor_user.id')
                                        .where('motor_inventory_record.id', id)
                                        .andWhere('motor_inventory_record.vendorFrom', this.session.USER.vendorId)
                                        .select(
                                                'motor_inventory_record.*',
                                                'vendorFrom.name as vendorFromName', 'vendorTo.name as vendorToName',
                                                'motor_vendor_user.realName as operatorRealName'
                                        );
                                if(ret.length == 1) {
                                        return ActionResult.createSuccessResult(ret[0]).setMsg('查询成功');
                                }
                                else {
                                        return ActionResult.createErrorResult('没有查到相关记录');
                                }
                        };
                }

                //下载出入库时上传的文件
                downloadInventoryUploadFile() {
                        var me = this;
                        return function * () {
                                var id = parseInt(this.params.id);
                                if (isNaN(id) || id < 1) {
                                        return ActionResult.createValidateFailResult('非法的出入库日志ID');
                                }

                                var ret = yield me.bookshelf.knex('motor_inventory_record')
                                        .leftJoin('motor_vendor as vendorFrom', 'motor_inventory_record.vendorFrom', 'vendorFrom.id')
                                        .where('motor_inventory_record.id', id)
                                        .andWhere('motor_inventory_record.vendorFrom', this.session.USER.vendorId)
                                        .select(
                                                'motor_inventory_record.deviceDetail'
                                        );
                                if(ret.length == 0) {
                                        return ActionResult.createErrorResult('没有查到相关记录');
                                }
                                var fileName = ret[0].deviceDetail.split(':');
                                var filePath = path.join(PROJECT_UPLOAD_RELATIVE_DIR, fileName[1]);
                                EasyNode.DEBUG && logger.debug(filePath);
                                var content = yield fs.readFile(filePath);
                                me.util.setDownloadHeader(this, fileName[0], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                                this.body = content;
                        };
                }

                //设备装配
                installDevices() {
                        var me = this;
                        return function * () {
                                this.validator.check('vendorId').necessary().isInt().min(0).end();
                                this.validator.check('importFile').file(true, '.xlsx').end();

                                if(this.validator.isValid()) {
                                        var file = yield this.parameter.fileParam('importFile');
                                        EasyNode.DEBUG && logger.debug(JSON.stringify(file));
                                        var uploadFileName = file.name;
                                        var uploadFilePath = file.path;

                                        var filePath = path.join(EasyNode.real(UPLOAD_DIR), '../../', uploadFilePath);
                                        EasyNode.DEBUG && logger.debug(filePath);
                                        var content = yield excel(filePath);
                                        if (content.length <= 1) {
                                                return ActionResult.createValidateFailResult('没有要安装的设备');
                                        }
                                        EasyNode.DEBUG && logger.debug('install excel data : ' + JSON.stringify(content));
                                        var tran = yield me.bookshelf.knex.transaction();
                                        var failures = [];
                                        var operatorId = this.session.USER.id;
                                        var operatorVendorId = this.session.USER.vendorId;
                                        var vendorId = this.parameter.intParam('vendorId');
                                        var quantity = 0;
                                        var dateRegExp = /^\d{4}-\d{2}-\d{2}$/;
                                        try {
                                                ret = yield me.bookshelf.knex('motor_vendor')
                                                        .where({
                                                                id: vendorId,
                                                                status: me.util.constants.VENDOR_ENABLED
                                                        })
                                                        .select();
                                                if (ret.length == 0) {
                                                        tran.rollback();
                                                        return ActionResult.createErrorResult('厂商不存在或已被锁定');
                                                }
                                                for (var i = 1; i < content.length; i++) {
                                                        var row = content[i];
                                                        var IMEI = row[0];
                                                        if (!IMEI) {
                                                                continue;
                                                        }
                                                        quantity++;
                                                        var ret = null;
                                                        var now = new Date().getTime();
                                                        ret = yield me.bookshelf.knex.select('masterId', 'installed')
                                                                .from('motor_device')
                                                                .where({
                                                                        imei: IMEI,
                                                                        vendorId: operatorVendorId
                                                                })
                                                                .transacting(tran);
                                                        if (ret.length == 0) {
                                                                failures.push(IMEI);
                                                                continue;
                                                        }
                                                        if(ret[0].masterId > 0 && ret[0].installed === me.util.constants.INSTALLED_DEVICE) {
                                                                failures.push(`设备(IMEI:${IMEI})已经在使用状态`);
                                                        }
                                                        ret = yield me.bookshelf.knex('motor_device')
                                                                .where({imei: IMEI})
                                                                .update({
                                                                        motorBrand : row[1],
                                                                        motorModel : row[2],
                                                                        motorColor : row[3],
                                                                        motorCode : row[4],
                                                                        motorEnginCode : row[5],
                                                                        motorBornTime : dateRegExp.test(row[6]) ? new Date(row[6]).getTime() : 0,
                                                                        motorNumber : row[7],
                                                                        installed : me.util.constants.INSTALLED_DEVICE,
                                                                        updateTime: now
                                                                });
                                                }

                                                if (failures.length == 0) {
                                                        tran.commit();
                                                        return ActionResult.createSuccessResult({}).setMsg('设备装配记录导入成功');
                                                }
                                                else {
                                                        tran.rollback();
                                                        return ActionResult.createErrorResult('设备装配记录导入失败').setResult(failures);
                                                }
                                        } catch (err) {
                                                tran.rollback();                                              //exception caused??
                                                throw err;
                                        }
                                }
                        }
                }

                //删除设备
                deleteDevice() {
                        var me = this;
                        return function * () {
                                var imei = this.params.imei;
                                if (!imei || imei.length !== me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                }
                                var ret = yield me.bookshelf.knex('motor_device')
                                        .where('motor_device.imei', imei)
                                        .del();
                                if(ret > 0) {
                                        return ActionResult.createSuccessResult(ret[0]).setMsg('删除设备成功');
                                }

                                return ActionResult.createErrorResult('删除设备失败，IMEI为['+imei+']的设备不存在');
                        };
                }

                //更新设备信息
                updateDeviceInfo() {
                        var me = this;
                        return function * () {
                                var imei = this.params.imei;
                                if (!imei || imei.length !== me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                }

                                var obj = this.parameter.params();
                                var count = 0;
                                for(var key in obj) {
                                        count ++;
                                }
                                if(count === 0) {
                                        return ActionResult.createValidateFailResult('缺少更新字段');
                                }
                                var ret  = yield me.bookshelf.knex('motor_device').update(obj).where('motor_device.imei', imei);

                                if(ret > 0) {
                                        return ActionResult.createSuccessResult(ret[0]).setMsg('更新设备资料成功');
                                }

                                return ActionResult.createErrorResult('更新设备资料失败，IMEI为['+imei+']的设备不存在');
                        };
                }


                /**
                 * @api {get} /api/device/info/:imei 查询设备详情
                 * @apiName deviceInfo
                 * @apiGroup Device
                 *
                 * @apiParam {String} imei 设备IMEI号, like
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                readDeviceInfo() {
                        var me = this;
                        return function * () {
                                var imei = this.params.imei;
                                if (!imei || imei.length !== me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                }
                                var ret = yield me.bookshelf.knex('motor_device')
                                        .leftJoin('device_config', 'motor_device.id', 'device_config.deviceId')
                                        .where('motor_device.imei', imei)
                                        .select(
                                        'motor_device.id as deviceId', 'motor_device.imei', 'motor_device.phone',
                                        'motor_device.appVersion', 'motor_device.firmwareVersion','motor_device.deviceType','motor_device.groupId','motor_device.simType',
                                        'device_config.host','device_config.port','device_config.masterMobile','device_config.micSensitivity',
                                        'device_config.alarmProcessFrom',
                                        'device_config.alarmProcessDevice','device_config.alarmProcessCenter','device_config.phoneCallCenter', 'device_config.phoneCallDevice',
                                        'device_config.reportIntervalM', 'device_config.reportIntervalS','device_config.serviceExpire','device_config.simExpire',
                                        'device_config.smsCenter','device_config.smsDevice','device_config.vehicleNumber','device_config.workMode'
                                );
                                if(ret && ret.length > 0) {
                                        return ActionResult.createSuccessResult(ret[0]).setMsg('查询设备信息成功');
                                }

                                return ActionResult.createErrorResult('查不到IMEI为['+imei+']的设备');
                        };
                }

                /**
                 * @api {get} /api/device/list 查询设备列表
                 * @apiName listDevice
                 * @apiGroup Device
                 *
                 * @apiParam {Number} onlineState 在线状态，0离线，1在线
                 * @apiParam {String} imei 设备IMEI号, like
                 * @apiParam {String} groupId 设备集团id
                 * @apiParam {String} phone 车载手机
                 * @apiParam {String} simType SIM卡类型：0.用户自备SIM卡 1.运营商定制卡
                 * @apiParam {String} vehicleNumber 车牌号码, like
                 * @apiParam {String} masterMobile  车主手机
                 * @apiParam {String} simExpire SIM卡到期时间，yyyy-MM-dd, <=
                 * @apiParam {String} serviceExpire 服务到期时间，yyyy-MM-dd, <=
                 * @apiParam {String} model 设备型号
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
                                this.validator.check('onlineState').optional().enum(['0', '1']).end();
                                this.validator.check('simType').optional().enum(['0', '1']).end();
                                this.validator.check('imei').optional().end();
                                this.validator.check('phone').optional().end();
                                // this.validator.check('phone').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('simExpire').optional().date().end();
                                this.validator.check('serviceExpire').optional().date().end();
                                this.validator.check('groupId').optional().isInt().min(0).end();
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();
                                var model=this.p('model');
                                var simExpire=this.p('simExpire')!=null?this.parameter.dateParam('simExpire').getTime():null;
                                var serviceExpire=this.p('serviceExpire')!=null?this.parameter.dateParam('serviceExpire').getTime():null;
                                var groupId=this.parameter.intParam('groupId');
                                if (this.validator.isValid()) {
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;

                                        var imei = this.parameter.param('imei');
                                        var onlineState = this.parameter.param('onlineState');
                                        var phone = this.parameter.param('phone');
                                        var masterMobile = this.parameter.param('masterMobile');
                                        var simType=this.parameter.param('simType');
                                        var vehicleNumber=this.parameter.param('vehicleNumber');
                                        var builder = me.bookshelf.knex('motor_device')
                                                .leftJoin('device_config', 'motor_device.id', 'device_config.deviceId')
                                                .leftJoin('device_state', 'motor_device.id', 'device_state.deviceId')
                                                .leftJoin('device_group_relation', 'motor_device.id', 'device_group_relation.deviceId')
                                                .leftJoin('device_group', 'device_group.id', 'device_group_relation.deviceGroupId')

                                        if(!isNaN(groupId)&&groupId>=0)
                                        {
                                                builder.andWhere('motor_device.groupId',  groupId);
                                        }
                                        if (imei) {
                                                builder.andWhere('motor_device.imei', 'like', `%${imei}%`);
                                        }
                                        if(simType)
                                        {
                                                builder.andWhere('motor_device.simType',simType);
                                        }
                                        if (phone) {
                                                builder.andWhere('motor_device.phone',phone);
                                        }
                                        if(masterMobile)
                                        {
                                                builder.andWhere('device_config.masterMobile',masterMobile);
                                        }
                                        if(vehicleNumber)
                                        {
                                                builder.andWhere('device_config.vehicleNumber', 'like', `%${vehicleNumber}%`);
                                        }
                                        if (onlineState) {
                                                builder.andWhere('device_state.state', onlineState);
                                        }
                                        if(model)
                                        {
                                                builder.andWhere('motor_device.model', model);
                                        }
                                        if (simExpire) {
                                                builder.andWhere('device_config.simExpire','<=', simExpire);
                                        }
                                        if (serviceExpire) {
                                                builder.andWhere('device_config.serviceExpire','<=', serviceExpire);
                                        }
                                        var ret = yield me.util.countAndQuery(builder, page, rpp, null,
                                                'motor_device.id as deviceId', 'motor_device.imei', 'motor_device.phone',
                                                'motor_device.deviceType','motor_device.appVersion',
                                                'device_config.masterMobile',
                                                'device_config.smsDevice','device_config.smsCenter','device_config.simExpire', 'device_config.serviceExpire',
                                                'device_config.vehicleNumber', 'device_state.state as onlineState',
                                                'device_group.id as deviceGroupId','device_group.name as deviceGroupName'
                                        );
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }


                /**
                 * @api {get} /api/device/msgLog/:imei 查询设备消息记录
                 * @apiName listDeviceMsgLog
                 * @apiGroup Device
                 *
                 * @apiParam {String} imei 设备IMEI号, like
                 * @apiParam {String} cmd 指令
                 * @apiParam {String} beginTime 开始时间，yyyy-MM-dd HH:mm:ss
                 * @apiParam {String} endTime 结束时间，yyyy-MM-dd HH:mm:ss
                 * @apiParam {Number} page 页号，默认1
                 * @apiParam {Number} rpp 每页记录数，系统默认值
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                queryMsgLog () {
                        var me = this;
                        return function * () {
                                var imei = this.params.imei;
                                if (!imei || imei.length !== me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                }
                                this.validator.check('cmd').optional().end();
                                this.validator.check('beginTime').optional().datetime().end();
                                this.validator.check('endTime').optional().datetime().end();
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();
                                if (this.validator.isValid()) {
                                        var beginTime=this.p('beginTime')!=null?this.parameter.datetimeParam('beginTime').getTime():null;
                                        var endTime=this.p('endTime')!=null?this.parameter.datetimeParam('endTime').getTime():null;
                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;

                                        var ret =yield me.bookshelf.knex('motor_device')
                                        .where('imei',imei)
                                        .select('id');
                                        if(ret.length==0)
                                        {
                                                return ActionResult.createValidateFailResult('未找到imei对应的设备');
                                        }

                                        var deviceId=ret[0].id;
                                        var builder = me.bookshelf.knex('device_msg_log')
                                                .where('deviceId',deviceId)
                                        if(this.p('cmd'))
                                        {
                                                builder.andWhere('device_msg_log.cmd',  this.p('cmd'));
                                        }
                                        if (beginTime) {
                                                builder.andWhere('device_msg_log.logTime','>=', beginTime);
                                        }
                                        if (endTime) {
                                                builder.andWhere('device_msg_log.logTime','<=', endTime);
                                        }
                                        var ret = yield me.util.countAndQuery(builder, page, rpp, 'logTime desc', '*');
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }


                /**
                 * @api {get} /api/device/snapshot/:imei 读取设备实时信息
                 * @apiName queryDeviceSnapshot
                 * @apiGroup Device
                 *
                 * @apiParam {String} imei 设备IMEI号
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                snapshot() {
                        var me = this;
                        return function * () {
                                var imei = this.params.imei;
                                if (imei.length != me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('非法的imei');
                                }
                                var ret = yield me.cache.get("SD-" + imei);
                                if (ret == null) {
                                        return ActionResult.createErrorResult('未找到实时数据');
                                }
                                return ActionResult.createSuccessResult(ret);
                        };
                }


                /**
                 * @api {get} /api/device/track/:imei 读取设备轨迹数据
                 * @apiName queryDeviceTrack
                 * @apiGroup Device
                 *
                 * @apiParam {String} imei 设备IMEI号
                 * @apiParam {String} beginTime 轨迹开始时间，yyyy-MM-dd HH:mm:ss
                 * @apiParam {String} endTime 轨迹结束时间，yyyy-MM-dd HH:mm:ss
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                track() {
                        var me = this;
                        return function * () {
                                var imei = this.p('imei');
                                var nowTime = new Date().getTime();
                                if (!imei || imei.length !== me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                }

                                this.validator.check('beginTime').necessary().datetime().end();
                                this.validator.check('endTime').optional().datetime().end();
                                if (this.validator.isValid()) {
                                var condition = {
                                        '$gte' : this.parameter.datetimeParam('beginTime').getTime()
                                };
                                if(this.parameter.hasParam('endTime')) {
                                        condition['$lt'] = this.parameter.datetimeParam('endTime').getTime();
                                        if(condition['$lt'] > nowTime) {
                                                condition['$lt'] = nowTime;
                                        }
                                }
                                else {
                                        condition['$lt'] = nowTime;
                                }

                                if(condition['$lt'] < condition['$gte']) {
                                        return ActionResult.createValidateFailResult('错误的查询条件:起止时间');
                                }
                                //只能查询一周范围
                                if(condition['$lt'] - condition['$gte'] > 86400000 * 7) {
                                        return ActionResult.createValidateFailResult('查询条件时间跨度太大,最多7天');
                                }
                                                var ret = yield me.bookshelf.knex('motor_device').where({
                                                        imei: imei
                                                }).select();
                                                if (ret.length === 0) {
                                                        return   ActionResult.createValidateFailResult('未能通过imei号[' + imei + ']查找到对应设备');
                                                }
                                        if(this.parameter.hasParam('endTime')) {
                                                ret = yield me.cache.get('TRACK-DC-' + imei + '-' + condition['$gte'] + '-' + condition['$lt']);
                                                if (ret) {
                                                        return ActionResult.createSuccessResult(ret);
                                                }
                                        }

                                        var mongodbOpts = BeanFactory.get('mongodbOpts').opts;
                                        var db = yield fnConnect.call(null, MONGODB_URL, mongodbOpts);
                                        if(!db) {
                                                logger.error('连接mongodb失败 -> ' + MONGODB_URL);
                                                return ActionResult.createErrorResult('GPS轨迹数据查询失败');
                                        }
                                        try {
                                                var collection = db.collection(COLLECTION_DATA);
                                                var pointsDataCursor = collection.find({
                                                        IMEI: imei,
                                                        dt: condition
                                                });
                                                var fnToArray = thunkify(pointsDataCursor.toArray);
                                                var data = yield fnToArray.call(pointsDataCursor);
                                                if(this.parameter.hasParam('endTime')) {
                                                        yield me.cache.set('TRACK-DC-' + imei + '-' + condition['$gte'] + '-' + condition['$lt'], data, 600);                //缓存10分钟
                                                }
                                                return ActionResult.createSuccessResult(data);
                                        }catch(err) {
                                                logger.error(err);
                                        }
                                        finally {
                                                try {
                                                        db.close();
                                                }catch(err) {}
                                        }
                                }
                        };
                }

                /**
                 * @api {get} /api/device/alarm  查询设备报警记录
                 * @apiName queryDeviceAlarm
                 * @apiGroup Device
                 *
                 * @apiParam {String} imei 设备IMEI号
                 * @apiParam {String} vehicleNumber 车牌号,like
                 * @apiParam {String} alarm 告警编码,1-7依次为：非法位移报警(1)、断电报警(2)、震动报警(3)、超速报警(4)、开门报警(5)、进入电子围栏区域报警(6)、离开电子围栏区域报警(7)
                 * @apiParam {String} alarmType 报警类型 0解除报警,1报警
                 * @apiParam {String} beginTime 报警开始时间，yyyy-MM-dd HH:mm:ss
                 * @apiParam {String} endTime 报警结束时间，yyyy-MM-dd HH:mm:ss
                 * @apiParam {Number} page 页号，默认1
                 * @apiParam {Number} rpp 每页记录数，系统默认值
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                alarm() {
                        var me = this;
                        return function * () {
                             /*   var imei = this.p('imei');
                                if (!imei || imei.length !== me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                }*/
                                this.validator.check('alarm').optional().enum([ '1', '2','3','4','5','6','7']).end();
                                this.validator.check('alarmType').optional().enum([ '1', '0']).end();
                                this.validator.check('beginTime').optional().datetime().end();
                                this.validator.check('endTime').optional().datetime().end();
                                this.validator.check('page').optional().isInt().end();
                                this.validator.check('rpp').optional().isInt().end();

                                if (this.validator.isValid()) {
                                        var imei=this.p('imei');
                                        var vehicleNumber=this.p('vehicleNumber');
                                        var alarm=this.p('alarm');
                                        var alarmType=this.p('alarmType');
                                        if(imei)
                                        {
                                                if ( imei.length !== me.util.constants.IMEI_LENGTH) {
                                                        return ActionResult.createValidateFailResult('错误的设备IMEI号');
                                                }
                                                var ret = yield me.bookshelf.knex('motor_device').where({
                                                        imei: imei
                                                }).select();
                                                if (ret.length === 0) {
                                                        return ActionResult.createValidateFailResult('未能通过imei号[' + imei + ']查找到对应设备');
                                                }
                                        }

                                        var page = this.parameter.intParam('page', 'all', false) || 1;
                                        var rpp = this.parameter.intParam('rpp', 'all', false) || me.util.constants.DEFAULT_RPP;
                                        var beginTime = this.p('beginTime') != null ? this.parameter.datetimeParam('beginTime').getTime() : null;
                                        var endTime = this.p('endTime') != null ? this.parameter.datetimeParam('endTime').getTime() : null;

                                        var builder = me.bookshelf.knex('device_alarm')
                                                .innerJoin('motor_device', 'motor_device.id','device_alarm.deviceId')
                                                .leftJoin('device_config', 'motor_device.id','device_config.deviceId')

                                        if(imei)
                                        {
                                                builder.andWhere('motor_device.imei', imei);
                                        }
                                        if(vehicleNumber)
                                        {
                                                builder.andWhere('device_config.vehicleNumber', 'like', `%${vehicleNumber}%`);
                                        }
                                        if(alarm)
                                        {
                                                builder.andWhere('device_alarm.alarm',alarm);
                                        }
                                        if(alarmType)
                                        {
                                                builder.andWhere('device_alarm.alarmType',alarmType);
                                        }
                                        if (beginTime) {
                                                builder.andWhere('device_alarm.deviceTime', '>=', beginTime);
                                        }
                                        if (endTime) {
                                                builder.andWhere('device_alarm.deviceTime', '<', endTime);
                                        }
                                        ret = yield me.util.countAndQuery(builder, page, rpp, null, 'device_alarm.*',
                                                'motor_device.imei', 'motor_device.deviceType', 'motor_device.phone', 'device_config.masterMobile',
                                        'device_config.vehicleNumber');
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }


                /**
                 * @api {get} /api/device/config/read/:deviceId 读取设备配置信息
                 * @apiName readDeviceConfig
                 * @apiGroup Device
                 *
                 * @apiParam {Number} deviceId 设备ID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                readConfig() {
                        var me = this;
                        return function * () {
                                var deviceId = parseInt(this.params.deviceId);
                                if (isNaN(deviceId) || deviceId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }
                                var ret = yield me.bookshelf.knex('device_config')
                                        .where('deviceId', deviceId)
                                if (ret.length == 0) {
                                        return ActionResult.createErrorResult('设备配置信息不存在');
                                }
                                return ActionResult.createSuccessResult(ret[0]);
                        };
                }

                /**
                 * @api {get} /api/device/config/update/:deviceId 更新设备配置信息
                 * @apiName updateDeviceConfig
                 * @apiGroup Device
                 *
                 * @apiParam {Number} deviceId 设备ID
                 * @apiParam {Number} redirectConnector 是否转向$host:$port，０否１是
                 * @apiParam {String} host connector主机IP地址
                 * @apiParam {Number} port connector服务端口
                 * @apiParam {Number} micSensitivity micphone灵敏度
                 * @apiParam {String} reportGPS 是否上报GPS状态，0：保留；1：轨迹上报；2：轨迹不上报；3：轨迹上报，但设置位置隐藏标志；
                 * @apiParam {String} workMode 工作模式，0：保留；1：省电工作模式；2：正常工作模式
                 * @apiParam {Number} reportIntervalM 运动时上报间隔，单位：秒
                 * @apiParam {Number} reportIntervalS 静止时上报间隔，单位：秒
                 * @apiParam {String} alarmProcessCenter 报警时中心处理方式
                 * @apiParam {String} alarmProcessDevice  0：表示电话+短信；1：表示纯短信；2：表示纯电话；3：不报警；默认3
                 * @apiParam {String} alarmProcessFrom  报警类型０：中心报警；１：设备报警
                 * @apiParam {Number} phoneCallCenter 中心每月最大拔出电话数
                 * @apiParam {Number} phoneCallDevice 设备每月最大拔出电话数
                 * @apiParam {Number} smsCenter 中心每月最大发出短信数
                 * @apiParam {Number} smsDevice 设备每月最大发出短信数
                 * @apiParam {String} g2ReportTime CBB-100G2设备专用参数，每天上报时间点，格式：HH24:MI,HH24:MI,HH24:MI
                 * @apiParam {String} g2KeepOnline CBB-100G2设备专用参数，保持设备在线直至此时刻，格式：yyyy-MM-dd HH:mm:ss
                 * @apiParam {String} vehicleNumber 车牌号
                 * @apiParam {String} masterMobile 车主手机号
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                updateConfig() {
                        var me = this;
                        return function * () {
                                var deviceId = parseInt(this.params.deviceId);
                                if (isNaN(deviceId) || deviceId < 0) {
                                        return ActionResult.createValidateFailResult('非法的设备ID');
                                }
                                this.validator.check('redirectConnector').optional().enum(['0', '1']).end();
                                this.validator.check('host').optional().rangeLength(0, 15).end();
                                this.validator.check('port').optional().isInt().end();
                                this.validator.check('micSensitivity').optional().isInt().max(9999).end();
                                this.validator.check('reportGPS').optional().enum(['0', '1', '2', '3']).end();
                                this.validator.check('workMode').optional().enum(['0', '1', '2']).end();
                                this.validator.check('reportIntervalM').optional().isInt().end();
                                this.validator.check('reportIntervalS').optional().isInt().end();
                                this.validator.check('alarmProcessCenter').rangeLength(0, 3).end();
                                this.validator.check('alarmProcessDevice').enum(['0', '1', '2', '3']).end();
                                this.validator.check('phoneCallCenter').isInt().max(9999).end();
                                this.validator.check('phoneCallDevice').isInt().max(9999).end();
                                this.validator.check('smsCenter').isInt().max(9999).end();
                                this.validator.check('smsDevice').isInt().max(9999).end();
                                this.validator.check('g2ReportTime').optional().end();
                                this.validator.check('g2KeepOnline').optional().datetime().end();
                                this.validator.check('vehicleNumber').optional().rangeLength(0, 10).end();
                                this.validator.check('masterMobile').optional().match(me.util.getRegExps().mobile).end();
                                var g2KeepOnline = this.p('g2KeepOnline') != null ? this.parameter.datetimeParam('g2KeepOnline').getTime() : null;
                                if (this.validator.isValid()) {
                                        var obj =
                                        {
                                                deviceId: deviceId,
                                                redirectConnector: this.p('redirectConnector'),
                                                host: this.p('host'),
                                                port: this.p('port'),
                                                micSensitivity: this.p('micSensitivity'),
                                                reportGPS: this.p('reportGPS'),
                                                workMode: this.p('workMode'),
                                                reportIntervalM: this.p('reportIntervalM'),
                                                reportIntervalS: this.p('reportIntervalS'),
                                                alarmProcessFrom: this.p('alarmProcessFrom'),
                                                alarmProcessCenter: this.p('alarmProcessCenter'),
                                                alarmProcessDevice: this.p('alarmProcessDevice'),
                                                phoneCallCenter: this.p('phoneCallCenter'),
                                                phoneCallDevice: this.p('phoneCallDevice'),
                                                smsCenter: this.p('smsCenter'),
                                                smsDevice: this.p('smsDevice'),
                                                g2ReportTime: this.p('g2ReportTime'),
                                                g2KeepOnline: g2KeepOnline,
                                                vehicleNumber: this.p('vehicleNumber'),
                                                masterMobile: this.p('masterMobile')
                                        }
                                        for (var attr in obj) {
                                                if (!obj[attr]) delete obj[attr];
                                        }
                                        yield me.bookshelf.knex('device_config')
                                                .where('deviceId', deviceId)
                                                .update(obj);
                                        return ActionResult.createSuccessResult({});
                                }
                                ;

                        }
                }



                /**
                 * @api {post} /api/device/create 创建新设备
                 * @apiName createDevice
                 * @apiGroup Device
                 *
                 * @apiParam {String} deviceType * 设备型号
                 * @apiParam {String} host 服务器地址
                 * @apiParam {String} port 服务端口
                 * @apiParam {String} imei * 设备IMEI号
                 * @apiParam {String} appVersion 程序版本
                 * @apiParam {String} phone 车载手机号
                 * @apiParam {String} masterMobile 车主手机号
                 * @apiParam {String} vehicleNumber 车牌号
                 * @apiParam {String} micSensitivity 钥匙扣灵敏度MIC
                 * @apiParam {String} reportGPS 是否上报gps  0 保留 1 轨迹上报 2 轨迹不上报 3 轨迹上报但设置位置隐藏标志
                 * @apiParam {String} micSensitivity 钥匙扣灵敏度MIC
                 * @apiParam {Number} workMode  0 保留 1 省电工作模式 2 正常工作模式
                 * @apiParam {Number} reportIntervalM  运动时GPS上报间隔，单位：秒
                 * @apiParam {Number} reportIntervalS  静止时GPS上报间隔，单位：秒
                 * @apiParam {String} serviceExpire  服务到期时间 yyyy-MM-dd
                 * @apiParam {Number} simType  sim卡类型　0.用户自备SIM卡 1.运营商定制卡 2物联网卡
                 * @apiParam {String} simExpire  SIM卡到期时间 yyyy-MM-dd
                 * @apiParam {String} alarmProcessFrom * 报警类型０：中心报警；１：设备报警
                 * @apiParam {String} alarmProcessCenter  报警时中心处理方式 111表示电话＋短信＋消息推送，100表示仅电话报警
                 * @apiParam {String} alarmProcessDevice  报警时，设备处理方式，0：表示电话+短信；1：表示纯短信；2：表示纯电话；3：不报警；默认3
                 *@apiParam {Number}  smsCenter　中心每月最大发出短信数
                 *@apiParam {Number} smsDevice　设备每月最大发出短信数
                 *@apiParam {Number}  phoneCallCenter　中心每月最大拔出电话数
                 *@apiParam {Number} phoneCallDevice　设备每月最大拔出电话数
                 *@apiParam {Number} groupId  集团ID，未分配的设备为0,默认0
                 *@apiParam {String} regCode 设备密码，默认123456
                 *@apiParam {String} firmwareVersion 设备固件版本号
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                // TEST http://localhost:10000/api/device/create?imei=000000000000124&deviceType=TEST&groupId=1&deviceName=aaa&phone=12345678999
                create() {
                        var me = this;
                        return function * () {
                                this.validator.check('imei').necessary().length(me.util.constants.IMEI_LENGTH).end();
                                this.validator.check('deviceType').necessary().end();
                                this.validator.check('groupId').optional().isInt().end();
                                this.validator.check('serviceExpire').optional().date().end();
                                this.validator.check('simExpire').optional().date().end();
                                this.validator.check('phone').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('masterMobile').optional().match(me.util.getRegExps().mobile).end();
                                this.validator.check('reportGPS').optional().enum(['0','1','2','3']).end();
                                this.validator.check('workMode').optional().enum(['0','1','2']).end();
                                this.validator.check('simType').optional().enum(['0','1','2']).end();
                                this.validator.check('alarmProcessFrom').necessary().enum(['0','1']).end();



                                // this.validator.check('comment').optional().end();
                                if (this.validator.isValid()) {
                                        var inventoryInId = new Date().toFormat('YYYYMMDD');
                                        for (var i = 0; i < 8; i++) {
                                                inventoryInId += parseInt(Math.random() * 10);
                                        }
                                        var regCode = this.p('regCode') || '123456';
                                        var groupId = this.p('groupId')||0;
                                        var simExpire = this.p('simExpire') != null ? this.parameter.dateParam('simExpire').getTime() : 0;
                                        var serviceExpire = this.p('serviceExpire') != null ? this.parameter.dateParam('serviceExpire').getTime() : 0;

                                        var now = new Date().getTime();
                                        var device = {
                                                imei: this.p('imei'),
                                                imsi: '',
                                                regCode: regCode,
                                                groupId: groupId,
                                                phone: this.p('phone'),
                                                deviceName: this.p('deviceName'),
                                                deviceType: this.p('deviceType'),
                                                simType:this.p('simType'),
                                                firmwareVersion: this.p('firmwareVersion'),
                                                appVersion: this.p('appVersion'),
                                                inventoryInId: inventoryInId,
                                                installed: me.util.constants.UNINSTALLED_DEVICE,
                                                updateTime: now,
                                                createTime: now
                                        };

                                        var deviceConfig = {
                                                host: this.p('host'),
                                                port: this.p('port'),
                                                masterMobile: this.p('masterMobile'),
                                                vehicleNumber: this.p('vehicleNumber'),
                                                micSensitivity:  this.p('micSensitivity'),
                                                workMode: this.p('workMode'),
                                                reportIntervalM: this.p('reportIntervalM'),
                                                reportIntervalS: this.p('reportIntervalS'),
                                                serviceExpire:serviceExpire,
                                                simExpire: simExpire,
                                                alarmProcessFrom: this.p('alarmProcessFrom'),
                                                alarmProcessCenter: this.p('alarmProcessCenter'),
                                                alarmProcessDevice: this.p('alarmProcessDevice'),
                                                smsCenter: this.p('smsCenter'),
                                                smsDevice: this.p('smsDevice'),
                                                phoneCallCenter: this.p('phoneCallCenter'),
                                                phoneCallDevice: this.p('phoneCallDevice'),
                                                updateTime: now
                                        };
                                       var tran = yield me.bookshelf.knex.transaction();
                                        try {
                                                var ret = yield me.bookshelf.knex.insert(device)
                                                        .into('motor_device')
                                                        .transacting(tran);
                                                deviceConfig.deviceId=ret[0];
                                                 ret = yield me.bookshelf.knex.insert(deviceConfig)
                                                        .into('device_config')
                                                tran.commit();
                                                return ActionResult.createSuccessResult({}).setMsg('设备入库成功');
                                        } catch (err) {
                                                tran.rollback();
                                                if (err.message.match(/.*ER_DUP_ENTRY.*/)) {
                                                        logger.error('设备IMEI号重复[' + this.p('imei') + ']');
                                                        return ActionResult.createErrorResult({}).setMsg('设备IMEI号重复');
                                                }
                                                else {
                                                        throw err;
                                                }
                                        }
                                }
                        };
                }




                /**
                 * @api {get} /api/device/deviceTypes 查询设备类型列表清单
                 * @apiName queryDeviceTypes
                 * @apiGroup Device
                 *
                 * @apiParam {String} name 设备类型名称, like
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                queryDeviceTypes() {
                        var me = this;
                        return function * () {
                                this.validator.check('name').optional().end();
                                if (this.validator.isValid()) {
                                        var name = this.parameter.param('name');
                                        var builder = me.bookshelf.knex('motor_device')
                                        if (name) {
                                                builder.andWhere('motor_device.deviceType', 'like', `%${name}%`);
                                        }
                                        var ret = yield builder.distinct('deviceType').select();
                                        return ActionResult.createSuccessResult(ret);
                                }
                        };
                }



                /**
                 * @api {post} /api/device/control/:imei 下发控制指令
                 * @apiName deviceControl
                 * @apiGroup Device
                 *
                 * @apiParam {Number} imei 设备imei
                 * @apiParam {String} cmd 控制指令 '0': '撤销断油断电',
                                                 '1': '执行断油断电',
                                                 '2': '撤防；（电动车用）',
                                                 '3': '设防；（电动车用）',
                                                 '5': '静音；（电动车用）',
                                                 '7': '免钥匙启动；（电动车用）',
                                                 '9': '寻车；（电动车用）',
                                                 '10': '电击模式；（宠物用）',
                                                 '11': '马达震动模式；（宠物用）',
                                                 '12': '蜂鸣器模式；（宠物用）',
                                                 '13': 'led闪烁模式；（宠物用）',
                                                 '14': '汽车远程启动；（德贝兴）',
                                                 '15': '汽车远程熄火；（德贝兴）',
                                                 '16': '汽车远程锁车；（德贝兴）',
                                                 '17': '汽车远程开锁；（德贝兴）',
                                                 '18': '汽车远程寻车；（德贝兴）',
                                                 '19': '监听；（儿童机）'
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                control() {
                        var me = this;
                        return function * () {
                                var imei = this.params.imei;
                                if (imei.length != me.util.constants.IMEI_LENGTH) {
                                        return ActionResult.createValidateFailResult('非法的imei');
                                }
                                this.validator.check('cmd').necessary().isInt().end();
                                if (this.validator.isValid()) {
                                        try {
                                                var snapshot = yield me.cache.get('SD-' + imei);
                                                if (!snapshot) {
                                                        return ActionResult.createErrorResult('设备未在平台登录');
                                                }
                                                var deviceControlServiceURL = snapshot['rcBaseURL'];
                                                var url = deviceControlServiceURL + '?IMEI=' + imei + '&cmd=' + this.p('cmd');
                                                EasyNode.DEBUG && logger.debug(`call deviceControl service URL -> ` + url);
                                                var ret = yield HTTPUtil.getJSON(url, timeout, deviceControlMethod);
                                                EasyNode.DEBUG && logger.debug(`received from deviceControl service : ` + JSON.stringify(ret));
                                                return ret;
                                        } catch (e) {
                                                return ActionResult.createErrorResult('终端控制服务连接失败:' + deviceControlServiceURL);
                                        }

                                }
                        };
                }


                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = DeviceController;
})();