var assert = require('assert');
var Logger = using('easynode.framework.Logger');
var logger = Logger.forFile(__filename);
var Decoder = using('easynode.framework.server.tcp.Decoder');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
var TCPClient = using('easynode.framework.server.tcp.TCPClient');
var Binary = using('easynode.framework.util.Binary');
var S = require('string');
var _ = require('underscore');
var Iconv = require('iconv').Iconv;
var StreamDecoderHelper = using('easynode.framework.server.tcp.StreamDecoderHelper');
var StringUtil = using('easynode.framework.util.StringUtil');
var packageLogger = Logger.getLogger('packageLogger');

(function () {
        const MAX_PKG_SIZE = S(EasyNode.config('tcp.connection.maxBufferSize', '8192')).toInt();
        const GBK2UTF8 = new Iconv('gbk', 'utf8');
        const PROTOCOL_ENDIAN = 'LE';
        const LOG_ORIGINAL_PACKAGE = StringUtil.switchState(EasyNode.config('package.original.log', '0'));

        /**
         * Class CBB100Decoder
         *
         * @class szzh.cbb100.protocol.CBB100Decoder
         * @extends easynode.framework.server.tcp.Decoder
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Decoder extends Decoder {
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
                                //还原0x7E, 真操蛋
                                hex = CBB100Decoder.restore0x7E(hex);
                                if(LOG_ORIGINAL_PACKAGE) {
                                        packageLogger.info(`received a package from client [${client.getAlias() || client.getSocketId()}] : ${hex}`);
                                }

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
                                                var ret = CBB100Decoder.doDecode(client.recvBuf, client.bufferSize);
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
                        //if(msg['IMEI'] != client.getAlias()) {
                        //        logger.warn(`Invalid IMEI => [${msg['IMEI']}], [${client.getAlias()}] expected, shutting down connection...`);
                        //        this.server.disconnect(client.getId(), 'IMEI is not matched');
                        //        return null;
                        //}
                        msg['msgIdStr'] = '0x' + StringUtil.short2Hex(msg['msgId']);
                        msg['__id__'] = msg['msgIdStr'];
                        return msg;
                }

                static restore0x7E(hex) {
                        return hex.replace(/7D02/gm, '7E').replace(/7D01/gm, '7D');
                }

                static doDecode(buf, bufLen) {
                        try {
                                return StreamDecoderHelper.decodeByStructDescription(
                                        buf,
                                        bufLen,
                                        CBB100Message.getFullMessageStructDescription(),
                                        CBB100Message.Dynamic,
                                        PROTOCOL_ENDIAN,
                                        GBK2UTF8,
                                        CBB100Decoder.Validator);
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

        CBB100Decoder.Validator = {
                validate : function(msg) {
                        //logger.error(JSON.stringify(msg));
                        return msg && msg['startFlag'] == 0x7E && msg['endFlag'] == 0x7E;
                }
        };

        module.exports = CBB100Decoder;
})();