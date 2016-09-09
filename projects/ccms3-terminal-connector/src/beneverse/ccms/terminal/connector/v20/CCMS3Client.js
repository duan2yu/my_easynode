var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var TCPClient = using('easynode.framework.server.tcp.TCPClient');
var BeanFactory = using('easynode.framework.BeanFactory');
var _ = require('underscore');
var co = require('co');

(function () {
        const IP = EasyNode.getLocalIP();
        const PORT = EasyNode.config('http.server.port');
        const PROTOCOL = 'http';
        const CONTROL_URI = EasyNode.config('http.server.services.control.URI');
        var mq = BeanFactory.get('mq');
        const queueName = EasyNode.config('app.mq.logQueueName');

        /**
         * Class CCMS3Client
         *
         * @class beneverse.ccms.terminal.connector.v20.CCMS3Client
         * @extends easynode.framework.server.tcp.TCPClient
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3Client extends TCPClient {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(socket, server) {
                        super(socket, server);
                        //调用super()后再定义子类成员。
                        socket.setEncoding('hex');
                        var me=this;
                        this.on(TCPClient.EVENT_MESSAGE_HANDLED, function(msg,responses,msgSent) {
                                co(function * () {
                                        logger.info(`push data tid -> [${msg.tid}]`);
                                        var logInfo={
                                                tid:me.getAlias() || '00000000',
                                                span:new Date()-msg.__decodeTime,
                                                time : new Date().toFormat('YYYY-MM-DD HH24:MI:SS'),
                                                uplink:msg.__original__,
                                                downlink:msgSent
                                        };
                                        yield mq.publish(queueName, {}, logInfo);

                                }).catch(function(err){
                                        logger.error(err);
                                });
                        })
                }



                getDeviceRCBaseURL () {
                        return `${PROTOCOL}://${IP}:${PORT}${CONTROL_URI}`;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        CCMS3Client.EVENT_CLIENT_DATA_CHANGED = 'client-data-changed';

        module.exports = CCMS3Client;
})();