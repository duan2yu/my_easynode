var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var AbstractRouteFactory = using('easynode.framework.server.http.AbstractRouteFactory');
var ActionResult = using('easynode.framework.mvc.ActionResult');

(function () {
        /**
         * Class DemoRouteFactory
         *
         * @class #NAMESPACE#.DemoRouteFactory
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class DemoRouteFactory extends AbstractRouteFactory {
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

                getRoutes() {
                        return [
                                {
                                        uri : '/test6',
                                        method : 'get/post',
                                        contentType : 'text/html',
                                        handler : function *() {
                                                logger.error(this.parameter.param('abc'));
                                                return ActionResult.createSuccessResult({name : 'zlbbq'});
                                        },
                                        view : 'demo/demo.mst',
                                        viewDir : '/views'
                                }
                        ];
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = DemoRouteFactory;
})();