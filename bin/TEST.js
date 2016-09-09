require('../src/EasyNode.js');
//通过config-files和src-dirs传入Source目录和配置文件清单
EasyNode.addConfigFile.apply(null, (EasyNode.arg('config-files') || '').split(','));
EasyNode.addSourceDirectory.apply(null, (EasyNode.arg('src-dirs') || '').split(','));
EasyNode.DEBUG = (EasyNode.config('debug-output', 'true') !== 'false');
EasyNode.addSourceDirectory('projects/szzh/src/');
EasyNode.addConfigFile('projects/szzh/etc/mp/message-push-dev.conf');

const logger = using('easynode.framework.Logger').getLogger();
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var co = require('co');
var thunkify = require('thunkify');
var utility = require('utility');
var Plugins = using('easynode.framework.plugin.Plugins');
var Redis = using('easynode.framework.cache.Redis');
var BeanFactory = using('easynode.framework.BeanFactory');
var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
var WebSocketServer = using('easynode.framework.server.ws.WebSocketServer');
var Logger = using('easynode.framework.Logger');
var APMTool = using('easynode.framework.util.APMTool');

co(function * () {
        //forward log stream to WebSocket, so we can read application console by browser
        var wsServer = new WebSocketServer();
        Logger.addLogListener(function(level, msg){
                level = level.toLowerCase();
                wsServer.broadcast(JSON.stringify({
                        time : new Date().getTime(),
                        level: level,
                        msg: msg
                }));
        });
        yield wsServer.start();
        var server = new KOAHttpServer();
        yield Plugins.load();
        var cache = new Redis();
        cache.initialize();
        yield BeanFactory.initialize('etc/demo-plugin-beans.json');
        var pluginSMSCaptcha = BeanFactory.get('smsCaptchaPlugin');
        var smsPlugin = BeanFactory.get('smsPlugin');
        yield smsPlugin.registerSMSService(server);
        logger.error(yield pluginSMSCaptcha.sendCaptcha('18658187318'));
        yield server.start();
}).catch(function(err){
        logger.error(err);
});