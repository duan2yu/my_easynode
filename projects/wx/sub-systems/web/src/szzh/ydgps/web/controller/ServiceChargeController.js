var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');

(function () {
        /**
         * Class ServiceChargeController
         *
         * @class #NAMESPACE#.ServiceChargeController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class ServiceChargeController extends GenericObject {
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
                        this.bookshelf = null;                          //IoC injection
                        this.cache = null;
                }

                /**
                 * @api {post} /api/charge 服务充值
                 * @apiName serviceCharge
                 * @apiGroup Group
                 *
                 * @apiParam {String} paymentPlatform * 支付平台，01 - 支付宝
                 * @apiParam {Number} money * 充值金额，单位：元
                 * @apiParam {String} detail * 设备充值清单，JSON字符串，格式：[{imei: '35533xxxxxxxxxx1', amount: 60},{imei: '35533xxxxxxxxxx2', amount: 60}]
                 *
                 * @apiSuccess {Number} code 返回码，0 -> 成功
                 * @apiSuccess {Object} result API处理结果
                 * @apiSuccess {String} msg 对应于返回码的文本消息
                 * */

                charge() {
                        var me = this;
                        return function * () {
                                return ActionResult.createSuccessResult({paymentURL : 'http://www.baidu.com'});
                        };
                }

                //支付宝即时到账-显示充值订单信息
                alipayDirectPayDisplayChargeOrder() {
                        var me = this;
                        return function * () {

                        };
                }

                //支付宝即时到账-返回界面
                alipayDirectPayChargeReturn() {
                        var me = this;
                        return function * () {

                        };
                }

                //支付宝即时到账-后台通知接口
                alipayDirectPayChargeNotify() {
                        var me = this;
                        return function * () {

                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = ServiceChargeController;
})();