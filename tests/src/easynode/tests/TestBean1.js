var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');

(function () {
        /**
         * Class Test4Action
         *
         * @class easynode.tests.Test4Action
         * @extends easynode.framework.mvc.Action
         * @since 0.1.0
         * @author zlbbq
         * */
        class TestBean1 extends Action {
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

                process(ctx) {
                        return function * () {
                                return ActionResult.createSuccessResult(ActionFactory.list());
                        };
                }

                init()
                {
                        logger.info('TestBean1 Init');
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }



        module.exports = TestBean1;
})();