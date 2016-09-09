var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class DeviceConfigParser
         *
         * @class beneverse.ccms.terminal.connector.v20.util.DeviceConfigParser
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class DeviceConfigParser extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super();
                        //调用super()后再定义子类成员。
                }

                static parse(configStr) {
                        const FIELDS = [
                                'AT$FRIEND',
                                'AT$EVTIM1',
                                'AT$MDMID',
                                'AT$GPSOSI',
                                'AT$EVENT',
                                'AT$WAKEUP',
                                'AT$CHANNELS',
                                'AT$TRS',
                                'AT$HRS',
                                'AT$THA',
                                'AT$EVTIM8',
                                'AT$EVTIM9',
                                'AT&PTH',
                                'AT$HDS',
                                'AT$VERSION'
                        ];
                        configStr += 'AT';
                        var ret = {};
                        FIELDS.forEach(f => {
                                f = f.replace(/\$/, '\\$');
                                var regEx = new RegExp(f + '=(.*?);AT');
                                f = f.replace(/\\\$/, '$');
                                var s = configStr;
                                while(true) {
                                        var arr = regEx.exec(s);
                                        if (arr) {
                                                if(ret[f] == null) {
                                                        ret[f] = arr[1];
                                                }
                                                else if(typeof ret[f] == 'string'){
                                                        var tempArr = [];
                                                        tempArr.push(ret[f]);
                                                        tempArr.push(arr[1]);
                                                        ret[f] = tempArr;
                                                }
                                                else {
                                                        ret[f].push(arr[1]);
                                                }
                                                s = s.replace(regEx, 'AT');
                                        }
                                        else {
                                                break;
                                        }
                                }
                        });
                        return ret;
                        //return {
                        //        'AT$FRIEND' : '1,"123.157.150.41",10089',
                        //        'AT$EVTIM1' : '30',
                        //        'AT$MDMID' : '15121061',
                        //        'AT$GPSOSI' : '40',
                        //        'AT$EVENT' : ['15,0,1,0', '15,0,2,0'],
                        //        'AT$WAKEUP' : '0,255',
                        //        'AT$CHANNELS' : '2',
                        //        'AT$TRS' : ['1,-9999,-9999', '2,-9999,-9999'],
                        //        'AT$HRS' : ['1,-9999,-9999', '2,-9999,-9999'],
                        //        'AT$THA' : ['1,0.0,0', '2,0.0,0'],
                        //        'AT$EVTIM8' : '5',
                        //        'AT$EVTIM9' : '30',
                        //        'AT&PTH' : '"浙江泽物信息科技有限公司","浙A-12345"',
                        //        'AT$HDS' : ['1,0,74','2,0,74'],
                        //        'AT$VERSION' : '1.5'
                        //};
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = DeviceConfigParser;
})();