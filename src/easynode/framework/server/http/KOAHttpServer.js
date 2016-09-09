var assert = require('assert');
var thunkify = require('thunkify');
var Logger = using('easynode.framework.Logger');
var _ = require('underscore');
var co = require('co');
var fs = require('co-fs');
var logger = Logger.forFile(__filename);
var AbstractServer = using('easynode.framework.server.AbstractServer');
var S = require('string');
var koa = require('koa');
var staticFileServe = require('koa-static');
var favicon = require('koa-favicon');
var path = require('path');
var session = require('koa-generic-session');
var accessLogger = Logger.getLogger('access');
var route = require('koa-route');
var pathToRegexp = require('path-to-regexp');
var qs = require('koa-qs');
var koaBody = require('koa-body');
var pjax = require('./misc/koa-pjax');
var KOAHttpRequestParameter = using('easynode.framework.server.http.KOAHttpRequestParameter');
var TemplateView = using('easynode.framework.mvc.TemplateView');
var MustacheHelper = using('easynode.framework.util.MustacheHelper');
var StringUtil = using('easynode.framework.util.StringUtil');
var Validator = using('easynode.framework.mvc.Validator');
var BeanFactory = using('easynode.framework.BeanFactory');
var APMTool = using('easynode.framework.util.APMTool');

