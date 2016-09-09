var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var thunkify = require('thunkify');
var BeanFactory = using('easynode.framework.BeanFactory');
var CBB100HttpServiceRoutes = using('szzh.cbb100.service.CBB100HttpServiceRoutes');
var mongodb = require('mongodb');
var fs = require('co-fs');

(function () {
        var _connection = null;
        var MongoClient = mongodb.MongoClient;
        var fnConnect = thunkify(MongoClient.connect);
        /**
         * Class LBSDataImportMain
         *
         * @class szzh.cbb100.LBSDataImportMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class LBSDataImportMain extends GenericObject {
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
                }

                static getMongoConnection() {
                        return function * () {
                                if (!_connection) {
                                        var mongodbOpts = BeanFactory.get('mongodbOpts').opts;
                                        try {
                                                var url = EasyNode.config('mongodb.url');
                                                logger.info('connecting to mongodb : ' + url);
                                                var db = yield fnConnect.call(null, url, mongodbOpts);
                                                if (db) {
                                                        logger.info('mongodb connected');
                                                        db.on('error', function (err) {
                                                                logger.error('MongoDB Error :' + err);
                                                                try {
                                                                        db.close();
                                                                } catch (e) {
                                                                }
                                                                _connection = null;
                                                        });
                                                        db.on('close', function () {
                                                                logger.error('mongodb connection lost');
                                                                _connection = null;
                                                        });
                                                        _connection = db;
                                                }
                                        } catch (err) {
                                                logger.error(err);
                                        }
                                }
                                return _connection;
                        };
                }

                static getPLMN(mcc, mnc) {
                        return parseInt(mcc) * 100 + parseInt(mnc);
                }

                static * main() {
                        yield BeanFactory.initialize('projects/szzh/etc/cbb100-dw/cbb100-dw-beans.json');
                        var connection = yield LBSDataImportMain.getMongoConnection();
                        if (!connection) {
                                logger.error('Connect to mongodb failed');
                                process.exit();
                        }
                        else {
                                var collection = connection.collection(EasyNode.config('mongodb.collection'));
                                logger.info('loading LBS data, please wait a while...');
                                var lbsData = yield fs.readFile(EasyNode.real(EasyNode.config('lbs.file')));
                                lbsData = lbsData.toString();
                                lbsData = lbsData.split('\r\n');
                                logger.info(`[${lbsData.length - 1}] rows load`);
                                logger.info(`writing LBS data to database, please wait a long while...`);
                                var fnSave = thunkify(collection.save);
                                for (var i = 1; i < lbsData.length; i++) {
                                        var [mcc, mnc, lac, cellId, lng, lat, o_lng, o_lat, precision, address] = lbsData[i].split(',');
                                        var plmn = LBSDataImportMain.getPLMN(mcc, mnc);
                                        address = address || '';
                                        address = address.replace(/"/g, "");
                                        //EasyNode.DEBUG && logger.debug(`importing lbs cell info [${plmn}.${lac}.${cell}]->[${address}]`);
                                        var o = {
                                                plmn : plmn,
                                                lac : parseInt(lac),
                                                cellId : parseInt(cellId),
                                                lat : parseFloat(lat),
                                                lng : parseFloat(lng),
                                                o_lat : parseFloat(o_lat),
                                                o_lng : parseFloat(o_lng),
                                                precision : parseInt(precision),
                                                address : address
                                        };
                                        try{
                                                yield fnSave.call(collection, o, {w : 1});
                                        }catch(err){
                                                logger.error(err);
                                        }
                                }
                                logger.info('LBS data imported, please ensure data integrity manually');
                                process.exit(0);
                        }
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = LBSDataImportMain;
})();