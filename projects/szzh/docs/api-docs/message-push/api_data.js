define({ "api": [
  {
    "type": "post",
    "url": "/login-init",
    "title": "用户登录初始化",
    "name": "LoginInitialize",
    "group": "MessagePush",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "app",
            "description": "<ul> <li>个推APP简称</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alias",
            "description": "<ul> <li>用户别名</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "clientId",
            "description": "<ul> <li>个推SDK获取的ClientID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "tags",
            "description": "<ul> <li>用户标签，多个标签使用&quot;,&quot;分隔</li> </ul> "
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
            "description": "<p>返回码，0 -&gt; 初始化成功(用户信息未更改), -1 -&gt; 参数错误，-3 -&gt; APP未初始化。成功返回 0</p> "
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
    "filename": "../src/szzh/mp/MessagePushMain.js",
    "groupTitle": "MessagePush"
  },
  {
    "type": "post",
    "url": "/logout",
    "title": "用户登出解除推送绑定关系",
    "name": "Logout",
    "group": "MessagePush",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "app",
            "description": "<ul> <li>个推APP简称</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alias",
            "description": "<ul> <li>用户别名</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "clientId",
            "description": "<ul> <li>个推SDK获取的ClientID</li> </ul> "
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
            "description": "<p>返回码，0 -&gt; 用户登出，推送绑定关系已解除, -1 -&gt; 参数错误，-3 -&gt; APP未初始化。成功返回 0</p> "
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
    "filename": "../src/szzh/mp/MessagePushMain.js",
    "groupTitle": "MessagePush"
  },
  {
    "type": "post",
    "url": "/push",
    "title": "推送消息",
    "name": "Push",
    "group": "MessagePush",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "app",
            "description": "<ul> <li>个推APP简称</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "type",
            "description": "<ul> <li>推送类型，single(单用户推送)/multiple(多用户推送)/tag(按用户标签推送)/app(全APP用户推送)</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "target",
            "description": "<p>推送目标用户的别名(alias)，type为single/multiple时必传，多个目标使用&quot;,&quot;分隔</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "content",
            "description": "<ul> <li>消息内容</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "badge",
            "description": "<p>应用图标上显示的数字标签，默认1</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alertTitle",
            "description": "<p>消息通知标题</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alert",
            "description": "<p>消息通知内容</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "expire",
            "description": "<p>离线消息过期时间，单位：秒，默认2小时</p> "
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
            "description": "<p>返回码，0 -&gt; 成功, -1 -&gt; 参数错误, -2 -&gt; 推送失败，-3 -&gt; APP未初始化。成功返回 0</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "pushId",
            "description": "<p>推送的消息ID</p> "
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
    "filename": "../src/szzh/mp/MessagePushMain.js",
    "groupTitle": "MessagePush"
  },
  {
    "type": "post",
    "url": "/queryPushResult",
    "title": "查询推送结果",
    "name": "QueryPushResult",
    "group": "MessagePush",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "pushId",
            "description": "<ul> <li>调用推送接口时返回的pushId</li> </ul> "
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
            "description": "<p>返回码，0 -&gt; 成功, -1 -&gt; 查询失败</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "result",
            "description": "<p>推送的结果</p> "
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
    "filename": "../src/szzh/mp/MessagePushMain.js",
    "groupTitle": "MessagePush"
  },
  {
    "type": "post",
    "url": "/tag",
    "title": "设置用户标签",
    "name": "Tag",
    "group": "MessagePush",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "app",
            "description": "<ul> <li>个推APP简称</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "alias",
            "description": "<ul> <li>用户别名</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "clientId",
            "description": "<ul> <li>个推SDK获取的ClientID</li> </ul> "
          },
          {
            "group": "Parameter",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "tags",
            "description": "<ul> <li>用户标签，多个标签使用&quot;,&quot;分隔</li> </ul> "
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
            "description": "<p>返回码，0 -&gt; 成功, -1 -&gt; 参数错误, -2 -&gt; 设置标签失败，-3 -&gt; APP未初始化。成功返回 0</p> "
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
    "filename": "../src/szzh/mp/MessagePushMain.js",
    "groupTitle": "MessagePush"
  }
] });