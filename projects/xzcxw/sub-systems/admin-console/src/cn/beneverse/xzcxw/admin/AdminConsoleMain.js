var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var BeanFactory = using('easynode.framework.BeanFactory');
var MysqlModelGenerator = using('easynode.framework.mvc.spi.MysqlModelGenerator');
var ModelProxyActionFactory = using('easynode.framework.mvc.ModelProxyActionFactory');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');
var EnsureSalt = using('cn.beneverse.xzcxw.admin.util.EnsureSalt');
var ActionFilter = using('easynode.framework.mvc.ActionFilter');
var moment = require('moment');

(function () {
        /**
         * Class AdminConsoleMain
         *
         * @class #NAMESPACE#.AdminConsoleMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class AdminConsoleMain extends GenericObject {
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

                static main() {
                        return function * () {
                                var koaHttpServer = BeanFactory.get('httpServer');
                                koaHttpServer.addWebDirs('projects/xzcxw/sub-systems/admin-console/www/');
                                if(EasyNode.config('http.simulateLogin') === '1') {
                                        koaHttpServer.addMiddleware(function * (next) {
                                                if(this.session.USER == null) {
                                                        logger.info('simulate login');
                                                        this.session.USER = BeanFactory.get('simulatedLoginUser');
                                                }
                                                yield next;
                                        });
                                }

                                var ds = BeanFactory.get('datasource');
                                var database = EasyNode.config('admin.console.db.database');
                                var mq=BeanFactory.get('mq');
                                var cache=BeanFactory.get('cache');
                                var mysqlModels = [
                                        {name: 'user', table: 'XZCXW_USER', view: 'XZCXW_USER'},
                                        {name: 'loginRecord', table: 'XZCXW_USER_LOGIN_RECORD', view: 'XZCXW_USER_LOGIN_RECORD'},
                                        {name: 'cmsCatalog', table: 'XZCXW_CMS_CATALOG', view: 'XZCXW_CMS_CATALOG'},
                                        {name: 'cmsContent', table: 'XZCXW_CMS_CONTENT', view: 'XZCXW_CMS_CONTENT'},
                                        {name: 'cmsContentAttachment', table: 'XZCXW_CMS_CONTENT_ATTACHMENT', view: 'XZCXW_CMS_CONTENT_ATTACHMENT'},
                                        {name: 'mapMarkerType', table: 'XZCXW_MAP_MARKER_TYPE', view: 'XZCXW_MAP_MARKER_TYPE'},
                                        {name: 'taxi', table: 'XZCXW_TAXI', view: 'XZCXW_TAXI'},
                                        {name: 'bus', table: 'XZCXW_BUS', view: 'XZCXW_BUS'},
                                        {name: 'busLine', table: 'XZCXW_BUS_LINE', view: 'XZCXW_BUS_LINE'},
                                        {name: 'busStop', table: 'XZCXW_BUS_STOP', view: 'XZCXW_BUS_STOP'}
                                ];
                                yield MysqlModelGenerator.generate(ds, database, mysqlModels);

                        /*        var EasyNodePlugin = using('easynode.framework.plugin.EasyNodePlugin');
                                var PluginLoadContext = using('easynode.framework.plugin.PluginLoadContext');
                                yield EasyNodePlugin.load(new PluginLoadContext({
                                        koaHttpServer : koaHttpServer,
                                        datasource : ds,
                                        database : database,
                                        cache : cache,
                                        mq : mq
                                }));*/

                                yield  ActionFactory.initialize('projects/xzcxw/sub-systems/admin-console/etc/admin-console-actions.json');

                                koaHttpServer.setActionContextListener({
                                        onActionReady : function (ctx) {
                                                return function * () {
                                                        ctx.setQueue(mq);
                                                        ctx.setCache(cache);
                                                        if(ctx.getAction().datasourceSupport() === true) {
                                                                ctx.setConnection(yield ds.getConnection());
                                                                yield ctx.getConnection().beginTransaction();
                                                        }
                                                };
                                        },
                                        onDestroy : function (ctx) {
                                                return function * () {
                                                        if(ctx.getAction() && ctx.getAction().datasourceSupport() === true) {
                                                                if(ctx.getConnection()) {
                                                                        yield ctx.getConnection().commit();
                                                                        yield ds.releaseConnection(ctx.getConnection());
                                                                }
                                                        }
                                                };
                                        }
                                });

                                ActionFilter.addFilter({filter:function *(m, a, action, stack, next)
                                {
                                        //todo checkSession
                                        return yield next;
                                }});

                                AdminConsoleMain.proxyUser();
                                AdminConsoleMain.proxyLoginRecord();
                                AdminConsoleMain.proxyCmsCatalog();
                                AdminConsoleMain.proxyCmsContent();
                                AdminConsoleMain.proxyCmsContentAttachMent();
                                AdminConsoleMain.proxyMapMarkerType();
                                AdminConsoleMain.proxyTaxi();
                                AdminConsoleMain.proxyBus();
                                AdminConsoleMain.proxyBusLine();
                                AdminConsoleMain.proxyBusStop();

                                yield koaHttpServer.start();
                        };
                }


                static proxyUser() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('user');
                                }
                        }, 'user');
                        ActionFactory.register(factory.getCreateAction('*', null,
                                {
                                        beforeCreate: function (model, ctx) {
                                                let {salt, password_sha} = EnsureSalt({password: ctx.param('pwd')});
                                                return function *() {
                                                        model.merge({
                                                                status:'1',
                                                                salt:salt,
                                                                pwd:password_sha,
                                                                registerChannel:ctx.param('registerChannel')?ctx.param('registerChannel'):'0',
                                                                registerTime:moment().second()
                                                        });
                                                }
                                        }
                                }), null, null, '新增系统用户');
                        ActionFactory.register(factory.getListAction(
                                {
                                        name:'like',
                                        realName:'like',
                                        status:'=',
                                        registerChannel:'='
                                },['status ASC','registerTime DESC']
                        ));
                        ActionFactory.register(factory.getReadAction());
                        ActionFactory.register(factory.getUpdateAction());
                        ActionFactory.register(factory.getDelAction());
                }

                static proxyLoginRecord() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('loginRecord');
                                }
                        }, 'loginRecord');
                        ActionFactory.register(factory.getListAction(
                                {
                                        userId:'=',
                                        loginChannel:'=',
                                        loginTime:'between'
                                },['loginTime DESC']
                        ));
                        ActionFactory.register(factory.getReadAction());
                }

                static proxyCmsCatalog() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('cmsCatalog');
                                }
                        }, 'cmsCatalog');
                        ActionFactory.register(factory.getCreateAction('*', null,
                                {
                                        beforeCreate: function (model, ctx) {
                                                return function *() {
                                                        var action = ActionFactory.createActionInstance('cmsCatalog', 'getChildNodes', ctx);
                                                        var code = yield action.process.call(action, ctx);
                                                        model.merge({
                                                                status:'1',
                                                                code:code,
                                                                createTime:moment().second()
                                                        });
                                                }
                                        }
                                }), null, null, '新增目录');
                        ActionFactory.register(factory.getListAction(
                                {
                                        code:'like',
                                        name:'like',
                                        status:'='
                                },['status ASC','createTime DESC']
                        ));
                        ActionFactory.register(factory.getReadAction());
                        ActionFactory.register(factory.getUpdateAction());
                        ActionFactory.register(factory.getDelAction());
                }

                static proxyCmsContent() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('cmsContent');
                                }
                        }, 'cmsContent');
                        ActionFactory.register(factory.getCreateAction('*', null,
                                {
                                        beforeCreate: function (model, ctx) {
                                                return function *() {
                                                        model.merge({
                                                                creator:ctx.session.USER.id,
                                                                createTime:moment().second()
                                                        });
                                                }
                                        }
                                }), null, null, '内容信息');
                        ActionFactory.register(factory.getListAction(
                                {
                                        title:'like',
                                        subtitle:'like',
                                        creator:'=',
                                        'expire':'>'
                                },['sortFactor']
                        ));
                        ActionFactory.register(factory.getReadAction());
                        ActionFactory.register(factory.getUpdateAction());
                        ActionFactory.register(factory.getDelAction());
                }

                static proxyCmsContentAttachMent() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('cmsContentAttachment');
                                }
                        }, 'cmsContentAttachment');
                        ActionFactory.register(factory.getCreateAction('*', null,
                                {
                                        beforeCreate: function (model, ctx) {
                                                return function *() {
                                                        model.merge({
                                                                uploadTime:moment().second()
                                                        });
                                                }
                                        }
                                }), null, null, '新增内容附件');
                        ActionFactory.register(factory.getListAction(
                                {
                                        fileName:'like'
                                },['sortFactor']
                        ));
                        ActionFactory.register(factory.getReadAction());
                        ActionFactory.register(factory.getUpdateAction());
                        ActionFactory.register(factory.getDelAction());
                }

                static proxyMapMarkerType() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('mapMarkerType');
                                }
                        }, 'mapMarkerType');
                        ActionFactory.register(factory.getCreateAction('*', null,
                                {
                                        beforeCreate: function (model, ctx) {
                                                return function *() {
                                                        model.merge({
                                                                createTime:moment().second(),
                                                                status:'1'
                                                        });
                                                }
                                        }
                                }), null, null, '新增地图标记点分类');
                        ActionFactory.register(factory.getListAction(
                                {
                                        name:'like'
                                },['createTime']
                        ));
                        ActionFactory.register(factory.getReadAction());
                        ActionFactory.register(factory.getUpdateAction());
                        ActionFactory.register(factory.getDelAction());
                }

                static proxyTaxi() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('taxi');
                                }
                        }, 'taxi');
                        ActionFactory.register(factory.getCreateAction('*', null,
                                {
                                        beforeCreate: function (model, ctx) {
                                                return function *() {
                                                        model.merge({
                                                                createTime:moment().second(),
                                                                status:'1'
                                                        });
                                                }
                                        }
                                }), null, null, '新增出租车');
                        ActionFactory.register(factory.getListAction(
                                {
                                        vehicleNumber:'like',
                                        drivers:'like'
                                },['createTime']
                        ));
                        ActionFactory.register(factory.getReadAction());
                        ActionFactory.register(factory.getUpdateAction());
                        ActionFactory.register(factory.getDelAction());
                }

                static proxyBus() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('bus');
                                }
                        }, 'bus');
                        ActionFactory.register(factory.getCreateAction('*', null,
                                {
                                        beforeCreate: function (model, ctx) {
                                                return function *() {
                                                        model.merge({
                                                                createTime:moment().second(),
                                                                status:'0'
                                                        });
                                                }
                                        }
                                }), null, null, '新增公交车');
                        ActionFactory.register(factory.getListAction(
                                {
                                        vehicleNumber:'like',
                                        busNo:'='
                                },['createTime']
                        ));
                        ActionFactory.register(factory.getReadAction());
                        ActionFactory.register(factory.getUpdateAction());
                        ActionFactory.register(factory.getDelAction());
                }

                static proxyBusLine() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('busLine');
                                }
                        }, 'busLine');
                        ActionFactory.register(factory.getCreateAction('*', null,
                                {
                                        beforeCreate: function (model, ctx) {
                                                return function *() {
                                                        model.merge({
                                                                createTime:moment().second(),
                                                                status:'0'
                                                        });
                                                }
                                        }
                                }), null, null, '新增公交车线路');
                        ActionFactory.register(factory.getListAction(
                                {
                                        busNo:'=',
                                        status:'='
                                },['createTime']
                        ));
                        ActionFactory.register(factory.getReadAction());
                        ActionFactory.register(factory.getUpdateAction());
                        ActionFactory.register(factory.getDelAction());
                }

                static proxyBusStop() {
                        var factory = new ModelProxyActionFactory({
                                getModel: function () {
                                        return MysqlModelGenerator.getModel('busStop');
                                }
                        }, 'busStop');
                        ActionFactory.register(factory.getCreateAction('*', null,
                                {
                                        beforeCreate: function (model, ctx) {
                                                return function *() {
                                                        model.merge({
                                                                createTime:moment().second()
                                                        });
                                                }
                                        }
                                }), null, null, '新增公交线路站台');
                        ActionFactory.register(factory.getListAction(
                                {
                                        name:'like',
                                        type:'='
                                },['stopIndex']
                        ));
                        ActionFactory.register(factory.getReadAction());
                        ActionFactory.register(factory.getUpdateAction());
                        ActionFactory.register(factory.getDelAction());
                }


                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = AdminConsoleMain;
})();