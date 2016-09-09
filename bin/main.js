require('../src/EasyNode.js');
var util = require('util');
var co = require('co');
var fs = require('fs');
var Logger = using('easynode.framework.Logger');
var logger = null;

(function main(){
        (function _handleUncaughtException () {
                process.on('uncaughtException', function(err){
                        logger.error('unhandled error : ');
                        logger.error(err);
                        if(err.code == 'EADDRINUSE') {
                                process.exit(-1);
                        }
                });
        })();

        function _onError(err) {
                logger.error(err);
        }

        /*
        * 启动选项及文件加载顺序：
        * １、加载$easynode/src目录为源码目录
        * ２、加载$easynode/etc/EasyNode.conf为默认配置文件
        * ３、如果指明"--config-files"参数，则将这些用","分隔的文件（相对路径）作为配置文件逐个加载
        * ４、如果指明"--src-dis"参数，则将这些用","分隔的目录（相对路径）作为源码目录加载
        * ５、如果指明"--project"参数，则将projects/$project目录作为项目目录，加载projects/$project/src为源码目录（必须有）
        * ６、如果指明"--project"参数，则将projects/$project目录作为项目目录，加载projects/$project/etc/$project.conf为配置文件（如果存在）
        * ７、如果指明"--project"参数，则将projects/$project目录作为项目目录，加载projects/$project/etc/i18n/为国际化配置文件目录（如果存在）
        * ８、如果指明"--bean-files"参数，则将这些用","分隔的文件作为BeanFactory的定义文件加载
        * */
        co(function * (){
                if(EasyNode.arg('enable-v8-profiler') === 'true') {
                        require('v8-profiler');
                }
                //通过config-files和src-dirs传入Source目录和配置文件清单
                EasyNode.addConfigFile.apply(null, (EasyNode.arg('config-files') || '').split(','));
                EasyNode.addSourceDirectory.apply(null, (EasyNode.arg('src-dirs') || '').split(','));
                EasyNode.DEBUG = (EasyNode.config('debug-output', 'true') !== 'false');
                const PROJECT = EasyNode.arg('project');
                //加载项目src目录和配置文件
                if(PROJECT) {
                        console.log(`loading project [${PROJECT}] source and configurations...`);
                        EasyNode.addSourceDirectory(`projects/${PROJECT}/src`);
                        if(fs.existsSync(EasyNode.real(`projects/${PROJECT}/etc/${PROJECT}.conf`))) {
                                EasyNode.addConfigFile(`projects/${PROJECT}/etc/${PROJECT}.conf`);
                        }
                        if(fs.existsSync(EasyNode.real(`projects/${PROJECT}/etc/i18n`))) {
                                EasyNode.addi18nDirectory(`projects/${PROJECT}/etc/i18n`);
                        }
                }
                logger = Logger.getLogger();
                Logger.init();          //之前所有语句，请使用console.log替代，因为在此之前log4js还没初始化完毕
                const BeanFactory = using('easynode.framework.BeanFactory');
                var beanDefinitions = EasyNode.arg('bean-definitions');
                if(beanDefinitions) {
                        beanDefinitions = beanDefinitions.split(',');
                        for(var i = 0;i<beanDefinitions.length;i++) {
                                yield BeanFactory.initialize(beanDefinitions[i]);
                        }
                }
                var beanFiles = EasyNode.arg('beans');
                if(beanFiles) {
                        beanFiles = beanFiles.split(',');
                        for(var i = 0;i<beanFiles.length;i++) {
                                if(beanFiles[i]) {
                                        EasyNode.DEBUG && logger.debug('loading bean description ['+beanFiles[i]+']');
                                        yield BeanFactory.initialize(beanFiles[i]);
                                }
                        }
                }

                var mainClassName = EasyNode.arg('main-class');
                if(!mainClassName) {
                        logger.error('command line argument "--main-class" is not set!');
                        logger.info('\n' + fs.readFileSync(EasyNode.real('bin/launch-arguments.txt')).toString());
                        process.exit(-1);
                        /*
                        //启动AOP
                        var AOP = using('easynode.framework.aop.AOP');
                        AOP.initialize('etc/easynode-aop.json');
                        //启动BeanFactory
                        var BeanFactory = using('easynode.framework.BeanFactory');
                        yield BeanFactory.initialize('etc/easynode-beans.json');
                        //加载Actions，通常是空的
                        var ActionFactory = using('easynode.framework.mvc.ActionFactory');
                        yield ActionFactory.initialize('etc/easynode-actions.json');

                        //启动HTTP Server
                        var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                        var httpServer = new KOAHttpServer();
                        //加载HTTP目录
                        if(PROJECT) {
                                logger.info(`add project web directory projects/${PROJECT}/www/`);
                                httpServer.addWebDirs(`projects/${PROJECT}/www/`);
                        }
                        //加载插件
                        var EasyNodePlugin = using('easynode.framework.plugin.EasyNodePlugin');
                        var PluginLoadContext = using('easynode.framework.plugin.PluginLoadContext');
                        yield EasyNodePlugin.load(new PluginLoadContext({
                                koaHttpServer : httpServer,
                                datasource : BeanFactory.get('datasource'),
                                database : EasyNode.config('app.datasource.database'),
                                cache : BeanFactory.get('cache'),
                                mq : BeanFactory.get('mq')
                        }));
                        //Http Session
                        httpServer.setSessionStorage(BeanFactory.get('sessionStorage').type, BeanFactory.get('sessionStorage').opts);
                        //注入ActionContext参数
                        var ds = BeanFactory.get('datasource');
                        var cache = BeanFactory.get('cache');
                        var mq = BeanFactory.get('mq');
                        httpServer.setActionContextListener({
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

                        var projectLoadCtx = {
                                koaHttpServer : httpServer,
                                datasource : ds,
                                database: EasyNode.config('app.datasource.database')
                        };

                        if(PROJECT) {
                                yield require(`../projects/${PROJECT}/src/ProjectEntry.js`).launch(projectLoadCtx);
                        }

                        yield httpServer.start();
                        */
                }
                else {
                        if(PROJECT) {
                                yield require(`../projects/${PROJECT}/src/ProjectEntry.js`).launch({});
                        }
                        var MainClass = using(mainClassName);
                        if(typeof MainClass.main == 'function') {
                                yield MainClass.main.call();
                        }
                        else {
                                logger.error(`main class [${mainClassName}] has no executable generator main*()`);
                        }
                }
        }).catch(_onError);
})();