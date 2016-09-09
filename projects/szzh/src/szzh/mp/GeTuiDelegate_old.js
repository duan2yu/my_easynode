var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var thunkify = require('thunkify');
var StringUtil = using('easynode.framework.util.StringUtil');
var _ = require('underscore');

(function () {
        const GT_URL = EasyNode.config('mp.getui.URL');
        const APP_ID = EasyNode.config('mp.getui.APPID');
        const APP_KEY = EasyNode.config('mp.getui.APPKEY');
        const MASTER_SECRET = EasyNode.config('mp.getui.MASTERSECRET');

        var GeTui = require('./GT.push.js');
        var NotificationTemplate = require('./getui/template/NotificationTemplate');
        var TransmissionTemplate = require('./getui/template/TransmissionTemplate');
        var RequestError = require('./RequestError');

        var APNTemplate = require('./getui/template/APNTemplate');
        var APNPayload = require('./payload/APNPayload');
        var SimpleAlertMsg = require('./payload/SimpleAlertMsg');
        var DictionaryAlertMsg = require('./payload/DictionaryAlertMsg');

        var SingleMessage = require('./getui/message/SingleMessage');
        var AppMessage = require('./getui/message/AppMessage');
        var ListMessage = require('./getui/message/ListMessage');

        var GT = new GeTui(GT_URL, APP_KEY, MASTER_SECRET);
        var Target = require('./getui/Target');

        /**
         * Class GeTuiDelegate
         *
         * @class szzh.mp.GeTuiDelegate
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class GeTuiDelegate extends GenericObject {
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

                static pushTransmission(m, mongoConnection) {
                        return function * () {
                                EasyNode.DEBUG && logger.debug('push transmission -> ' + JSON.stringify(m));
                                var template = new TransmissionTemplate({
                                        appId: APP_ID,
                                        appKey: APP_KEY,
                                        //transmissionType: 1,                    //收到消息是否立即启动应用
                                        transmissionType: 2,                   //等待客户端自启动
                                        transmissionContent: m.content
                                });
                                //iOS推送需要设置的setApnInfo字段，这个测试通过。。。。我他妈就无语了，鸟文档还能再烂一点？？？？！！！！
                                var payload = new APNPayload();
                                var alertMsg = new DictionaryAlertMsg();
                                alertMsg.body = m.alert;
                                alertMsg.actionLocKey = "";
                                alertMsg.locKey = "";
                                alertMsg.locArgs = Array("");
                                alertMsg.launchImage = "";
                                //ios8.2以上版本支持
                                alertMsg.title = m.alertTitle;
                                alertMsg.titleLocKey = "";
                                alertMsg.titleLocArgs = Array("");

                                payload.alertMsg = alertMsg;
                                payload.badge = m.badge;
                                //payload.contentAvailable = 1;
                                //if(StringUtil.switchState(EasyNode.config('push.contentAvailable', '0'))) {
                                //        payload.contentAvailable = 1;
                                //}
                                //    payload.category="";
                                //    payload.sound="";
                                //payload.customMsg.content = m.content;
                                //payload.customMsg = JSON.parse(m.content);
                                var temp = {};
                                try{
                                        temp = JSON.parse(m.content);
                                }catch(e){
                                        logger.error(e);
                                }
                                _.extend(payload.customMsg, temp);
                                template.setApnInfo(payload);


                                var ret = null;
                                switch (m.type) {
                                        case 'single' :
                                        {
                                                ret = yield GeTuiDelegate.push2Single(m, template);
                                                break;
                                        }
                                        case 'multiple':
                                        {
                                                ret = yield GeTuiDelegate.push2Multiple(m, template);
                                                break;
                                        }
                                        case 'app':
                                        {
                                                ret = yield GeTuiDelegate.push2App(m, template);
                                                break;
                                        }
                                        case 'tag':
                                        {
                                                ret = yield GeTuiDelegate.push2Tag(m, template);
                                                break;
                                        }
                                }

                                return ret;
                        };
                }

                static setTag(clientId, tag) {
                        return function * () {
                                var fnSetClientTag = thunkify(GT.setClientTag);
                                return yield fnSetClientTag.call(GT, APP_ID, clientId, tag);
                        };
                }

                static queryClientIdByAlias(alias) {
                        return function * () {
                                var fnQueryClientId = thunkify(GT.queryClientId);
                                var result = yield fnQueryClientId.call(GT, APP_ID, alias);
                                if (result && result.result == 'ok') {
                                        return result.cidlist[0];
                                }
                        };
                }

                static push2Single(m, template) {
                        return function * () {
                                var message = new SingleMessage({
                                        isOffline: true,                        //是否离线
                                        offlineExpireTime: m.expire,             //离线时间
                                        data: template                          //设置推送消息类型
                                });

                                var target = new Target({
                                        appId: APP_ID,
                                        alias: m.target[0]
                                });

                                function _doPush(cb) {
                                        GT.pushMessageToSingle(message, target, function (err, res) {
                                                if (err != null && err.exception != null && err.exception instanceof  RequestError) {
                                                        var requestId = err.exception.requestId;
                                                        logger.warn('push fail, try again...');
                                                        GT.pushMessageToSingle(message, target, requestId, function (err, res) {
                                                                if (err) {
                                                                        logger.error('push message error');
                                                                }
                                                                cb && cb(err, res);
                                                        });
                                                }
                                                else {
                                                        cb && cb(err, res);
                                                }
                                        });
                                }

                                var fnPush = thunkify(_doPush);
                                return yield fnPush.call(null);
                        };
                }

                static push2Multiple(m, template) {
                        return function * () {
                                var targets = [];
                                for (var i = 0; i < m.target.length; i++) {
                                        var target = new Target({
                                                appId: APP_ID,
                                                alias: m.target[i]
                                        });
                                        targets.push(target);
                                }

                                var message = new ListMessage({
                                        isOffline: true,
                                        offlineExpireTime: m.expire,
                                        data: template
                                });

                                var taskGroupName = 'multi';
                                var fnGetContentId = thunkify(GT.getContentId);
                                var fnPushMessage2List = thunkify(GT.pushMessageToList);
                                var contentId = yield fnGetContentId.call(GT, message, taskGroupName);
                                return yield fnPushMessage2List.call(GT, contentId, targets);
                        };
                }

                static push2App(m, template) {
                        return function * () {
                                var taskGroupName = 'app';
                                var message = new AppMessage({
                                        isOffline: true,
                                        offlineExpireTime: m.expire,
                                        data: template,
                                        appIdList: [APP_ID],
                                        phoneTypeList: ['ANDROID', 'IOS']
                                });
                                var fnPushMessage2App = thunkify(GT.pushMessageToApp);
                                return yield fnPushMessage2App.call(GT, message, taskGroupName);
                        };
                }

                static push2Tag(m, template) {
                        return function * () {
                                var taskGroupName = 'tag';
                                var message = new AppMessage({
                                        isOffline: true,
                                        offlineExpireTime: m.expire,
                                        data: template,
                                        appIdList: [APP_ID],
                                        tagList: m.tag
                                });
                                var fnPushMessage2App = thunkify(GT.pushMessageToApp);
                                return yield fnPushMessage2App.call(GT, message, taskGroupName);
                        };
                }

                static getUserClientInfo(userId) {
                        return function * () {
                                return {
                                        platform: 'android',
                                        clientId: '12345678'
                                };
                        };
                }

                static bindAlias(alias, clientId) {
                        return function * () {
                                var fnBindAlias = thunkify(GT.bindAlias);
                                return yield fnBindAlias.call(GT, APP_ID, alias, clientId);
                        };
                }

                static unbindAlias(alias, clientId) {
                        return function * () {
                                var fnUnBindAlias = thunkify(GT.unBindAlias);
                                //return yield fnUnBindAlias.call(GT, APP_ID, alias, clientId);
                                return yield fnUnBindAlias.call(GT, APP_ID, alias, null);               //clientId为空时，解绑所有alias的client
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = GeTuiDelegate;
})();