var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var SerializableObject = using('easynode.framework.server.tcp.SerializableObject');

(function () {
        class ElectronicFenceArea0x820F extends SerializableObject {
                constructor() {
                        super();
                        //调用super()后再定义子类成员。
                }

                /**
                 * 获取对象结构描述
                 *
                 * @method getObjectStructure
                 * @param {Object} msg 正在解析的消息对象
                 * @return {Array} 对象结构描述
                 * @abstract
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getObjectStructure(msg) {
                        return [
                                'efAreaId:DWORD',                       //电子围栏区域ID
                                'efAreaProperty:WORD',             //电子围栏区域属性
                                'efAreaProperty_ByTime:BIT:BIT($efAreaProperty,1)',                 //电子围栏是否根据时间生效
                                'efAreaProperty_AlarmEnter:BIT:BIT($efAreaProperty,4)',         //进入电子围栏区域时报警
                                'efAreaProperty_AlarmLeave:BIT:BIT($efAreaProperty,6)',         //离开电子围栏区域时报警
                                //'efAreaProperty_LatN:BIT:BIT($efAreaProperty,7)',                       //北纬，中国总应为0
                                //'efAreaProperty_LngE:BIT:BIT($efAreaProperty,8)',                       //东经，中国总应为0
                                'efAreaCenterLat:DWORD',        //中心点纬度 * 10000
                                'efAreaCenterLng:DWORD',        //中心点经度 * 10000
                                'efAreaRadius:DWORD',              //中心点半径，单位：米
                                'efAreaBeginTime1:BYTES:6',     //时间段１－起
                                'efAreaEndTime1:BYTES:6',     //时间段１－止
                                'efAreaBeginTime2:BYTES:6',     //时间段2－起
                                'efAreaEndTime2:BYTES:6',     //时间段2－止
                                'efAreaSpeedLimit:WORD',      //最大速度，单位：Km/h
                                'efAreaSpeedSustained:BYTE'     //超速超过多长时间即发出超速报警，单位：秒
                        ];
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = ElectronicFenceArea0x820F;
})();