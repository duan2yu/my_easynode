var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var TestCase = using('easynode.framework.test.TestCase');

(function () {
        /**
         * Class KOASessionTest
         *
         * @class easynode.tests.KOASessionTest
         * @extends easynode.framework.test.TestCase
         * @since 0.1.0
         * @author zlbbq
         * */
        class KOASessionTest extends TestCase {
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

                                //use memory session, NOTE: this will cause Memory Leak
                                server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_MEMORY);

                                //use memcached session
                                /*
                                server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_MEMCACHED, {
                                        host: '127.0.0.1',
                                        port: 11211
                                });
                                */

                                //use redis session
                                /*
                                server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_REDIS, {
                                        host: '127.0.0.1',
                                        port: 6379,
                                        db: 'EasyNode_Session',
                                        pass: 'password_of_db'
                                });
                                */

                                server.addMiddleware(function * (next) {
                                        if (!this.session.user) {
                                                logger.info('simulate user login...');
                                                this.session.user = {
                                                        id: 'zlbbq'
                                                };
                                        }
                                        yield next;
                                });

                                server.addRoute('get', '/session', function * () {
                                        this.body = 'Hello, /session! user in session is ' + JSON.stringify(this.session.user);
                                });

                                logger.info('access /session to test session');
                                yield server.start();
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = KOASessionTest;
})();