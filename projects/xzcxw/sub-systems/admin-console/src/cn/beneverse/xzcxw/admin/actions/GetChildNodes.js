var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');
var MysqlModelGenerator = using('easynode.framework.mvc.spi.MysqlModelGenerator');

(function () {
        const CODE_LENGTH=2;
        const FRIST_LEVEL_CHILD=1;
        const ALL=2;
        /**
         * Class GetChildNodes
         *
         * @class easynode.plugin.rbac.actions.GetChildCode
         * @extends easynode.framework.mvc.Action
         * @since 0.1.0
         * @author zlbbq
         * */
        class GetChildNodes extends Action {
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
                        this.addArg({name : 'code', type : 'string',comment:'父级节点code'})
                        this.addArg({name : 'mode', type : 'string',comment:'查询类型　１只查询一级字节点　２查询全部'})
                }

                process(ctx) {
                        return function * () {
                                var code=ctx.param('code');
                                var mode=ctx.param('mode')||ALL;
                                var sql="select * from xzcxw_cms_catalog where 1=1 "
                                if(!code)
                                {
                                        code="";
                                }
                                else
                                {
                                        sql+=' and code like "'+code+'%"';
                                }
                                if(mode==FRIST_LEVEL_CHILD)
                                {
                                        sql+= ' and  LENGTH(code)='+(code.length+CODE_LENGTH)
                                }
                                var result=yield ctx.getConnection().execQuery(sql);
                                return ActionResult.createSuccessResult(result);
                        };
                }

                datasourceSupport () {
                        return true;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }

        }
        module.exports = GetChildNodes;
})();