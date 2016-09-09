define({ "api": [
  {
    "type": "post",
    "url": "/api/device/create",
    "title": "创建新设备",
    "name": "createDevice",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "deviceType",
            "description": "<ul> <li>设备型号</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "host",
            "description": "<p>服务器地址</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "port",
            "description": "<p>服务端口</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "imei",
            "description": "<ul> <li>设备IMEI号</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "appVersion",
            "description": "<p>程序版本</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "phone",
            "description": "<p>车载手机号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "masterMobile",
            "description": "<p>车主手机号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "vehicleNumber",
            "description": "<p>车牌号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "micSensitivity",
            "description": "<p>钥匙扣灵敏度MIC</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "reportGPS",
            "description": "<p>是否上报gps  0 保留 1 轨迹上报 2 轨迹不上报 3 轨迹上报但设置位置隐藏标志</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "workMode",
            "description": "<p>0 保留 1 省电工作模式 2 正常工作模式</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "reportIntervalM",
            "description": "<p>运动时GPS上报间隔，单位：秒</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "reportIntervalS",
            "description": "<p>静止时GPS上报间隔，单位：秒</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "serviceExpire",
            "description": "<p>服务到期时间 yyyy-MM-dd</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "simType",
            "description": "<p>sim卡类型　0.用户自备SIM卡 1.运营商定制卡 2物联网卡</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "simExpire",
            "description": "<p>SIM卡到期时间 yyyy-MM-dd</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alarmProcessFrom",
            "description": "<ul> <li>报警类型０：中心报警；１：设备报警</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alarmProcessCenter",
            "description": "<p>报警时中心处理方式 111表示电话＋短信＋消息推送，100表示仅电话报警</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alarmProcessDevice",
            "description": "<p>报警时，设备处理方式，0：表示电话+短信；1：表示纯短信；2：表示纯电话；3：不报警；默认3</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "smsCenter",
            "description": "<p>中心每月最大发出短信数</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "smsDevice",
            "description": "<p>设备每月最大发出短信数</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "phoneCallCenter",
            "description": "<p>中心每月最大拔出电话数</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "phoneCallDevice",
            "description": "<p>设备每月最大拔出电话数</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<p>集团ID，未分配的设备为0,默认0</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "regCode",
            "description": "<p>设备密码，默认123456</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "firmwareVersion",
            "description": "<p>设备固件版本号</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "post",
    "url": "/api/device/control/:imei",
    "title": "下发控制指令",
    "name": "deviceControl",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "imei",
            "description": "<p>设备imei</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "cmd",
            "description": "<p>控制指令 '0': '撤销断油断电', '1': '执行断油断电', '2': '撤防；（电动车用）', '3': '设防；（电动车用）', '5': '静音；（电动车用）', '7': '免钥匙启动；（电动车用）', '9': '寻车；（电动车用）', '10': '电击模式；（宠物用）', '11': '马达震动模式；（宠物用）', '12': '蜂鸣器模式；（宠物用）', '13': 'led闪烁模式；（宠物用）', '14': '汽车远程启动；（德贝兴）', '15': '汽车远程熄火；（德贝兴）', '16': '汽车远程锁车；（德贝兴）', '17': '汽车远程开锁；（德贝兴）', '18': '汽车远程寻车；（德贝兴）', '19': '监听；（儿童机）'</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/info/:imei",
    "title": "查询设备详情",
    "name": "deviceInfo",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "imei",
            "description": "<p>设备IMEI号, like</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/list",
    "title": "查询设备列表",
    "name": "listDevice",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "onlineState",
            "description": "<p>在线状态，0离线，1在线</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "imei",
            "description": "<p>设备IMEI号, like</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<p>设备集团id</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "phone",
            "description": "<p>车载手机</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "simType",
            "description": "<p>SIM卡类型：0.用户自备SIM卡 1.运营商定制卡</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "vehicleNumber",
            "description": "<p>车牌号码, like</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "masterMobile",
            "description": "<p>车主手机</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "simExpire",
            "description": "<p>SIM卡到期时间，yyyy-MM-dd, &lt;=</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "serviceExpire",
            "description": "<p>服务到期时间，yyyy-MM-dd, &lt;=</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "model",
            "description": "<p>设备型号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "page",
            "description": "<p>页号，默认1</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "rpp",
            "description": "<p>每页记录数，系统默认值</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/msgLog/:imei",
    "title": "查询设备消息记录",
    "name": "listDeviceMsgLog",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "imei",
            "description": "<p>设备IMEI号, like</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "cmd",
            "description": "<p>指令</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "beginTime",
            "description": "<p>开始时间，yyyy-MM-dd HH:mm:ss</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "endTime",
            "description": "<p>结束时间，yyyy-MM-dd HH:mm:ss</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "page",
            "description": "<p>页号，默认1</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "rpp",
            "description": "<p>每页记录数，系统默认值</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/alarm",
    "title": "查询设备报警记录",
    "name": "queryDeviceAlarm",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "imei",
            "description": "<p>设备IMEI号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "vehicleNumber",
            "description": "<p>车牌号,like</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alarm",
            "description": "<p>告警编码,1-7依次为：非法位移报警(1)、断电报警(2)、震动报警(3)、超速报警(4)、开门报警(5)、进入电子围栏区域报警(6)、离开电子围栏区域报警(7)</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alarmType",
            "description": "<p>报警类型 0解除报警,1报警</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "beginTime",
            "description": "<p>报警开始时间，yyyy-MM-dd HH:mm:ss</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "endTime",
            "description": "<p>报警结束时间，yyyy-MM-dd HH:mm:ss</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "page",
            "description": "<p>页号，默认1</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "rpp",
            "description": "<p>每页记录数，系统默认值</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/snapshot/:imei",
    "title": "读取设备实时信息",
    "name": "queryDeviceSnapshot",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "imei",
            "description": "<p>设备IMEI号</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/track/:imei",
    "title": "读取设备轨迹数据",
    "name": "queryDeviceTrack",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "imei",
            "description": "<p>设备IMEI号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "beginTime",
            "description": "<p>轨迹开始时间，yyyy-MM-dd HH:mm:ss</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "endTime",
            "description": "<p>轨迹结束时间，yyyy-MM-dd HH:mm:ss</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/deviceTypes",
    "title": "查询设备类型列表清单",
    "name": "queryDeviceTypes",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>设备类型名称, like</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/config/read/:deviceId",
    "title": "读取设备配置信息",
    "name": "readDeviceConfig",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "deviceId",
            "description": "<p>设备ID</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/config/update/:deviceId",
    "title": "更新设备配置信息",
    "name": "updateDeviceConfig",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "deviceId",
            "description": "<p>设备ID</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "redirectConnector",
            "description": "<p>是否转向$host:$port，０否１是</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "host",
            "description": "<p>connector主机IP地址</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "port",
            "description": "<p>connector服务端口</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "micSensitivity",
            "description": "<p>micphone灵敏度</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "reportGPS",
            "description": "<p>是否上报GPS状态，0：保留；1：轨迹上报；2：轨迹不上报；3：轨迹上报，但设置位置隐藏标志；</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "workMode",
            "description": "<p>工作模式，0：保留；1：省电工作模式；2：正常工作模式</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "reportIntervalM",
            "description": "<p>运动时上报间隔，单位：秒</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "reportIntervalS",
            "description": "<p>静止时上报间隔，单位：秒</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alarmProcessCenter",
            "description": "<p>报警时中心处理方式</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alarmProcessDevice",
            "description": "<p>0：表示电话+短信；1：表示纯短信；2：表示纯电话；3：不报警；默认3</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alarmProcessFrom",
            "description": "<p>报警类型０：中心报警；１：设备报警</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "phoneCallCenter",
            "description": "<p>中心每月最大拔出电话数</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "phoneCallDevice",
            "description": "<p>设备每月最大拔出电话数</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "smsCenter",
            "description": "<p>中心每月最大发出短信数</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "smsDevice",
            "description": "<p>设备每月最大发出短信数</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "g2ReportTime",
            "description": "<p>CBB-100G2设备专用参数，每天上报时间点，格式：HH24:MI,HH24:MI,HH24:MI</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "g2KeepOnline",
            "description": "<p>CBB-100G2设备专用参数，保持设备在线直至此时刻，格式：yyyy-MM-dd HH:mm:ss</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "vehicleNumber",
            "description": "<p>车牌号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "masterMobile",
            "description": "<p>车主手机号</p> "
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
    "filename": "../src/szzh/motor/console/controllers/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/group/addDeviceBatch/:groupId",
    "title": "分配设备给集团 excle",
    "name": "addDeviceBatch",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<p>集团ID</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "importFile",
            "description": "<p>设备excle</p> "
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
    "filename": "../src/szzh/motor/console/controllers/GroupController.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/api/group/addDevice/:groupId",
    "title": "分配设备给集团",
    "name": "addGroupDevice",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<p>集团ID</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "imei",
            "description": "<p>imei字符串　以,分隔　355334050097660,355334050106016</p> "
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
    "filename": "../src/szzh/motor/console/controllers/GroupController.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/api/group/create",
    "title": "创建新集团用户",
    "name": "createGroup",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<ul> <li>集团名称</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "fullName",
            "description": "<p>集团全名</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "address",
            "description": "<p>集团地址</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "tel",
            "description": "<p>集团联系电话</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "fax",
            "description": "<p>集团传真</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "linkman",
            "description": "<p>联系人</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "linkmanMobile",
            "description": "<p>联系人电话</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "status",
            "description": "<p>状态，0无效，1有效 默认有效</p> "
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
    "filename": "../src/szzh/motor/console/controllers/GroupController.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/api/group/delete/:groupId",
    "title": "删除集团",
    "name": "deleteGroup",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<p>集团ID</p> "
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
    "filename": "../src/szzh/motor/console/controllers/GroupController.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/api/group/list",
    "title": "查询集团列表",
    "name": "listGroup",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>集团名称, like</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "status",
            "description": "<p>状态，0无效，1有效</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "page",
            "description": "<p>页号，默认1</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "rpp",
            "description": "<p>每页记录数，系统默认值</p> "
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
    "filename": "../src/szzh/motor/console/controllers/GroupController.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/api/group/autocomplete",
    "title": "查询所有集团的名称",
    "name": "listGroupNames",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>集团名称, like</p> "
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
    "filename": "../src/szzh/motor/console/controllers/GroupController.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/api/group/read/:groupId",
    "title": "读取集团信息",
    "name": "readGroup",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<p>集团ID</p> "
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
    "filename": "../src/szzh/motor/console/controllers/GroupController.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/api/group/update/:groupId",
    "title": "更新集团资料",
    "name": "updateGroup",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<ul> <li>集团ID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<ul> <li>集团名称</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "fullName",
            "description": "<p>集团全名</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "address",
            "description": "<p>集团地址</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "tel",
            "description": "<p>联系电话</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "fax",
            "description": "<p>传真</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "linkman",
            "description": "<p>联系人</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "linkmanMobile",
            "description": "<p>联系人电话</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "status",
            "description": "<p>状态，0无效，1有效</p> "
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
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "../src/szzh/motor/console/controllers/GroupController.js",
    "groupTitle": "Group"
  }
] });