var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var utility = require('utility');

(function () {
        /**
         * Class BasicController
         *
         * @class #NAMESPACE#.BasicController
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class BasicController extends GenericObject {
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
                        this.constants = null;                          //IoC injection
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = BasicController;
})();