(function () {
        const PROXY_IP_HEADER = EasyNode.config('easynode.servers.koa-HttpServer.proxyIPHeader', 'x-forwarded-for');
        const ROUTE_URI_PREFIX = EasyNode.config('easynode.servers.koa-HttpServer.routePrefix', '');
        const HTTP_METHODS = [
                'all',          //virtual method
                'del',          //virtual method, equal to delete
                'get',
                'post',
                'put',
                'head',
                'delete',
                'options',
                'trace',
                'copy',
                'lock',
                'mkcol',
                'move',
                'purge',
                'propfind',
                'proppatch',
                'unlock',
                'report',
                'mkactivity',
                'checkout',
                'merge',
                'm-search',
                'notify',
                'subscribe',
                'unsubscribe',
                'patch',
                'search',
                'connect'
        ];

        /**
         * KOAHttpServer封装了一个koa Application，预定义了access logger，csrf，session, routes等中间件，并支持通过API方式向koa Application
         * 增加新的中间件、路由。<br>
         * 中间件和路由的加载顺序：favicon->access log->static files(包括所有静态文件目录)->session->csrf->$middlewares->default routes->$extra routes->$middleware-after-routes
         * <h5>使用参考：</h5>
         * <pre>
         *
         *
         require('../src/EasyNode.js');
         EasyNode.addSourceDirectory('src');
         var co = require('co');
         var assert = require('assert');
         var logger = using('easynode.framework.Logger').getLogger();

         var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
         var server = new KOAHttpServer();
         yield server.loadRouteMap('etc/demo-route-map.json');

         Route处理函数(generator)中可以使用成员定义如下：
         this -> koaContext实例
         this.params -> uri参数表
         this.parameter -> 请求参数, easynode.framework.server.http.KOAHttpRequestParameter实例
         要求统一返回：easynode.framework.mvc.ActionResult 实例(text/html或application/json)

         // redis session存储
         //server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_REDIS, {
                        //        host : '127.0.0.1',
                        //        port : 6379
                        //});

         // memcached session存储
         //server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_MEMCACHED, {
                        //        host : '127.0.0.1',
                        //        port : 11211
                        //});

         // memory session 存储
         server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_MEMORY);

         //增加一个WEB目录。
         server.addWebDirs('plugins/demo/www/');

         //增加一个中间件
         server.addMiddleware(function * (next) {
                        console.log('this message is printed anytime');
                        console.log(this.parameter.param('a'));
                        console.log(this.parameter.param('b'));
                        console.log(this.parameter.dateParam('c'));
                        console.log(this.remoteAddress);                        //客户端IP地址
                                yield next;
                        });

         //增加一个在路由之后的中间件
         server.addMiddlewareAfterRoutes(function * (next) {
                        console.log('this message is printed when no route was found');
                                this.type = 'json';
                                this.body = {
                                        hello : 'EasyNode'
                                };
                                yield next;
                        });

         //增加一个路由
         server.addRoute('get', '/abc.jsp', function * () {
                                 this.body = 'This is abc.jsp';
                        });

         //启动服务

         co(function * (){
                                yield server.start();
                        }).catch(onError());

         //错误处理
         function onError(err) {
                                if(err) {
                                        logger.error(err);
                                }
                        }
         *  </pre>
         * @class easynode.framework.server.http.KOAHttpServer
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class KOAHttpServer extends AbstractServer {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @param {int} port 端口，默认5000
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(port = S(EasyNode.config('easynode.servers.koa-HttpServer.port', '5000')).toInt()) {
                        super(port, EasyNode.config('easynode.servers.koa-HttpServer.name', 'koa-HttpServer'));
                        //调用super()后再定义子类成员。

                        /**
                         *  HTTP服务的根目录，默认配置项：easynode.servers.koa-HttpServer.rootDirectory或www
                         * @property _webRoot
                         * @type String
                         * @private
                         *
                         * */
                        var _webRoot = EasyNode.real(EasyNode.config('easynode.servers.koa-HttpServer.webRoot', 'www/'));

                        /**
                         *  设置HTTP服务根目录。
                         * @method setWebRoot
                         * @param {String} webRoot HTTP服务根目录，相对路径
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.setWebRoot = function (webRoot) {
                                _webRoot = EasyNode.real(webRoot);
                        };

                        /**
                         *  获取HTTP服务根目录。
                         * @method getWebRoot
                         * @return {String} 返回HTTP服务根目录
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.getWebRoot = function () {
                                return _webRoot;
                        };

                        /**
                         *  上传文件目录，默认www/uploads
                         * @property _uploadDir
                         * @type String
                         * @private
                         * */
                        var _uploadDir = EasyNode.real(EasyNode.config('easynode.servers.koa-HttpServer.uploadDir', 'www/uploads/'));

                        /**
                         *  设置文件上传目录。
                         * @method setUploadDir
                         * @param {String} uploadDir HTTP服务根目录，相对路径
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.setUploadDir = function (uploadDir) {
                                _uploadDir = EasyNode.real(uploadDir);
                        };
                        /**
                         *  获取HTTP服务上传目录。
                         * @method getUploadDir
                         * @return {String} 返回HTTP服务上传目录
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.getUploadDir = function () {
                                return _uploadDir;
                        };

                        var _writeAccessLog = S(EasyNode.config('easynode.servers.koa-HttpServer.writeAccessLog', 'true')).toBoolean();
                        /**
                         *  设置服务是否记录访问日志
                         * @method writeAccessLog
                         * @param {boolean} flag 是否记录访问日志
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.writeAccessLog = function (flag) {
                                if (arguments.length == 0) {
                                        return _writeAccessLog;
                                }
                                assert(typeof flag == 'boolean', 'Invalid argument');
                                _writeAccessLog = flag;
                        };

                        /**
                         *  Session 存储类型，默认KOAHttpServer.SessionSupport.STORAGE_MEMORY，可以设置它为
                         *  easynode.framework.server.http.ISessionStore的实例以使用指定的store.
                         *
                         * @property sessionStorage
                         * @type String/easynode.framework.server.http.ISessionStore
                         * @default "storeage-memory"
                         * @public
                         * */
                        this.sessionStorage = 'storage-memory';
                        /**
                         *  Session 存储选项，默认null
                         * @property sessionStorageOptions
                         * @type object
                         * @public
                         * */
                        this.sessionStorageOptions = null;

                        /**
                         *  koa app的key
                         * @property _keys
                         * @type array
                         * @private
                         * */
                        this._keys = EasyNode.config('easynode.servers.koa-HttpServer.keys', 'EasyNode').split(',');

                        /**
                         *  开启默认http目录"www/"，默认为true
                         * @property enableDefaultWebRoot
                         * @type boolean
                         * @public
                         * */
                        this.enableDefaultWebRoot = true;

                        /**
                         *  路由入口文件，相对路径，相对于EasyNode根目录( EasyNode.home() )
                         * @property routeMapEntry
                         * @type String
                         * @public
                         * */
                        this.routeMapEntry = null;

                        /**
                         *  是否启用APM(发送APM数据至EasyNode APM服务)
                         *
                         * @property apmEnabled
                         * @type boolean
                         * @public
                         * */
                        this.apmEnabled = StringUtil.switchState(EasyNode.config('easynode.services.apm.enabled', 'false'));

                        /**
                         *  是否阻止所有请求
                         *
                         * @property blockRequest
                         * @type boolean
                         * @public
                         * */
                        this.blockRequest = false;
                }

                /**
                 *  增加静态文件查找目录
                 * @method addWebDirs
                 * @param {String} arr 静态文件列表，相对于EasyNode的目录。
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                addWebDirs(...arr) {
                        this._webDirs = this._webDirs || [];
                        arr.forEach(dir => {
                                assert(typeof dir == 'string', 'Invalid arguments');
                                this._webDirs.push(dir);
                        });
                }

                /**
                 *  是否向EasyNode的APM平台发送APM(Application Performance Monitor)数据。默认不发送APM数据
                 *
                 * @method setAPMEnabled
                 * @param {boolean} flag 发送标志, true/false，默认true
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                setAPMEnabled(flag = true) {
                        this.apmEnabled = flag;
                }

                /**
                 *  获取所有静态文件目录
                 * @method getWebDirs
                 * @return {Array} 静态文件列表，相对于EasyNode的目录。
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getWebDirs() {
                        return _.clone(this._webDirs || []);
                }

                /**
                 *  设置koa的KEY
                 * @method setKeys
                 * @param {...} keys Key列表，每个KEY是string。
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                setKeys(...keys) {
                        assert(keys.length > 0, 'Invalid arguments');
                        this._keys = keys;
                }

                /**
                 *  增加中间件，中间件是一个generator函数，请注意：中间件会按先后顺序添加到koa，具体流程请参考start函数。
                 *  在任何中间件中可以访问koa ctx对象，即中间件generator函数中的this对象，的parameter对象，该成员是
                 *  easynode.framework.server.http.KOAHttpRequestParameter类实例，用于获取HTTP请求参数和上传的文件。
                 *
                 * @method addMiddleware
                 * @param {generator} gen generator函数，符合koa中间件规范
                 * @since 0.1.0
                 * @author zlbbq
                 * @example
                 *
                 *      server.addMiddleware(function * (next) {
                 *               console.log('this message is printed anytime');
                 *               console.log(this.parameter.param('a'));
                 *               console.log(this.parameter.param('b'));
                 *               console.log(this.parameter.dateParam('c'));
                 *               yield next;
                 *       });
                 * */
                addMiddleware(gen) {
                        this._middlewares = this._middlewares || [];
                        this._middlewares.push(gen);
                }

                /**
                 *  增加中间件(在Routes之后)，中间件是一个generator函数，请注意：中间件会按先后顺序添加到koa，具体流程请参考start函数。
                 *  在任何中间件中可以访问koa ctx对象，即中间件generator函数中的this对象，的parameter对象，该成员是
                 *  easynode.framework.server.http.KOAHttpRequestParameter类实例，用于获取HTTP请求参数和上传的文件。
                 *
                 * @method addMiddlewareAfterRoutes
                 * @param {generator} gen generator函数，符合koa中间件规范
                 * @since 0.1.0
                 * @author zlbbq
                 * @example
                 *       server.addMiddlewareAfterRoutes(function * (next) {
                 *               console.log('this message is printed when no route was found');
                 *               this.type = 'json';
                 *               this.body = {
                 *                       hello : 'EasyNode'
                 *               };
                 *               yield next;
                 *       });
                 * */
                addMiddlewareAfterRoutes(gen) {
                        this._middlewaresAfterRoutes = this._middlewaresAfterRoutes || [];
                        this._middlewaresAfterRoutes.push(gen);
                }

                /**
                 *  开启或禁用默认路由，在服务启动前调用此方法有效。默认路由默认是开启的。
                 *
                 * @method setDefaultRoutesEnabled
                 * @param {boolean} flag 启用true, 或禁用false
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                setDefaultRoutesEnabled(flag) {
                        assert(typeof flag == 'boolean', 'Invalid argument');
                        this._defaultRoutesEnabled = flag;
                }

                /**
                 *  加载路由配置表, 路由配置表是一个标准json文件，参考: etc/demo-route-map.json。
                 *  路由的Controller参考：tests/src/easynode/tests/controllers/TestController.js
                 *
                 * @method setDefaultRoutesEnabled
                 * @param {String} configFiles 路由配置文件的相对路径，多参
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                loadRouteMap(...configFiles) {
                        var me = this;
                        const CONTENT_TYPE_JSON = 1;
                        const CONTENT_TYPE_HTML = 2;
                        const EASYNODE_VIEW_DIR = EasyNode.config('easynode.framework.mvc.view.dir', 'views/');
                        //const BEAN_REGEXP = /^\$(\w+)\.?(.*)$/;
                        const BEAN_REGEXP = /^\$(.+)$/;                                       //不支持向下级引用
                        const INSTRUCTION_IMPORT = /^@import\((.*)\)$/;
                        const INSTRUCTION_FACTORY = /^@factory\((.*)\)$/;
                        return function * () {
                                for (var idx = 0; idx < configFiles.length; idx++) {
                                        var file = configFiles[idx];
                                        var realFile = EasyNode.real(file);
                                        logger.info('loading route map from file [' + realFile + ']');
                                        var content = yield fs.readFile(realFile);
                                        content = JSON.parse(content.toString());
                                        for (var i = 0; i < content.length; i++) {
                                                var c = content[i];
                                                yield (function * (c) {
                                                        if (typeof c == 'string') {
                                                                if (INSTRUCTION_IMPORT.test(c)) {
                                                                        var importFile = INSTRUCTION_IMPORT.exec(c)[1];
                                                                        if (importFile.startsWith('./') || importFile.startsWith('../')) {
                                                                                importFile = path.join(file, '../', importFile);
                                                                        }
                                                                        yield me.loadRouteMap(importFile);
                                                                }
                                                                else if (INSTRUCTION_FACTORY.test(c)) {
                                                                        var routeFactoryNamespace = INSTRUCTION_FACTORY.exec(c)[1];
                                                                        yield me.loadRoutesFromFactory(routeFactoryNamespace);
                                                                }
                                                        }
                                                        else {
                                                                assert(c['uri'] && c['controller'] && c['handler'], 'Invalid route config, "uri", "controller" and "handler" must be set ');
                                                                var routeId = c['id'] || 'NO_NAME';
                                                                var filters = c['filters'] || [];
                                                                assert(_.isArray(filters), 'Invalid attribute "filters"');
                                                                var httpMethod = c['http-method'] || 'get';
                                                                var contentType = (c['content-type'] || 'application/json').toLocaleLowerCase();
                                                                switch (contentType) {
                                                                        case 'application/json' :
                                                                        case 'json':
                                                                        {
                                                                                contentType = CONTENT_TYPE_JSON;
                                                                                break;
                                                                        }
                                                                        case 'text/html' :
                                                                        case 'html':
                                                                        {
                                                                                contentType = CONTENT_TYPE_HTML;
                                                                                break;
                                                                        }
                                                                        default :
                                                                        {
                                                                                contentType = 0;
                                                                        }
                                                                }
                                                                if (contentType == CONTENT_TYPE_HTML && !c['view']) {
                                                                        //assert(c['view'], 'Invalid route config, "view" must be set when "content-type" = "text/html"')
                                                                        logger.warn('route [' + c['uri'] + '], ' + '"content-type" is converted to "application-json" automatically, route view should be set!');
                                                                        contentType = CONTENT_TYPE_JSON;
                                                                }
                                                                var controllerBeanId = BEAN_REGEXP.exec(c['controller']);
                                                                httpMethod.split('/').forEach(m => {
                                                                        if (m) {
                                                                                me.addRoute(m, c['uri'], function * () {
                                                                                        var ctx = this;
                                                                                        this.routeId = routeId;
                                                                                        var controllerObj = null;
                                                                                        var handler = null;
                                                                                        if(c['controller'] === '$none' && c['handler'] === '$none') {
                                                                                                controllerObj = {
                                                                                                        handler : function() {
                                                                                                                return function * () {
                                                                                                                        return {};
                                                                                                                };
                                                                                                        }
                                                                                                };
                                                                                                handler = controllerObj.handler;
                                                                                        }
                                                                                        if(!controllerObj) {
                                                                                                if (BEAN_REGEXP.test(c['controller'])) {
                                                                                                        controllerObj = BeanFactory.get(controllerBeanId[1]);
                                                                                                }
                                                                                                else {
                                                                                                        controllerObj = using(c['controller']);
                                                                                                }
                                                                                        }
                                                                                        if(!handler) {
                                                                                                handler = controllerObj[c['handler']];
                                                                                        }
                                                                                        try {
                                                                                                var index = 0;
                                                                                                var next = function * () {
                                                                                                        if (index < filters.length) {
                                                                                                                var tempIndex = index++;
                                                                                                                var sFilter = filters[tempIndex];
                                                                                                                var thisFilter = null;
                                                                                                                if (BEAN_REGEXP.test(sFilter)) {
                                                                                                                        thisFilter = BeanFactory.get(BEAN_REGEXP.exec(sFilter)[1]);
                                                                                                                }
                                                                                                                else {
                                                                                                                        var ThisFilterClass = using(sFilter);
                                                                                                                        thisFilter = new ThisFilterClass();
                                                                                                                }
                                                                                                                assert(typeof thisFilter.filter == 'function', 'Invalid route filter [' + sFilter + ']');
                                                                                                                return yield thisFilter.filter(ctx, next);
                                                                                                        }
                                                                                                        else {
                                                                                                                return yield handler.call(controllerObj).call(ctx);
                                                                                                        }
                                                                                                };

                                                                                                var ret = yield next();

                                                                                                if (!ret) return;                                //controllers can set type and body by itself
                                                                                                switch (contentType) {
                                                                                                        case CONTENT_TYPE_JSON :
                                                                                                        {
                                                                                                                this.type = 'json';
                                                                                                                this.body = ret;
                                                                                                                break;
                                                                                                        }
                                                                                                        case CONTENT_TYPE_HTML :
                                                                                                        {
                                                                                                                if (typeof ret.toJSON != 'function') {
                                                                                                                        ret.toJSON = function () {
                                                                                                                                return this;
                                                                                                                        };
                                                                                                                }
                                                                                                                this.type = 'html';
                                                                                                                var renderBegin = new Date().getTime();
                                                                                                                this.body = new TemplateView(c['view'], null, c['view-dir'] || EASYNODE_VIEW_DIR).render(ret);
                                                                                                                this.renderCost = new Date().getTime() - renderBegin;
                                                                                                                break;
                                                                                                        }
                                                                                                        default :
                                                                                                        {
                                                                                                                //content-type and body is set by controller itself
                                                                                                                break;
                                                                                                        }
                                                                                                }
                                                                                        } catch (err) {
                                                                                                this.status = 500;
                                                                                                logger.error(err);
                                                                                                if (EasyNode.DEBUG) {
                                                                                                        this.type = 'html';
                                                                                                        this.body = '<pre>\n' + err.stack + '\n</pre>';
                                                                                                }
                                                                                        }
                                                                                });
                                                                        }
                                                                });
                                                        }
                                                })(c);
                                        }
                                }
                        };
                }

                /**
                 *  加载路由工厂中定义的路由
                 *
                 * @method loadRouteFactory
                 * @param {String/Object} factoryNamespace 路由工厂全类名或实例, 须继承于easynode.framework.server.http.AbstractRouteFactory
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * @deprecated
                 * */
                /*
                 loadRoutesFromFactory(factoryNamespace) {
                 var me = this;
                 return function * () {
                 const CONTENT_TYPE_JSON = 1;
                 const CONTENT_TYPE_HTML = 2;
                 const EASYNODE_VIEW_DIR = EasyNode.config('easynode.framework.mvc.view.dir', 'views/');
                 var factory = null;
                 if(typeof factoryNamespace == 'string') {
                 var Factory = using(factoryNamespace);
                 if (typeof Factory == 'function') {
                 factory = new Factory();
                 }
                 else if (typeof Factory == 'object') {
                 factory = Factory;
                 }
                 }
                 else if(typeof factoryNamespace == 'object') {
                 factory = factoryNamespace;
                 }
                 var routes = factory.getRoutes();
                 for (var i = 0; i < routes.length; i++) {
                 var r = routes[i];
                 assert(r.uri && r.handler, 'Invalid route, uri and handler must be set');
                 yield (function * (r) {
                 var contentType = (r.contentType || 'application/json').toLocaleLowerCase();
                 switch (contentType) {
                 case 'application/json' :
                 case 'json':
                 {
                 contentType = CONTENT_TYPE_JSON;
                 break;
                 }
                 case 'text/html' :
                 case 'html':
                 {
                 contentType = CONTENT_TYPE_HTML;
                 break;
                 }
                 default :
                 {
                 contentType = 0;
                 }
                 }
                 if (contentType == CONTENT_TYPE_HTML && !r.view) {
                 //assert(c['view'], 'Invalid route config, "view" must be set when "content-type" = "text/html"')
                 logger.warn('route [' + r.uri + '], ' + '"content-type" is converted to "application-json" automatically, route view should be set!');
                 contentType = CONTENT_TYPE_JSON;
                 }
                 var httpMethod = (r.methods || 'get').split('/');
                 for (var j = 0; j < httpMethod.length; j++) {
                 var m = httpMethod[j];
                 me.addRoute(m, r.uri, function * () {
                 try {
                 var ret = yield r.handler.call(factory).call(this);
                 if (!ret) return;                                //controllers can set type and body by itself
                 switch (contentType) {
                 case CONTENT_TYPE_JSON :
                 {
                 this.type = 'json';
                 this.body = ret;
                 break;
                 }
                 case CONTENT_TYPE_HTML :
                 {
                 this.type = 'html';
                 this.body = new TemplateView(r.view, null, r.viewDir || EASYNODE_VIEW_DIR).render(ret);
                 break;
                 }
                 default :
                 {
                 //content-type and body is set by controller itself
                 break;
                 }
                 }
                 } catch (err) {
                 this.status = 500;
                 logger.error(err);
                 if (EasyNode.DEBUG) {
                 this.type = 'html';
                 this.body = '<pre>\n' + err.stack + '\n</pre>';
                 }
                 }
                 });
                 }
                 })(r);
                 }
                 };
                 }
                 */

                /**
                 *  增加一个路由。
                 * 在任何路由中可以访问koa ctx对象，即中间件generator函数中的this对象，的parameter对象，该成员是
                 *  easynode.framework.server.http.KOAHttpRequestParameter类实例，用于获取HTTP请求参数和上传的文件。
                 *
                 * @method addRoute
                 * @param {String} method http method，支持"all", "get", "post", "put", "delete"
                 * @param {String} uri, 以"/"开头
                 * @param {generator} gen, 路由generator函数
                 * @since 0.1.0
                 * @author zlbbq
                 * @example
                 *      server.addRoute('get', '/abc.jsp', function * () {
                 *               this.body = 'This is abc.jsp';
                 *      });
                 *
                 * */
                addRoute(method, uri, gen) {
                        assert(typeof method == 'string' && typeof uri == 'string', 'Invalid http method');
                        method = method.toLowerCase();
                        assert(_.contains(HTTP_METHODS, method), `Invalid http method [${method}] of route, supported methods are: [${HTTP_METHODS.join(',')}]`);
                        if (ROUTE_URI_PREFIX) {
                                uri = ROUTE_URI_PREFIX + uri;
                        }
                        this._routes = this._routes || [];
                        this._routes.push({
                                method: method,
                                uri: uri,
                                gen: gen
                        });
                }

                /**
                 *  设置Session的存储类型，默认Session支持为内存存储，这容易引起内存泄漏，请不要用于生产环境。
                 *
                 * @method setSessionStorage
                 * @param {String} storage 存储类型, KOAHttpServer.SessionSupport.STORAGE_*
                 * @param {object} opt 参数，使用KOAHttpServer.SessionSupport.STORAGE_MEMORY时，忽略此参数。
                 * @since 0.1.0
                 * @author zlbbq
                 * @example
                 *      var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                 *      var server = new KOAHttpServer();
                 *
                 *      //use memory session
                 *      server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_MEMORY);
                 *
                 *      //use redis session storage
                 *      server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_REDIS, {
                 *              host : '127.0.0.1',
                 *              port : 6379,
                 *              db : 'EasyNode_Session',
                 *              pass : 'password_of_db'
                 *      });
                 *
                 *      //use memcached session storage
                 *      server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_MEMCACHED, {
                 *              host : '127.0.0.1',
                 *              port : 11211
                 *      });
                 * */
                setSessionStorage(storage, opt) {
                        assert(typeof storage == 'string', 'Invalid argument');
                        assert(_.contains([
                                KOAHttpServer.SessionSupport.STORAGE_MEMORY,
                                KOAHttpServer.SessionSupport.STORAGE_REDIS,
                                KOAHttpServer.SessionSupport.STORAGE_MEMCACHED
                        ], storage), `Invalid session storage [${storage}]`);
                        this.sessionStorage = storage;
                        this.sessionStorageOptions = opt;
                }

                /**
                 *  设置HTTP Server是否启用CSRF防御。默认禁用。启用时需要koa-csrf模块支持。
                 *
                 * @method enableCSRF
                 * @param {boolean} flag true-启用；false-禁用。
                 * @since 0.1.0
                 * @author zlbbq
                 **/
                enableCSRF(flag) {
                        assert(typeof flag == 'boolean', 'Invalid argument');
                        this._enableCSRF = flag;
                }

                /**
                 *  设置HTTP Server是否启用404中间件。默认启用。可以通过addMiddlewareAfterRoutes函数自行增加一个404处理中间件，在这个
                 *  中间件中不调用yield next中止downstream中间件可以达到同样的效果。KOAHttpServer的404中间件总是位于中间件最底端。
                 *
                 * @method enableCSRF
                 * @param {boolean} flag true-启用；false-禁用。
                 * @since 0.1.0
                 * @author zlbbq
                 **/
                enable404Middleware(flag) {
                        assert(typeof flag == 'boolean', 'Invalid argument');
                        this._enable404Middleware = flag;
                }

                /**
                 *  设置KOAActionContext的事件处理器。可在此注入数据库支持、缓存支持、队列支持等等。<br/>
                 *  这是一个非常重要的函数，用于设置EasyNode中所有Action的调用上下文，包括数据库连接使用，cache使用，MQ使用
                 *  等，这些对象的使用，EasyNode已经抽象出相应的接口。<br/>
                 *  EasyNode的新版本可能会再抽象其他一些通用的功能接口
                 *
                 * @method setActionContextListener
                 * @param @param {easynode.framework.mvc.IActionContextListener} l ActionContext事件监听器
                 * @since 0.1.0
                 * @author zlbbq
                 **/
                setActionContextListener(l) {
                        this._actionContextListener = l;
                }

                /**
                 *  返回session的storage对象，符合koa-generic-session接口定义。get、set、destroy。
                 *
                 * @method _getSessionStore
                 * @return {object} storage 存储对象。实现get、set、destroy接口。
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _getSessionStore() {
                        if (typeof this.sessionStorage == 'object') {
                                return this.sessionStorage;
                        }
                        this.sessionStorage = this.sessionStorage || KOAHttpServer.SessionSupport.STORAGE_MEMORY;
                        switch (this.sessionStorage) {
                                case KOAHttpServer.SessionSupport.STORAGE_MEMORY :
                                {
                                        return this._createMemoryStorage();
                                }
                                case KOAHttpServer.SessionSupport.STORAGE_REDIS :
                                {
                                        return this._createRedisStorage();
                                }
                                case KOAHttpServer.SessionSupport.STORAGE_MEMCACHED :
                                {
                                        return this._createMemcachedStorage();
                                }
                                default :
                                {
                                        throw new Error(`Unsupported session storage [${this.sessionStorage}]`);
                                }
                        }
                }

                /**
                 *  session内存存储
                 *
                 * @method _createMemoryStorage
                 * @return {object} session内存存储对象。实现get、set、destroy接口。
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _createMemoryStorage() {
                        var MSS = using('easynode.framework.server.http.KOAMemorySessionStorage');
                        return new MSS();
                }

                /**
                 *  session redis存储
                 *
                 * @method _createRedisStorage
                 * @return {object} session redis存储对象。koa-redis模块支持。
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _createRedisStorage() {
                        var redisStore = require('koa-redis');
                        return redisStore(this.sessionStorageOptions);
                }

                /**
                 *  session memcached存储
                 *
                 * @method _createMemcachedStorage
                 * @return {object} session memcached存储对象。koa-memcached模块支持。
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _createMemcachedStorage() {
                        var memcachedStore = require('koa-memcached');
                        return memcachedStore(this.sessionStorageOptions);
                }

                /**
                 *  写AccessLog的中间件。
                 *  如果需要记录会话用户，则需要在后续中间件或者route或action中设置session.user.id至koa context
                 *
                 * @method _createAccessMiddleware
                 * @return {generator} 符合koa中间件规范的AccessLog的generator对象。
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _createAccessMiddleware() {
                        var me = this;
                        return function * (next) {
                                var d = new Date();
                                yield next;
                                if (this.status == 404) {
                                        return;
                                }
                                var t = new Date() - d;
                                var o = {
                                        type: 'HTTP',
                                        'app-id': me.appId,
                                        'app-key': me.appKey,
                                        pid: process.pid,
                                        uptime: parseInt(process.uptime()),
                                        server: me.name,
                                        listening: EasyNode.getLocalIP() + ':' + me.port,
                                        time: d.toFormat('YYYY-MM-DD HH:MI:SS'),
                                        method: this.method,
                                        path: this.request.path,
                                        'route-id': this.routeId || 'undefined',
                                        status: this.status,
                                        cost: t,
                                        'render-cost': this.renderCost || 0,                   // to write the performance of view engine such as ejs or mustache
                                        // set renderCost attribute to koa context.
                                        action: this.action,                                               // see KOADefaultRoutes._execAction();
                                        remote: this.remoteAddress,                            //remote address
                                        user: this.session && this.session.user && this.session.user.id || '[UNKNOWN]'         //user id in the session
                                };
                                me.trigger(KOAHttpServer.Events.EVENT_ACCESS, o);
                        };
                }

                /**
                 *  默认Routes。
                 *
                 * @method _createDefaultRoutes
                 * @param {koa} app koa实例
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _createDefaultRoutes(app) {
                        var DefaultRoutes = using('easynode.framework.server.http.KOADefaultRoutes');
                        new DefaultRoutes(app, route, this._actionContextListener).addRoutes();
                }

                /**
                 *  增加用户定义的Routes(通过addRoute函数)。
                 *
                 * @method _createDefaultRoutes
                 * @param {koa} app koa实例
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _createExtraRoutes(app) {
                        this._routes = this._routes || [];
                        this._routes.forEach(o => {
                                if (typeof route[o.method] == 'function') {
                                        logger.info(`loading route [${o.uri}], method [${o.method}]`);
                                        app.use(route[o.method].call(null, o.uri, function * () {
                                                //var url = this.url.replace(/\?.*$/, '');
                                                var url = this.request.path;
                                                var keys = [];
                                                var exp = pathToRegexp(o.uri, keys);
                                                this.params = {};
                                                if (keys.length > 0) {
                                                        var arr = exp.exec(url);
                                                        for (var i = 0; i < keys.length; i++) {
                                                                this.params[keys[i].name] = arr[i + 1];
                                                        }
                                                }
                                                EasyNode.DEBUG && logger.debug('route params -> ' + JSON.stringify(this.params));
                                                yield o.gen.call(this);
                                        }));
                                }
                                else {
                                        throw new Error(`Unsupported http method [${o.method}]`);
                                }
                        });
                }

                /**
                 *  增加用户定义的Middleware(通过addMiddleware函数)。
                 *
                 * @method _createExtraMiddlewares
                 * @param {koa} app koa实例
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _createExtraMiddlewares(app) {
                        this._middlewares = this._middlewares || [];
                        this._middlewares.forEach(middleware => {
                                app.use(middleware);
                        });
                }

                /**
                 *  加载默认中间件。
                 *
                 * @method _createDefaultMiddlewares
                 * @param {koa} app koa实例
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _createDefaultMiddlewares(app) {
                        // anytime goes here, this.query will be the parse result of query string, this.parts will be the parsed body of request if
                        // it is a POST method now
                        app.use(function * (next) {
                                var me = this;
                                // add parameter attribute to ctx, so the downstream middlewares could access this attribute to fetch parameters from
                                // query string or body
                                EasyNode.DEBUG && logger.debug('url -> ' + this.request.path);
                                EasyNode.DEBUG && logger.debug('content type -> ' + JSON.stringify(this.request.type));
                                EasyNode.DEBUG && logger.debug('query string -> ' + JSON.stringify(this.query || {}));
                                EasyNode.DEBUG && logger.debug('multiparts -> ' + JSON.stringify(this.parts || {}));
                                EasyNode.DEBUG && logger.debug('body -> ' + JSON.stringify(this.request.body || {}));
                                this.parameter = new KOAHttpRequestParameter(this.query, this.request.body, this.request.body);
                                this.validator = new Validator(this, this.parameter);
                                this.p = function(name) {
                                        return me.params[name] || me.parameter.param(name);
                                };
                                yield next;
                        });
                }


                _createBodyParserMiddleware(app) {
                        app.use(koaBody({
                                jsonLimit: EasyNode.config('easynode.servers.koa-HttpServer.maxJSONBodySize', '100KB'),
                                formLimit: EasyNode.config('easynode.servers.koa-HttpServer.maxFormBodySize', '56KB'),
                                multipart: true,
                                formidable: {
                                        //uploadDir: EasyNode.real('www/uploads')
                                        uploadDir: '/tmp'
                                }
                        }));
                }

                /**
                 *  增加在Route之后的middleware, 通过addMiddlewareAfterRoutes
                 *
                 * @method _createMiddlewaresAfterRoutes
                 * @param {koa} app koa实例
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _createMiddlewaresAfterRoutes(app) {
                        this._middlewaresAfterRoutes = this._middlewaresAfterRoutes || [];
                        this._middlewaresAfterRoutes.forEach(middleware => {
                                app.use(middleware);
                        });
                }

                /**
                 *  增加用户定义的静态文件目录(通过addWebDirs函数)。
                 *
                 * @method _addExtraWebDirs
                 * @param {koa} app koa实例
                 * @private
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                _addExtraWebDirs(app) {
                        this._webDirs = this._webDirs || [];
                        this._webDirs.forEach(dir => {
                                app.use(staticFileServe(EasyNode.real(dir)));
                        });
                }

                postAPMData2EasyNodePlatform(apmString) {
                        var me = this;
                        return function * () {
                                yield APMTool.post(apmString);
                        };
                }

                /**
                 * 启动KOAHttpServer并加载中间件，中间件会按先后顺序添加到koa，具体流程如下：<br>
                 *          favicon->access log->static files(包括所有静态文件目录)->session->csrf->$middlewares->default routes->$extra routes->$middleware-after-routes
                 *
                 * @method start
                 * @overwrite
                 * @public
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                start() {
                        var me = this;
                        return function * () {
                                /**
                                 * koa Application实例
                                 * @property _app
                                 * @type {koa.Application}
                                 * @private
                                 * @since 0.1.0
                                 * @author zlbbq
                                 * */
                                var app = me._app = koa();
                                //trigger before-start event
                                me.trigger(AbstractServer.EVENT_BEFORE_START);

                                // set key of app
                                app.keys = me._keys;
                                app.name = me.name;

                                //pause service
                                app.use(function * (next) {
                                        if(me.blockRequet === true) {
                                                this.status = 403;
                                                this.body = 'server is going to down';
                                        }
                                        else {
                                                yield next;
                                        }
                                });

                                // add favicon support
                                app.use(favicon(path.join(me.getWebRoot(), 'favicon.ico')));
                                // serve static files
                                //HTTP ROOT
                                if (me.enableDefaultWebRoot === true) {
                                        app.use(staticFileServe(me.getWebRoot()));
                                }
                                //Additional web dirs
                                me._addExtraWebDirs(app);

                                //=========================dynamic request below=========================//

                                if (EasyNode.config('easynode.servers.koa-HttpServer.restrictUA')) {
                                        var uaRegExp = new RegExp(EasyNode.config('easynode.servers.koa-HttpServer.restrictUA'), 'i');
                                        app.use(function * (next) {
                                                var ua = this.header['user-agent'];
                                                logger.error(ua);
                                                if (uaRegExp.test(ua)) {
                                                        yield next;
                                                }
                                                else {
                                                        this.status = 403;
                                                        this.body = 'Invalid header "user-agent"';
                                                }
                                        });
                                }

                                //set remote address and set resource firewall by ip white list
                                var whiteIP = EasyNode.config('easynode.servers.koa-HttpServer.whiteIP');
                                var whiteIPRegExp = null;
                                if (whiteIP) {
                                        whiteIPRegExp = new RegExp(whiteIP);
                                }
                                app.use(function * (next) {
                                        var req = this.req;
                                        var address = req.headers[PROXY_IP_HEADER] ||
                                                (req.connection && req.connection.remoteAddress) ||
                                                (req.socket && req.socket.remoteAddress) ||
                                                (req.connection.socket && req.connection.socket.remoteAddress) || '0.0.0.0';
                                        address = address.replace(/:.*:/, '');                  //convert to pure IPv4
                                        this.remoteAddress = address;
                                        if (whiteIPRegExp) {
                                                if (whiteIPRegExp.test(address)) {
                                                        yield next;
                                                }
                                                else {
                                                        this.status = 403;
                                                        this.body = 'Forbidden(IP firewall, can not access resource from [' + address + '])';
                                                        EasyNode.DEBUG && logger.error('can not access resource from [' + address + ']');
                                                }
                                        }
                                        else {
                                                yield next;
                                        }
                                });

                                // access log
                                app.use(me._createAccessMiddleware());
                                if (me.writeAccessLog()) {
                                        if(me.apmEnabled) {
                                                logger.info(`apm enabled for server [${me.name}]`);
                                        }

                                        me.on(KOAHttpServer.Events.EVENT_ACCESS, function (o) {
                                                co(function * () {
                                                        var s = JSON.stringify(o);
                                                        accessLogger.info(s);
                                                        if (me.apmEnabled) {
                                                                yield me.postAPMData2EasyNodePlatform(s);
                                                        }
                                                }).catch(function (err) {
                                                });
                                        });
                                }

                                //add pjax support
                                if(StringUtil.switchState(EasyNode.config('easynode.servers.koa-HttpServer.enablePjax', 'false'))) {
                                        app.use(pjax());
                                }

                                // session support
                                app.use(session({
                                        store: me._getSessionStore(),
                                        ttl: parseInt(EasyNode.config('easynode.servers.koa-HttpServer.session.timeout', '1800')),
                                        prefix: EasyNode.config('easynode.servers.koa-HttpServer.session.prefix', 'koa:sess:')
                                }));

                                //csrf support
                                if (me._enableCSRF === true) {
                                        var csrf = require('koa-csrf');
                                        csrf(app);
                                        app.use(csrf.middleware);
                                }

                                // parse url query string and body before any middleware defined by user is running
                                qs(app, 'first');                       // /foo?a=b&a=c         this.query.a = 'b' , not a = ['b', 'c']

                                //parse http body, support application/x-www-form-urlencoded, multipart/form-data and application/json
                                me._createBodyParserMiddleware(app);

                                // default middlewares
                                me._createDefaultMiddlewares(app);

                                // user defined middlewares
                                me._createExtraMiddlewares(app);

                                // inner routes
                                if (me._defaultRoutesEnabled !== false) {
                                        me._createDefaultRoutes(app);
                                }
                                // load route map entry
                                if (me.routeMapEntry) {
                                        yield me.loadRouteMap(me.routeMapEntry);
                                }

                                // user defined routes
                                me._createExtraRoutes(app);

                                // middleware after routes
                                me._createMiddlewaresAfterRoutes(app);

                                // handle error 404
                                if (me._enable404Middleware !== false) {
                                        app.use(function * () {
                                                if (this.status == 404) {
                                                        var uri = this.request.path;
                                                        var content404 = me._404Content;
                                                        if (!content404) {
                                                                EasyNode.DEBUG && logger.debug('load 404 content from 404.html');
                                                                var config404 = EasyNode.config('easynode.servers.koa-HttpServer.404', '404.html');
                                                                var page404 = path.join(me.getWebRoot(), config404);
                                                                var content404 = '<h1>404 Resource Not Found : ${URI}</h1>';
                                                                if (yield fs.exists(page404)) {
                                                                        content404 = yield fs.readFile(page404);
                                                                }
                                                                me._404Content = content404;
                                                        }
                                                        content404 = content404.toString().replace(/\$\{URI\}/gm, uri);
                                                        this.type = 'html';
                                                        this.body = content404;
                                                        this.status = 404;
                                                }
                                        });
                                }

                                //auto-generate nginx configuration
                                if (EasyNode.config('easynode.servers.koa-HttpServer.generateNginxConfig', '1') == '1') {
                                        var nginxConfTemplate = EasyNode.real('etc/nginx-conf.mst');
                                        var nginxVPTemplate = EasyNode.real('etc/nginx-vp-conf.mst');
                                        var sCfg = '';
                                        var sVP = '';
                                        var extraDirs = me.getWebDirs();
                                        var vpRegexp = /.*\/(.+)\/www\/?$/;
                                        //virtual path
                                        for (var i = 0; i < extraDirs.length; i++) {
                                                var p = extraDirs[i];
                                                var vp = '';
                                                if (p.match(vpRegexp)) {
                                                        vp = vpRegexp.exec(p)[1];
                                                        sVP += yield MustacheHelper.renderFile(nginxVPTemplate, {
                                                                virtualPathName: vp,
                                                                virtualPathRoot: EasyNode.real(p)
                                                        });
                                                        sVP += '\n\n\n';
                                                }
                                        }
                                        //nginx conf
                                        sCfg = yield MustacheHelper.renderFile(nginxConfTemplate, {
                                                rootDir: me.getWebRoot(),
                                                serviceIP: EasyNode.getLocalIP(),
                                                servicePort: me.port,
                                                virtualPath: sVP
                                        });

                                        const NGINX_CONFIG_DIR = EasyNode.config('easynode.servers.koa-HttpServer.generateNginxConfig.dir', 'etc/nginx.conf')
                                        var nginxConfigFile = EasyNode.real(NGINX_CONFIG_DIR);
                                        yield fs.writeFile(nginxConfigFile, sCfg);
                                        logger.info(`nginx config file is auto-generated at [${nginxConfigFile}]`);
                                }

                                var fnListen = thunkify(app.listen);
                                yield fnListen.call(app, me.port);
                                logger.info(`[${me.name}] is listening on port [${me.port}]...`);
                                me.trigger(AbstractServer.EVENT_STARTED);
                        };
                }

                /**
                 * 获取客户端连接列表。KOAHttpServer只返回一个空的数组。
                 *
                 * @method connections
                 * @abstract
                 * @return {Array} 客户端连接列表，每个客户端连接应至少包含一个token字标用于唯一标识一个客户端连接
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                connections() {
                        return [];
                }

                /**
                 * 向客户端发送消息。HTTP服务不支持主动向客户端发送消息，仅抛出错误。
                 *
                 * @method send
                 * @param {Array/String} clientTokens 客户端Token列表，客户端Token可以唯一识别一个客户端。传递Array时，
                 *                                      向多个客户端发送消息
                 * @param {Buffer} msg 消息体
                 * @return {Array} 客户端列表
                 * @abstract
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                send(clientTokens, msg) {
                        throw new Error('This is http server, do you think it is able to work?');
                }

                stop () {
                        logger.info(`server [${this.name}] is going to down`);
                        this.blockRequet = true;
                }

                pause () {
                        logger.info(`server [${this.name}] is pausing`);
                        this.blockRequet = true;
                }

                resume() {
                        logger.info(`server [${this.name}] is resuming`);
                        this.blockRequet = false;
                }

                /**
                 * 向所有客户端广播消息。HTTP服务不支持主动向客户端发送消息，仅抛出错误。
                 *
                 * @method broadcast
                 * @param {Buffer} msg 消息体
                 * @return {Array} 客户端列表
                 * @abstract
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                broadcast(msg) {
                        throw new Error('This is http server, do you think it is able to work?');
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        /**
         *      session存储类型常量。
         *      <pre>
         *      KOAHttpServer.SessionSupport.STORAGE_MEMORY = 'storage-memory';
         *      KOAHttpServer.SessionSupport.STORAGE_REDIS = 'storage-redis';
         *      KOAHttpServer.SessionSupport.STORAGE_MEMCACHED = 'storage-memcached';
         *      </pre>
         *      <h5>Example</h5>
         *      <pre>
         *var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
         *var server = new KOAHttpServer();
         *
         * server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_REDIS, {
         *         host : '127.0.0.1',
         *         port : 6379
         * });
         *
         * server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_MEMCACHED, {
         *         host : '127.0.0.1',
         *         port : 11211
         * });
         *
         * server.setSessionStorage(KOAHttpServer.SessionSupport.STORAGE_MEMORY);
         *      </pre>
         *
         * @class easynode.framework.server.http.KOAHttpServer.SessionSupport
         * @since 0.1.0
         * @author zlbbq
         * */
        KOAHttpServer.SessionSupport = {};

        KOAHttpServer.SessionSupport.STORAGE_MEMORY = 'storage-memory';

        KOAHttpServer.SessionSupport.STORAGE_REDIS = 'storage-redis';

        KOAHttpServer.SessionSupport.STORAGE_MEMCACHED = 'storage-memcached';

        KOAHttpServer.Events = {};

        /**
         * 用户访问动态内容时触发。
         *
         * @event access
         * @since 0.1.0
         * @author zlbbq
         * */
        KOAHttpServer.Events.EVENT_ACCESS = 'access';

        module.exports = KOAHttpServer;
})();