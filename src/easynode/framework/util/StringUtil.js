var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var mustache = require('mustache');
var _ = require('underscore');
var Iconv = require('iconv').Iconv;

(function () {
        /**
         * Class StringUtil
         *
         * @class easynode.framework.util.StringUtil
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class StringUtil extends GenericObject {
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

                /**
                 * 格式化字符串，将字符串中的占位符按顺序或按名称替换成实际字符串。占位符格式：{{xxx}}。
                 *
                 * @method format
                 * @param {String} str
                 * @param {...} replaces 替换参数，可以为数组，如果为数组则逐个替换，如果为对象则按名称替换。
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                static format(str, ...replaces) {
                        assert(str == null || typeof str == 'string', 'Invalid argument');
                        if(arguments.length == 1) {
                                return str;
                        }

                        if(!str) {
                                return str;
                        }

                        if(arguments.length == 2 && typeof arguments[1] == 'object') {
                                var replace = arguments[1];
                                //使用mustache来渲染，不支持helper函数。
                                return mustache.render(str, replace);
                        }
                        else {
                                var args = _.toArray(arguments).splice(1);
                                var regExp = /\{\{\w+\}\}/;
                                var idx = 0;
                                while(true) {
                                        if(idx == args.length) {
                                                break;
                                        }
                                        if(str.match(regExp)) {
                                                str = str.replace(regExp, args[idx]);
                                        }
                                        else {
                                                break;
                                        }
                                        idx ++;
                                }
                                return str;
                        }
                }

                /**
                 * 2字节short转HEX String
                 *
                 * @method short2Hex
                 * @param {short} s
                 * @return {String} hex code, 不含0x
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                static short2Hex(s) {
                        //var buf = new Buffer(2);
                        //buf.writeUInt16BE(s);
                        //return buf.toString('hex').toUpperCase();
                        assert(typeof s == 'number' && !isNaN(s), 'Invalid short number');
                        s = s & 0xFFFF;                                         //防止short型溢出
                        s = s.toString(16).toUpperCase();
                        while(s.length < 4) {
                                s = '0' + s;
                        }
                        return s;
                }

                /**
                 * 1字节byte转HEX String
                 *
                 * @method short2Hex
                 * @param {byte} b
                 * @return {String} hex code, 不含0x
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                static byte2Hex(b) {
                        //var buf = new Buffer(1);
                        //buf.writeUInt8BE(b);
                        //return buf.toString('hex').toUpperCase();
                       assert(typeof b == 'number' && !isNaN(b), 'Invalid short number');
                        b = b & 0xFF;                           //防止byte型溢出
                        b = b.toString(16).toUpperCase();
                        if(b.length < 2) {
                                b = '0' + b;
                        }
                }

                /**
                 * 4字节int转HEX String
                 *
                 * @method short2Hex
                 * @param {int} i
                 * @return {String} hex code, 不含0x
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                static int2Hex(i) {
                        //var buf = new Buffer(4);
                        //buf.writeUInt32BE(i);
                        //return buf.toString('hex').toUpperCase();
                       assert(typeof i == 'number' && !isNaN(i), 'Invalid short number');
                        i = i & 0xFFFFFFFF;                     //防止int型溢出
                        i = i.toString(16).toUpperCase();
                        while(i.length < 8) {
                                i = '0' + i;
                        }
                        return i;
                }

                /**
                 * 返回开关状态
                 *
                 * @method switchState
                 * @param {int/boolean/String} sw 状态
                 * @return {boolean} 开关状态，int型时，1返回true, 非1返回false，boolean型时直接返回，字符串型
                 *                                      '1','true','on','yes'返回true，其他返回false
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                static switchState(sw) {
                        switch(typeof sw) {
                                case 'number' : {
                                        return sw === 1;
                                }
                                case 'boolean' : {
                                        return sw;
                                }
                                case 'string' : {
                                        sw = sw.toLowerCase();
                                        return sw == '1' || sw == 'true' || sw == 'yes' || sw == 'on';
                                }
                        }
                        return false;
                }

                /*字符串转hexString
                 */
                static  stringToHex(str, encoding){
                        var buf = new Buffer(str);
                        if(encoding) {
                                var converter = new Iconv('utf8', encoding);
                                buf = converter.convert(buf);
                        }
                        return buf.toString('hex');
                }

                /**
                 * 是否为局域网IP，局域网IP包括：192网段，172网段和10网段，127本地地址也视为局域网地址
                 *
                 * @method isIntranet
                 * @param {String} ip IP地址
                 * @return {boolean} 是否为局域网IP地址
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                static isIntranet(ip) {
                        if(ip) {
                                return ip.match(/^[172|192|127|10].*$/);
                        }
                        return false;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = StringUtil;
})();