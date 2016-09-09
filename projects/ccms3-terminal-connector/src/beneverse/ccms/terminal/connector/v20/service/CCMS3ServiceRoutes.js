var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var S = require('string');
var _ = require('underscore');
var thunkify = require('thunkify');
var BeanFactory = using('easynode.framework.BeanFactory');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');
var CCMS3Message = using('beneverse.ccms.terminal.connector.v20.messages.CCMS3Message');
var StringUtil = using('easynode.framework.util.StringUtil');
var DeviceConfigParser=using('beneverse.ccms.terminal.connector.v20.util.DeviceConfigParser');
var Iconv=require('iconv').Iconv;
(function () {
        const UTF82GBK = new Iconv('utf8', 'gbk');
        const timeout = parseInt(EasyNode.config('service.terminalLogin.timeout', '5000'));
        const login_url = EasyNode.config('service.terminalLogin.URL','http://192.168.0.16:5000/action/device/query-intranet')
        const method = EasyNode.config('service.terminalLogin.httpMethod', 'GET');

        const CONTROL_TIMEOUT = S(EasyNode.config('http.server.services.control.timeout', '10000')).toInt();
        const DEFAULT_ADMINPWD = EasyNode.config('http.server.services.control.adminPwd', 'ccmsadmin123');
        const RESULT_CODE_SUCCESS = 0;
        const RESULT_CODE_DEVICE_NOT_FOUND = -1;
        const RESULT_CODE_TID_ERROR = -2;
        const RESULT_CODE_CMD_ERROR = -3;
        const RESULT_CODE_TIMEOUT = -4;
        const RESULT_CODE_NO_CONTROL = -5;
        const  RESULT_CODE_CMD_NOT_ALLOW=-6;
        const CCMS3_DOWNLINK_CMD='00010400';
        const CCMS3_DOWNLINK_ENDFLAG='ODOA';
        const FORBIDEN_CMD=["AT$FRIEND","AT$MDMID"];
        const NO_RESPONSE_CMD=["AT$RESET"];

//同步配置的结果编码
        const RESULT_CODE_DB_PARAM_FAILED= -7;
        const RESULT_CODE_TERMINAL_PARAM_FAILED = -8;
        const RESULT_CODE_NO_CONF = -9;


        const QUERY_TERMINAL_CMD='AT&VE1';

        const DISABLE_TH='-9999';

        /**
         * Class CCMS3ServiceRoutes
         *
         * @class beneverse.ccms.terminal.connector.v20.service.CCMS3ServiceRoutes
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3ServiceRoutes extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 1.0.0
                 * @author duansj
                 * */
                constructor() {
                        super();
                        //调用super()后再定义子类成员。
                }

                static __getFullResult(ret)
                {
                        switch (ret.code) {
                                case RESULT_CODE_DEVICE_NOT_FOUND :
                                {
                                        ret.msg = '终端设备未登录';
                                        break;
                                }
                                case RESULT_CODE_TID_ERROR :
                                {
                                        ret.msg = '错误的终端编号，必须为8位字符串';
                                        break;
                                }
                                case RESULT_CODE_CMD_ERROR :
                                {
                                        ret.msg = '指令集错误';
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
                                case RESULT_CODE_SUCCESS :
                                {
                                        ret.msg = '指令执行完成';
                                        break;
                                }
                                case RESULT_CODE_CMD_NOT_ALLOW :
                                {
                                        ret.msg = '禁止下发的指令';
                                        break;
                                }
                                case RESULT_CODE_DB_PARAM_FAILED :
                                {
                                        ret.msg = '获取数据库终端配置失败';
                                        break;
                                }
                                case RESULT_CODE_TERMINAL_PARAM_FAILED :
                                {
                                        ret.msg = '获取终端参数失败';
                                        break;
                                }
                                case RESULT_CODE_NO_CONF :
                                {
                                        ret.msg = '没有需要同步的参数';
                                        break;
                                }
                        }

                        return ret;
                }

                static __getSendCMDS(real,db)
                {
                        var cmds=['AT$AREG=0'];
                        var realCmds=DeviceConfigParser.parse(real);
                        //    real:"AT$FRIEND=1,\"101.69.246.230\",10089;AT$EVTIM1=30;AT$MDMID=15121061;AT$GPSOSI=40;AT$EVENT=15,0,1,0;AT$EVENT=15,0,2,0;AT$WAKEUP=0,255;AT$CHANNELS=2;AT$TRS=1,2,10;AT$TRS=2,2,10;AT$HRS=1,35,75;AT$HRS=2,35,75;AT$THA=1,0.0,0;AT$THA=2,-1.0,0;AT$EVTIM8=5;AT$EVTIM9=30;AT&PTH=\"北京科特威电子技术有限公司\",\"京A12389\";AT$HDS=1,0,74;AT$HDS=2,0,74;AT$VERSION=2."//
                        //db:configuration":{"channels":2,"corp":"浙江泽物信息科技有限公司","alarmReceipts":"18658187318,18658187308","showHum":1,"tempAdjustment1":0,"humAdjustment1":0,"tempAdjustment2":0,"humAdjustment2":0,"tempRange1":"2,8","humRange1":",","tempRange2":"2,8","humRange2":",","channelName1":"第1路","channelName2":"第2路"}}
                        var channels=db.configuration.channels;
                        var corp=db.configuration.corp;
                        var vehicleNum=db.deviceName;

//温湿度路数
                        var key='AT$CHANNELS';
                        if(channels!=realCmds[key])
                        {
                                cmds.push(`${key}=${channels}`);
                        }
//打印标题
                        key='AT&PTH';
                        var realPath='"'+corp+'","'+vehicleNum+'"';
                        if(realPath!=realCmds[key])
                        {
                                cmds.push(`${key}=${realPath}`);
                        }


                       channels=S(channels).trim().toInt();
                        for(var i=1;i<=channels;i++)
                        {
                                key='AT$THA';
                                var temp=realCmds[key][i-1];
                                var realTHA=i+','+db.configuration['tempAdjustment'+i].toFixed(1)+','+db.configuration['humAdjustment'+i]
                                if(!temp||temp!=realTHA)
                                {
                                        cmds.push(`${key}=${realTHA}`);
                                }


                                key='AT$TRS';
                                temp=realCmds[key][i-1];
                                var conf=db.configuration['tempRange'+i]||',';
                                conf=conf.split(',');
                                if(conf.length==2)
                                {
                                        if(S(conf[0]).isEmpty()) conf[0]=DISABLE_TH;
                                        if(S(conf[1]).isEmpty()) conf[1]=DISABLE_TH;
                                        conf=conf.join(',');
                                }
                                else
                                        conf=DISABLE_TH+","+DISABLE_TH;

                                var realTRS=i+','+conf;
                                if((!temp||temp!=realTRS))
                                {
                                        cmds.push(`${key}=${realTRS}`);
                                }

                                key='AT$HRS';
                                temp=realCmds[key][i-1];
                                conf=db.configuration['humRange'+i]||',';
                                conf=conf.split(',');
                                if(conf.length==2)
                                {
                                        if(S(conf[0]).isEmpty()) conf[0]=DISABLE_TH;
                                        if(S(conf[1]).isEmpty()) conf[1]=DISABLE_TH;
                                        conf=conf.join(',');
                                }
                                else
                                        conf=DISABLE_TH+","+DISABLE_TH;

                                var realHRS=i+','+conf;
                                if((!temp||temp!=realHRS))
                                {
                                        cmds.push(`${key}=${realHRS}`);
                                }
                        }

                        cmds.push('AT&w');
                        cmds.push('AT$RESET');


                        if(cmds.length>3) return cmds;
                        return [];
                }

                static sendToTerminal(httpServer,tcpServer,tid,cmd,pwd)
                {
                        return function *()
                        {
                                               var NO_RESPONSE_CMDHEX=[];
                                                var ret = {
                                                        code : RESULT_CODE_NO_CONTROL,
                                                        stepResults : []
                                                };
                                                var controlFlag = true;

                                                if (controlFlag &&(!tid|| (tid.length != 8))) {
                                                        ret.code = RESULT_CODE_TID_ERROR;
                                                        controlFlag = false;
                                                }

                                                if(controlFlag && (!cmd|| (cmd.length <0)))
                                                {
                                                        ret.code = RESULT_CODE_CMD_ERROR;
                                                        controlFlag = false;
                                                }

                                                if(controlFlag)
                                                {
                                                        cmd=cmd.split(';');
                                                        for(var i=0;i<cmd.length;i++)
                                                        {
                                                                if(!cmd[i]||cmd[i].length==0)
                                                                {
                                                                        ret.code = RESULT_CODE_CMD_ERROR;
                                                                        controlFlag = false;
                                                                        break;
                                                                }
                                                                var isForbiden=false;
                                                                for(var j=0;j<FORBIDEN_CMD.length;j++)
                                                                {
                                                                        if(cmd[i].indexOf(FORBIDEN_CMD[j])>=0)
                                                                        {
                                                                                isForbiden=true;
                                                                                break;
                                                                        }
                                                                }
                                                                if(!isForbiden||pwd==DEFAULT_ADMINPWD) {
                                                                        var b=NO_RESPONSE_CMD.indexOf(cmd[i])>=0;
                                                                        var cmdHex = StringUtil.stringToHex(cmd[i], 'gbk');
                                                                        var lengthHex = StringUtil.short2Hex(cmdHex.length / 2 + 8);
                                                                        cmd[i] = lengthHex + CCMS3_DOWNLINK_CMD + cmdHex + CCMS3_DOWNLINK_ENDFLAG;
                                                                        if(b)//如果是没有响应的消息，记录下消息hexString
                                                                        {
                                                                                NO_RESPONSE_CMDHEX.push(cmd[i]);
                                                                        }

                                                                }
                                                                else
                                                                {
                                                                        ret.code = RESULT_CODE_CMD_NOT_ALLOW;
                                                                        controlFlag = false;
                                                                        break;
                                                                }
                                                        }
                                                }
                                                if(controlFlag) {
                                                        var client = tcpServer.getClientByAlias(tid);
                                                        if(!client)
                                                        {
                                                                ret.code = RESULT_CODE_DEVICE_NOT_FOUND;
                                                        }
                                                        else {
                                                                for (var i = 0; i < cmd.length; i++) {
                                                                        // var msg =CCMS3Message.createMessageById(0x00010400).notation(client);
                                                                        //var buff=new Buffer(cmd[i],'hex');
                                                                        //var tempS = UTF82GBK.convert(buff);
                                                                        client.getSocket().write(cmd[i],'hex');
                                                                        EasyNode.DEBUG && logger.debug('send control msg to client [' + tid + '],hex ['+cmd[i]+']');
                                                                        var fnOnce = thunkify(client.once);
                                                                        if(NO_RESPONSE_CMDHEX.indexOf(cmd[i])>=0) {
                                                                                ret.stepResults.push('CMD_NORESPONSE');
                                                                                if(i==cmd.length-1)
                                                                                {
                                                                                        ret.code=RESULT_CODE_SUCCESS;
                                                                                }
                                                                                continue;
                                                                        }
                                                                        var ackMsg = null;
                                                                        setTimeout(function () {
                                                                                if (ackMsg == null) {
                                                                                        client.trigger('msg-handle-able-0x00010500', null, 'TIMEOUT');                      //超时响应
                                                                                }
                                                                        }, CONTROL_TIMEOUT);
                                                                        ackMsg = yield fnOnce.call(client, 'msg-handle-able-0x00010500');
                                                                        if (ackMsg == 'TIMEOUT') {
                                                                                ret.code = RESULT_CODE_TIMEOUT;
                                                                                ret.stepResults.push('TIMEOUT');
                                                                                break;

                                                                        }
                                                                        else {
                                                                                var responseMsg = ackMsg['responseMsg'];
                                                                                if(responseMsg=='ERROR')
                                                                                {
                                                                                        ret.code = RESULT_CODE_NO_CONTROL;
                                                                                        ret.stepResults.push('ERROR');
                                                                                        break;
                                                                                }
                                                                                else{
                                                                                        ret.stepResults.push(responseMsg);
                                                                                        if(i==cmd.length-1)
                                                                                        {
                                                                                                ret.code=RESULT_CODE_SUCCESS;
                                                                                        }
                                                                                }
                                                                        }
                                                                }
                                                        }
                                                }

                                return ret;

                        }
                }

                static defineRoutes(httpServer,tcpServer) {
                        CCMS3ServiceRoutes.addRoute_CCMS3ControlServer(httpServer,tcpServer);
                        CCMS3ServiceRoutes.addRoute_CCMS3SynTerminalConf(httpServer,tcpServer);
                        CCMS3ServiceRoutes.addRoute_CCMS3QueryServer(httpServer,tcpServer);
                }

                static  addRoute_CCMS3SynTerminalConf(httpServer,tcpServer)
                {
                        httpServer.addRoute(EasyNode.config('service.SynTerminalConf.httpMethod', 'GET'),
                                EasyNode.config('service.SynTerminalConf.URL', '/SynTerminalConf'),
                                function *()
                        {
                                var ret={};
                                var tid = this.parameter.param('tid');
                                var pwd = this.parameter.param('pwd');
                                var param_DB = yield HTTPUtil.getJSON(login_url, timeout, method, {tid:tid});
                                var controlFlag=true;
                                if(controlFlag&&param_DB.code!=0)
                                {
                                        ret.code = RESULT_CODE_DB_PARAM_FAILED;
                                        controlFlag=false;
                                }

                                var param_Real=yield CCMS3ServiceRoutes.sendToTerminal(httpServer,tcpServer,tid,QUERY_TERMINAL_CMD,pwd);
                                if(controlFlag&&param_Real.code!=0)
                                {
                                        ret.code=RESULT_CODE_TERMINAL_PARAM_FAILED;
                                        controlFlag=false;
                                }

                                var cmds=CCMS3ServiceRoutes.__getSendCMDS(param_Real.stepResults[0],param_DB.result)

                                if(controlFlag&&cmds.length==0){
                                        ret.code=RESULT_CODE_NO_CONF;;
                                        controlFlag=false;
                                }

                                ret.cmd=JSON.stringify(cmds);

                                if(controlFlag)
                                {
                                        var sendResult= yield CCMS3ServiceRoutes.sendToTerminal(httpServer,tcpServer,tid,cmds.join(';'),pwd);
                                        ret.stepResults=sendResult.stepResults;
                                        if(sendResult.code!=0)
                                                ret.code=sendResult.code;
                                }
                                ret=CCMS3ServiceRoutes.__getFullResult(ret);
                                this.type = 'json';
                                this.body = ret;
                        })
                }


                static addRoute_CCMS3QueryServer(httpServer,tcpServer)
                {
                        httpServer.addRoute(EasyNode.config('service.remoteQueryServer.httpMethod', 'GET'),
                                EasyNode.config('service.remoteQueryServer.URL', '/queryOnLineTerminals'),function *() {
                                        var ret= _.keys(tcpServer._clientAlias);
                                        this.type = 'json';
                                        this.body = ret;
                                })
                }

                static addRoute_CCMS3ControlServer(httpServer,tcpServer)
                {
                        httpServer.addRoute(EasyNode.config('service.remoteControlServer.httpMethod', 'GET'),
                                EasyNode.config('service.remoteControlServer.URL', '/control'),
                                function *()
                                {
                                        var tid = this.parameter.param('tid');
                                        var cmd = this.parameter.param('cmd');
                                        var pwd = this.parameter.param('pwd');
                                        var ret=yield CCMS3ServiceRoutes.sendToTerminal(httpServer,tcpServer,tid,cmd,pwd);
                                       ret= CCMS3ServiceRoutes.__getFullResult(ret);
                                        this.type = 'json';
                                        this.body = ret;
                                })
                }


           /*     static addRoute_CCMS3ControlServer(httpServer,tcpServer)
                {

                        const CONTROL_TIMEOUT = S(EasyNode.config('http.server.services.control.timeout', '10000')).toInt();
                        const DEFAULT_ADMINPWD = EasyNode.config('http.server.services.control.adminPwd', 'ccmsadmin123');
                        const RESULT_CODE_SUCCESS = 0;
                        const RESULT_CODE_DEVICE_NOT_FOUND = -1;
                        const RESULT_CODE_TID_ERROR = -2;
                        const RESULT_CODE_CMD_ERROR = -3;
                        const RESULT_CODE_TIMEOUT = -4;
                        const RESULT_CODE_NO_CONTROL = -5;
                        const  RESULT_CODE_CMD_NOT_ALLOW=-6;
                        const CCMS3_DOWNLINK_CMD='00010400';
                        const CCMS3_DOWNLINK_ENDFLAG='ODOA';
                        const FORBIDEN_CMD=["AT$FRIEND","AT$MDMID"];
                        const NO_RESPONSE_CMD=["AT$RESET"];

                        var NO_RESPONSE_CMDHEX=[];
                        httpServer.addRoute(EasyNode.config('service.remoteControlServer.httpMethod', 'GET'),
                                EasyNode.config('service.remoteControlServer.URL', '/control'),function *()
                                {
                                        var tid = this.parameter.param('tid');
                                        var cmd = this.parameter.param('cmd');
                                        var pwd = this.parameter.param('pwd');
                                        var ret = {
                                                code : RESULT_CODE_NO_CONTROL,
                                                stepResults : []
                                        };
                                        var controlFlag = true;

                                        if (controlFlag &&(!tid|| (tid.length != 8))) {
                                                ret.code = RESULT_CODE_TID_ERROR;
                                                controlFlag = false;
                                        }

                                        if(controlFlag && (!cmd|| (cmd.length <0)))
                                        {
                                                ret.code = RESULT_CODE_CMD_ERROR;
                                                controlFlag = false;
                                        }

                                        if(controlFlag)
                                        {
                                                cmd=cmd.split(';');
                                                for(var i=0;i<cmd.length;i++)
                                                {
                                                        if(!cmd[i]||cmd[i].length==0)
                                                        {
                                                                ret.code = RESULT_CODE_CMD_ERROR;
                                                                controlFlag = false;
                                                                break;
                                                        }
                                                        var isForbiden=false;
                                                        for(var j=0;j<FORBIDEN_CMD.length;j++)
                                                        {
                                                                if(cmd[i].indexOf(FORBIDEN_CMD[j])>=0)
                                                                {
                                                                        isForbiden=true;
                                                                        break;
                                                                }
                                                        }
                                                        if(!isForbiden||pwd==DEFAULT_ADMINPWD) {
                                                                var b=NO_RESPONSE_CMD.indexOf(cmd[i])>=0;
                                                                var cmdHex = StringUtil.stringToHex(cmd[i])
                                                                var lengthHex = StringUtil.short2Hex(cmdHex.length / 2 + 8);
                                                                cmd[i] = lengthHex + CCMS3_DOWNLINK_CMD + cmdHex + CCMS3_DOWNLINK_ENDFLAG;
                                                                if(b)//如果是没有响应的消息，记录下消息hexString
                                                                {
                                                                        NO_RESPONSE_CMDHEX.push(cmd[i]);
                                                                }

                                                        }
                                                        else
                                                        {
                                                                ret.code = RESULT_CODE_CMD_NOT_ALLOW;
                                                                controlFlag = false;
                                                                break;
                                                        }
                                                }
                                        }
                                        if(controlFlag) {
                                                var client = tcpServer.getClientByAlias(tid);
                                                if(!client)
                                                {
                                                        ret.code = RESULT_CODE_DEVICE_NOT_FOUND;
                                                }
                                              else {
                                                        for (var i = 0; i < cmd.length; i++) {
                                                                // var msg =CCMS3Message.createMessageById(0x00010400).notation(client);
                                                                client.getSocket().write(cmd[i], 'hex');
                                                                EasyNode.DEBUG && logger.debug('send control msg to client [' + tid + '],hex ['+cmd[i]+']');
                                                                var fnOnce = thunkify(client.once);
                                                                if(NO_RESPONSE_CMDHEX.indexOf(cmd[i])>=0) {
                                                                        ret.stepResults.push('CMD_NORESPONSE');
                                                                        if(i==cmd.length-1)
                                                                        {
                                                                                ret.code=RESULT_CODE_SUCCESS;
                                                                        }
                                                                        continue;
                                                                }
                                                                var ackMsg = null;
                                                                setTimeout(function () {
                                                                        if (ackMsg == null) {
                                                                                client.trigger('msg-handle-able-0x00010500', null, 'TIMEOUT');                      //超时响应
                                                                        }
                                                                }, CONTROL_TIMEOUT);
                                                                ackMsg = yield fnOnce.call(client, 'msg-handle-able-0x00010500');
                                                                if (ackMsg == 'TIMEOUT') {
                                                                                ret.code = RESULT_CODE_TIMEOUT;
                                                                                ret.stepResults.push('TIMEOUT');
                                                                                break;

                                                                }
                                                                else {
                                                                        var responseMsg = ackMsg['responseMsg'];
                                                                        if(responseMsg=='ERROR')
                                                                        {
                                                                                ret.code = RESULT_CODE_NO_CONTROL;
                                                                                ret.stepResults.push('ERROR');
                                                                                break;
                                                                        }
                                                                        else{
                                                                                ret.stepResults.push(responseMsg);
                                                                                if(i==cmd.length-1)
                                                                                {
                                                                                        ret.code=RESULT_CODE_SUCCESS;
                                                                                }
                                                                        }
                                                                }
                                                        }
                                                }
                                        }

                                        switch (ret.code) {
                                                case RESULT_CODE_DEVICE_NOT_FOUND :
                                                {
                                                        ret.msg = '终端设备未登录';
                                                        break;
                                                }
                                                case RESULT_CODE_TID_ERROR :
                                                {
                                                        ret.msg = '错误的终端编号，必须为8位字符串';
                                                        break;
                                                }
                                                case RESULT_CODE_CMD_ERROR :
                                                {
                                                        ret.msg = '指令集错误';
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
                                                case RESULT_CODE_SUCCESS :
                                                {
                                                        ret.msg = '指令执行完成';
                                                        break;
                                                }
                                                case RESULT_CODE_CMD_NOT_ALLOW :
                                                {
                                                        ret.msg = '禁止下发的指令';
                                                        break;
                                                }
                                        }

                                        this.type = 'json';
                                        this.body = ret;
                                })
                }*/


                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3ServiceRoutes;
})();