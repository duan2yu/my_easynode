var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var BasicController = using('cn.beneverse.xzcxw.api.controllers.BasicController');
var utility = require('utility');

(function () {
        /**
         * Class CMSController
         *
         * @class #NAMESPACE#.CMSController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CMSController extends BasicController {
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
                 * @api {get} api/cms/catalog/list/:identityName 查询分类内容列表
                 * @apiName ListCatalogContents
                 * @apiGroup CMS
                 * @apiParam {Number} identityName 内容分类标识码，对应xzcxw_cms_catalog.identityName字段
                 * @apiParam {Boolean} recursive 是否取所有的子分类的内容，默认false
                 * @apiParam {Number} page 页号，默认1
                 * @apiParam {Number} rpp 每页记录数，默认20
                 *
                 * @apiSuccess {Object} pagination 分页信息
                 * @apiSuccess {Number} pagination.rows 结果集总行数
                 * @apiSuccess {Number} pagination.page 页号
                 * @apiSuccess {Number} pagination.rpp 每页记录数
                 * @apiSuccess {Array} data 结果集数据
                 * @apiSuccess {Number} data.id 内容ID
                 * @apiSuccess {Number} data.catalogId 分类ID
                 * @apiSuccess {String} data.title 标题
                 * @apiSuccess {String} data.content 内容
                 * @apiSuccess {String} data.subtitle 子标题
                 * @apiSuccess {Number} data.createTime 创建时间
                 * @apiSuccess {Number} data.expireTime 过期时间
                 * @apiSuccess {String} data.creator 创建者（管理员）ID
                 * */

                queryCatalogContentList () {
                        return function * () {
                                return ActionResult.createNoImplementationError();
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CMSController;
})();