var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');

(function () {
        /**
         * Class TestController
         *
         * @class #NAMESPACE#.TestController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class TestController extends GenericObject {
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

                static test() {
                        return function * () {
                                logger.error(this.params.id);                                   //URI参数
                                logger.error(this.parameter.param('p'));               //query string or post body
                                this.validator.check('p').necessary().isInt().end();
                                this.validator.check('p1').isDateString().end();
                                if(this.validator.isValid()) {
                                        return ActionResult.createSuccessResult({
                                                name: 'zlbbq'
                                        });
                                }
                        };
                }

                static test1() {
                        return function * () {
                                return ActionResult.createSuccessResult({
                                        name : 'zlbbq1'
                                });
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = TestController;
})();