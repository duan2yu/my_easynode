var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var thunkify = require('thunkify');
var BeanFactory = using('easynode.framework.BeanFactory');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var StringUtil = using('easynode.framework.util.StringUtil');
var _ = require('underscore');
var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
var GeTuiDelegate = using('szzh.mp.GeTuiDelegate');
var UUID = require('node-uuid');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var fs = require('co-fs');

(function () {
        var _connection = null;
        const MP_QUEUE_NAME = EasyNode.config('redis.queueName', 'MP-QUEUE');
        const SERVICE_HTTP_METHOD = EasyNode.config('push.service.httpMethod', 'GET');
        //const ENSURE_PUSH_SWITCH = StringUtil.switchState(EasyNode.config('push.service.QoS.switch', '0'));
        const ENSURE_PUSH_SWITCH = false;
        const MESSAGE_EXPIRE = parseInt(EasyNode.config('message.expire', '7200'));                     //默认2小时
        const PUSH_INTERVAL = parseInt(EasyNode.config('message.push.interval', '10')) * 60 * 1000;
        const APP_NAME = EasyNode.config('app.name');
        const CACHE_PREFIX = EasyNode.config('user.cache.prefix', 'GT-');

        /**
         * Class MessagePushMain
         *
         * @class szzh.mp.MessagePushMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class MessagePushMain extends GenericObject {
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

                static * main() {
                        //var content = yield fs.readFile(EasyNode.real('projects/szzh/etc/mp/app-config.json'));
                        var content = yield fs.readFile(EasyNode.real(EasyNode.config('app.config.file', 'projects/szzh/etc/mp/app-config-all.json')));
                        var appConfig = JSON.parse(content.toString());
                        GeTuiDelegate.initializeApps(appConfig);
                        var httpServer = new KOAHttpServer(parseInt(EasyNode.config('http.port', '5000')));
                        httpServer.addWebDirs('projects/szzh/docs/');
                        MessagePushMain.addRoutes(httpServer);
                        yield httpServer.start();
                        yield BeanFactory.initialize('projects/szzh/etc/mp/message-push-beans.json');
                        var redisQueue = BeanFactory.get('redisQueue');
                        var cache = BeanFactory.get('clientInfoCache');
                        var l = {
                                onMessage: function * (queueName, m) {
                                        if (m) {
                                                try {
                                                        var pushResult = yield MessagePushMain.doPush(m, MessagePushMain.getMongoConnection());
                                                        EasyNode.DEBUG && logger.debug('push result [' + m.uuid + '] -> ' + JSON.stringify(pushResult));
                                                        yield cache.set('MP-RESULT-' + m.uuid, pushResult, 172800);             //推送结果缓存2天
                                                        if(pushResult && pushResult.result == 'Success') {
                                                                logger.info(`push message [${m.uuid}] success`);
                                                        }
                                                }
                                                 catch (e) {
                                                        logger.error(`push message fail -> [${m.uuid}]`);
                                                        logger.error(e);
                                                }
                                        }
                                },
                                onError: function (err) {
                                        logger.error(err);
                                }
                        };
                        yield redisQueue.subscribe(EasyNode.config('redis.queueName'), {}, l);
                }

                static addRoutes(httpServer) {
                        //URI -> /push
                        MessagePushMain.addRoutePush(httpServer);
                        //URI -> /tag
                        MessagePushMain.addRouteTag(httpServer);
                        //URI -> /login-init
                        MessagePushMain.addRouteLogin(httpServer);
                        //URI -> /logout
                        MessagePushMain.addRouteLogout(httpServer);
                        //URI -> /queryPushResult
                        MessagePushMain.addRouteQueryPushResult(httpServer);
                }

                /**
                 * @api {post} /queryPushResult 查询推送结果
                 * @apiName QueryPushResult
                 * @apiGroup MessagePush
                 * @apiParam {String} pushId * 调用推送接口时返回的pushId
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功, -1 -> 查询失败
                 * @apiSuccess {Object} result 推送的结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                static addRouteQueryPushResult(httpServer) {
                        httpServer.addRoute('GET', '/queryPushResult', function * () {
                                var pushId = this.parameter.param('pushId');

                                var ret = null;
                                if(!pushId) {
                                        ret = ActionResult.createValidateFailResult('需要参数pushId');
                                }
                                if(!ret) {
                                        var cache = BeanFactory.get('clientInfoCache');
                                        var pushResult = yield cache.get('MP-RESULT-' + pushId);
                                        if(pushResult) {
                                                ret = ActionResult.createSuccessResult(pushResult);
                                        }
                                        else {
                                                ret = ActionResult.createErrorResult('pushId不存在或已过期(48小时)');
                                        }
                                }
                                this.type = 'json';
                                this.body = ret;
                        });
                }

                /**
                 * @api {post} /push 推送消息
                 * @apiName Push
                 * @apiGroup MessagePush
                 * @apiParam {String} app *  个推APP简称
                 * @apiParam {String} type * 推送类型，single(单用户推送)/multiple(多用户推送)/tag(按用户标签推送)/app(全APP用户推送)
                 * @apiParam {String} target 推送目标用户的别名(alias)，type为single/multiple时必传，多个目标使用","分隔
                 * @apiParam {String} content * 消息内容
                 * @apiParam {Number} badge 应用图标上显示的数字标签，默认1
                 * @apiParam {String} alertTitle 消息通知标题
                 * @apiParam {String} alert 消息通知内容
                 * @apiParam {Number} expire 离线消息过期时间，单位：秒，默认2小时
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功, -1 -> 参数错误, -2 -> 推送失败，-3 -> APP未初始化。成功返回 0
                 * @apiSuccess {String} pushId 推送的消息ID
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                static addRoutePush(httpServer) {
                        httpServer.addRoute(SERVICE_HTTP_METHOD, '/push', function * () {
                                var me = this;
                                var appName = this.parameter.param('app');
                                var type = this.parameter.param('type') || '';
                                var target = this.parameter.param('target') || '';
                                var content = this.parameter.param('content');
                                var badge = this.parameter.param('badge') || '1';
                                var tag = this.parameter.param('tag') || '';
                                var alertTitle = this.parameter.param('alertTitle') || ('通知-' + APP_NAME);
                                var alert = this.parameter.param('alert') || '您有一条新的应用通知';
                                var expire = parseInt(this.parameter.param('expire'));                  //过期时间，单位：秒
                                if(isNaN(expire) || expire <= 0) {
                                        expire = MESSAGE_EXPIRE;
                                }

                                var ret = {};
                                const CODE_INVALID_PARAM = -1;
                                const CODE_PUSH_FAIL = -2;
                                const CODE_INVALID_APP = -3;

                                function response(code = 0, msg = '消息已推送', uuid = null) {
                                        ret.code = code;
                                        if (uuid) {
                                                ret.pushId = uuid;
                                        }
                                        ret.msg = msg;
                                        me.type = 'json';
                                        me.body = ret;
                                }

                                switch (type) {
                                        case 'single' :
                                        case 'multiple' :
                                        {
                                                if (!target) {
                                                        return response(CODE_INVALID_PARAM, '请指定推送用户');
                                                }
                                                break;
                                        }
                                        case 'tag' :
                                        {
                                                if (!tag) {
                                                        return response(CODE_INVALID_PARAM, '请指定用户标签');
                                                }
                                                break;
                                        }
                                        case 'app' :
                                        {
                                                break;
                                        }
                                        default :
                                        {
                                                return response(CODE_INVALID_PARAM, '错误的推送类型(single/multiple/tag/app)');
                                        }
                                }

                                if(!appName) {
                                        return response(CODE_INVALID_PARAM, '请指定要推送的APP');
                                }

                                if (!content) {
                                        return response(CODE_INVALID_PARAM, '没有推送内容');
                                }

                                badge = parseInt(badge);
                                if (isNaN(badge) || badge < 0) {
                                        return response(CODE_INVALID_PARAM, '错误的标签号');
                                }

                                if(!GeTuiDelegate.isAppDelegated(appName)) {
                                        return response(CODE_INVALID_APP, '不能推送到此APP');
                                }

                                var uuid = UUID.v4();
                                var msg = {
                                        appName : appName,
                                        type: type,
                                        target: target.split(','),
                                        content: content,
                                        badge: badge,
                                        tag: tag ? tag.split(',') : [],
                                        alert : alert,
                                        alertTitle : alertTitle,
                                        expire: expire * 1000,                  //convert to ms
                                        uuid: uuid
                                };
                                try {
                                        yield MessagePushMain.enqueuePushMessage(msg);
                                        response(0, '消息推送成功', uuid);
                                }catch(e) {
                                        logger.error(e);
                                        response(CODE_PUSH_FAIL, '消息推送失败');
                                }
                        });
                }

                /**
                 * @api {post} /tag 设置用户标签
                 * @apiName Tag
                 * @apiGroup MessagePush
                 * @apiParam {String} app *  个推APP简称
                 * @apiParam {String} alias * 用户别名
                 * @apiParam {String} clientId * 个推SDK获取的ClientID
                 * @apiParam {String} tags * 用户标签，多个标签使用","分隔
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功, -1 -> 参数错误, -2 -> 设置标签失败，-3 -> APP未初始化。成功返回 0
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                static addRouteTag(httpServer) {
                        httpServer.addRoute(SERVICE_HTTP_METHOD, '/tag', function * () {
                                var me = this;
                                var appName = this.parameter.param('app');
                                var alias = this.parameter.param('alias');
                                var clientId = this.parameter.param('clientId');
                                var tag = this.parameter.param('tags');                        //以","分割的字符串
                                var ret = {};
                                const CODE_INVALID_PARAM = -1;
                                const CODE_FAIL = -2;
                                const CODE_INVALID_APP = -3;

                                function response(code = 0, msg = 'Success') {
                                        ret.code = code;
                                        ret.msg = msg;
                                        me.type = 'json';
                                        me.body = ret;
                                }

                                if(!appName) {
                                        return response(CODE_INVALID_PARAM, '需要参数-app');
                                }

                                if(!alias) {
                                        return response(CODE_INVALID_PARAM, '需要参数-alias');
                                }

                                if(!clientId) {
                                        return response(CODE_INVALID_PARAM, '需要参数-clientId');
                                }

                                if(!tag) {
                                        return response(CODE_INVALID_PARAM, '需要参数-tag');
                                }

                                if(!GeTuiDelegate.isAppDelegated(appName)) {
                                        return response(CODE_INVALID_APP, '不能设置此APP的标签');
                                }

                                logger.info(`app [${appName}], set alias [${alias}] to tag [${tag}]`);
                                var res = yield GeTuiDelegate.setTag(appName, clientId, tag.split(','));
                                EasyNode.DEBUG && logger.debug(`app [${appName}], set alias [${alias}] tag response -> ${JSON.stringify(res)}`);
                                var cache = BeanFactory.get('clientInfoCache');
                                yield cache.del(CACHE_PREFIX + appName + '-' + alias);                          //clear cached data
                                if(res.result === 'ok') {
                                        response();
                                }
                                else {
                                        response(CODE_FAIL, '个推接口调用失败');
                                }
                        });
                }

                /**
                 * @api {post} /login-init 用户登录初始化
                 * @apiName LoginInitialize
                 * @apiGroup MessagePush
                 * @apiParam {String} app *  个推APP简称
                 * @apiParam {String} alias * 用户别名
                 * @apiParam {String} clientId * 个推SDK获取的ClientID
                 * @apiParam {String} tags * 用户标签，多个标签使用","分隔
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 初始化成功(用户信息未更改), -1 -> 参数错误，-3 -> APP未初始化。成功返回 0
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                static addRouteLogin(httpServer) {
                        httpServer.addRoute(SERVICE_HTTP_METHOD, '/login-init', function * () {
                                var me = this;
                                var appName = this.parameter.param('app');
                                var alias = this.parameter.param('alias');                     //用户别名，手机号码
                                var clientId = this.parameter.param('clientId');          //个推ClientID
                                var tags = this.parameter.param('tags') || '';                       //用户tag列表，以","分隔

                                var ret = {};
                                const CODE_INVALID_PARAM = -1;
                                const CODE_NOT_MODIFIED = 0;
                                const CODE_INVALID_APP = -3;

                                function response(code = 0, msg = '用户登录成功，个推设置成功') {
                                        ret.code = code;
                                        ret.msg = msg;
                                        me.type = 'json';
                                        me.body = ret;
                                }

                                if(!appName) {
                                        return response(CODE_INVALID_PARAM, '需要参数-app');
                                }

                                if(!alias) {
                                        return response(CODE_INVALID_PARAM, '需要参数-alias');
                                }

                                if(!clientId) {
                                        return response(CODE_INVALID_PARAM, '需要参数-clientId');
                                }

                                if(!GeTuiDelegate.isAppDelegated(appName)) {
                                        return response(CODE_INVALID_APP, '不能使用此APP');
                                }

                                try{
                                        logger.info(`login-init, app [${appName}], alias [${alias}], clientId [${clientId}], tags [${tags}]`);
                                        var cache = BeanFactory.get('clientInfoCache');
                                        var gtClientInfo = yield cache.get(CACHE_PREFIX + appName + '-' + alias);
                                        var res = null;
                                        if(gtClientInfo) {
                                                var changed = false;
                                                if(gtClientInfo.alias !== alias) {
                                                        changed = true;
                                                        res = yield GeTuiDelegate.unbindAlias(appName, alias, clientId);
                                                        res = yield GeTuiDelegate.bindAlias(appName, alias, clientId);
                                                        EasyNode.DEBUG && logger.debug(`app [${appName}], rebind alias [${alias}] to client [${clientId}], response -> ${JSON.stringify(res)}`);
                                                }

                                                if(tags && gtClientInfo.tags !== tags) {
                                                        changed = true;
                                                        res = yield GeTuiDelegate.setTag(appName, clientId, tags.split(','));
                                                        EasyNode.DEBUG && logger.debug(`app [${appName}], set client [${clientId}] tag [${tags}] response -> ` + JSON.stringify(res));
                                                }
                                        }
                                        else if(!gtClientInfo) {
                                                res = yield GeTuiDelegate.unbindAlias(appName, alias, clientId);
                                                res = yield GeTuiDelegate.bindAlias(appName, alias, clientId);
                                                EasyNode.DEBUG && logger.debug(`app [${appName}], bind alias [${alias}] to client [${clientId}], response -> ${JSON.stringify(res)}`);
                                                res = yield GeTuiDelegate.setTag(appName, clientId, tags.split(','));
                                                EasyNode.DEBUG && logger.debug(`app [${appName}], set alias [${alias}] tag [${tags}] response -> ` + JSON.stringify(res));
                                        }

                                        if(!gtClientInfo || changed) {
                                                var o = {
                                                        clientId : clientId,
                                                        alias : alias,
                                                        tags : tags || ''
                                                };
                                                yield cache.set(CACHE_PREFIX + appName + '-' + alias, o, 86400 * 7);                        //缓存一个星期
                                                response();
                                        }
                                        else {
                                                response(CODE_NOT_MODIFIED, '用户登录成功，推送信息未变更');
                                        }
                                }
                                catch(e) {
                                        logger.error(e);
                                }
                        });
                }

                /**
                 * @api {post} /logout 用户登出解除推送绑定关系
                 * @apiName Logout
                 * @apiGroup MessagePush
                 *
                 * @apiParam {String} app *  个推APP简称
                 * @apiParam {String} alias * 用户别名
                 * @apiParam {String} clientId * 个推SDK获取的ClientID
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 用户登出，推送绑定关系已解除, -1 -> 参数错误，-3 -> APP未初始化。成功返回 0
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */
                static addRouteLogout(httpServer) {
                        httpServer.addRoute(SERVICE_HTTP_METHOD, '/logout', function * () {
                                var me = this;
                                var appName = this.parameter.param('app');
                                var alias = this.parameter.param('alias');                     //用户别名，手机号码
                                var clientId = this.parameter.param('clientId');          //个推ClientID
                                var tags = '';

                                var ret = {};
                                const CODE_INVALID_PARAM = -1;
                                const CODE_INVALID_APP = -3;

                                function response(code = 0, msg = '用户登出成功，个推设置成功') {
                                        ret.code = code;
                                        ret.msg = msg;
                                        me.type = 'json';
                                        me.body = ret;
                                }

                                if(!appName) {
                                        return response(CODE_INVALID_PARAM, '需要参数-app');
                                }

                                if(!alias) {
                                        return response(CODE_INVALID_PARAM, '需要参数-alias');
                                }

                                if(!clientId) {
                                        return response(CODE_INVALID_PARAM, '需要参数-clientId');
                                }

                                if(!GeTuiDelegate.isAppDelegated(appName)) {
                                        return response(CODE_INVALID_APP, '不能使用此APP');
                                }

                                try{
                                        logger.info(`logout, app [${appName}], alias [${alias}], clientId [${clientId}]`);
                                        var cache = BeanFactory.get('clientInfoCache');
                                        var res = yield GeTuiDelegate.unbindAlias(appName, alias, clientId);
                                        EasyNode.DEBUG && logger.debug(`unbind alias [${alias}] response -> ${JSON.stringify(res)}`);
                                        res = yield GeTuiDelegate.setTag(appName, clientId, []);
                                        EasyNode.DEBUG && logger.debug(`clear alias [${alias}] tags response -> ${JSON.stringify(res)}`);
                                        yield cache.del(CACHE_PREFIX + appName + '-' + alias);               //clear cache，下次登录时重新执行login-init
                                        response();
                                }
                                catch(e) {
                                        logger.error(e);
                                }
                        });
                }

                static doPush(m, mongoConnection) {
                        return function * () {
                                return yield GeTuiDelegate.pushTransmission(m, mongoConnection);
                        };
                }

                static enqueuePushMessage(m) {
                        return function * () {
                                var redisQueue = BeanFactory.get('redisQueue');
                                yield redisQueue.publish(MP_QUEUE_NAME, {}, m);
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = MessagePushMain;
})();