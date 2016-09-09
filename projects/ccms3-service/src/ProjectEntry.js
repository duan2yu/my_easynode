var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var BeanFactory = using('easynode.framework.BeanFactory');
var MysqlModelGenerator = using('easynode.framework.mvc.spi.MysqlModelGenerator');
var ModelProxyActionFactory = using('easynode.framework.mvc.ModelProxyActionFactory');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');

(function () {
        /**
         * Class ProjectEntry
         *
         * @class ProjectEntry
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class ProjectEntry extends GenericObject {
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

                static launch(ctx) {
                        return function * () {
                                logger.info('initializing project [ccms3-service]...');
                                yield BeanFactory.initialize('projects/ccms3-service/etc/ccms3-service-beans.json');
                                yield  ActionFactory.initialize('projects/ccms3-service/etc/ccms3-service-actions.json');
                                //定义Mysql模型
                                var ccmsModels = [
                                        {name: 'ccms-user-info', table: 'CCMS_USER_INFO'},
                                        {name: 'ccms-device', table: 'CCMS_DEVICE'},
                                        {name: 'ccms-device-config-items', table: 'CCMS_DEVICE_CONFIG_ITEMS'},
                                        {name: 'ccms-device-config', table: 'CCMS_DEVICE_CONFIG'},
                                        {name: 'ccms-device-binding', table: 'CCMS_DEVICE_BINDING'},
                                        {name: 'ccms-drivers', table: 'CCMS_DRIVERS'},
                                        {name: 'ccms-transport-job', table: 'CCMS_TRANSPORT_JOB'},
                                        {name: 'ccms-waybill', table: 'CCMS_WAYBILL'},
                                        {name: 'ccms-sharing', table: 'CCMS_SHARING'},
                                        {name: 'ccms-device-data', table: 'CCMS_DEVICE_DATA'},
                                        {name: 'ccms-device-alarm', table: 'CCMS_DEVICE_ALARM'}
                                ];
                                yield MysqlModelGenerator.generate(ctx.datasource, ctx.database, ccmsModels);

                                //生成CRUDL接口
                                ProjectEntry.createCRUDLs();
                        };
                }

                static createCRUDLs() {
                        {
                                //CCMS_USER_INFO表
                                var factory = new ModelProxyActionFactory({
                                        getModel: function () {
                                                return MysqlModelGenerator.getModel('ccms-user-info');
                                        }
                                }, 'ccms-user-info');

                                ActionFactory.register(factory.getCreateAction(), null, null, '创建CCMS用户');
                                ActionFactory.register(factory.getReadAction(), null, null, '获取CCMS用户');
                                ActionFactory.register(factory.getUpdateAction(), null, null, '修改CCMS用户');
                                ActionFactory.register(factory.getDelAction(), null, null, '删除CCMS用户');
                                var queryAction = factory.getListAction({
                                        userId : '=',
                                        userName : '=',
                                        createTime : 'between',
                                        createChannel : '='
                                }, null, function(condition, model){return null;});
                                ActionFactory.register(queryAction, null, null, '查询CCMS用户');
                        }
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = ProjectEntry;
})();