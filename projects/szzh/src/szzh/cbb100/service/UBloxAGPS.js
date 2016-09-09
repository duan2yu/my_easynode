var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var net = require('net');

(function () {
        const AGPS_URL = EasyNode.config('agps.u-blox.URL', 'http://agps.u-blox.com:46434');
        const AGPS_SERVER = EasyNode.config('agps.u-blox.server', 'agps.u-blox.com');
        const AGPS_PORT = parseInt(EasyNode.config('agps.u-blox.port', '46434'));
        const AGPS_REQUEST_TPL = EasyNode.config('agps.u-blox.request.tpl');
        const UBLOX_TIMEOUT = parseInt(EasyNode.config('agps.u-blox.timeout', '5000'));

        /**
         * Class UBloxAGPS
         *
         * @class szzh.cbb100.service.UBloxAGPS
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class UBloxAGPS extends GenericObject {
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

                //返回一个HEX STRING
                static getAGPSData(lat, lng) {
                        return function * () {
                                var body = AGPS_REQUEST_TPL.replace(/\$\{lat\}/, lat).replace(/\$\{lng\}/, lng);
                                EasyNode.DEBUG && logger.debug('AGPS request -> ' + body);
                                var response = yield HTTPUtil.rawPost(AGPS_URL, UBLOX_TIMEOUT, body);
                                return response.replace(/^(\w+0d0a0d0a)?/, '');
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = UBloxAGPS;
})();