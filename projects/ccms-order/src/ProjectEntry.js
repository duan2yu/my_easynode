var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
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
                                logger.info('initializing project [ccms-order]...');
                                var mysqlModels = [
                                        {name: 'order', table: 'CCMS_ORDER', view: 'CCMS_ORDER'},
                                        {name: 'recharge', table: 'RECHARGE_RECORD', view: 'RECHARGE_RECORD'}
                                ];
                                yield MysqlModelGenerator.generate(ctx.datasource, ctx.database, mysqlModels);

                                var factory = new ModelProxyActionFactory({
                                        getModel: function () {
                                                return MysqlModelGenerator.getModel('order');
                                        }
                                }, 'ccms-order-order');
                                ActionFactory.register(factory.getCreateAction('*', null,
                                        {
                                                beforeCreate: function (model, ctx) {
                                                        return function *() {
                                                                model.merge({orderState: '0'});
                                                        }
                                                }

                                        }), null, null, '新增订单');
                                ActionFactory.register(factory.getReadAction(), null, null, '查询单个订单');
                                ActionFactory.register(factory.getUpdateAction(), null, null, '修改订单');
                                ActionFactory.register(factory.getDelAction(), null, null, '删除订单');
                                var queryAction = factory.getListAction({
                                        'orderCode': 'like',
                                        'orderDate': 'between',
                                        'customerName' : 'like',
                                        'batchNumber': 'like',
                                        'terminalId': 'like',
                                        'simNumber': 'like',
                                        'simEnddate': 'between',
                                        'simBegindate': 'between'
                                });
                                ActionFactory.register(queryAction, null, null, '查询订单列表');


                                factory = new ModelProxyActionFactory({
                                        getModel: function () {
                                                return MysqlModelGenerator.getModel('recharge');
                                        }
                                }, 'ccms-order-recharge');
                                ActionFactory.register(factory.getCreateAction('*', null,
                                        {
                                                beforeCreate: function (model, ctx) {
                                                        return function *() {
                                                                model.merge({rechargeTime: new Date()});
                                                        }
                                                }

                                        }), null, null, '新增充值记录');

                                ActionFactory.register(factory.getReadAction(), null, null, '查询单个充值记录');
                                ActionFactory.register(factory.getUpdateAction(), null, null, '修改充值记录单');
                                ActionFactory.register(factory.getDelAction(), null, null, '删除充值记录');
                                var queryAction = factory.getListAction({
                                        'simNumber': 'like',
                                        'rechargeTime': 'between',
                                        'expiryDate': 'between'
                                })
                                ActionFactory.register(queryAction, null, null, '查询充值记录列表');

                                //   logger.error(JSON.stringify(test));
                                /*       var connection = yield ctx.datasource.getConnection();
                                 var data = yield connection.list(MysqlModelGenerator.getModel('order'));
                                 logger.error(JSON.stringify(data));
                                 yield ctx.datasource.releaseConnection(connection);*/
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = ProjectEntry;
})();