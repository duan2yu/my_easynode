var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x820E
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x820E
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x820E extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x820E);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        return [
                                'controlType:BYTE',                                                   //控制类型
                                'modeLevel:BYTE',                                                      //模式级别，???
                                'monitorMobile:STRING:12',                                   //监听手机号
                                'reversed_0x820E:BYTES:7'                                      //保留字段
                        ];
                }

                getAckMsgId() {
                        return 0x020E;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        CBB100Message0x820E.CONTROL_UNDEFERENCE = 2;                 //撤防
        CBB100Message0x820E.CONTROL_DEFERENCE = 3;                       //设防
        CBB100Message0x820E.CONTROL_MUTE = 4;                                  //静音
        CBB100Message0x820E.CONTROL_START_ENGINE = 5;                //免钥匙启动
        CBB100Message0x820E.CONTROL_BEEP = 6;                                   //发声（寻车）

        module.exports = CBB100Message0x820E;
})();