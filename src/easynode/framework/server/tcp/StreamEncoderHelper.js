var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var Binary = using('easynode.framework.util.Binary');
var util = require('util');
var _ = require('underscore');
var StringUtil = using('easynode.framework.util.StringUtil');

(function () {
        const SHOW_DETAIL_ENCODE_DECODE_INFO = StringUtil.switchState(EasyNode.config('easynode.servers.tcpServer.encoder-decoder.showDetailInfo', '1'));
        /**
         * Class StreamEncoderHelper
         *
         * @class easynode.framework.server.tcp.StreamEncoderHelper
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class StreamEncoderHelper extends GenericObject {
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
                 * 根据字符串描述的报文结构解析报文。
                 *
                 * @method encodeByStructDescription
                 * @static
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                static encodeByStructDescription(msg, struct, dynamic={}, endian='BE', encodingConverter=null) {
                        if(!msg || struct.length == 0) {
                                return new Buffer(0);
                        }

                        var arr = [];
                        var dynamicLengthRegExp = /^LENGTH\(\$(.*)\)$/;
                        var length = 0;
                        //计算BIT值。
                        function __calculateBits(s) {
                                for(var i = 0;i<s.length;i++) {
                                        var field = s[i];
                                        var [name, type, exp] = field.split(':');
                                        name = S(name).trim().toString();
                                        type = S(type).trim().toString();
                                        exp = exp || '';
                                        exp = S(exp).trim().toString();
                                        if(name == '$dynamic') {
                                                var subStruct = dynamic[type].call(null, msg);
                                                __calculateBits(subStruct);
                                        }
                                        else {
                                                switch (type.toUpperCase()) {
                                                        case 'BIT' :
                                                        {
                                                                var bitRegExp = /^BIT\(\$(\w+)\,(\d+)\,?(\d*)\)$/;
                                                                var arr = bitRegExp.exec(exp);
                                                                if(!arr) {
                                                                        throw new Error(`Invalid bit field expression [${exp}], BIT($fieldName,pos[,len])`);
                                                                }
                                                                var fieldName = arr[1];
                                                                var bitPos = parseInt(arr[2]);
                                                                var bitLen = parseInt(arr[3] || '1');
                                                                if(msg[fieldName] === undefined) {
                                                                        msg[fieldName] = 0;
                                                                }
                                                                var fieldVal = msg[fieldName];
                                                                var val = msg[name] || 0;
                                                                assert(typeof fieldVal == 'number', `Invalid field type number -> [${fieldName}]`);
                                                                assert(typeof val == 'number', `Invalid field type number -> [${name}]`);
                                                                msg[fieldName] = Binary.bitSets(fieldVal, bitPos, bitPos + bitLen, val);
                                                                break;
                                                        }
                                                }
                                        }
                                }
                        }

                        function __encodeStruct(s) {
                                for(var loop = 0;loop<s.length;loop++) {
                                        var field = s[loop];
                                        EasyNode.DEBUG && SHOW_DETAIL_ENCODE_DECODE_INFO && logger.debug('encoding field -> ' + field);
                                        var [name, type, exp] = field.split(':');
                                        name = S(name).trim().toString();
                                        type = S(type).trim().toString();
                                        exp = exp || '';
                                        exp = S(exp).trim().toString();
                                        if(dynamicLengthRegExp.test(exp)) {
                                                var _referField = dynamicLengthRegExp.exec(exp)[1];
                                                exp = msg[_referField];
                                                if(exp == null) {
                                                        throw new Error(`Invalid struct definition, field [${_referField}] is not found`);
                                                }
                                                exp = '' + exp;         //convert to string
                                        }
                                        if(name == '$dynamic') {
                                                var subStruct = dynamic[type].call(null, msg);
                                                __encodeStruct(subStruct);
                                        }
                                        else {
                                                switch (type.toUpperCase()) {
                                                        case 'STRING':
                                                        {
                                                                var len = parseInt(exp);
                                                                length += len;
                                                                var val = msg[name] || '';
                                                                assert(typeof val == 'string', `Invalid field type string -> [${name}]`);
                                                                var tempBuf = new Buffer(len);
                                                                tempBuf.fill(0);
                                                                if(encodingConverter) {
                                                                        var _buf = encodingConverter.convert(val);
                                                                        _buf.copy(tempBuf);
                                                                }
                                                                else {
                                                                        tempBuf.write(val);
                                                                }
                                                                Binary.writeBuffer2Array(tempBuf, len, arr);
                                                                break;
                                                        }
                                                        case 'BYTE':
                                                        {
                                                                var val = msg[name] || 0;
                                                                length += 1;
                                                                assert(typeof val == 'number', `Invalid field type number -> [${name}]`);
                                                                var tempBuf = new Buffer(1);
                                                                tempBuf.writeUInt8(val);
                                                                Binary.writeBuffer2Array(tempBuf, 1, arr);
                                                                break;
                                                        }
                                                        case 'BYTES':
                                                        {
                                                                var len = parseInt(exp);
                                                                length += len;
                                                                var val = msg[name] || [];
                                                                assert(_.isArray(val), `Invalid field type array -> [${name}]`);
                                                                var tempBuf = new Buffer(len);
                                                                tempBuf.fill(0);
                                                                var dataBuf = new Buffer(val);
                                                                dataBuf.copy(tempBuf);
                                                                Binary.writeBuffer2Array(tempBuf, len, arr);
                                                                break;
                                                        }
                                                        case 'BIT' :
                                                        {
                                                                break;
                                                        }
                                                        case 'WORD':
                                                        {
                                                                var val = msg[name] || 0;
                                                                length += 2;
                                                                assert(typeof val == 'number', `Invalid field type number -> [${name}]`);
                                                                var tempBuf = new Buffer(2);
                                                                if(endian != 'LE') {
                                                                        tempBuf.writeUInt16BE(val);
                                                                }
                                                                else {
                                                                        tempBuf.writeUInt16LE(val);
                                                                }
                                                                Binary.writeBuffer2Array(tempBuf, 2, arr);
                                                                break;
                                                        }
                                                        case 'DWORD':
                                                        {
                                                                var val = msg[name] || 0;
                                                                length += 4;
                                                                assert(typeof val == 'number', `Invalid field type number -> [${name}]`);
                                                                var tempBuf = new Buffer(4);
                                                                if(endian != 'LE') {
                                                                        tempBuf.writeUInt32BE(val);
                                                                }
                                                                else {
                                                                        tempBuf.writeUInt32LE(val);
                                                                }
                                                                Binary.writeBuffer2Array(tempBuf, 4, arr);
                                                                break;
                                                        }
                                                        case 'OBJECT':
                                                        {
                                                                var val = msg[name];
                                                                var SerializeObjectClass = using(exp);
                                                                var o = new SerializeObjectClass();
                                                                var subStruct = o.getObjectStructure(msg);
                                                                var objFieldNames = [];
                                                                for(var i = 0;i<subStruct.length;i++) {
                                                                        var [f1,f2,f3] = subStruct[i].split(':');
                                                                        objFieldNames.push(f1);
                                                                        msg[f1] = val[f1];                                                              //设置成msg的临时成员
                                                                }
                                                                __calculateBits(subStruct);
                                                                __encodeStruct(subStruct);
                                                                for(var i = 0;i<objFieldNames.length;i++) {
                                                                        delete msg[objFieldNames[i]];                                     //删除msg的临时成员
                                                                }
                                                                break;
                                                        }
                                                        default :
                                                        {
                                                                var objectsRegExp = /^OBJECTS\(\$(\w+)\)$/;
                                                                if(objectsRegExp.test(type)) {
                                                                        var val = msg[name];
                                                                        if(!_.isArray(val)) {
                                                                                logger.error('Invalid message data, OBJECTS field expect data type -> Array');
                                                                        }
                                                                        var objectLenArr = objectsRegExp.exec(type);
                                                                        var varNum = val.length;
                                                                        if(varNum !== msg[objectLenArr[1]]) {
                                                                                throw new Error('Invalid objects length ['+varNum+'] -> expect : ['+objectLenArr[1]+']');
                                                                        }
                                                                        var SerializeObjectClass = using(exp);
                                                                        var o = new SerializeObjectClass();
                                                                        var subStruct = o.getObjectStructure(msg);
                                                                        var objFieldNames = [];
                                                                        for(var i = 0;i<subStruct.length;i++) {
                                                                                var [f1,f2,f3] = subStruct[i].split(':');
                                                                                objFieldNames.push(f1);
                                                                        }
                                                                        for(var i = 0;i<varNum;i++) {
                                                                                var tempFieldVal = val[i];
                                                                                for(var j = 0;j<objFieldNames.length;j++) {
                                                                                        msg[objFieldNames[j]] = tempFieldVal[objFieldNames[j]];         //设置成msg的临时成员
                                                                                }
                                                                                __calculateBits(subStruct);
                                                                                __encodeStruct(subStruct);
                                                                                for(var j = 0;j<objFieldNames.length;j++) {
                                                                                        delete msg[objFieldNames[j]];                                                    //删除msg的临时成员
                                                                                }
                                                                        }
                                                                }
                                                                else {
                                                                        throw new Error(`Unknown type [${type}] of field [${name}]`);
                                                                }
                                                        }
                                                }

                                        }
                                }
                        }

                        __calculateBits(struct);
                        __encodeStruct(struct);
                        return new Buffer(arr);
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = StreamEncoderHelper;
})();