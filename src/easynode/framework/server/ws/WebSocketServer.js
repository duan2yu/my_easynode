var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var AbstractServer = using('easynode.framework.server.AbstractServer');
var WebSocketClient = using('easynode.framework.server.ws.WebSocketClient');
var WSServer = require('ws').Server;
var thunkify = require('thunkify');
var UUID = require('node-uuid');
var util = require('util');
var co = require('co');
var _ = require('underscore');

(function () {
        /**
         * Class WebSocketServer
         *
         * @class easynode.framework.server.ws.WebSocketServer
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class WebSocketServer extends AbstractServer {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(msgHandler=null, path=null, port=parseInt(EasyNode.config('easynode.servers.ws-Server.port', '9999'))) {
                        super(port);
                        //调用super()后再定义子类成员。

                        /**
                         *  客户端连接map，session id -> ws Socket
                         *
                         * @property _clients
                         * @type Map(String -> easynode.framework.server.ws.WebSocketClient)
                         * @private
                         *
                         * */
                        this._clients = {};
                        this._clientAlias = {};                                         //客户端别名
                        this._clientsCount = 0;                                     //连接总数

                        /**
                         *  WebSocket消息处理器
                         *
                         * @property _server
                         * @type ws.Server
                         * @private
                         *
                         * */
                        this._server = null;

                        /**
                         *  WebSocket消息处理器
                         *
                         * @property msgHandler
                         * @type easynode.framework.server.ws.MessageHandler
                         * @public
                         *
                         * */
                        this.msgHandler = msgHandler;

                        /**
                         *  WebSocket端口
                         *
                         * @property port
                         * @type int
                         * @public
                         *
                         * */
                        this.port = port;

                        /**
                         *  WebSocket Path
                         *
                         * @property path
                         * @type String
                         * @public
                         *
                         * */
                        this.path = path;
                        /**
                         *  客户端类名
                         *
                         * @property clientClassName
                         * @type String
                         * @default easynode.framework.server.ws.WebSocketClient
                         * @public
                         *
                         * */
                        this.clientClassName = 'easynode.framework.server.ws.WebSocketClient';
                }

                onClientConnected(socket) {
                        var id = UUID.v4();
                        socket.SOCKET_ID = id;
                        var client = new this._clientClass(socket, this);
                        client.url = socket.upgradeReq.url;
                        this._clients[id] = client;
                        this._clientsCount ++;
                        this.trigger(WebSocketServer.EVENT_CLIENT_CONNECTED, client);
                        EasyNode.DEBUG && logger.debug('client ['+id+'] connected to WebSocket server ['+this.name+']');
                }

                setClientClass(clientClass) {
                        this._clientClass = clientClass;
                }

                /**
                 * 设置客户端别名。
                 *
                 * @method setClientAlias
                 * @param {String} alias 客户端别名
                 * @param {easynode.framework.server.ws.WebSocketClient} client 客户端实例
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                setClientAlias(alias, client) {
                        var oldClient = this._clientAlias[alias];
                        if (oldClient) {
                                this.disconnect(oldClient.getSocketId(), 'duplicated alias');
                        }
                        client.setAlias(alias);
                        this._clientAlias[alias] = client;
                }

                disconnect(socketId, reason) {
                        var me = this;
                        var client = this._clients[socketId];
                        if(!client) return;
                        var alias = client.getAlias();
                        try {
                                EasyNode.DEBUG && logger.debug(`client [${alias || socketId}] disconnected by reason [${reason}]`);
                                this._clientsCount --;
                                me.trigger(WebSocketServer.EVENT_CLIENT_DISCONNECTED, client);
                                client.socket.close();
                        }catch(err){
                                logger.warn(err);
                        }
                        delete this._clients[socketId];
                        if(alias) {
                                delete this._clientAlias[alias];
                        }
                }

                onMessageReceived(socket, msg) {
                        var me = this;
                        var socketId = socket.SOCKET_ID;
                        var client = this._clients[socketId];
                        var alias = client.getAlias() || socketId;
                        EasyNode.DEBUG && logger.debug('WebSocket server ['+this.name+'] received a message from client ['+alias+']-> ' + msg);
                        if(!this.msgHandler) {
                                logger.warn('message listener has not been specified');
                                return ;
                        }
                        co(function * () {
                                var ret = yield me.msgHandler.handleMessage(msg, client);
                                if(!ret) return;

                                function _send(ret) {
                                        if (typeof ret == 'string') {
                                                client.send(ret);
                                        }
                                        else if(ret instanceof Buffer) {
                                                client.send(ret.toString());
                                        }
                                        else if (typeof ret == 'object') {
                                                client.send(JSON.stringify(ret));
                                        }
                                        else {
                                                logger.error('invalid response type ['+(typeof ret)+']');
                                        }
                                }

                                if(_.isArray(ret)) {
                                        ret.forEach(msg => {
                                                _send(msg);
                                        });
                                }
                                else {
                                        _send(ret);
                                }
                        }).catch(function(err){
                                logger.error(err);
                        });
                }

                onClientDisconnected(socket) {
                        var socketId = socket.SOCKET_ID;
                        var client = this._clients[socketId];
                        var alias = client.getAlias() || socketId;
                        EasyNode.DEBUG && logger.debug('client ['+alias+'] disconnecting from WebSocket server ['+this.name+']');
                        this.disconnect(socket.SOCKET_ID, 'close');
                }

                getClients() {
                        return _.values(this._clients);
                }

                broadcast(msg) {
                        var array = this.getClients();
                        for(var i = 0;i<array.length;i++) {
                                try{array[i].send(msg);}catch(err){}                               //handle nothing
                        }
                }

                getClientByAlias(alias) {
                        return this._clientAlias[alias];
                }

                stop() {
                        var me = this;
                        me.trigger(AbstractServer.EVENT_BEFORE_STOP);
                        return function * () {
                                me._server.close();
                                me.trigger(AbstractServer.EVENT_STOP);
                        };
                }

                start () {
                        var me = this;
                        if(!this._clientClass) {
                                this._clientClass = using(this.clientClassName);
                        }
                        return function * () {
                                var server = new WSServer({ port: me.port, path : me.path });
                                me._server = server;

                                server.on('connection', function(socket) {
                                        me.onClientConnected(socket);
                                        socket.on('message', function(msg){
                                                me.onMessageReceived(socket, msg);
                                        });

                                        socket.on('close', function(){
                                                me.onClientDisconnected(socket);
                                        });

                                        socket.on('timeout', function(){
                                                me.disconnect(socket.SOCKET_ID, 'timeout');
                                        });

                                        socket.on('error', function(err){
                                                logger.error(error);
                                                me.disconnect(socket.SOCKET_ID, 'error');
                                        });
                                });

                                function _listen(cb) {
                                        server.on('listening', function(){
                                                logger.info('WebSocket server ['+me.name+'] is listening on port ['+me.port+']...');
                                                cb && cb();
                                        });
                                }

                                yield thunkify(_listen)();
                                me.trigger(AbstractServer.EVENT_STARTED);
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        WebSocketServer.EVENT_CLIENT_CONNECTED = 'client-connected';
        WebSocketServer.EVENT_CLIENT_DISCONNECTED = 'client-disconnected';

        module.exports = WebSocketServer;
})();