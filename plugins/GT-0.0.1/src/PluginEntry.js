var assert = require('assert');
var GenericObject = using('easynode.GenericObject');
var AbstractPlugin = using('easynode.framework.plugin.AbstractPlugin');
const PLUGIN_VERSION = '0.0.1';
const PLUGIN_NAME = 'GT';
const PLUGIN_FULL_NAME = PLUGIN_NAME + '@' + PLUGIN_VERSION;

(function () {
        const logger = AbstractPlugin.getPluginLogger(PLUGIN_FULL_NAME, __filename);
        /**
         * Class PluginEntry
         *
         * @class PluginEntry
         * @extends easynode.framework.plugin.AbstractPlugin
         * @since 0.1.0
         * @author zlbbq
         * */
        class PluginEntry extends AbstractPlugin {
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
                        this.options = null;

                        /**
                         *  个推代理实例。
                         *
                         * @method property
                         * @type cn.beneverse.easynode.plugin.GT.GeTuiDelegate
                         * @private
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.gtDelegate = null;
                }

                /**
                 *  初始化个推消息推送插件。
                 *
                 * @method initialize
                 * @param {cn.beneverse.easynode.plugin.GT.PluginOptions} options 初始化参数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                initialize(options) {
                        var me = this;
                        me.options = options;
                        const GT_URL = me.config('plugin.GT.GTServiceURL');
                        options.GT_URL = GT_URL;
                        const GeTuiDelegate = me.using('cn.beneverse.easynode.plugin.GT.GeTuiDelegate');
                        me.gtDelegate = new GeTuiDelegate(options);
                }

                /**
                 *  向单个用户推送消息。
                 *
                 * @method push2Single
                 * @param {String} alias 用户别名
                 * @param {String} alertTitle 通知标题
                 * @param {String} alert 通知内容
                 * @param {String} content 消息文本
                 * @param {int} badge 小标签数字
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                push2Single(alias, alertTitle, alert, content, badge=1) {
                        var me = this;
                        return function * () {
                                var m = {
                                        type : 'single',
                                        target : alias,
                                        alertTitle : alertTitle,
                                        alert : alert,
                                        content : content,
                                        badge : badge
                                };

                                return yield me.gtDelegate.pushTransmission(m);
                        };
                }

                /**
                 *  向多个用户推送消息。
                 *
                 * @method push2Multiple
                 * @param {Array} aliases 用户别名数组, ['zlbbq','zlbbq1']
                 * @param {String} alertTitle 通知标题
                 * @param {String} alert 通知内容
                 * @param {String} content 消息文本
                 * @param {int} badge 小标签数字
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                push2Multiple(aliases, alertTitle, alert, content, badge=1) {
                        var me = this;
                        return function * () {
                                var m = {
                                        type : 'multiple',
                                        target : aliases,
                                        alertTitle : alertTitle,
                                        alert : alert,
                                        content : content,
                                        badge : badge
                                };

                                return yield me.gtDelegate.pushTransmission(m);
                        };
                }

                /**
                 *  向标签用户推送消息
                 *
                 * @method push2Tag
                 * @param {String/Array} tag 标签名或标签数组
                 * @param {String} alertTitle 通知标题
                 * @param {String} alert 通知内容
                 * @param {String} content 消息文本
                 * @param {int} badge 小标签数字
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                push2Tag(tag, alertTitle, alert, content, badge=1) {
                        var me = this;
                        if(typeof tag === 'string') {
                                tag = [tag];
                        }
                        return function * () {
                                var m = {
                                        type : 'tag',
                                        tag : tag,
                                        alertTitle : alertTitle,
                                        alert : alert,
                                        content : content,
                                        badge : badge
                                };

                                return yield me.gtDelegate.pushTransmission(m);
                        };
                }

                /**
                 *  向全APP的用户推送消息
                 *
                 * @method push2App
                 * @param {String} alertTitle 通知标题
                 * @param {String} alert 通知内容
                 * @param {String} content 消息文本
                 * @param {int} badge 小标签数字
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                push2App(alertTitle, alert, content, badge=1) {
                        var me = this;
                        return function * () {
                                var m = {
                                        type : 'app',
                                        alertTitle : alertTitle,
                                        alert : alert,
                                        content : content,
                                        badge : badge
                                };

                                return yield me.gtDelegate.pushTransmission(m);
                        };
                }

                /**
                 *  注册客户端。流程如下：
                 *  １、APP客户端SDK连接到个推平台，获取到cid(ClientID)
                 *  ２、APP客户端用户登录
                 *  ３、APP客户端后台服务系统取得业务系统中的用户标签后调用本插件的API函数（或由APP端调用）
                 *  ４、插件确认cache中有没有客户端数据或数据有没有变更
                 *  ５、无数据或数据有变更，则重新调用个推平台的bindAlias绑定客户端并打上标签
                 *  ６、每次用户登录，数据被保存24小时
                 *
                 *
                 * @method registerClient
                 * @param {String} alias 用户别名
                 * @param {String} cid 个推cid
                 * @param {Array} tags 用户标签数组
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                registerClient(alias, cid, tags) {
                        var me = this;
                        return function * () {
                                EasyNode.DEBUG && logger.debug(`registering client [alias=${alias}, cid=${cid}, tags=${JSON.stringify(tags)}]`);
                                var cache = me.options.cache;
                                var clientInfo = yield cache.get(`GT-CLIENT-INFO-${alias}`);
                                var rebindAlias = false;
                                var resetTags = false;
                                var ret = null;
                                var sTags = tags.join(',');
                                var allOK = true;
                                if(!clientInfo) {
                                        rebindAlias = true;
                                        resetTags = true;
                                        clientInfo = {
                                                alias : alias,
                                                cid : cid,
                                                tags : sTags
                                        };
                                }
                                else {
                                        if(clientInfo.cid !== cid) {
                                                rebindAlias = true;
                                                clientInfo.cid = cid;
                                        }
                                        if(clientInfo.tags !== sTags) {
                                                resetTags = true;
                                                clientInfo.tags = sTags;
                                        }
                                }

                                if(rebindAlias) {
                                        ret = yield me.gtDelegate.unbindAlias(alias);
                                        EasyNode.DEBUG && logger.debug(`unbind alias ${alias} response : ${JSON.stringify(ret)}`);
                                        allOK &= (ret && ret.result === 'ok');
                                        if(allOK) {
                                                ret = yield me.gtDelegate.bindAlias(alias, cid);
                                                EasyNode.DEBUG && logger.debug(`bind alias ${alias} response : ${JSON.stringify(ret)}`);
                                                allOK &= (ret && ret.result === 'ok');
                                        }
                                }

                                if(resetTags && allOK) {
                                        ret = yield me.gtDelegate.setTag(cid, tags);
                                        EasyNode.DEBUG && logger.debug(`set alias [${alias}] tag to [${sTags}] response : ${JSON.stringify(ret)}`);
                                        allOK &= (ret && ret.result === 'ok');
                                }

                                //缓存一天
                                if(allOK) {
                                        yield cache.set(`GT-CLIENT-INFO-${alias}`, clientInfo, 24 * 3600);
                                }
                                else {
                                        logger.error(`register client [alias=${alias}, cid=${cid}, tags=${JSON.stringify(tags)}] failed, last failed response is：${JSON.stringify(ret)}`);
                                }
                        };
                }

                /**
                 *  销毁插件实例，没什么可以干的。
                 *
                 * @method finalize
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                finalize() {
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = PluginEntry;
})();