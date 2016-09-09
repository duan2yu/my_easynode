var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class CCMS3DWMain
         *
         * @class beneverse.ccms.terminal.dw.CCMS3TWMain
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class CCMS3DWMain extends GenericObject {
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

                static * main() {
                        var BeanFactory = using('easynode.framework.BeanFactory');
                        yield BeanFactory.initialize('projects/ccms3-terminal-dw/etc/ccms3-terminal-dw-beans.json');
                        var mq = BeanFactory.get('mq');
                        var cache = BeanFactory.get('cache');
                        var teletextPrefix = EasyNode.config('redis.device.teletext.prefix', 'CCMS3-TELETEXT-');
                        var l = {
                                pause: false,
                                onMessage: function * (queueName, m) {
                                        if(m && m.tid) {
                                                var tid = m.tid;
                                                logger.info(`[${tid}]-[${m.uplink}]-[${m.downlink.join(',')}]`);
                                                var key = teletextPrefix + tid;
                                                yield cache.set(key, m);
                                        }
                                },

                                onError: function (err) {
                                        logger.error(err);
                                }
                        };

                        yield mq.subscribe(EasyNode.config('redis.teletext.queueName', 'CCMS3-TELETEXT-QUEUE'), {}, l);
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = CCMS3DWMain;
})();