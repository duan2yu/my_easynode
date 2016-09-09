var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var thunkify = require('thunkify');
var BeanFactory = using('easynode.framework.BeanFactory');
var mongodb = require('mongodb');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var UbloxAGPS = using('szzh.cbb100.service.UBloxAGPS');

(function () {
        var MongoClient = mongodb.MongoClient;
        var fnConnect = thunkify(MongoClient.connect);
        const ERROR_TABLE = {
                "0" : "成功",
                "1" : "缺少key",
                "2" : "key错误",
                "3" : "key过期",
                "4" : "没有查询到结果",
                "5" : "请求达到上限",
                "6" : "请求IP无效",
                "7" : "请求参数错误",
                "8" : "请求参数错误",
                "9" : "纠偏经纬度错误",
                "10" : "appKey剩余请求次数为零",
                "10001" : "错误的请求KEY",
                "10002" : "该KEY无请求权限",
                "10003" : "KEY过期",
                "10004" : "错误的SDK KEY",
                "10005" : "应用未审核超时，请提交认证",
                "10007" : "未知的请求源，（服务器没有获取到IP地址）",
                "10008" : "被禁止的IP",
                "10009" : "被禁止的KEY",
                "10011" : "当前IP请求超过限制",
                "10012" : "当前Key请求超过限制",
                "10013" : "测试KEY超过请求限制",
                "10020" : "接口维护",
                "10021" : "接口停用",
                "10022" : "appKey按需剩余请求次数为零",
                "10023" : "请求IP无效",
                "10024" : "网络错误",
                "10025" : "没有查询到结果",
                "10026" : "当前请求频率过高超过权限限制"
        };

        /**
         * Class LBSServiceRoutes
         *
         * @class szzh.cbb100.service.LBSServiceRoutes
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class LBSServiceRoutes extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 1.0.0
                 * @author zlbbq
                 * */
                constructor() {
                        super();
                        //调用super()后再定义子类成员。
                }

                static defineRoutes(httpServer) {
                        LBSServiceRoutes.addRoute_lbs(httpServer);
                        LBSServiceRoutes.addRoute_stop(httpServer);
                }

                static getMongoConnection() {
                        return function * () {
                                var mongodbOpts = BeanFactory.get('mongodbOpts').opts;
                                try {
                                        var url = EasyNode.config('mongodb.url');
                                        var db = yield fnConnect.call(null, url, mongodbOpts);
                                        if (db) {
                                                db.on('error', function (err) {
                                                        logger.error('MongoDB Error :' + err);
                                                        try {
                                                                db.close();
                                                        } catch (e) {
                                                        }
                                                });
                                                return db;
                                        }
                                } catch (err) {
                                        logger.error(err);
                                }
                        };
                }

                static addRoute_stop(httpServer) {
                        httpServer.addRoute('get', '/stop', function * (){
                                var password = this.p('password');
                                if(password === EasyNode.config('http.server.pause.password', 'zlbbq47054370')) {
                                        httpServer.stop();
                                        this.type = 'html';
                                        this.body = '服务已停止';
                                }
                                else {
                                        this.type = 'html';
                                        this.body = '密码错误';
                                }
                        });
                }

                static addRoute_lbs(httpServer, tcpServer) {
                        var prefix = EasyNode.config('lbs.cache.prefix', 'LBS');
                        var agpsPrefix = EasyNode.config('agps.cache.prefix','AGPS');
                        var collectionName = EasyNode.config('mongodb.collection', 'ZHLBS');
                        httpServer.addRoute('get', EasyNode.config('http.server.services.lbs.URI', '/lbs'), function * () {
                                var plmn = parseInt(this.parameter.param('plmn'));              //PLMN码，中国移动46000，中国联通46001
                                var lac = parseInt(this.parameter.param('lac'));                      //LAC，区域码
                                var cellId = parseInt(this.parameter.param('cellId'));            //基站ID
                                var agps = parseInt(this.parameter.param('agps'));               //是否需要u-blox AGPS平台辅助定位数据
                                var ret = {
                                        code : 0,
                                        data : null,
                                        msg : '查询失败-没有数据'
                                };
                                if(isNaN(plmn) || isNaN(lac) || isNaN(cellId)) {
                                        ret.msg = '错误的参数，需要整数型的[plmn]、[lac]和[cellId]';
                                }
                                else {
                                        /*
                                        * 数据查询步骤：
                                        * 1、从redisCache中查询
                                        * 2、从mongodb中查询
                                        * 3、调用远程接口查询
                                        * 4、存储远程接口数据到mongodb
                                        * 5、存储远程接口数据到redis
                                        * 6、查不到任何数据时，写入"EMPTY"至redis，并设置1小时TTL
                                        * */
                                        var lbsCache = BeanFactory.get('lbsCache');
                                        var key = `${prefix}-${plmn}-${lac}-${cellId}`;
                                        var o = yield lbsCache.get(key);
                                        if(!o) {
                                                EasyNode.DEBUG && logger.debug('query LBS data from database');
                                                var connection = yield LBSServiceRoutes.getMongoConnection();
                                                if(connection) {
                                                        var collection = connection.collection(collectionName);
                                                        var fnFindOne = thunkify(collection.findOne);
                                                        try{
                                                                o = yield fnFindOne.call(collection, {plmn:plmn, lac:lac, cellId: cellId}, {limit: 1});
                                                                if(!o) {
                                                                        EasyNode.DEBUG && logger.debug('query LBS data from remote service');
                                                                        o = yield LBSServiceRoutes.queryLBSRemote(plmn, lac, cellId);
                                                                        if(o) {
                                                                                logger.info(`append LBS data to database`);
                                                                                var fnSave = thunkify(collection.save);
                                                                                yield fnSave.call(collection, o, {w: 1});
                                                                        }
                                                                }
                                                                connection.close();
                                                        }catch(e){
                                                                logger.error(e);
                                                                ret.msg = '查询错误->' + e.message;
                                                        }
                                                }
                                                if(!o) {
                                                        o = 'EMPTY';
                                                        yield lbsCache.set(key, o, 3600);
                                                }
                                                else {
                                                        yield lbsCache.set(key, o);
                                                }
                                        }
                                        if(o && o !== 'EMPTY') {
                                                delete o._id;
                                                ret.code = 1;
                                                ret.data = o;
                                                ret.msg = '查询成功';
                                        }
                                        if(ret.code === 1) {
                                                //使用u-blox平台取AGPS数据
                                                if(agps === 1) {
                                                        try {
                                                                var agpsData = yield lbsCache.get(`${agpsPrefix}-${plmn}-${lac}-${cellId}`);
                                                                if(!agpsData) {
                                                                        agpsData = yield UbloxAGPS.getAGPSData(o.lat, o.lng);
                                                                        if(agpsData) {
                                                                                //缓存AGPS数据2小时
                                                                                yield lbsCache.set(`${agpsPrefix}-${plmn}-${lac}-${cellId}`, agpsData, 7200);
                                                                        }
                                                                }
                                                                if(agpsData) {
                                                                        ret.data.agps = agpsData;
                                                                }
                                                        }catch(err) {
                                                                logger.error(err);
                                                        }
                                                }
                                        }
                                }
                                this.type = 'json';
                                this.body = ret;
                        });
                }

                static queryLBSRemote(plmn, lac, cellId) {
                        var me = this;
                        return function * () {
                                var timeout = parseInt(EasyNode.config('service.remote.lbs.timeout', '2000'));
                                var url = EasyNode.config('service.remote.lbs.URL');
                                var method = EasyNode.config('service.remote.lbs.httpMethod', 'GET');
                                var mcc = parseInt(plmn / 100);
                                var mnc = plmn % 100;
                                url = url.replace(/\$mcc/, ''+mcc).replace(/\$mnc/, ''+mnc).replace(/\$plmn/, ''+plmn).replace(/\$lac/, ''+lac).replace(/\$cellId/, ''+cellId);
                                EasyNode.DEBUG && logger.debug(`call remote LBS service URL -> ` + url);
                                var ret = yield HTTPUtil.getJSON(url, timeout, method);
                                EasyNode.DEBUG && logger.debug(`received from remote LBS service : ` + JSON.stringify(ret));
                                if(ret['ErrCode'] == 0) {
                                        return {
                                                plmn : plmn,
                                                lac : lac,
                                                cellId : cellId,
                                                address : ret.location.addressDescription,
                                                lat : ret.location.latitude,
                                                lng : ret.location.longitude,
                                                o_lat : 0,
                                                o_lng : 0,
                                                precision : parseInt(ret.location.accuracy)
                                        };
                                }
                                else {
                                        var errMsg = ERROR_TABLE['' + ret['ErrCode']];
                                        logger.error(`remote LBS query fail -> ${errMsg}`);
                                        return null;
                                }
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = LBSServiceRoutes;
})();