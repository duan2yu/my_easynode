var assert = require('assert');
var GenericObject = using('easynode.GenericObject');
var AbstractPlugin = using('easynode.framework.plugin.AbstractPlugin');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var StringUtil = using('easynode.framework.util.StringUtil');

(function () {
        var logger = AbstractPlugin.getPluginLogger('sms-captcha@0.0.1', __filename);
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
                 * @param {Object} options 初始化参数。配置项请参考插件配置文件。
                 *                                      options.cache : 缓存实例，用于存储验证码
                 *                                      options.pluginSMS : sms-haoservice插件实例
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                initialize(options) {
                        var me = this;
                        me.config(options);
                        me.templateId = parseInt(me.config('plugin.sms-captcha.templateId', '0'));
                        assert(me.templateId > 0, 'Invalid template id, please overwrite config item "plugins.sms-captcha.templateId"');
                        me.captchaLength = parseInt(me.config('plugin.sms-captcha.length', '6'));
                        me.captchaAlphabet = me.config('plugin.sms-captcha.alphabet', '0,1,2,3,4,5,6,7,8,9').split(',');
                        me.captchaExpire = parseInt(me.config('plugin.sms-captcha.expire', '5')) * 60;          //convert to seconds
                        me.sendInterval = parseInt(me.config('plugin.sms-captcha.sendInterval', '60')) * 1000;          //convert to ms
                        me.maxRetries = parseInt(me.config('plugin.sms-captcha.maxRetries', '10'));
                        me.placeholder = me.config('plugin.sms-captcha.placeholder', 'captcha');
                        me.cachePrefix = me.config('plugin.sms-captcha.cachePrefix', 'SMS-CAPTCHA-');
                        me.cache = options.cache;
                        assert(me.cache, 'Invalid options, cache instance is required');
                        me.pluginSMS = options.pluginSMS;
                        assert(me.pluginSMS, 'Invalid options, plugin [sms-haoservice] instance is required');
                }

                _generate() {
                        var s = '';
                        for (var i = 0; i < this.captchaLength; i++) {
                                var n = parseInt(Math.random() * this.captchaAlphabet.length);
                                s += this.captchaAlphabet[n];
                        }
                        return s;
                }

                /**
                 *  发送短信验证码。
                 *
                 * @method sendCaptcha
                 * @param {String} mobile 手机号码
                 * @return {Object} Notation: {error_code : xxx, reason : "xxx", result : xxx}
                 * @public
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                sendCaptcha(mobile) {
                        var me = this;
                        const ERROR_FREQUENCY = -10000;
                        return function * () {
                                var cacheKey = me.cachePrefix + mobile;
                                var cached = yield me.cache.get(cacheKey);
                                var nowTime = new Date().getTime();
                                if (cached && (nowTime - cached.sendTime) < me.sendInterval) {
                                        return {
                                                error_code: ERROR_FREQUENCY,
                                                reason: '下发频率过快',
                                                result: null
                                        };
                                }

                                var captcha = me._generate();
                                var bindValue = {};
                                bindValue[me.placeholder] = captcha;

                                var ret = yield me.pluginSMS.sendSMS(mobile, me.templateId, bindValue);
                                if (me.pluginSMS.isSuccess(ret)) {
                                        EasyNode.DEBUG && logger.debug(`recent captcha of [${mobile}] is [${captcha}]`);
                                        cached = {
                                                captcha: captcha,
                                                sendTime: nowTime,
                                                retry: 0
                                        };
                                        yield me.cache.set(cacheKey, cached, me.captchaExpire);
                                }
                                return ret;
                        };
                }

                /**
                 *  验证短信码证码
                 *
                 * @method isSuccess
                 * @param {String} mobile 手机号码
                 * @param {String} captcha 短信码证码
                 * @return {boolean} 验证结果
                 * @public
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                checkCaptcha(mobile, captcha) {
                        var me = this;
                        return function * () {
                                assert(typeof mobile === 'string', 'Invalid argument mobile');
                                assert(typeof captcha === 'string', 'Invalid argument captcha');
                                if (captcha.length != me.captchaLength) {
                                        return false;
                                }
                                var cacheKey = me.cachePrefix + mobile;
                                var cached = yield me.cache.get(cacheKey);
                                if (!cached) {
                                        return false;
                                }

                                if (cached.retry >= me.maxRetries) {
                                        yield me.cache.del(cacheKey);
                                }

                                if (cached.captcha === captcha) {                                        //短信验证码只能有效一次
                                        yield me.cache.del(cacheKey);
                                        return true;
                                }

                                cached.retry++;
                                yield me.cache.set(cacheKey, cached);
                                return false;
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
                        logger.info('finalize');
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = PluginEntry;
})();