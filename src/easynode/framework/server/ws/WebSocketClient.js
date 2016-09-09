var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class WebSocketClient
         *
         * @class easynode.framework.server.ws.WebSocketClient
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class WebSocketClient extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @param {Socket} socket WebSocket套接字
                 * @param {WebSocketServer} server WebSocketServer实例
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(socket, server) {
                        super();
                        //调用super()后再定义子类成员。
                        assert(socket, 'Invalid argument [socket]');
                        /**
                         *  网络套接字
                         *
                         * @property socket
                         * @type Socket Node.js plain socket object
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.socket = socket;

                        /**
                         *  TCPServer实例
                         *
                         * @property server
                         * @type easynode.framework.server.tcp.TCPServer
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.server = server;

                        /**
                         *  创建时间
                         *
                         * @property _uptime
                         * @type Date
                         * @private
                         *
                         * */
                        this._uptime = new Date();

                        /**
                         *  是否处于连接状态
                         *
                         * @property _connected
                         * @type boolean
                         * @private
                         *
                         * */
                        this._connected = true;

                        /**
                         *  客户端别名
                         *
                         * @property _alias
                         * @type String
                         * @private
                         *
                         * */
                        this._alias = null;

                        /**
                         *  连接的WebSocket URL, ws://localhost:9999/test，this.url = "/test"
                         *
                         * @property url
                         * @type String
                         * @default null
                         * @public
                         *
                         * */
                        this.url = null;

                        /**
                         *  连接的创建时间
                         *
                         * @property createTime
                         * @type Date
                         * @default now()
                         * @public
                         *
                         * */
                        this.createTime = new Date();
                }

                /**
                 * 获取客户端连接时长(单位：ms)。
                 *
                 * @method uptime
                 * @return {int} 客户端连接时长(单位：ms)
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                uptime () {
                        return new Date() - this._uptime;
                }

                /**
                 * 获取原生Socket连接。
                 *
                 * @method getSocket
                 * @return {Socket} Socket连接
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getSocket() {
                        return this.socket;
                }

                /**
                 * 获取客户端ID，返回：this.socket.SOCKET_ID
                 *
                 * @method getId
                 * @return {String} 客户端ID
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getId () {
                        return this.getSocketId();
                }

                /**
                 * 设置客户端别名
                 *
                 * @method setAlias
                 * @param {String} alias 客户端别名
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                setAlias(alias) {
                        this._alias = alias;
                }

                /**
                 * 设置客户端别名
                 *
                 * @method getAlias
                 * @return {String} 客户端别名
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getAlias() {
                        return this._alias;
                }

                /**
                 * 获取客户端Socket ID，返回：this.socket.SOCKET_ID
                 *
                 * @method getClientId
                 * @return {String} 客户端ID
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getSocketId() {
                        return this.socket.SOCKET_ID;
                }

                /**
                 * 客户端是否已经连接成功
                 *
                 * @method uptime
                 * @return {boolean} 客户端是否已经连接成功
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                connected () {
                        return this._connected;
                }

                /**
                 * 向此客户端发送一条消息
                 *
                 * @method send
                 * @param {Object} msg 要发送的消息
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                send(msg) {
                        if (typeof msg == 'string') {
                                this.socket.send(msg);
                        }
                        else if(msg instanceof Buffer) {
                                this.socket.send(msg.toString());
                        }
                        else if (typeof msg == 'object') {
                                this.socket.send(JSON.stringify(msg));
                        }
                        else {
                                logger.error('invalid response type ['+(typeof msg)+']');
                        }
                }

                /**
                 * 获取此客户端的名称。如果对此客户端使用了别名，则返回别名，否则返回socketId.
                 *
                 * @method getName
                 * @return {String} 客户端名称
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getName() {
                        return this.getAlias() || this.getSocketId();
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = WebSocketClient;
})();