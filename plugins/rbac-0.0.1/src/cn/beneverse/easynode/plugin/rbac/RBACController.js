var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');

(function () {
        /**
         * Class RBACController
         *
         * @class cn.beneverse.easynode.plugin.sms.haoservice.RBACController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class RBACController extends GenericObject {
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
                        this.pluginInstance = null;
                }

                setPluginInstance(pluginInstance) {
                        this.pluginInstance = pluginInstance;
                }

                send() {
                        var me = this;
                        return function * () {
                                this.validator.check('mobile').necessary().length(11).isInt().end();
                                this.validator.check('templateId').necessary().isInt().end();
                                this.validator.check('values').optional().end();

                                if(this.validator.isValid()) {
                                        var bindValues = {};
                                        if(this.parameter.param('values')) {
                                                bindValues = JSON.parse(this.parameter.param('values'));
                                        }
                                        var ret = yield me.pluginInstance.sendSMS(this.parameter.param('mobile'), this.parameter.param('templateId'), bindValues);
                                        if(me.pluginInstance.isSuccess(ret)) {
                                                return ActionResult.createSuccessResult(ret).setMsg('短信下发成功');
                                        }
                                        else {
                                                return ActionResult.createErrorResult('短信下发失败').setResult(ret);
                                        }
                                }
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = RBACController;
})();