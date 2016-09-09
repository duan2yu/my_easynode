var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class Session
         *
         * @class cn.beneverse.easynode.plugin.chat.Session
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class Session extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(client) {
                        super();
                        //调用super()后再定义子类成员。
                        this.client = client;

                        this.joinedRooms = [];

                        this.createTime = new Date();
                }

                joinRoom(roomName, roomPwd) {

                }

                exitRoom(roomName) {

                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = Session;
})();