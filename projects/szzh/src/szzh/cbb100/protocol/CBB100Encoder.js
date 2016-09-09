var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var Encoder = using('easynode.framework.server.tcp.Encoder');
var StreamEncoderHelper = using('easynode.framework.server.tcp.StreamEncoderHelper');
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
var Iconv = require('iconv').Iconv;

(function () {
        const UTF82GBK = new Iconv('utf8', 'gbk');

        /**
         * Class CBB100Encoder
         *
         * @class szzh.cbb100.protocol.CBB100Encoder
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Encoder extends Encoder {
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
                                CBB100Message.getFullMessageStructDescription(),
                                CBB100Message.Dynamic,
                                'LE',
                                UTF82GBK);
                        //修改帧长度
                        buf.writeUInt16LE(buf.length - 4, 1);
                        //修改和校验码
                        var bytesSum = 0;
                        for(var i = 5;i<buf.length - 1;i++) {
                                bytesSum += buf.readUInt8(i);
                        }
                        bytesSum = bytesSum & 0xFFFF;
                        buf.writeUInt16LE(bytesSum, 3);
                        var s = this.encode0x7E(buf.toString('hex'));
                        return s;
                }

                encode0x7E (hex){
                        //TODO 0x7E encode 真操蛋
                        return hex.replace(/7D/gm, '7D01').replace(/7E/gm, '7D02').replace(/^7D02/, '7E').replace(/7D02$/, '7E');
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Encoder;
})();