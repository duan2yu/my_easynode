var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');


(function () {
        /**
         * Class CCMS3Message0x00050200
         *
         * @class beneverse.ccms.terminal.connector.v20.messages.CCMS3Message0x00050200
         * @extends beneverse.ccms.terminal.connector.v20.messages.CCMS3Message
         * @since 1.0.0
         * @author duansj
         * */
        class CCMS3Message0x00050200 extends CCMS3Message {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 1.0.0
                 * @author duansj
                 * */
                constructor() {
                        super(0x00050200);
                        this.direction='U';
                        //调用super()后再定义子类成员。
                }

                convert(msg, client) {
                        var timeArray=[].concat(msg['dayStr'],msg['timeStr']);
                        msg['reportTime'] = CCMS3Message0x00050200.clientTime2String(timeArray);
                        var lat=CCMS3Message0x00050200.threeBytes2Int(msg['lat']);
                        msg['lat']=CCMS3Message0x00050200.calculateStringLatLng(lat);
                        msg['lng']=CCMS3Message0x00050200.calculateStringLatLng(msg['lng']);
                        msg['speed']=parseInt(msg['speed']*1.852);
                        var channels=msg['channels'];
                        for(var i=1;i<=channels;i++)
                        {
                                msg['temp'+i]= (msg['temp'+i]-4000)/100;
                                msg['hum'+i]= msg['hum'+i]/100;
                        }
                        return msg;
                }

                getStructDescription(msg) {
                        if(msg.direction&&msg.direction=='D')
                        {
                                return [
                                        'result:string:2',
                                        'end:bytes:2'
                                ]
                        }

                        var base= [
                                'normalAlarm:DWORD',
                                'areaAlarm:BIT:BIT($normalAlarm,1)',
                                'speedAlarm:BIT:BIT($normalAlarm,2)',
                                'doorOpenAlarm:BIT:BIT($normalAlarm,3)',
                                'vibrationAlarm:BIT:BIT($normalAlarm,4)',
                                'tempAlarm:DWORD',
                                'humAlarm:DWORD',
                                'tid:STRING:8',
                                'dayStr:BYTES:3',
                                'gpsState:BYTE',
                                'lat:BYTES:3',
                                'lng:DWORD',
                                'speed:WORD',
                                'timeStr:BYTES:3',
                                'height:WORD',
                                'starCount:BYTE',   //卫星定位数量
                                'channels:BYTE',   //传感器路数
                                '$dynamic:getStructFromChannelCount',
                                '$dynamic:createAlarmFields',
                        ];

                        return base;
                }

                getAckMsgId() {
                        return 0x00050200;
                }

                setDirection(direction)
                {
                        this.direction=direction;
                }

                static calculateStringLatLng(i)
                {
                        var s=i/1000;
                        s = ""+s;
                        var  position = s.indexOf(".");
                        if (position > 0)
                        {
                                s = s.substring(0, position) + "." + s.substring(position + 1);
                        }
                        var  d = s.substring(0, position - 2);
                        var  f = s.substring(position - 2);
                        var  dfen = f/60;
                        var  ifen = parseInt(dfen * 1000000);
                        var  ret = "";
                        if ((dfen < 0.1) && (dfen >= 0.01))
                        {
                                ret = d + ".0" + ifen;
                        }
                        else if ((dfen < 0.01) && (dfen >= 0.001))
                        {
                                ret = d + ".00" + ifen;
                        }
                        else if ((dfen < 0.001) && (dfen >= 0.0001))
                        {
                                ret = d + ".000" + ifen;
                        }
                        else if (dfen < 0.0001)
                        {
                                ret = d + ".0000" + ifen;
                        }
                        else
                                ret = d + "." + ifen;
                        return parseFloat(ret).toFixed(6);

                }


                static clientTime2String(timeArray)
                {
                       var date=new Date();
                        var buffer = new Buffer(timeArray);
                        try {
                                var str='';
                                for (var i = 0; i < timeArray.length; i++) {
                                        var temp = buffer.readUInt8(i);
                                        if (temp < 10)
                                                str += '0' + temp;
                                        else str += temp;
                                }
                                date=new Date(Date.parse(str,'ddMMyyHHmmss'));
                        }catch(e)
                        {
                                logger.error(e);
                        }
                        return date.toFormat('YYYY-MM-DD HH24:MI:SS');
                }


                static threeBytes2Int(arr) {
                       // arr[0]<<16|arr[1]<<8|arr[2];
                        //var buf =Buffer.concat([new Buffer(1),new Buffer(arr)]);
                        return arr[0]<<16|arr[1]<<8|arr[2];
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }
        module.exports = CCMS3Message0x00050200;
})();