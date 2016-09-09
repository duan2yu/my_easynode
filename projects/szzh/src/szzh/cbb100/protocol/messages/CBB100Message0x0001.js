var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x0001
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x0001
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x0001 extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x0001);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        var struct = [
                                'STATE_WORD:WORD',
                                'i2cState:BIT:BIT($STATE_WORD,1)',
                                'rs232StateR:BIT:BIT($STATE_WORD,2)',
                                'rs232StateW:BIT:BIT($STATE_WORD,3)',
                                'btState:BIT:BIT($STATE_WORD,4)',
                                'reverseState:BIT:BIT($STATE_WORD,5,4)',
                                'simState:BIT:BIT($STATE_WORD,9)',
                                'networkState:BIT:BIT($STATE_WORD,10)',
                                'call112State:BIT:BIT($STATE_WORD,11)',
                                'gpsRS232State:BIT:BIT($STATE_WORD,12)',
                                'stateReversed:BIT:BIT($STATE_WORD,13,4)',
                                'networkSignal:BYTE'
                                //'otherStateReversed:BYTES:4'
                        ];

                        //按给我的协议应该是0x001D帧长，不过实际情况可能会出来0x002D帧长度
                        if(msg['frameLen'] == 0x001D) {
                                struct.push('otherStateReversed:BYTES:4');
                        }
                        else {
                                struct.push('otherStateReversed:BYTES:20');
                        }

                        return struct;
                }

                getAckMsgId() {
                        return 0x8001;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x0001;
})();