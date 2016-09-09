var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var thunkify = require('thunkify');
var LBSServiceRoutes = using('szzh.cbb100.service.LBSServiceRoutes');

(function () {
        /**
         * Class CBB100ServerMain
         *
         * @class szzh.cbb100.CBB100ServerMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100ServerMain extends GenericObject {
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

                static * main() {
                        var BeanFactory = using('easynode.framework.BeanFactory');
                        yield BeanFactory.initialize('projects/szzh/etc/lbs/lbs-service-beans.json');
                        BeanFactory.init('lbsCache');

                        //HTTP Server
                        var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                        var httpPort = S(EasyNode.config('http.server.port', '7000')).toInt();
                        var httpServer = new KOAHttpServer(httpPort);
                        httpServer.name = EasyNode.config('http.server.name', 'LBS-Service');
                        LBSServiceRoutes.defineRoutes(httpServer);
                        yield httpServer.start();
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100ServerMain;
})();