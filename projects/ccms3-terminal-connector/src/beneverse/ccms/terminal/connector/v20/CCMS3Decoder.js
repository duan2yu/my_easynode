var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var Decoder = using('easynode.framework.server.tcp.Decoder');
var TCPClient = using('easynode.framework.server.tcp.TCPClient');
var Binary = using('easynode.framework.util.Binary');
var S = require('string');
var _ = require('underscore');
var Iconv = require('iconv').Iconv;
var StreamDecoderHelper = using('easynode.framework.server.tcp.StreamDecoderHelper');
var StringUtil = using('easynode.framework.util.StringUtil');
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');

(function () {
        const MAX_PKG_SIZE = S(EasyNode.config('tcp.connection.maxBufferSize', '4096')).toInt();
        const GBK2UTF8 = new Iconv('gbk', 'utf8');
        const PROTOCOL_ENDIAN = 'BE';

        /**
         * Class CCMS3Decoder
         *
         * @class beneverse.ccms.terminal.connector.v20.CCMS3Decoder
         * @extends easynode.framework.server.tcp.Decoder
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3Decoder extends Decoder {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(server) {
                        super(server);
                        //调用super()后再定义子类成员。
                }

                decode(client) {
                        var socket = client.getSocket();
                        var me = this;
                        client.recvBuf = new Buffer(MAX_PKG_SIZE);
                        client.decoding = false;
                        client.bufferSize = 0;
                        socket.on('data', function (trunk) {
                                var trunkLen = trunk.length;
                                if (trunkLen > MAX_PKG_SIZE) {
                                        logger.error(`connection's buffer exceed it's range -> [${MAX_PKG_SIZE}] bytes, shutdown socket`);
                                        me.server.disconnect(client.getId(), `connection's buffer exceed it's range`);
                                        return;
                                }
                                var hex = trunk.toString('hex').toUpperCase();
                                EasyNode.DEBUG && logger.debug(`received a package from client [${client.getAlias() || client.getSocketId()}] : ${hex}`);

                                client.recvBuf.write(hex, 'hex');
                                client.bufferSize += trunkLen / 2;                      //2 hex char -> 1 byte

                                if (!client.decoding) {
                                        client.decoding = true;
                                        while (true) {
                                                if(client.bufferSize > 0) {
                                                        EasyNode.DEBUG && logger.debug(`buffer size remaining : [${client.bufferSize}] bytes`);
                                                }
                                                if(client.bufferSize == 0) {
                                                        client.recvBuf.fill(0);
                                                        break;
                                                }
                                                var ret = CCMS3Decoder.doDecode(client.recvBuf, client.bufferSize);
                                                if (!ret) {
                                                        client.bufferSize = 0;
                                                        client.recvBuf.fill(0);
                                                        break;
                                                }
                                                client.bufferSize -= ret.offset;
                                                if(ret.msg) {
                                                        ret.msg = me.finalizeMsg(ret.msg, client);
                                                        if(ret.msg) {
                                                                client.trigger(TCPClient.EVENT_MESSAGE_DECODED, ret.msg);               //SEE event listener: TCPServer._handleMessages()
                                                        }
                                                }
                                        }
                                        client.decoding = false;
                                }
                        });
                }

                finalizeMsg(msg, client) {
                        msg.__decodeTime=new Date();
                        return msg;
                }

                static doDecode(buf, bufLen) {
                        try {
                                return StreamDecoderHelper.decodeByStructDescription(
                                        buf,
                                        bufLen,
                                        CCMS3Message.getFullMessageStructDescription(),
                                        CCMS3Message.Dynamic,
                                        PROTOCOL_ENDIAN,
                                        GBK2UTF8,
                                        CCMS3Decoder.Validator);
                        }catch(err) {
                                logger.error(err);
                                return {
                                        offset : bufLen                                                      //will truncate input buffer
                                };
                        }
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        CCMS3Decoder.Validator = {
                validate : function(msg) {
                        return true;
                }
        };

        module.exports = CCMS3Decoder;
})();