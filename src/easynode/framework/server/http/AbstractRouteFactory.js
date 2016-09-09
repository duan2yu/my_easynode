var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        /**
         * Class AbstractRouteFactory
         *
         * @class easynode.framework.server.http.AbstractRouteFactory
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class AbstractRouteFactory extends GenericObject {
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
                 * 路由函数。
                 *
                 * @method getRoutes
                 * @return {Array} 路由列表，各元素Notation如下：
                 *                                                      {
                 *                                                              uri : '/test/test6',
                 *                                                              methods : 'get/post',
                 *                                                              handler : [generator],
                 *                                                              contentType : 'text/html',              // contentType : 'application/json'
                 *                                                              view : 'xxx.mst',
                 *                                                              viewDir : '/view'
                 *                                                      }
                 * @since 0.1.0
                 * @async
                 * @author zlbbq
                 * */
                getRoutes() {
                        return function * () {
                                throw new Error('Abstract Method');
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = AbstractRouteFactory;
})();