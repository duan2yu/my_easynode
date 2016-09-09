define({ "api": [
  {
    "type": "get",
    "url": "api/cms/catalog/list/:identityName",
    "title": "查询分类内容列表",
    "name": "ListCatalogContents",
    "group": "CMS",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "identityName",
            "description": "<p>内容分类标识码，对应xzcxw_cms_catalog.identityName字段</p> "
          },
          {
            "group": "Parameter",
            "type": "<p>Boolean</p> ",
            "optional": false,
            "field": "recursive",
            "description": "<p>是否取所有的子分类的内容，默认false</p> "
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
            "description": "<p>每页记录数，默认20</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "<p>Object</p> ",
            "optional": false,
            "field": "pagination",
            "description": "<p>分页信息</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "pagination.rows",
            "description": "<p>结果集总行数</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "pagination.page",
            "description": "<p>页号</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "pagination.rpp",
            "description": "<p>每页记录数</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Array</p> ",
            "optional": false,
            "field": "data",
            "description": "<p>结果集数据</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "data.id",
            "description": "<p>内容ID</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "data.catalogId",
            "description": "<p>分类ID</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "data.title",
            "description": "<p>标题</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "data.content",
            "description": "<p>内容</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "data.subtitle",
            "description": "<p>子标题</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "data.createTime",
            "description": "<p>创建时间</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>Number</p> ",
            "optional": false,
            "field": "data.expireTime",
            "description": "<p>过期时间</p> "
          },
          {
            "group": "Success 200",
            "type": "<p>String</p> ",
            "optional": false,
            "field": "data.creator",
            "description": "<p>创建者（管理员）ID</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "../sub-systems/site-api/src/cn/beneverse/xzcxw/api/controllers/CMSController.js",
    "groupTitle": "CMS"
  }
] });