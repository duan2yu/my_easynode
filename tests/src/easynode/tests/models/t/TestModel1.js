var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class TestModel1
         *
         * @class #NAMESPACE#.TestModel1
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class TestModel1 extends GenericObject {
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

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = TestModel1;
})();