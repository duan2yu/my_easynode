var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var thunkify = require('thunkify');

(function () {
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

        var Target = require('./getui/Target');

        /**
         * Class GeTuiDelegate
         *
         * @class cn.beneverse.easynode.plugin.GT.GeTuiDelegate
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
                constructor(options) {
                        super();
                        //调用super()后再定义子类成员。
                        this.GT = new GeTui(options.GT_URL, options.APP_KEY, options.MASTER_SECRET);
                        this.APP_ID = options.APP_ID;
                        this.offlineExpireTime = options.offlineExpireTime ;
                        this.transmissionType = options.transmissionType ;
                }

                pushTransmission(m) {
                        var me = this;
                        return function * () {
                                EasyNode.DEBUG && logger.debug('push transmission -> ' + JSON.stringify(m));
                                var template = new TransmissionTemplate({
                                        appId: me.APP_ID,
                                        appKey: me.APP_KEY,
                                        transmissionType : 2,                   //等待客户端自启动
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
                                template.setApnInfo(payload);

                                var ret = null;
                                switch (m.type) {
                                        case 'single' :
                                        {
                                                ret = yield me.push2Single(m, template);
                                                break;
                                        }
                                        case 'multiple':
                                        {
                                                ret = yield me.push2Multiple(m, template);
                                                break;
                                        }
                                        case 'app':
                                        {
                                                ret = yield me.push2App(m, template);
                                                break;
                                        }
                                        case 'tag':
                                        {
                                                ret = yield me.push2Tag(m, template);
                                                break;
                                        }
                                }

                                return ret;
                        };
                }

                setTag(clientId, tag) {
                        var me = this;
                        return function * () {
                                var fnSetClientTag = thunkify(me.GT.setClientTag);
                                return yield fnSetClientTag.call(me.GT, me.APP_ID, clientId, tag);
                        };
                }

                queryClientIdByAlias(alias) {
                        var me = this;
                        return function * () {
                                var fnQueryClientId = thunkify(me.GT.queryClientId);
                                var result = yield fnQueryClientId.call(me.GT, me.APP_ID, alias);
                                if (result && result.result == 'ok') {
                                        return result.cidlist[0];
                                }
                        };
                }

                push2Single(m, template) {
                        var me = this;
                        return function * () {
                                var message = new SingleMessage({
                                        isOffline: true,                        //是否离线
                                        offlineExpireTime: me.offlineExpireTime,             //离线时间
                                        data: template                          //设置推送消息类型
                                });

                                var target = new Target({
                                        appId: me.APP_ID,
                                        alias: m.target
                                });

                                function _doPush(cb) {
                                        me.GT.pushMessageToSingle(message, target, function (err, res) {
                                                if (err != null && err.exception != null && err.exception instanceof  RequestError) {
                                                        var requestId = err.exception.requestId;
                                                        logger.warn('push fail, try again...');
                                                        me.GT.pushMessageToSingle(message, target, requestId, function (err, res) {
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

                push2Multiple(m, template) {
                        var me = this;
                        return function * () {
                                var targets = [];
                                for (var i = 0; i < m.target.length; i++) {
                                        var target = new Target({
                                                appId: me.APP_ID,
                                                alias: m.target[i]
                                        });
                                        targets.push(target);
                                }

                                var message = new ListMessage({
                                        isOffline: true,
                                        offlineExpireTime: me.offlineExpireTime,             //离线时间
                                        data: template
                                });

                                var taskGroupName = 'multi';
                                var fnGetContentId = thunkify(me.GT.getContentId);
                                var fnPushMessage2List = thunkify(me.GT.pushMessageToList);
                                var contentId = yield fnGetContentId.call(me.GT, message, taskGroupName);
                                return yield fnPushMessage2List.call(me.GT, contentId, targets);
                        };
                }

                push2App(m, template) {
                        var me = this;
                        return function * () {
                                var taskGroupName = 'app';
                                var message = new AppMessage({
                                        isOffline: true,
                                        offlineExpireTime: me.offlineExpireTime,             //离线时间
                                        data: template,
                                        appIdList: [me.APP_ID],
                                        phoneTypeList: ['ANDROID', 'IOS']
                                });
                                var fnPushMessage2App = thunkify(me.GT.pushMessageToApp);
                                return yield fnPushMessage2App.call(me.GT, message, taskGroupName);
                        };
                }

                push2Tag(m, template) {
                        var me = this;
                        return function * () {
                                var taskGroupName = 'tag';
                                var message = new AppMessage({
                                        isOffline: true,
                                        offlineExpireTime: me.offlineExpireTime,             //离线时间
                                        data: template,
                                        appIdList: [me.APP_ID],
                                        tagList: m.tag
                                });
                                var fnPushMessage2App = thunkify(me.GT.pushMessageToApp);
                                return yield fnPushMessage2App.call(me.GT, message, taskGroupName);
                        };
                }

                bindAlias(alias, clientId) {
                        var me = this;
                        return function * () {
                                var fnBindAlias = thunkify(me.GT.bindAlias);
                                return yield fnBindAlias.call(me.GT, me.APP_ID, alias, clientId);
                        };
                }

                unbindAlias(alias) {
                        var me = this;
                        return function * () {
                                var fnUnBindAlias = thunkify(me.GT.unBindAlias);
                                return yield fnUnBindAlias.call(me.GT, me.APP_ID, alias, null);               //clientId为空时，解绑所有alias的client
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = GeTuiDelegate;
})();