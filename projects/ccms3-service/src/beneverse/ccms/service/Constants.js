var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class Constants
         *
         * @class beneverse.ccms.service.Constants
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class Constants extends GenericObject {
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

        Constants.ROLE_ADMIN = 1;                                               //管理员
        Constants.ROLE_USER = 2;                                                  //一般用户
        Constants.ROLE_DRIVER = 3;                                              //司机

        module.exports = Constants;
})();