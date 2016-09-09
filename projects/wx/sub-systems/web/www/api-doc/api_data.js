define({ "api": [
  {
    "type": "post",
    "url": "/api/deviceGroup/addDevice/:deviceGroupId",
    "title": "向设备分组中增加设备",
    "name": "addDevice2Group",
    "group": "DeviceGroup",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "deviceGroupId",
            "description": "<ul> <li>设备分组ID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "deviceId",
            "description": "<ul> <li>设备ID列表，多个ID使用&quot;,&quot;分隔</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceGroupController.js",
    "groupTitle": "DeviceGroup"
  },
  {
    "type": "post",
    "url": "/api/deviceGroup/create",
    "title": "创建新设备分组",
    "name": "createDeviceGroup",
    "group": "DeviceGroup",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<ul> <li>设备分组名称</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "parentId",
            "description": "<p>父分组ID 不传表示创建根集团</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "sortFactor",
            "description": "<ul> <li>排序因子，大-&gt;小排序</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceGroupController.js",
    "groupTitle": "DeviceGroup"
  },
  {
    "type": "post",
    "url": "/api/deviceGroup/delete/:deviceGroupId",
    "title": "删除设备分组",
    "name": "deleteDeviceGroup",
    "group": "DeviceGroup",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "deviceGroupId",
            "description": "<ul> <li>设备分组ID</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceGroupController.js",
    "groupTitle": "DeviceGroup"
  },
  {
    "type": "get",
    "url": "/api/deviceGroup/listDetail",
    "title": "查询集团用户下所有设备分组及分组下设备",
    "name": "listDetail",
    "group": "DeviceGroup",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceGroupController.js",
    "groupTitle": "DeviceGroup"
  },
  {
    "type": "get",
    "url": "/api/deviceGroup/list",
    "title": "查询设备分组列表",
    "name": "listDeviceGroup",
    "group": "DeviceGroup",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>设备分组名称 like</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "code",
            "description": "<p>设备分组code like</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceGroupController.js",
    "groupTitle": "DeviceGroup"
  },
  {
    "type": "get",
    "url": "/api/deviceGroup/read/:deviceGroupId",
    "title": "读取设备分组信息",
    "name": "readDeviceGroup",
    "group": "DeviceGroup",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "deviceGroupId",
            "description": "<ul> <li>设备分组ID</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceGroupController.js",
    "groupTitle": "DeviceGroup"
  },
  {
    "type": "post",
    "url": "/api/deviceGroup/removeDevice/:deviceGroupId",
    "title": "从设备分组中删除设备",
    "name": "removeDeviceFromGroup",
    "group": "DeviceGroup",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "deviceGroupId",
            "description": "<ul> <li>设备分组ID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "deviceId",
            "description": "<ul> <li>设备ID列表，多个ID使用&quot;,&quot;分隔</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceGroupController.js",
    "groupTitle": "DeviceGroup"
  },
  {
    "type": "post",
    "url": "/api/deviceGroup/update/:deviceGroupId",
    "title": "更新设备分组信息",
    "name": "updateDeviceGroup",
    "group": "DeviceGroup",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>设备分组名称</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "sortFactor",
            "description": "<p>排序因子，大-&gt;小排序</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceGroupController.js",
    "groupTitle": "DeviceGroup"
  },
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
            "field": "imei",
            "description": "<ul> <li>设备IMEI号</li> </ul> "
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
            "field": "deviceType",
            "description": "<ul> <li>设备型号</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "firmware",
            "description": "<p>设备固件版本号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "phone",
            "description": "<p>SIM卡号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "deviceName",
            "description": "<p>设备名称</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "batch",
            "description": "<p>批次号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<ul> <li>集团ID，未分配的设备为0</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "post",
    "url": "/api/device/delete/:deviceId",
    "title": "删除设备",
    "name": "deleteDevice",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "deviceId",
            "description": "<ul> <li>设备ID</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/count",
    "title": "设备统计(在线状态)",
    "name": "deviceCount",
    "group": "Device",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
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
            "type": "<p>String</p> ",
            "optional": false,
            "field": "deviceGroupName",
            "description": "<p>设备分组名称</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "vehicleNumber",
            "description": "<p>车牌号码,like</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "masterMobile",
            "description": "<p>车主电话</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "deviceType",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
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
            "type": "<p>Number</p> ",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "get",
    "url": "/api/device/read/:deviceId",
    "title": "读取设备信息",
    "name": "readDevice",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "post",
    "url": "/api/device/simCharge/:deviceId",
    "title": "sim卡充值",
    "name": "simCharge",
    "group": "Device",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "deviceId",
            "description": "<ul> <li>设备ID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "money",
            "description": "<ul> <li>充值金额，单位：元</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "simExpire",
            "description": "<ul> <li>充值后套餐到期日期，yyyy-MM-dd</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "post",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/DeviceController.js",
    "groupTitle": "Device"
  },
  {
    "type": "post",
    "url": "/api/electronic-fence/create",
    "title": "创建电子围栏区域",
    "name": "createElectronicFence",
    "group": "ElectronicFence",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<ul> <li>电子围栏区域名称</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "type",
            "description": "<ul> <li>电子围栏区域类型，0：离开报警；1：进入报警；；2：进入离开均报警</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "address",
            "description": "<ul> <li>中心点地址</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "lat",
            "description": "<ul> <li>中心点纬度</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "lng",
            "description": "<ul> <li>中心点经度</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "radius",
            "description": "<ul> <li>区域半径，单位：米</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "maxSpeed",
            "description": "<ul> <li>最大速度，单位：Km/h，0 - 120之间，０表示不限速</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "devices",
            "description": "<ul> <li>该电子围栏区域应用的设备ID列表，多个设备使用&quot;,&quot;分隔</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/ElectronicFenceController.js",
    "groupTitle": "ElectronicFence"
  },
  {
    "type": "post",
    "url": "/api/electronic-fence/delete/:efId",
    "title": "删除电子围栏区域",
    "name": "deleteElectronicFence",
    "group": "ElectronicFence",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "efId",
            "description": "<ul> <li>电子围栏区域ID</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/ElectronicFenceController.js",
    "groupTitle": "ElectronicFence"
  },
  {
    "type": "post",
    "url": "/api/electronic-fence/device-fences/:imei",
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
            "field": "imei",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/ElectronicFenceController.js",
    "groupTitle": "ElectronicFence"
  },
  {
    "type": "post",
    "url": "/api/electronic-fence/list",
    "title": "查询集团电子围栏区域列表",
    "name": "listElectronicFence",
    "group": "ElectronicFence",
    "parameter": {
      "fields": {
        "Parameter": [
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/ElectronicFenceController.js",
    "groupTitle": "ElectronicFence"
  },
  {
    "type": "post",
    "url": "/api/electronic-fence/:efId/devices",
    "title": "查询电子围栏关联的设备列表",
    "name": "queryElectronicFenceDevices",
    "group": "ElectronicFence",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "efId",
            "description": "<ul> <li>电子围栏ID</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/ElectronicFenceController.js",
    "groupTitle": "ElectronicFence"
  },
  {
    "type": "post",
    "url": "/api/electronic-fence/sync/:imei",
    "title": "同步设备的电子围栏配置到设备",
    "name": "syncElectronicFence",
    "group": "ElectronicFence",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "imei",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/ElectronicFenceController.js",
    "groupTitle": "ElectronicFence"
  },
  {
    "type": "post",
    "url": "/api/electronic-fence/toggle/:imei/:flag",
    "title": "启用/禁用车辆电子围栏功能",
    "name": "toggleDeviceElectronicFence",
    "group": "ElectronicFence",
    "parameter": {
      "fields": {
        "Parameter": [
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
            "field": "flag",
            "description": "<ul> <li>启用/停用标识, &quot;true&quot;/&quot;false&quot;</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/ElectronicFenceController.js",
    "groupTitle": "ElectronicFence"
  },
  {
    "type": "post",
    "url": "/api/electronic-fence/update/:efId",
    "title": "更新电子围栏区域",
    "name": "updateElectronicFence",
    "group": "ElectronicFence",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "efId",
            "description": "<ul> <li>电子围栏区域ID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<ul> <li>电子围栏区域名称</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "type",
            "description": "<ul> <li>电子围栏区域类型，0：离开报警；1：进入报警；2：进入离开均报警</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "address",
            "description": "<ul> <li>中心点地址</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "lat",
            "description": "<ul> <li>中心点纬度</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "lng",
            "description": "<ul> <li>中心点经度</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "radius",
            "description": "<ul> <li>区域半径，单位：米</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "maxSpeed",
            "description": "<ul> <li>最大速度，单位：Km/h，0 - 120之间，０表示不限速</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "devices",
            "description": "<ul> <li>该电子围栏区域应用的设备ID列表，多个设备使用&quot;,&quot;分隔</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/ElectronicFenceController.js",
    "groupTitle": "ElectronicFence"
  },
  {
    "type": "get",
    "url": "/api/group/read/:groupId",
    "title": "读取集团信息(用户所属集团)",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/GroupController.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/api/charge",
    "title": "服务充值",
    "name": "serviceCharge",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "paymentPlatform",
            "description": "<ul> <li>支付平台，01 - 支付宝</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "money",
            "description": "<ul> <li>充值金额，单位：元</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "detail",
            "description": "<ul> <li>设备充值清单，JSON字符串，格式：[{imei: '35533xxxxxxxxxx1', amount: 60},{imei: '35533xxxxxxxxxx2', amount: 60}]</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/ServiceChargeController.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/api/group/update/:groupId",
    "title": "修改集团信息(当前用户所属集团)",
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
            "field": "lat",
            "description": "<p>纬度</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "lng",
            "description": "<p>经度</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/GroupController.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/api/privilege/list",
    "title": "查询权限列表",
    "name": "listPrivilege",
    "group": "Privilege",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "privilegeName",
            "description": "<p>权限名称 like</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/PrivilegeController.js",
    "groupTitle": "Privilege"
  },
  {
    "type": "post",
    "url": "/api/role/bindPrivileges/:roleId",
    "title": "角色绑定权限(解除原绑定关系)",
    "name": "bindPrivileges",
    "group": "Role",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "roleId",
            "description": "<p>角色ID</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "privilegeId",
            "description": "<ul> <li>权限列表，多个ID使用&quot;,&quot;分隔</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/RoleController.js",
    "groupTitle": "Role"
  },
  {
    "type": "post",
    "url": "/api/role/create",
    "title": "创建新角色",
    "name": "createRole",
    "group": "Role",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "roleName",
            "description": "<p>角色名称</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/RoleController.js",
    "groupTitle": "Role"
  },
  {
    "type": "post",
    "url": "/api/role/delete/:roleId",
    "title": "删除角色",
    "name": "deleteRole",
    "group": "Role",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "roleId",
            "description": "<ul> <li>角色ID</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/RoleController.js",
    "groupTitle": "Role"
  },
  {
    "type": "get",
    "url": "/api/role/list",
    "title": "查询角色列表",
    "name": "listRoles",
    "group": "Role",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "roleName",
            "description": "<p>角色名称 like</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/RoleController.js",
    "groupTitle": "Role"
  },
  {
    "type": "get",
    "url": "/api/role/queryBindPrivileges/:roleId",
    "title": "查询角色已绑定的权限",
    "name": "queryBindPrivileges",
    "group": "Role",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "roleId",
            "description": "<p>角色ID</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/RoleController.js",
    "groupTitle": "Role"
  },
  {
    "type": "post",
    "url": "/api/role/update/:roleId",
    "title": "修改角色信息",
    "name": "updateRole",
    "group": "Role",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "roleId",
            "description": "<ul> <li>角色D</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "roleName",
            "description": "<ul> <li>角色名称</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/RoleController.js",
    "groupTitle": "Role"
  },
  {
    "type": "get",
    "url": "/api/user/getLoginUser",
    "title": "获取系统登录的用户",
    "name": "GetLoginUser",
    "group": "User",
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
            "description": "<p>登录用户的信息</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserSessionController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/user/login",
    "title": "用户登录",
    "name": "UserLogin",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<ul> <li>用户名</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "pwd",
            "description": "<ul> <li>用户密码</li> </ul> "
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
            "description": "<p>登录用户的信息</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserSessionController.js",
    "groupTitle": "User"
  },
  {
    "type": "get/post",
    "url": "/api/user/logout",
    "title": "用户登出",
    "name": "UserLogout",
    "group": "User",
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserSessionController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/user/bindRole/:userId",
    "title": "用户绑定角色(覆盖原有绑定关系)",
    "name": "bindRole",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "userId",
            "description": "<ul> <li>用户ID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "roleId",
            "description": "<p>角色ID</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/user/changePwd/:userId",
    "title": "修改用户密码",
    "name": "changeUserPassword",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "userId",
            "description": "<ul> <li>用户ID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "oldPwd",
            "description": "<ul> <li>旧密码 明文</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "newPwd",
            "description": "<ul> <li>新密码　明文</li> </ul> "
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
            "description": "<p>登录用户的信息</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/user/create",
    "title": "创建新用户",
    "name": "createUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<ul> <li>用户名</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "realName",
            "description": "<p>真实姓名</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "mobile",
            "description": "<ul> <li>手机号码</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "email",
            "description": "<p>邮箱地址</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<ul> <li>集团ID，管理员为0</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "pwd",
            "description": "<ul> <li>明文密码</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/user/delete/:userId",
    "title": "删除用户",
    "name": "deleteUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "userId",
            "description": "<ul> <li>用户ID</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/api/user/list",
    "title": "查询用户列表",
    "name": "listUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>用户名, like</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "mobile",
            "description": "<p>用户手机号</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "status",
            "description": "<p>状态，0无效，1有效 默认有效</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/api/user/read/:userId",
    "title": "读取用户信息",
    "name": "readUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "userId",
            "description": "<ul> <li>用户ID</li> </ul> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/user/update/:userId",
    "title": "更新用户资料",
    "name": "updateUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "userId",
            "description": "<ul> <li>用户ID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "name",
            "description": "<p>用户名</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "realName",
            "description": "<p>真实姓名</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "mobile",
            "description": "<p>手机号码</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "email",
            "description": "<p>邮箱地址</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "groupId",
            "description": "<p>集团ID，管理员为0</p> "
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
    "filename": "../sub-systems/web/src/szzh/ydgps/web/controller/UserController.js",
    "groupTitle": "User"
  }
] });