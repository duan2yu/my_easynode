var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class TestModel
         *
         * @class #NAMESPACE#.TestModel
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class TestModel extends GenericObject {
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

                static define(bookshelf) {
                        var Course = bookshelf.Model.extend({
                                tableName: 'course'
                        });

                        var Plugins = bookshelf.Model.extend({
                                tableName: 'en_plugins'
                        });

                        var TTT = bookshelf.Model.extend({
                                tableName : 'TTT'
                        });


                        return {
                                Course : Course,
                                Plugins : Plugins,
                                Test : TTT
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = TestModel;
})();