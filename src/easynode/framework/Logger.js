var log4js = require('log4js');
var assert = require('assert');
var fs = require('fs');
var S = require('string');
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * EasyNode日志类。这是一个单例类，请使用它的静态函数，不要实例化它。<br>
         * Logger是结合配置文件定义的appender和log level使用的，参考：etc/EasyNode.conf。<br>
         * <h5>示例</h5>
         * <pre>
         *  var logger = using('easynode.framework.Logger').forFile(__filename);
         *  EasyNode.DEBUG && logger.debug('Hello, EasyNode');
         *  logger.info('Hello, EasyNode');
         *  logger.warn('Hello, EasyNode');
         *  logger.error('Hello, EasyNode');
         *  logger.fatal('Hello, EasyNode');
         *  </pre>
         *
         * @class easynode.framework.Logger
         * @extends easynode.GenericObject
         * @author zlbbq
         * @since 0.1.0
         * */

        /**
         *  静态实例
         *  @property   instance
         *  @private
         *  @static
         *  @author zlbbq
         *  @since 0.1.0
         * */
        var _instance = null;
        var _eventDelegate = new GenericObject();

        class Logger extends GenericObject {
                /**
                 * 构造函数，私有的，使用静态函数getLogger()获取Logger实例。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * @private
                 * */
                constructor() {
                        super();
                        //调用super()后再定义子类成员。
                        assert(_instance == null, 'easynode.Logger is a singleton class,  use getLogger() instead of instantiation');
                }

                getClassName () {
                        return EasyNode.namespace(__filename);
                }

                /**
                 * 获取一个Logger实例。Logger实例具有debug、info、warn、error、fatal五个函数，对应DEBUG、INFO、WARN、ERROR、FATAL五个日志级别。<br>
                 *  <h5>Logger配置</h5>
                 *  <pre>
                 *  // appenders
                 *  easynode.logger.appenders=root,access
                 *  // root appender
                 *  easynode.logger.appender.root.level=DEBUG
                 *  easynode.logger.appender.root.file = app.log
                 *  easynode.logger.appender.root.pattern=_yyyy-MM-dd
                 *  easynode.logger.appender.root.maxSize=1024
                 *  easynode.logger.appender.root.backup=10
                 *  // access appender
                 *  easynode.logger.appender.root.level=DEBUG
                 *  easynode.logger.appender.root.file = access.log
                 *  easynode.logger.appender.root.pattern=_yyyy-MM-dd
                 *  easynode.logger.appender.root.maxSize=1024
                 *  easynode.logger.appender.root.backup=10
                 *  </pre>
                 *
                 * @method getLogger
                 * @static
                 * @since 0.1.0
                 * @author zlbbq
                 * @param {String} name Logger名称，默认'root'。
                 * @return {Logger} Logger实例。
                 * @example
                 *      var logger = using('easynode.framework.Logger').getLogger();
                 *      EasyNode.DEBUG && logger.debug('Hello, EasyNode');
                 *      logger.info('Hello, EasyNode');
                 *      logger.warn('Hello, EasyNode');
                 *      logger.error('Hello, EasyNode');
                 *      logger.fatal('Hello, EasyNode');
                 * @example
                 *      // 写access日志
                 *      var logger = using('easynode.framework.Logger').getLogger('access');
                 *      EasyNode.DEBUG && logger.debug('Hello, EasyNode');
                 *      logger.info('Hello, EasyNode');
                 *      logger.warn('Hello, EasyNode');
                 *      logger.error('Hello, EasyNode');
                 *      logger.fatal('Hello, EasyNode');
                 * */
                static getLogger(name='root') {
                        var logger = log4js.getLogger(name);
                        var l = EasyNode.config('easynode.logger.appender.' + name + '.' + 'level') || EasyNode.config('easynode.logger.level');
                        l && logger.setLevel(l);
                        if(!logger.__encapsulation) {
                                logger.__encapsulation = true;

                                ['trace', 'debug','info','warn','error','fatal'].forEach(function(name){
                                        var oldFun = logger[name];
                                        logger[name] = function(msg) {
                                                _eventDelegate.trigger('log', name, msg);
                                                oldFun.call(logger, msg);
                                        };
                                });
                        }
                        return logger;
                }

                /**
                 * 增加一个log事件监听器。
                 *
                 * @method addLogListener
                 * @param {Function} listener 监听器函数，函数原型：function listener(level, msg) {}，level : 日志级别，msg : 日志对象
                 * @since 0.1.0
                 * @author zlbbq
                 * @static
                 * @public
                 * */
                static addLogListener(listener) {
                        assert(typeof listener == 'function', 'Invalid argument');
                        _eventDelegate.on('log', listener);
                }

                /**
                 * 删除一个log事件监听器，请注意，日志监听器在不使用时请删除。
                 *
                 * @method removeLogListener
                 * @param {Function} listener 通过addLogListener注册的监听器函数
                 * @since 0.1.0
                 * @author zlbbq
                 * @static
                 * @public
                 * */
                static removeLogListener(listener) {
                        assert(typeof listener == 'function', 'Invalid argument');
                        _eventDelegate.off('log', listener);
                }

                /**
                 * 获取指定文件名的Logger，它是Logger.getLogger()函数的语法糖，参考getLogger。
                 *
                 * @method forFile
                 * @since 0.1.0
                 * @author zlbbq
                 * @static
                 * @param {String} name 请始终传递__filename
                 * @return {Logger} Logger实例。
                 * @example
                 *      var logger = using('easynode.framework.Logger').forFile(__filename);
                 *      EasyNode.DEBUG && logger.debug('Hello, EasyNode');
                 *      logger.info('Hello, EasyNode');
                 *      logger.warn('Hello, EasyNode');
                 *      logger.error('Hello, EasyNode');
                 *      logger.fatal('Hello, EasyNode');
                 * */
                static forFile(file) {
                        assert(typeof file == 'string', 'Not a String');
                        if(file.match(/.*\/src\/.*/)) {
                                var ns = EasyNode.namespace(file);
                                return Logger.getLogger(ns);
                        }
                        else {
                                return Logger.getLogger(file.replace(/.*\//gm, ''));
                        }
                }

                static init() {
                        //initialize appenders
                        var appenders = [
                                {
                                        type: 'console'
                                }
                        ];
                        var logDirectory = EasyNode.config('easynode.logger.folder');
                        if (!fs.existsSync(EasyNode.real(logDirectory))) {
                                fs.mkdirSync(EasyNode.real(logDirectory));
                        }
                        var s = EasyNode.config('easynode.logger.appenders') || '';
                        s = s.split(',');
                        s.forEach(function (v) {
                                v = S(v).trim();
                                if(v.length === 0) return ;
                                var appId = EasyNode.config('easynode.app.id', 'UNTITLED');
                                appId = appId == 'UNTITLED' ? '' : ('.' + appId);
                                var appender = {
                                        type: EasyNode.config('easynode.logger.appender.' + v + '.type', 'dateFile'),
                                        filename: EasyNode.real(logDirectory + '/' + EasyNode.config('easynode.logger.appender.' + v + '.file', v + '.log') + appId),
                                        category: EasyNode.config('easynode.logger.appender.' + v + '.namespace') || v
                                };
                                if(appender.type !== 'file' && appender.type !== 'dateFile') {
                                        appender.type = 'file';
                                        console.warn(`invalid appender type [${appender.type}]`);
                                }
                                if(appender.type === 'file') {
                                        //默认每个文件10M大小
                                        appender.maxLogSize = parseInt(EasyNode.config('easynode.logger.appender.' + v + '.maxSize', '10')) * 1024;
                                        //默认10个文件
                                        appender.backups = parseInt(EasyNode.config('easynode.logger.appender.' + v + '.backup', '10'));

                                }
                                else if(appender.type === 'dateFile') {
                                        appender.pattern = EasyNode.config('easynode.logger.appender.' + v + '.pattern', '-yyyy-MM-dd');
                                        appender.alwaysIncludePattern = true;
                                        appender.backups = parseInt(EasyNode.config('easynode.logger.appender.' + v + '.backup', '10'));
                                }
                                appenders.push(appender);
                        });
                        log4js.configure({
                                appenders: appenders,
                                replaceConsole: true
                        });
                }
        }

        //实例化单例对象。
        _instance = new Logger();

        module.exports = Logger;
})();