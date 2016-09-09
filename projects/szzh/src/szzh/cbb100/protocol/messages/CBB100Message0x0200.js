var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');

(function () {
        /**
         * Class CBB100Message0x0200
         *
         * @class szzh.cbb100.protocol.messages.CBB100Message0x0200
         * @extends szzh.cbb100.protocol.messages.CBB100Message
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100Message0x0200 extends CBB100Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super(0x0200);
                        //调用super()后再定义子类成员。
                }

                getStructDescription(msg) {
                        return [
                                'version_0x0200:BYTE',                                             //GPS格式版本号
                                'STATUS_0x0200:WORD',                                          //状态码
                                'gpsState:BIT:BIT($STATUS_0x0200,1,2)',           //0：GPS未定位；1：GPS真实定位；2:GPS粗精度定位；3:最后定位
                                'latS:BIT:BIT($STATUS_0x0200,3)',                        //0：北纬；1：南纬
                                'lngW:BIT:BIT($STATUS_0x0200,4)',                      //0：东经；1：西经
                                'vehicleState:BIT:BIT($STATUS_0x0200,5,3)',     //0b000：撤防状态
                                                                                                                        //0b001：布防状态
                                                                                                                        //0b010：非法开车门报警
                                                                                                                        //0b011：非法驾驶报警
                                                                                                                        //0b100：震动报警
                                                                                                                        //0b101：超速报警
                                                                                                                        //0b110：断电报警
                                                                                                                        //0b111：保留
                                'movement:BIT:BIT($STATUS_0x0200,8)',            //0：静止状态；1：运动状态
                                'reportState:BIT:BIT($STATUS_0x0200,9)',          //0：正常状态；1：位置隐藏标志，如果该标志有效，中心将无法显示该位置；
                                'ACCState:BIT:BIT($STATUS_0x0200,10)',            //0：ACC无效；1：ACC有效；
                                'lat1:DWORD',                                                                 //形变后纬度, 1/10000分
                                'lng1:DWORD',                                                                //形变后经度，1/10000分
                                'odometerOfDay:DWORD',                                       //当天即时里程, 1/10km
                                'rideTimeOfDay:DWORD',                                         //当天行驶时间，秒
                                'TEMPERATURE:BYTE',                                               //车内温度, -127~+127摄氏度；如果最高位为0，则后面的7位数值为正；如果最高位为1，则后面的7位数值为负
                                'temperatureSign:BIT:BIT($TEMPERATURE,8)',     //温度符号
                                'temperatureValue:BIT:BIT($TEMPERATURE,1,7)',//温度值
                                'speed:WORD',                                                            //速度，1/10km/h
                                'direction:BYTE',                                                         //方向，0—178,刻度为2度，正北为0，顺时针
                                'altitude:WORD',                                                         //高度，米为单位，整数
                                'lat2:DWORD',                                                                 //形变前纬度, 1/10000分
                                'lng2:DWORD',                                                                //形变前经度，1/10000分
                                'deviceTime:BYTES:6',                                               //时间，年、月、日、时、分、秒各占一个byte。
                                                                                                                        //年：系统时间年份的后两位，取值范围00H~FFH如2011年，则该字段为0x0b；
                                                                                                                        //月：取值范围01H~0CH
                                                                                                                        //日：取值范围01H~1FH
                                                                                                                        //时：取值范围01H~18H
                                                                                                                        //分：取值范围00H~3BH
                                                                                                                        //秒：取值范围00H~3BH
                                                                                                                        //注意：在此数组中，第0个字节存放的是年，依次类推；
                                'plmn:STRING:7',                                                        //移动国家代码，(PLMN=MCC+MNC)，“46000”:中国移动; “46001”:中国联通;
                                'lac:WORD',                                                                  //地区区域码
                                'cellId:WORD'                                                              //基站号码
                        ];
                }

                convert(msg, client) {
                        var lat, lng;
                        //纬度转换，转成度，保留5位小数，南纬补“S"后缀
                        lat = msg['lat2'] / 10000 / 60;
                        lat = lat.toFixed(6);
                        if(msg['latS'] == 1) {
                                lat += 'S';
                        }
                        msg['lat'] = lat;

                        //经度转换，转成度，保留6位小数，西经补“W"后缀
                        lng = msg['lng2'] / 10000 / 60;
                        lng = lng.toFixed(6);
                        if(msg['lngW'] == 1) {
                                lng += 'W';
                        }
                        msg['lng'] = lng;

                        //终端时间转换
                        var buf = new Buffer(msg['deviceTime']);
                        msg['deviceTime'] = CBB100Message0x0200.clientTime2String(buf);

                        //终端温度转换
                        msg['temperature'] = msg['temperatureSign'] == 0 ? msg['temperatureValue'] : (0 - msg['temperatureValue']);
                        return msg;
                }

                static clientTime2String(buf) {
                        var year = '' + (2000 + buf[0]);
                        var month = buf[1] < 10 ? ('0' + buf[1]) : ('' + buf[1]);
                        var day = buf[2] < 10 ? ('0' + buf[2]) : ('' + buf[2]);
                        var hours = buf[3] < 10 ? ('0' + buf[3]) : ('' + buf[3]);
                        var minutes = buf[4] < 10 ? ('0' + buf[4]) : ('' + buf[4]);
                        var seconds = buf[5] < 10 ? ('0' + buf[5]) : ('' + buf[5]);
                        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
                }

                getAckMsgId() {
                        return CBB100Message.NO_ACK;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100Message0x0200;
})();