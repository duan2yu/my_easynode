var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var View = using('easynode.framework.mvc.View');
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class JSONView
         *
         * @class easynode.framework.mvc.JSONView
         * @extends easynode.framework.mvc.View
         * @since 0.1.0
         * @author zlbbq
         * */
        class JSONView extends View {
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
                 * 获取渲染类型，json/html，影响response content-type。
                 *
                 * @method getContentType
                 * @return {String} 返回body类型, json/html
                 * @abstract
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getContentType () {
                        return 'json';
                }

                /**
                 * 渲染ActionResult。
                 *
                 * @method render
                 * @param {easynode.framework.mvc.ActionResult} actionResult Action执行结果
                 * @return {Object} 返回渲染结果，JSON对象或者String
                 * @abstract
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                render (actionResult) {
                        assert(actionResult, 'Invalid argument');
                        return actionResult instanceof GenericObject?actionResult.toJSON():actionResult;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = JSONView;
})();