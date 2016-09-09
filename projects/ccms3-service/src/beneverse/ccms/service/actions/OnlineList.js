var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');
var MysqlModelGenerator = using('easynode.framework.mvc.spi.MysqlModelGenerator');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');

(function () {
        const ONLINE_DEVICE_CACHE_KEY = EasyNode.config('cache.key.onlineDevices', 'CCM3-ONLINE-DEVICES');
        const CONNECTOR_HTTP_SERVICES = EasyNode.config('ccms3.connector.services.http').split(';');
        const ONLINE_SERVICE_URI = EasyNode.config('ccms3.connector.service.onlineDevice.URI', '/onlineDevice');
        /**
         * Class OnlineList
         *
         * @class beneverse.ccms.service.actions.OnlineList
         * @extends easynode.framework.mvc.Action
         * @since 0.1.0
         * @author zlbbq
         * */
        class OnlineList extends Action {
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
                        this.addArg('page int 页号，每页100条');
                }

                process(ctx) {
                        //TODO 分页处理
                        return function * () {
                                const RPP = 100;
                                if(!ctx.args.page) {
                                        ctx.args.page = 1;
                                }
                                var idx = (ctx.args.page - 1) * RPP;

                                //1分钟过期时间
                                const TTL = 60;
                                var o = yield ctx.cache.get(ONLINE_DEVICE_CACHE_KEY);
                                if(o) {
                                        return ActionResult.createSuccessResult(o);
                                }
                                o = [];
                                for(var i = 0;i<CONNECTOR_HTTP_SERVICES.length;i++) {
                                        if(CONNECTOR_HTTP_SERVICES[i]) {
                                                var url = OnlineList.getOnlineDeviceHttpURL(CONNECTOR_HTTP_SERVICES[i]);
                                                try {
                                                        var ret = yield HTTPUtil.getJSON(url);
                                                        o = o.concat(ret);
                                                } catch (e) {
                                                        logger.error(e);
                                                }
                                        }
                                }
                                yield ctx.cache.set(ONLINE_DEVICE_CACHE_KEY, o, TTL);
                                return ActionResult.createSuccessResult(o);
                        };
                }

                static getOnlineDeviceHttpURL(httpService) {
                        var [ip,port] = httpService.split(':');
                        return `http://${ip}:${port}${ONLINE_SERVICE_URI}`;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }

        }
        module.exports = OnlineList;
})();