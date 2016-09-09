var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var _ = require('underscore');

(function () {
        /**
         * Class Room
         *
         * @class cn.beneverse.easynode.plugin.chat.Room
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class Room extends GenericObject {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor(app, name, password) {
                        super();
                        //调用super()后再定义子类成员。
                        this.app = app;

                        this.name = name;

                        this.password = password;

                        this.sessions = {};

                        this.destroyFlag = Room.DESTROY_WHEN_EMPTY;

                        this.attributes = {};

                        this.createTime = new Date();

                        this.on(Room.EVENT_MEMBER_JOINED, this.onMemberJoined);

                        this.on(Room.EVENT_MEMBER_EXIT, this.onMemberExit);
                }

                setAttribute(name, val) {
                        this.attributes[name] = val;
                }

                getAttribute(name, val) {
                        return this.attributes[name];
                }

                getAttributes() {
                        return _.clone(this.attributes);
                }

                onMemberJoined(session) {

                }

                onMemberExit(session) {

                }

                destroy(room) {

                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        Room.KEEP_ALIVE = 0;
        Room.DESTROY_WHEN_EMPTY = 1;

        Room.EVENT_MEMBER_JOINED = 'member-joined';
        Room.EVENT_MEMBER_EXIT = 'member-exit';

        module.exports = Room;
})();