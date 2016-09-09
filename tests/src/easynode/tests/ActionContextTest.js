var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var TestCase = using('easynode.framework.test.TestCase');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');

(function () {
        /**
         * Class ActionContextTest
         *
         * @class easynode.tests.ActionContextTest
         * @extends easynode.framework.test.TestCase
         * @since 0.1.0
         * @author zlbbq
         * */
        class ActionContextTest extends TestCase {
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

                createAction() {
                        class TestAction extends Action {
                                constructor() {
                                        super();
                                }

                                process(ctx) {
                                        return function * () {
                                                var sql = 'SELECT 1 AS DUAL_COL FROM DUAL';
                                                var r = yield ctx.getConnection().execQuery(sql);
                                                return ActionResult.createSuccessResult(r);
                                        };
                                }
                        }
                        Action.define('ctx', 'test', TestAction);
                        ActionFactory.register(TestAction);
                        logger.info('access [/rest/ctx/test] to test ActionContext');
                }

                start() {
                        var me = this;
                        return function * () {
                                var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                                var server = new KOAHttpServer();

                                var Memcached = using('easynode.framework.cache.Memcached');
                                var cache = new Memcached("192.168.0.25:11211");

                                var MySqlDataSource = using('easynode.framework.db.MysqlDataSource');
                                var mysqlOptions = {
                                        host: '192.168.0.25',
                                        port: 3306,
                                        user: 'root',
                                        password: 'zlbbq99',
                                        database: 'easynode',
                                        acquireTimeout: 3000,
                                        waitForConnections: true,
                                        connectionLimit: 2,
                                        queueLimit: 2
                                };
                                var ds = new MySqlDataSource(mysqlOptions);
                                yield ds.initialize();

                                server.setActionContextListener({
                                        onCreate: function (ctx) {
                                                return function * () {
                                                        // inject cache instance
                                                        ctx.setCache(cache);
                                                        // inject database connection instance
                                                        ctx.setConnection(yield ds.getConnection());
                                                        // begin database transaction
                                                        yield ctx.getConnection().beginTransaction();
                                                };
                                        },

                                        onDestroy: function (ctx) {
                                                return function * () {
                                                        //commit database transaction
                                                        yield ctx.getConnection().commit();
                                                        //release database transaction
                                                        yield ds.releaseConnection(ctx.getConnection());
                                                };
                                        },

                                        onError: function (ctx, err) {
                                                return function * () {
                                                        //rollback database transaction if any error occurred
                                                        yield ctx.getConnection().rollback();
                                                        //if an error contains attribute 'execResult', that means the error is handled
                                                        !err.executeResult  && logger.error(err.stack);
                                                };
                                        }
                                });

                                //actions can access database and cache
                                me.createAction();

                                yield server.start();
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = ActionContextTest;
})();