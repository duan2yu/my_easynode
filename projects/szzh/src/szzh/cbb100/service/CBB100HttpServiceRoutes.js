var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var thunkify = require('thunkify');

(function () {
        /**
         * Class CBB100HttpServiceRoutes
         *
         * @class szzh.cbb100.service.CBB100HttpServiceRoutes
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CBB100HttpServiceRoutes extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 1.0.0
                 * @author zlbbq
                 * */
                constructor() {
                        super();
                        //调用super()后再定义子类成员。
                }

                static defineRoutes(httpServer, tcpServer) {
                        CBB100HttpServiceRoutes.addRoute_control(httpServer, tcpServer);
                        //EasyNode.DEBUG && CBB100HttpServiceRoutes.addRoute_send(httpServer, tcpServer);
                }

                static addRoute_control(httpServer, tcpServer) {
                        const CONTROL_TIMEOUT = S(EasyNode.config('http.server.services.control.timeout', '5000')).toInt();
                        const RESULT_CODE_DEVICE_NOT_FOUND = -1;
                        const RESULT_CODE_IMEI_ERROR = -2;
                        const RESULT_CODE_CMD_ERROR = -3;
                        const RESULT_CODE_TIMEOUT = -4;
                        const RESULT_CODE_NO_CONTROL = -5;
                        httpServer.addRoute('get', EasyNode.config('http.server.services.control.URI', '/control'), function * () {
                                var IMEI = this.parameter.param('IMEI') || '';
                                var cmd = this.parameter.intParam('cmd', 'all', false);
                                var ret = {
                                        code : RESULT_CODE_NO_CONTROL
                                };
                                var controlFlag = true;

                                if (controlFlag && (IMEI.length != 15)) {
                                        ret.code = RESULT_CODE_IMEI_ERROR;
                                        controlFlag = false;
                                }

                                //指令只能是0-19
                                if (controlFlag && (cmd < 0 || cmd > 19)) {
                                        ret.code = RESULT_CODE_CMD_ERROR;
                                        controlFlag = false;
                                }

                                if (controlFlag) {
                                        var client = tcpServer.getClientByAlias(IMEI);
                                        if (!client) {
                                                ret.code = RESULT_CODE_DEVICE_NOT_FOUND;                                                         //Device is offline
                                        }
                                        else {
                                                var CBB100Message = using('szzh.cbb100.protocol.messages.CBB100Message');
                                                var msg = CBB100Message.createMessageById(0x820E).notation(client);
                                                msg['controlType'] = cmd;
                                                msg['modeLevel'] = 1;                             //模式级别，1 - 100??
                                                client.getSocket().encodeAndSend(msg, client);
                                                var fnOnce = thunkify(client.once);
                                                var ackMsg = null;
                                                setTimeout(function () {
                                                        if (ackMsg == null) {
                                                                client.trigger('msg-handle-able-0x020E', null, 'TIMEOUT');                      //超时响应
                                                        }
                                                }, CONTROL_TIMEOUT);
                                                ackMsg = yield fnOnce.call(client, 'msg-handle-able-0x020E');
                                                if (ackMsg == 'TIMEOUT') {
                                                        ret.code = RESULT_CODE_TIMEOUT;
                                                }
                                                else {
                                                        //logger.error(JSON.stringify(ackMsg));
                                                        ret.code = ackMsg['controlResult'];
                                                        ret.msg = '指令执行完成(0：成功/确认；1：失败；2：消息有误；3：不支持)';
                                                }
                                        }
                                }
                                switch (ret.code) {
                                        case RESULT_CODE_DEVICE_NOT_FOUND :
                                        {
                                                ret.msg = '终端设备未登录';
                                                break;
                                        }
                                        case RESULT_CODE_IMEI_ERROR :
                                        {
                                                ret.msg = '错误的IMEI编号，必须为15位字符串';
                                                break;
                                        }
                                        case RESULT_CODE_CMD_ERROR :
                                        {
                                                ret.msg = '错误的控制码，只支持2-9';
                                                break;
                                        }
                                        case RESULT_CODE_TIMEOUT :
                                        {
                                                ret.msg = '终端设备响应超时';
                                                break;
                                        }
                                        case RESULT_CODE_NO_CONTROL :
                                        {
                                                ret.msg = '指令不能成功执行';
                                                break;
                                        }
                                }
                                this.type = 'json';
                                this.body = ret;
                        });
                }

                static addRoute_send(httpServer, tcpServer) {
                        httpServer.addRoute('get', '/send', function * () {
                                var IMEI = this.parameter.param('IMEI') || '355334050097660';
                                var hex = this.parameter.param('hex');
                                var ret = {};
                                var client = tcpServer.getClientByAlias(IMEI);
                                if(!client) {
                                        ret.msg = '没有找到终端';
                                }
                                else {
                                        var buf = new Buffer(hex, 'hex');
                                        //修改帧长度
                                        buf.writeUInt16LE(buf.length - 4, 1);
                                        //修改和校验码
                                        var bytesSum = 0;
                                        for(var i = 5;i<buf.length - 1;i++) {
                                                bytesSum += buf.readUInt8(i);
                                        }
                                        bytesSum = bytesSum & 0xFFFF;
                                        buf.writeUInt16LE(bytesSum, 3);
                                        client.getSocket().write(buf.toString('hex'), 'hex');
                                        ret.msg = '消息已发送';
                                }
                                this.type = 'json';
                                this.body = ret;
                        });
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CBB100HttpServiceRoutes;
})();