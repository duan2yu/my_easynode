var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var Binary = using('easynode.framework.util.Binary');
var StringUtil = using('easynode.framework.util.StringUtil');

(function () {
        const SHOW_DETAIL_ENCODE_DECODE_INFO = StringUtil.switchState(EasyNode.config('easynode.servers.tcpServer.encoder-decoder.showDetailInfo', '1'));
        /**
         * Class StreamDecoderHelper
         *
         * @class easynode.framework.server.tcp.StreamDecoderHelper
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class StreamDecoderHelper extends GenericObject {
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
                 * @method decodeByStructDescription
                 * @param {Buffer} buf 输入Buffer，IN | OUT，正确解析时输入Buffer将被”消费“相应消息内容。
                 * @param {int} bufLen 输入Buffer的长度, in bytes
                 * @param {Array} struct 报文结构描述，字符串数组。
                 * @param {Object} dynamic 动态参数处理函数容器
                 * @param {String} endian 字节序：BE/LE。BE->big endian, LE->little endian
                 * @param {Iconv} encodingConverter 字符集转换器，如果为null则视为utf8字符集，否则请传递iconv字符集转换实例new Iconv('src', 'dest')
                 * @param {Object} validator 报文验证器，具有一个成员：validate : function(msg) {return true/false;}，如果验证失败，本函数将返回truncated Buffer
                 * @return {Object} 返回正确解析的消息结构、偏移量（消息总字节数），正确解析时输入Buffer将被”消费“相应消息内容。
                 * @static
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                static decodeByStructDescription(buf, bufLen, struct, dynamic = {}, endian='BE', encodingConverter = null, validator = {
                        validate: function (msg) {
                                return true;
                        }
                }) {
                        if (!buf || bufLen == 0 || !struct) {
                                return null;
                        }

                        var msg = {};
                        var offset = 0;
                        const DECODE_FAIL = -1;
                        var dynamicLengthRegExp = /^LENGTH\(\$(.*)\)$/;

                        function __setField(name, val) {
                                if (msg[name] !== undefined) {
                                        logger.warn(`Duplicated field name [${name}]`);
                                }
                                msg[name] = val;
                        }

                        function __recursiveDecode(buf, bufLen, struct, dynamic = {}, endian = 'BE', encodingConverter = null) {
                                for (var loop = 0; loop < struct.length; loop++) {
                                        var field = struct[loop];
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
                                                exp = '' + exp; //convert to string
                                        }
                                        if (name == '$dynamic') {
                                                var subStruct = dynamic[type].call(null, msg);
                                                if (__recursiveDecode(buf, bufLen, subStruct, dynamic, endian, encodingConverter) < 0) {
                                                        return DECODE_FAIL;
                                                }
                                        }
                                        else {
                                                //EasyNode.DEBUG && logger.debug(`read [${name}] -> [${type}(${exp})] -> offset[${offset}]`);
                                                switch (type.toUpperCase()) {
                                                        //example: fieldName:STRING:5
                                                        //example: fieldName:STRING:$lenFieldName   //TODO
                                                        case 'STRING':
                                                        {
                                                                var len = parseInt(exp);
                                                                if (offset + len > bufLen) {
                                                                        return DECODE_FAIL;
                                                                }
                                                                var tempBuf = new Buffer(len);
                                                                for (var i = 0; i < len; i++) {
                                                                        tempBuf.writeUInt8(buf.readUInt8(offset++), i);
                                                                }
                                                                if (encodingConverter) {
                                                                        var tempS = encodingConverter.convert(tempBuf).toString();
                                                                        tempS = tempS.replace(/\u0000.*$/, '');                                         //截断C字符串终止符\0
                                                                        __setField(name, tempS);
                                                                }
                                                                else {
                                                                        var tempS = tempBuf.toString('utf8');
                                                                        tempS = tempS.replace(/\u0000.*$/, '');                                         //截断C字符串终止符\0
                                                                        __setField(name, tempS);
                                                                }
                                                                break;
                                                        }
                                                        //example: fieldName:BYTE
                                                        case 'BYTE':
                                                        {
                                                                var len = 1;
                                                                if (offset + len > bufLen) {
                                                                        return DECODE_FAIL;
                                                                }
                                                                __setField(name, buf.readUInt8(offset++));
                                                                break;
                                                        }
                                                        //example: fieldName:BYTES:10
                                                        //example: fieldName:BYTES:$lenFieldName        //TODO
                                                        case 'BYTES':
                                                        {
                                                                var len = parseInt(exp);
                                                                if (offset + len > bufLen) {
                                                                        return DECODE_FAIL;
                                                                }
                                                                var arr = [];
                                                                for (var i = 0; i < len; i++) {
                                                                        arr.push(buf.readUInt8(offset++));
                                                                }
                                                                __setField(name, arr);
                                                                break;
                                                        }
                                                        //example: fieldName:BIT:BIT($sourceFieldName,5,3)  bit 5 6 7
                                                        //example: fieldName:BIT:BIT($sourceFieldName,5)     bit 5
                                                        case 'BIT' :
                                                        {
                                                                var bitRegExp = /^BIT\(\$(\w+)\,(\d+)\,?(\d*)\)$/;
                                                                var arr = bitRegExp.exec(exp);
                                                                if (!arr) {
                                                                        throw new Error(`Invalid bit field expression [${exp}], BIT($fieldName,pos[,len])`);
                                                                }
                                                                var fieldName = arr[1];
                                                                var bitPos = parseInt(arr[2]);
                                                                var bitLen = parseInt(arr[3] || '1');
                                                                var fieldVal = msg[fieldName];
                                                                if (fieldVal === undefined) {
                                                                        throw new Error(`Invalid sequence of field definition, BIT source is not found [$${fieldName}]`);
                                                                }
                                                                fieldVal = fieldVal || 0;
                                                                __setField(name, Binary.bits(fieldVal, bitPos, bitPos + bitLen - 1));
                                                                break;
                                                        }
                                                        //example: fieldName:WORD
                                                        case 'WORD':
                                                        {
                                                                var len = 2;
                                                                if (offset + len > bufLen) {
                                                                        return DECODE_FAIL;
                                                                }
                                                                if (endian != 'LE') {
                                                                        __setField(name, buf.readUInt16BE(offset));
                                                                }
                                                                else {
                                                                        __setField(name, buf.readUInt16LE(offset));
                                                                }
                                                                offset += 2;
                                                                break;
                                                        }
                                                        //example: fieldName:DWORD
                                                        case 'DWORD':
                                                        {
                                                                var len = 4;
                                                                if (offset + len > bufLen) {
                                                                        return DECODE_FAIL;
                                                                }
                                                                if (endian != 'LE') {
                                                                        __setField(name, buf.readUInt32BE(offset));
                                                                }
                                                                else {
                                                                        __setField(name, buf.readUInt32LE(offset));
                                                                }
                                                                offset += 4;
                                                                break;
                                                        }
                                                        //example: fieldName:OBJECT:com.xxx.xxx.xxx.xxx(inherits from easynode.framework.server.tcp.SerializableObject)
                                                        case 'OBJECT' :
                                                        {
                                                                var SerializeObjectClass = using(exp);
                                                                var o = new SerializeObjectClass();
                                                                var subStruct = o.getObjectStructure(msg);
                                                                var objFieldNames = [];
                                                                for(var i = 0;i<subStruct.length;i++) {
                                                                        var [f1,f2,f3] = subStruct[i].split(':');
                                                                        objFieldNames.push(f1);
                                                                }
                                                                if (__recursiveDecode(buf, bufLen, subStruct, dynamic, endian, encodingConverter) < 0) {
                                                                        return DECODE_FAIL;
                                                                }
                                                                var fieldVal = {};
                                                                for(var i = 0;i<objFieldNames.length;i++) {
                                                                        fieldVal[objFieldNames[i]] = msg[objFieldNames[i]];
                                                                        delete msg[objFieldNames[i]];
                                                                }
                                                                msg[name] = fieldVal;
                                                                break;
                                                        }
                                                        default :
                                                        {
                                                                //example: fieldName:OBJECTS($numFieldName):com.xxx.xxx.xxx.xxx(inherits from easynode.framework.server.tcp.SerializableObject)
                                                                var objectsRegExp = /^OBJECTS\(\$(\w+)\)$/;
                                                                if(objectsRegExp.test(type)) {
                                                                        var objectLenArr = objectsRegExp.exec(type);
                                                                        var varNum = msg[objectsRegExp[1]];
                                                                        var SerializeObjectClass = using(exp);
                                                                        var o = new SerializeObjectClass();
                                                                        var subStruct = o.getObjectStructure(msg);
                                                                        var objFieldNames = [];
                                                                        for(var i = 0;i<subStruct.length;i++) {
                                                                                var [f1,f2,f3] = subStruct[i].split(':');
                                                                                objFieldNames.push(f1);
                                                                        }
                                                                        var fieldVal = [];
                                                                        for(var i = 0;i<varNum;i++) {
                                                                                var tempVal = {};
                                                                                if (__recursiveDecode(buf, bufLen, subStruct, dynamic, endian, encodingConverter) < 0) {
                                                                                        return DECODE_FAIL;
                                                                                }
                                                                                for(var j = 0;j<objFieldNames.length;j++) {
                                                                                        tempVal[objFieldNames[j]] = msg[objFieldNames[j]];
                                                                                        delete msg[objFieldNames[j]];
                                                                                }
                                                                                fieldVal.push(tempVal);
                                                                        }
                                                                        msg[name] = fieldVal;
                                                                }
                                                                else {
                                                                        throw new Error(`Unknown type [${type}] of field [${name}]`);
                                                                }
                                                        }
                                                }
                                        }
                                }
                                return offset;
                        }

                        var ret = __recursiveDecode(buf, bufLen, struct, dynamic, endian, encodingConverter);
                        if (ret > 0) {
                                msg.__original__ = buf.slice(0, offset).toString('hex');
                                if (validator.validate(msg)) {
                                        //buf.copy(buf, 0, offset, bufLen - offset);                    //nodejs bug，重复地址的copy会出问题
                                        var _buf = new Buffer(bufLen - offset);
                                        buf.copy(_buf, 0, offset, bufLen);
                                        _buf.copy(buf);
                                        buf.fill(0, bufLen - offset);
                                        return {
                                                msg: msg,
                                                offset: offset
                                        };
                                }
                                else {
                                        //clear received buffer
                                        logger.warn('bad package, received buffer will be truncated -> ' + msg.__original__);
                                        buf.fill(0);
                                        return {
                                                msg: null,
                                                offset: bufLen,
                                                badPackage : true
                                        };
                                }
                        }
                        else {
                                EasyNode.DEBUG && logger.debug('waiting next package...');
                        }
                        return null;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = StreamDecoderHelper;
})();