var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var thunkify = require('thunkify');
var CCMS3ServiceRoutes= using('beneverse.ccms.terminal.connector.v20.service.CCMS3ServiceRoutes');

(function () {
        /**
         * Class CCMS3ServerMain
         *
         * @class beneverse.ccms.terminal.connector.v20.CCMS3ServerMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3ServerMain extends GenericObject {
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
                        yield BeanFactory.initialize('projects/ccms3-terminal-connector/etc/ccms3-terminal-connector-beans.json');

                        //TCP Server
                        var TCPServer = using('easynode.framework.server.tcp.TCPServer');
                        var port = S(EasyNode.config('tcp.server.port', '10089')).toInt();
                        var server = new TCPServer(port);
                        var CCMS3 = using('beneverse.ccms.terminal.connector.v20.*');
                        server.setClientFactory(CCMS3.CCMS3Client);
                        var decoder = new CCMS3.CCMS3Decoder(server);
                        var encoder = new CCMS3.CCMS3Encoder(server);
                        var messageHandler = new CCMS3.CCMS3MessageHandler(server);
                        server.name = EasyNode.config('tcp.server.name', 'CCMS3-TCPServer');
                        server.setDecoder(decoder).setEncoder(encoder).setMessageHandler(messageHandler);

                        //HTTP Server
                        var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                        var httpPort = S(EasyNode.config('http.server.port', '9010')).toInt();
                        var httpServer = new KOAHttpServer(httpPort);
                        httpServer.name = EasyNode.config('http.server.name', 'CCMS3-Embed-HTTPServer');
                        CCMS3ServiceRoutes.defineRoutes(httpServer,server);

                        yield server.start();
                        yield httpServer.start();
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3ServerMain;
})();