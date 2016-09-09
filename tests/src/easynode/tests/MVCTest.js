var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var TestCase = using('easynode.framework.test.TestCase');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');
var MysqlModelGenerator = using('easynode.framework.mvc.spi.MysqlModelGenerator');
var TemplateView = using('easynode.framework.mvc.TemplateView');

(function () {
        /**
         * Class MVCTest
         *
         * @class easynode.tests.MVCTest
         * @extends easynode.framework.test.TestCase
         * @since 0.1.0
         * @author zlbbq
         * */
        class MVCTest extends TestCase {
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

                createAction1() {
                        var Model = using('easynode.framework.mvc.Model');
                        class MyModel extends Model {
                                constructor() {
                                        super('TABLE_NAME', 'VIEW_NAME');            // 'VIEW_NAME' is able to be equalized to 'TABLE_NAME' or ignored
                                }

                                defineFields() {
                                        this
                                                .defineField('recordId', 'int')
                                                .defineField('pluginName', 'string')
                                                .defineField('pluginVersion', 'string')
                                                .defineField('pluginId', 'int')
                                                .defineField('testJson', 'json')
                                        ;
                                }
                        }


                        class TestAction extends Action {
                                constructor() {
                                        super();
                                        this.setView(new TemplateView('test.mst', null, EasyNode.namespace2Path('easynode.tests')));
                                }

                                process(ctx) {
                                        return function * () {
                                                var model = new MyModel();
                                                model.merge({
                                                        pluginName: 'testXX',
                                                        pluginVersion: '0.1.0',
                                                        pluginId: 9,
                                                        testJson: {
                                                                name: 'zlbbq'
                                                        }
                                                });
                                                //create、read、update、del、list for a model
                                                //see IConnection(interface)/MysqlConnection(implementation)
                                                var r = yield ctx.getConnection().create(model);
                                                return ActionResult.createSuccessResult(r);

                                                //auto-generated model
                                                /*
                                                var pluginModel = MysqlModelGenerator.getModel('Plugin');
                                                var r = yield ctx.getConnection().create(pluginModel);
                                                return ActionResult.createSuccessResult(r);
                                                */
                                        };
                                }
                        }
                        Action.define('mvc', 'test1', TestAction);
                        ActionFactory.register(TestAction);
                        logger.info('access [/rest/mvc/test1] to test mvc action1');
                }

                createActionDemo() {
                        class TestAction extends Action {
                                constructor() {
                                        super();
                                }

                                process(ctx) {
                                        return function * () {
                                                var r = {
                                                        name : 'zlbbq'
                                                };
                                                return ActionResult.createSuccessResult(r);
                                        };
                                }
                        }
                        Action.define('demo', 'demo', TestAction);
                        ActionFactory.register(TestAction);
                        logger.info('access [/rest/demo/demo] to test demo');
                }

                start() {
                        var me = this;
                        return function * () {
                                var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                                var server = new KOAHttpServer();

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

                                //Auto-generate model
                                yield MysqlModelGenerator.generate(ds, 'easynode',
                                        {name: 'Plugin', table: 'EN_PLUGINS', view: 'EN_PLUGINS'},
                                        {name: 'CMSContent', table: 'CMS_CONTENT', view: 'CMS_CONTENT'}
                                );

                                //actions can access database and cache
                                //me.createAction1();
                                me.createActionDemo();
                                yield server.start();
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = MVCTest;
})();