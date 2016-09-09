var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        const APP_ROOM_LIMIT = parseInt(EasyNode.config('plugin.chat.appRoomLimit', '100'));
        /**
         * Class App
         *
         * @class cn.beneverse.easynode.plugin.chat.App
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class App extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(appId, appName) {
                        super();
                        //调用super()后再定义子类成员。
                        this.appId = appId;

                        this.name = appName;

                        this.roomLimit = APP_ROOM_LIMIT;

                        this.rooms = {};
                }

                createRoom(name, password, destroyFlag = Room.DESTROY_WHEN_EMPTY) {

                }



                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = App;
})();