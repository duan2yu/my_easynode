var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');
var MysqlModelGenerator = using('easynode.framework.mvc.spi.MysqlModelGenerator');

(function () {
        /**
         * Class CheckUser
         *
         * @class easynode.plugin.rbac.actions.CheckUser
         * @extends easynode.framework.mvc.Action
         * @since 0.1.0
         * @author zlbbq
         * */
        class CheckUser extends Action {
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
                        this.addArg('id','int','用户id -1代表新增');
                        this.addArg('name','string','用户名');
                }

                process(ctx) {
                        return function * () {
                                var id=ctx.param('id');
                                var name=ctx.param('name');
                                var sql="select count(id) as count from xzcxw_user where name='"+name+"' and id <>"+id;
                                var result=yield ctx.getConnection().execQuery(sql);
                                if(result[0].count>0)
                                        return "false";
                                else
                                return "true";
                        };
                }

                datasourceSupport () {
                        return true;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }

        }
        module.exports = CheckUser;
})();