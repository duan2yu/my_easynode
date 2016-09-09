var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var Encoder = using('easynode.framework.server.tcp.Encoder');
var StreamEncoderHelper = using('easynode.framework.server.tcp.StreamEncoderHelper');
var CCMS3Message=using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');
var Iconv = require('iconv').Iconv;

(function () {
        const UTF82GBK = new Iconv('utf8', 'gbk');

        /**
         * Class CCMS3Encoder
         *
         * @class beneverse.ccms.terminal.connector.v20.CCMS3Encoder
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3Encoder extends Encoder {
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

                encode(msg, client) {
                        EasyNode.DEBUG && logger.debug('encoding msg: ' + JSON.stringify(msg));
                        var buf = StreamEncoderHelper.encodeByStructDescription(
                                msg,
                                CCMS3Message.getFullMessageStructDescription(),
                                CCMS3Message.Dynamic,
                                'BE',
                                UTF82GBK);
                         buf.writeUInt16BE(buf.length, 0);
                        return buf.toString('hex');
                }


                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3Encoder;
})();