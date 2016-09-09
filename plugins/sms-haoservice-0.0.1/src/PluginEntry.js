var assert = require('assert');
var GenericObject = using('easynode.GenericObject');
var AbstractPlugin = using('easynode.framework.plugin.AbstractPlugin');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var StringUtil = using('easynode.framework.util.StringUtil');
var BeanFactory = using('easynode.framework.BeanFactory');

(function () {
        var logger = AbstractPlugin.getPluginLogger('sms-haoservice@0.0.1', __filename);
        const SEND_SUCCESS = 0;
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
                }

                /**
                 *  初始化短信发送（基于HaoService）插件。
                 *
                 * @method initialize
                 * @param {Object} options 初始化参数。例：{'plugin.sms-haoservice.appKey' : '756547a3dfeb4682bb6e33d90ecaab7f'}，配置项请参考插件配置文件
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                initialize(options) {
                        var me = this;
                        me.config(options);
                        me.serviceTimeout = parseInt(me.config('plugin.sms-haoservice.serviceTimeout', '3000'));
                        me.serviceURL = me.config('plugin.sms-haoservice.serviceURL');
                        me.appKey = me.config('plugin.sms-haoservice.appKey');
                        me.printSendResult = StringUtil.switchState(me.config('plugin.sms-haoservice.printSendResult', '1'));
                }

                /**
                 *  在KOAHttpServer中注册短信插件服务，将插件功能转换成HTTP服务，而不是API。
                 *  路由参考：etc/sms-haoservice-routes.json
                 *
                 * @method registerSMSService
                 * @param {easynode.framework.server.http.KOAHttpServer} koaHttpServer koaHttpServer实例
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                registerSMSService(koaHttpServer) {
                        var me = this;
                        return function * () {
                                yield BeanFactory.initialize(me.relative('etc/sms-haoservice-beans.json'));
                                yield koaHttpServer.loadRouteMap(me.relative('etc/sms-haoservice-routes.json'));
                                BeanFactory.get('smsHaoServiceController').setPluginInstance(me);
                        };
                }

                /**
                 *  发送短信。
                 *
                 * @method sendSMS
                 * @param {String} mobile 手机号码
                 * @param {int} tplId HaoService平台上申请的短信模板ID
                 * @param {Object} bindValues 绑定变量键-值对，KEY取决于在HaoService申请的模板体。"您的订单#no#快要到期了"传递{no : "$订单号"}
                 * @return {Object} HaoService平台的发送结果，使用isSuccess和getErrorMessage检查发送结果
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                sendSMS(mobile, tplId, bindValues) {
                        var me = this;
                        return function * () {
                                var strVal = '';
                                for(var key in bindValues) {
                                        strVal += `#${encodeURI(key)}#=${encodeURI(bindValues[key])}`;
                                }
                                strVal = encodeURI(strVal);
                                var params = {
                                        key : me.appKey,
                                        mobile : mobile,
                                        tpl_id : tplId,
                                        tpl_value : strVal
                                };
                                var ret = yield HTTPUtil.getJSON(me.serviceURL, me.serviceTimeout, 'GET', params);
                                logger.info(`***SMS SEND RESULT*** send sms to [${mobile}], template [${tplId}], values ${JSON.stringify(bindValues)}, response -> ${JSON.stringify(ret)}`);
                                return ret;
                        };
                }

                /**
                 *  返回短信发送结果
                 *
                 * @method isSuccess
                 * @param {Object} ret，调用sendSMS的返回值
                 * @public
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                isSuccess(ret) {
                        return ret['error_code'] === SEND_SUCCESS;
                }

                /**
                 *  返回短信发送结果的错误消息
                 *
                 * @method getErrorMessage
                 * @param {Object} ret，调用sendSMS的返回值
                 * @public
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getErrorMessage(ret) {
                        return ret['reason'] || this.i18n('plugin.sms-haoservice.errors.' + ret['error_code']);
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