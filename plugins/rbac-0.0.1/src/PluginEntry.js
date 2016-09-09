var assert = require('assert');
var GenericObject = using('easynode.GenericObject');
var AbstractPlugin = using('easynode.framework.plugin.AbstractPlugin');
var HTTPUtil = using('easynode.framework.util.HTTPUtil');

(function () {
        var logger = AbstractPlugin.getPluginLogger('rbac@0.0.1', __filename);
        /**
         * Class PluginEntry
         *
         * @class PluginEntry
         * @extends easynode.framework.plugin.AbstractPlugin
         * @since 0.1.0
         * @author zlbbq
         * */
        class PluginEntry extends AbstractPlugin {
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
                 *  初始化rbac插件。
                 *
                 * @method initialize
                 * @param {Object} options 初始化参数。
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                initialize(options) {
                        this.config(options);
                        this.bookshelf = options.bookshelf;                             // database support
                        this.cache = options.cache;                                             // cache support
                        this.util=options.util;
                }

                /**
                 *  销毁插件实例，没什么可以干的。
                 *
                 * @method finalize
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                finalize() {
                }

                createRole(groupId,roleName) {
                        var me=this;
                        return function *()
                        {
                                var ret=yield me.bookshelf.knex('rbac_role')
                                .insert({
                                                roleGroup:groupId,
                                                roleName:roleName
                                        });
                                return  ret;
                        }
                }

                updateRole(roleId,groupId,roleName) {
                        var me=this;
                        return function *()
                        {
                                var obj=
                                {
                                        id:roleId,
                                        groupId:groupId,
                                        roleName:roleName
                                }
                                for(var attr in obj)
                                {
                                        if(!obj[attr]) delete obj[attr];
                                }
                               var ret= yield me.bookshelf.knex('rbac_role')
                                        .where('id', roleId)
                                        .update(obj);
                                return  ret;
                        }
                }

                deleteRole(roleId)
                {
                        var me=this;
                        return function *()
                        {
                                var   ret = yield me.bookshelf.knex('rbac_role')
                                        .where('id',roleId)
                                        .delete();
                                return  ret;
                        }
                }


                listRoles(roleGroup,roleName,page,rpp)
                {
                        var me=this;
                        return function *()
                        {
                                var builder = me.bookshelf.knex('rbac_role')

                                builder.andWhere('rbac_role.roleGroup', roleGroup);

                                if (roleName) {
                                        builder.andWhere('rbac_role.roleName', 'like', `%${roleName}%`);
                                }
                                var ret = yield me.util.countAndQuery(builder, page, rpp, null, 'rbac_role.*');

                                return ret;
                        }
                }

                bindPrivileges(roleId,privilegeId)
                {
                        var me=this;
                        return function *()
                        {
                                var array=privilegeId.split(',');
                                var ret=yield me.bookshelf.knex('rbac_role_privilege')
                                .where('roleId',roleId)
                                .delete();
                                var tran = yield me.bookshelf.knex.transaction();
                                for(var i=0;i<array.length;i++)
                                {
                                        ret=yield me.bookshelf.knex('rbac_role_privilege')
                                        .insert(
                                        {
                                                roleId:roleId,
                                                privilegeId:array[i]
                                        }).transacting(tran);
                                }
                                tran.commit();
                        }
                }

                queryBindPrivileges(roleId)
                {
                        var me=this;
                        return function *()
                        {
                                if(!roleId)  return [];
                                var query=yield me.bookshelf.knex('rbac_role_privilege')
                                .select(me.bookshelf.knex.raw('GROUP_CONCAT(privilegeId)   as privilegeIds'))
                                .where('roleId',roleId)
                                .groupBy('roleId');

                                var ids=query[0].privilegeIds;
                                if(!ids) return [];
                                var arr=ids.split(',');
                                if(arr.length<=0) return [];

                                var ret = yield me.bookshelf.knex('rbac_privilege')
                                        .distinct('privilegeGroup as group')
                                        .whereIn('id',arr)
                                        .select()
                                logger.error(JSON.stringify(ret))

                                for(var i=0;i<ret.length;i++)
                                {
                                        var   temp=yield me.bookshelf.knex('rbac_privilege')
                                                .where('privilegeGroup',ret[i].group)
                                                .whereIn('id',arr)
                                                .orderBy('privilegeIndex', 'asc')
                                                .select('privilegeName','privilegeIndex')
                                        ret[i].child=temp;
                                }

                                return ret;
                        }

                }

                listPrivileges(privilegeName,page,rpp)
                {
                        var me=this;
                        return function *()
                        {
                                var builder = me.bookshelf.knex('rbac_privilege')

                                if (privilegeName) {
                                        builder.andWhere('rbac_privilege.privilegeName', 'like', `%${privilegeName}%`);
                                }
                                var ret = yield me.util.countAndQuery(builder, page, rpp, null, 'rbac_privilege.*');

                                return ret;
                        }
                }


                isSuccess(ret)
                {
                        return true;
                }


                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = PluginEntry;
})();