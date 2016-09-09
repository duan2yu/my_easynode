var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class IModelDefinition
         *
         * @class easynode.framework.db.IModelDefinition
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class IModelDefinition extends GenericObject {
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
                 * 模型定义入口函数。
                 * <pre>
                 *
                 *  //easynode.tests.models.XXX
                 * var modelDefinitionImpl = {
                 *      define : function(bookshelf) {
                 *              var MyModel = bookshelf.Model.extend({tableName : 'test'});
                 *              var Model2 = bookshelf.Model.extend({tableName : 'test2'});
                 *              return {
                 *                      Model1 : MyModel,
                 *                      Mode2 : Model2
                 *              };
                 *      }
                 * };
                 *
                 * module.exports = modelDefinitionImpl;
                 *
                 * usage :
                 * var bs = new Bookshelf();
                 * bs.initialize(connectOpts, 'easynode.tests.models.*');
                 * yield new bs.models.Model1({name : 'zlbbq'}).fetch();
                 * </pre>
                 *
                 *
                 * @method define
                 * @param {bookshelf} bookshelf bookshelf实例
                 * @return {Object} 返回一个模型名称和模型定义的key-value对
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                define(bookshelf) {
                        throw new Error('Abstract Method');
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = IModelDefinition;
})();