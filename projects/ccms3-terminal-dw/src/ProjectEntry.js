var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class ProjectEntry
         *
         * @class ProjectEntry
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class ProjectEntry extends GenericObject {
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

                static launch(ctx) {
                        return function * () {
                                logger.info('initializing project [ccms3-terminal-dw]...');
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = ProjectEntry;
})();