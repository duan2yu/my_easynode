var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var StringUtil = using('easynode.framework.util.StringUtil');
var Message = using('easynode.framework.server.tcp.Message');
var _ = require('underscore');

(function () {
        /**
         * Class CBB100Message
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(msgId) {
                        super();
                        //调用super()后再定义子类成员。
                        this.msgId = msgId;
                        this.direction = this.getDirection();
                }

                getDirection() {
                        var h = this.msgId >> 12 & 0x0F;
                        if (h == 0) {
                                return CBB100Message.DIRECTION_CBB100_2_SERVER;
                        }
                        return CBB100Message.DIRECTION_SERVER_2_CBB100;
                }

                convert(msg, client) {
                        assert(msg['msgId'] == this.msgId, `Invalid message id [${StringUtil.short2Hex(msg['msgId'])}]`);
                        return msg;
                }

                getDirectionString() {
                        if (this.direction == CBB100Message.DIRECTION_CBB100_2_SERVER) {
                                return 'CBB100 to Server';
                        }
                        return 'Server to CBB100';
                }

                getStructDescription() {
                        return [];
                }

                getAckMsgId() {
                        return CBB100Message.NO_ACK;
                }

                toString() {
                        return '0x' + StringUtil.short2Hex(this.msgId);
                }

                ackNotation(msg, client) {
                        var ret = null;
                        if (this.getAckMsgId() != CBB100Message.NO_ACK) {
                                var message = CBB100Message.createMessageById(this.getAckMsgId());
                                if (message) {
                                        ret = message.notation(client, msg);
                                }
                        }
                        assert(ret, 'create ACK notation fail, NO ACK is defined or message class is not found');
                        return ret;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }

                notation(client, srcMsg = {}) {
                        var me = this;
                        var msg = {
                                msgId: this.msgId,
                                msgVersion: srcMsg['msgVersion'] || 0x00
                        };
                        var ret = Message.createFromStructDescription(msg, CBB100Message.getFullMessageStructDescription(), CBB100Message.Dynamic);
                        _.extend(ret.msg, {
                                startFlag: 0x7E,
                                frameLen: 0x0000,              //帧长度去掉startFlag, endFlag和frameLen本身，共4字节
                                sumCheck: 0x0000,
                                msgId: me.msgId,
                                msgVersion: srcMsg['msgVersion'] || 0x00,
                                encrypt: srcMsg['encrypt'] || 0x00,
                                IMEI: srcMsg['IMEI'] || (client ? client.IMEI : '000000000000000'),
                                endFlag: 0x7E
                        });
                        return ret.msg;
                }

                //CBB100完整TCP协议栈
                static getFullMessageStructDescription() {
                        return [
                                'startFlag:BYTE',
                                'frameLen:WORD',
                                'sumCheck:WORD',
                                'msgId:WORD',
                                'msgVersion:BYTE',
                                'encrypt:BYTE',
                                'IMEI:STRING:16',
                                '$dynamic:getStructForMsgId',                              //see CBB100Message.Dynamic.getStructForMsgId()
                                'endFlag:BYTE'
                        ];
                }

                static createMessageById(msgId) {
                        var hexMsgId = StringUtil.short2Hex(msgId);
                        var messageClassName = 'szzh.cbb100.protocol.messages.CBB100Message0x' + hexMsgId;
                        var MessageClass = using(messageClassName, false);
                        if (MessageClass) {
                                var msg = new MessageClass();
                                return msg;
                        }
                        else {
                                logger.warn(`message class [${messageClassName}] is not found`);
                        }
                }
        }

        CBB100Message.DIRECTION_CBB100_2_SERVER = 0;
        CBB100Message.DIRECTION_SERVER_2_CBB100 = 1;
        CBB100Message.NO_ACK = 0x00;

        CBB100Message.Dynamic = {
                getStructForMsgId: function (msg) {
                        //msg.msgId = 0x0001;                                                           //simulate 0x0001
                        var hexMsgId = StringUtil.short2Hex(msg.msgId);
                        if(!_.contains(CBB100Message.SUPPORTED_CMDS, msg['msgId'])) {
                                logger.warn(`Unsupported cmd -> [0x${hexMsgId}]`);
                                return [];
                        }
                        var className = 'szzh.cbb100.protocol.messages.CBB100Message0x' + hexMsgId;
                        var Message = using(className, false);
                        if (!Message) {
                                logger.warn(`message [0x${hexMsgId}] has not been described, class [${className}] is not found`);
                                return [];
                        }
                        var inst = new Message();
                        return inst.getStructDescription(msg);
                },
                getAreaStructFor0x820F : function(msg) {
                        msg.areaData = msg.areaData || [];
                        if(msg.areaData.length === 0) {
                                return [];
                        }
                        var totalBytes = msg.areaData.length * 45;                      //参考文档：CBB100-0x820F
                        return ['areaDataBytes:BYTE:' + totalBytes];
                }
        };

        CBB100Message.SUPPORTED_CMDS = [
                0x0001, 0x0002, 0x020E, 0x0200, 0x0206, 0x0209, 0x0202,0x0210,0x020F,0x0204,0x020A,
                0x8001, 0x8002, 0x820E,               0x8206, 0x8209, 0x8202,0x8210,0x820F,0x8204,0x820A
        ];

        module.exports = CBB100Message;
})();