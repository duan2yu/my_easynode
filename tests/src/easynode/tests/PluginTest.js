var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var TestCase = using('easynode.framework.test.TestCase');

(function () {
        /**
         * Class PluginTest
         *
         * @class easynode.tests.PluginTest
         * @extends easynode.framework.test.TestCase
         * @since 0.1.0
         * @author zlbbq
         * */
        class PluginTest extends TestCase {
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

                start() {
                        return function * () {
                                var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                                var server = new KOAHttpServer();
                                var EasyNodePlugin = using('easynode.framework.plugin.EasyNodePlugin');
                                var PluginLoadContext = using('easynode.framework.plugin.PluginLoadContext');
                                yield EasyNodePlugin.load(new PluginLoadContext({
                                        koaHttpServer : server
                                }));

                                server.on(KOAHttpServer.Events.EVENT_ACCESS, function(o){
                                        logger.error(JSON.stringify(o));
                                });

                                yield server.start();
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = PluginTest;
})();