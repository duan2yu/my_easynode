var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var CCMS3AbstractHandler = using('beneverse.ccms.terminal.connector.v20.handlers.CCMS3AbstractHandler');
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var S = require('string');
const timeout = parseInt(EasyNode.config('service.terminalLogin.timeout', '5000'));
const login_url = EasyNode.config('service.terminalLogin.URL','http://192.168.0.16:5000/action/device/query-intranet')
const method = EasyNode.config('service.terminalLogin.httpMethod', 'GET');

(function () {
        /**
         * Class CCMS3Handler0x000A0800
         *
         * @class beneverse.ccms.terminal.connector.v20.handlers.CCMS3Handler0x000A0800
         * @extends beneverse.ccms.terminal.connector.v20.handlers.CCMS3AbstractHandler
         * @since 0.1.0
         * @author duansj
         * */
        class CCMS3Handler0x000A0800 extends CCMS3AbstractHandler {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(client, server) {
                        super(client, server);
                        //调用super()后再定义子类成员。
                }

                //处理消息, 这里的msg是processMessage处理过的消息
                handleMessage(msg) {
                        var me = this;
                        return function * () {
                                var ret=yield me.terminalLogin(msg.tid);
                                if(ret.code!=0)  //登录失败
                                {
                                        me.server.disconnect(me.client.socket.SOCKET_ID,ret.msg);
                                }
                                else
                                me.server.setClientAlias(msg.tid,me.client);
                             //  var message = new CCMS3Message(0x00050200);
                             //   var ackMessage = message.ackNotation(msg, me.client);
                                return null;
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }


                 terminalLogin(tid) {
                        /* {"code":1,"data":{"tid":"12345678","sessionId":"1e063853-178a-4133-a296-15629750510b","online":1},"msg":"登录成功"}
                        code
                                 0：表示登录成功；
                        data  终端登录信息
                        msg
                         * */
                        var me = this;
                        return function * () {
                                EasyNode.DEBUG && logger.debug(`device login service URL -> ` + login_url);
                                var loginArgs = {
                                        tid: tid
                                };
                                EasyNode.DEBUG && logger.debug('request device login -> ' + JSON.stringify(loginArgs));
                                var ret = yield HTTPUtil.getJSON(login_url, timeout, method, loginArgs);
                                EasyNode.DEBUG && logger.debug(`received from CCMS3 service : ` + JSON.stringify(ret));
                                return ret;
                        };
                }
        }

        module.exports = CCMS3Handler0x000A0800;
})();