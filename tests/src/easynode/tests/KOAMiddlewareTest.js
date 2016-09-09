var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var TestCase = using('easynode.framework.test.TestCase');

(function () {
        /**
         * Class KOAMiddlewareTest
         *
         * @class easynode.tests.KOAMiddlewareTest
         * @extends easynode.framework.test.TestCase
         * @since 0.1.0
         * @author zlbbq
         * */
        class KOAMiddlewareTest extends TestCase {
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

                start () {
                        return function * () {
                                var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                                var server = new KOAHttpServer();

                                server.addMiddleware(function * (next){
                                        logger.info('middleware goes here');
                                        yield next;
                                });

                                server.addRoute('get', '/route', function * () {
                                        this.body = 'Hello, /route!';
                                });

                                server.addMiddlewareAfterRoutes(function * (next) {
                                        this.status = 404;
                                        this.body = 'Simple 404 Handler';
                                });

                                logger.info('access /route to test route');
                                yield server.start();
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = KOAMiddlewareTest;
})();