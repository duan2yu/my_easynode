define({ "api": [
  {
    "type": "get/post",
    "url": "/config",
    "title": "远程配置",
    "name": "Config",
    "group": "CBB100Controller",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "IMEI",
            "description": "<ul> <li>设备IMEI号,必须为15位数字</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "clearSMSHistory",
            "description": "<p>是否清除短信发送记录，０否１是</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "clearPhoneCallHistory",
            "description": "<p>是否清除拨打电话记录，０否１是</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "code",
            "description": "<p>返回码，0 -&gt; 成功</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "result",
            "description": "<p>远程控制结果</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "msg",
            "description": "<p>对应于返回码的文本消息</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "../src/szzh/cbb100/controller/CBB100Controller.js",
    "groupTitle": "CBB100Controller"
  },
  {
    "type": "get/post",
    "url": "/deviceLogin",
    "title": "设备登录",
    "name": "DeviceLogin",
    "group": "CBB100Controller",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "IMEI",
            "description": "<p>设备IMEI号,必须为15位数字</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "time",
            "description": "<p>登录时间</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "modal",
            "description": "<p>设备型号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "sw",
            "description": "<p>固件版本</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "code",
            "description": "<p>返回码，0 -&gt; 成功</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "result",
            "description": "<p>设备配置</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "msg",
            "description": "<p>对应于返回码的文本消息</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "../src/szzh/cbb100/controller/CBB100Controller.js",
    "groupTitle": "CBB100Controller"
  },
  {
    "type": "get/post",
    "url": "/deviceState",
    "title": "设备状态查询",
    "name": "DeviceState",
    "group": "CBB100Controller",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "IMEI",
            "description": "<p>设备IMEI号,必须为15位数字</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "code",
            "description": "<p>返回码，0 -&gt; 成功</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "result",
            "description": "<p>设备状态数据</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "msg",
            "description": "<p>对应于返回码的文本消息</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "../src/szzh/cbb100/controller/CBB100Controller.js",
    "groupTitle": "CBB100Controller"
  },
  {
    "type": "post",
    "url": "/onlineDevices",
    "title": "在线设备列表",
    "name": "OnlineDevices",
    "group": "CBB100Controller",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "account",
            "description": "<ul> <li>账号</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "pwd",
            "description": "<ul> <li>密码</li> </ul> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "code",
            "description": "<p>返回码，0 -&gt; 成功</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "result",
            "description": "<p>在线设备列表</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "msg",
            "description": "<p>对应于返回码的文本消息</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "../src/szzh/cbb100/controller/CBB100Controller.js",
    "groupTitle": "CBB100Controller"
  },
  {
    "type": "get/post",
    "url": "/remoteControl",
    "title": "远程控制",
    "name": "RemoteControl",
    "group": "CBB100Controller",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "IMEI",
            "description": "<p>设备IMEI号,必须为15位数字</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "cmd",
            "description": "<p>控制命令 '1': '执行断油断电', '2': '撤防；（电动车用）', '3': '设防；（电动车用）', '5': '静音；（电动车用）', '7': '免钥匙启动；（电动车用）', '9': '寻车；（电动车用）', '10': '电击模式；（宠物用）', '11': '马达震动模式；（宠物用）', '12': '蜂鸣器模式；（宠物用）', '13': 'led闪烁模式；（宠物用）', '14': '汽车远程启动；（德贝兴）', '15': '汽车远程熄火；（德贝兴）', '16': '汽车远程锁车；（德贝兴）', '17': '汽车远程开锁；（德贝兴）', '18': '汽车远程寻车；（德贝兴）', '19': '监听；（儿童机）'</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "code",
            "description": "<p>返回码，0 -&gt; 成功</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "result",
            "description": "<p>远程控制结果</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "msg",
            "description": "<p>对应于返回码的文本消息</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "../src/szzh/cbb100/controller/CBB100Controller.js",
    "groupTitle": "CBB100Controller"
  },
  {
    "type": "get",
    "url": "/queryDeviceFence",
    "title": "查询设备的电子围栏配置",
    "name": "listDeviceElectronicFence",
    "group": "ElectronicFence",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "IMEI",
            "description": "<ul> <li>设备IMEI号</li> </ul> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "code",
            "description": "<p>返回码，0 -&gt; 成功</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "result",
            "description": "<p>API处理结果</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "msg",
            "description": "<p>对应于返回码的文本消息</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "../src/szzh/cbb100/controller/CBB100Controller.js",
    "groupTitle": "ElectronicFence"
  }
] });