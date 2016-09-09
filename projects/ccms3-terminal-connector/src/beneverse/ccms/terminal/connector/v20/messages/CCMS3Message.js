var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var StringUtil = using('easynode.framework.util.StringUtil');
var Message = using('easynode.framework.server.tcp.Message');
var _ = require('underscore');

(function () {
        /**
         * Class CCMS3Message
         *
         * @class beneverse.ccms.terminal.connector.v20.messages.CCMS3Message
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3Message extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(msgId,direction='U') {
                        super();
                        //调用super()后再定义子类成员。
                        this.msgId = msgId;
                        this.direction = direction;
                }

                convert(msg, client) {
                        assert(msg['msgId'] == this.msgId, `Invalid message id [${StringUtil.int2Hex(msg['msgId'])}]`);
                        return msg;
                }

                getStructDescription() {
                        return [];
                }

                getAckMsgId() {
                        return CCMS3Message.NO_ACK;
                }

                ackNotation(msg, client) {
                        var ret = null;
                        if (this.getAckMsgId() !=CCMS3Message.NO_ACK) {
                                var message = CCMS3Message.createMessageById(this.getAckMsgId());
                                if (message) {
                                        ret = message.notation(client, msg);
                                }
                        }
                        assert(ret, 'create ACK notation fail, NO ACK is defined or message class is not found');
                        return ret;
                }


                notation(client, srcMsg = {}) {
                        var me = this;
                        var msg = {
                                msgId: this.msgId
                        };
                        var ret = Message.createFromStructDescription(msg, CCMS3Message.getFullMessageStructDescription(), CCMS3Message.Dynamic);
                       _.extend(ret.msg, {
                               msgId: me.msgId,
                               result: srcMsg['result'],
                               endFlag: 0x0D0A
                        });
                        return ret.msg;
                }


                getClassName() {
                        return EasyNode.namespace(__filename);
                }


                //CCMS完整TCP协议栈
                static getFullMessageStructDescription() {
                        return [
                                'length:WORD',
                                'msgId:DWORD',
                                '$dynamic:getStructForMsgId',                              //see CBB100Message.Dynamic.getStructForMsgId()
                        ];
                }

                static createMessageById(msgId) {
                        var hexMsgId = StringUtil.int2Hex(msgId);
                        var messageClassName = 'beneverse.ccms.terminal.connector.v20.messages.CCMS3Message0x' + hexMsgId;
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

        CCMS3Message.NO_ACK = 0x00;

        CCMS3Message.Dynamic = {
                getStructForMsgId: function (msg) {
                      if(msg.msgId==0x00050200&&msg.length==7)  //GPS上报和心跳包的CMD都是0x00050200，判断如果长度为６个字节就是心跳包
                      {
                              msg.msgId=0x000B0200;
                      }
                        var hexMsgId = StringUtil.int2Hex(msg.msgId);
                        if(!_.contains(CCMS3Message.SUPPORTED_CMDS, msg['msgId'])) {
                                logger.warn(`Unsupported cmd -> [0x${hexMsgId}]`);
                                return [];
                        }
                        var className = 'beneverse.ccms.terminal.connector.v20.messages.CCMS3Message0x' + hexMsgId;
                        var Message = using(className, false);
                        if (!Message) {
                                logger.warn(`message [0x${hexMsgId}] has not been described, class [${className}] is not found`);
                                return [];
                        }
                        var inst = new Message();
                        return inst.getStructDescription(msg);
                },
                getStructFromChannelCount:function(msg)
                {
                        var struct=[];
                        var channelCount=msg.channels;
                        for(var i=1;i<=channelCount;i++)
                        {
                                struct.push('temp'+i+':WORD');
                                struct.push('hum'+i+':WORD');
                        }
                        return struct;
                },
                createAlarmFields:function(msg)
                {
                        var channels=msg.channels;
                        var struct=[];
                        var bitIndex=1;
                        for(var i=1;i<=channels;i++) {
                                struct.push(
                                        'lowTemp_'+i+':BIT:BIT($tempAlarm,'+(bitIndex++)+')',
                                        'highTemp_'+i+':BIT:BIT($tempAlarm,'+(bitIndex++)+')'
                                )
                        }

                        bitIndex=1;
                        for(var i=1;i<=channels;i++) {
                                struct.push(
                                        'lowHum_'+i+':BIT:BIT($humAlarm,'+(bitIndex++)+')',
                                        'highHum_'+i+':BIT:BIT($humAlarm,'+(bitIndex++)+')'
                                )
                        }
                        return struct;
                },
                getResponseMsg:function(msg)
                {
                        //报文长度减去开头   'length:WORD','msgId:DWORD',和  'spacer:BYTES:2'  'endFlag:BYTES:2'  总共10个字节，剩下的就是响应字符串的长度
                        var length=msg.length;
                        return [
                                'responseMsg:STRING:'+(length-10)
                        ]

                }
        };

        CCMS3Message.SUPPORTED_CMDS = [
                0x000A0800,0x00050200,0x00010500    //0x00010500为终端响应的数据包CMD
                ,0x000B0200 　　　　// ,0x000B0200是模拟的终端心跳数据包CMD
        ];

        module.exports = CCMS3Message;
})();