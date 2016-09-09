var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class SerializableObject
         *
         * @class easynode.framework.server.tcp.SerializableObject
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class SerializableObject extends GenericObject {
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
                 * 获取对象结构描述
                 *
                 * @method getObjectStructure
                 * @param {Object} msg 正在解析的消息对象
                 * @return {Array} 对象结构描述
                 * @abstract
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getObjectStructure(msg) {
                        throw new Error('Abstract Method');
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = SerializableObject;
})();