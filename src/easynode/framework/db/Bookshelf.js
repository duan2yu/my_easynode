var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var knex = require('knex');
var bookshelf = require('bookshelf');
var _ = require('underscore');
var thunkify = require('thunkify');

(function () {
        /**
         * Class Bookshelf
         *
         * @class easynode.framework.db.Bookshelf
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class Bookshelf extends GenericObject {
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
                        /**
                         *  knex实例
                         *
                         * @property knex
                         * @type {Object} knex
                         * @default null
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.knex = null;

                        /**
                         *  bookshelf.Model键值对。该键值对由initialize方法加载和定义
                         *
                         * @property models
                         * @type {Object}
                         * @default {}
                         * @since 0.1.0
                         * @author zlbbq
                         * */
                        this.models = {};
                }

                /**
                 * 初始化Bookshelf。
                 *
                 * <pre>
                 *
                 *  //easynode.tests.models.XXX
                 * var modelDefinitionImpl = {
                 *      define : function(bookshelf) {
                 *              var MyModel = bookshelf.Model.extend({tableName : 'test'});
                 *              var Model2 = bookshelf.Model.extend({tableName : 'test2'});
                 *              return {
                 *                      Model1 : MyModel,
                 *                      Mode2 : Model2
                 *              };
                 *      }
                 * };
                 *
                 * module.exports = modelDefinitionImpl;
                 *
                 * usage :
                 * var bs = new Bookshelf();
                 * bs.initialize(connectOpts, 'easynode.tests.models.*');
                 * yield new bs.models.Model1({name : 'zlbbq'}).fetch();
                 * </pre>
                 *
                 * @method initialize
                 * @param {Object} opts Mysql连接池配置，对象原型：
                 *                      {
                 *                              host : '127.0.0.1',
                 *                              port : 3306',
                 *                              user : 'root',
                 *                              password : 'password of root',
                 *                              database : 'db,
                 *                              minConnections :  1,
                 *                              maxConnections : 1
                 *                      }
                 * @param {String...} modelNamespaces 模型定义文件命名空间(通常组织为一个包名)，这个包里或类里需要导出IModelDefinition。
                 * 这个包里的导出文件可以写成以下几种：1、导出Class，定义静态方法define，２、导出Class，定义成员函数define(实现IModelDefinition接口)，３、导出Object，定义成员函数define。
                 * define方法或函数参考easynode.framework.db.IModelDefinition接口。
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                initialize(opts, ...modelNamespaces) {
                        assert(opts, 'Invalid argument');
                        EasyNode.DEBUG && logger.debug(JSON.stringify(opts));
                        var me = this;
                        var knexOpts = {
                                debug : EasyNode.DEBUG,
                                dialect : 'mysql',
                                connection : {
                                        host : '127.0.0.1',
                                        port : 3306,
                                        user : 'root',
                                        password : '',
                                        database : 'db'
                                },
                                pool : {
                                        min : 1,
                                        max : 1
                                },
                                migrations: {
                                        tableName: 'knex_migrations'
                                }
                        };
                        knexOpts.client = opts.client || knexOpts.client;
                        knexOpts.connection.host = opts.host || knexOpts.connection.host;
                        knexOpts.connection.port = opts.port || knexOpts.connection.port;
                        knexOpts.connection.user = opts.user || knexOpts.connection.user;
                        knexOpts.connection.password = opts.password || knexOpts.connection.password;
                        knexOpts.connection.database = opts.database || knexOpts.connection.database;
                        knexOpts.pool.min = opts.minConnections || 1;
                        knexOpts.pool.max = opts.maxConnections || 1;
                        this.knex = knex(knexOpts);
                        this.bookshelf = bookshelf(this.knex);
                        this._originalTransaction = this.knex.transaction;
                        this.knex.transaction = function () {
                                return function * () {
                                        function _t(cb) {
                                                me._originalTransaction.call(me.knex, function(tran){
                                                        var err = tran == null ? new Error('begin knex transaction fail') : null;
                                                        cb && cb(err, tran);
                                                });
                                        }
                                        var fn = thunkify(_t);
                                        return yield fn();
                                };
                        };
                        for(var i = 0;i<modelNamespaces.length;i++) {
                                var ns = modelNamespaces[i];
                                var o = using(ns);
                                if(typeof o == 'function' && typeof o.prototype.define == 'function') {
                                        //导出了一个类，实例化它
                                        this._defineModels(new o().define(this.bookshelf));
                                }
                                if(typeof o == 'function' && typeof o.define == 'function') {
                                        //导出了一个类，实例化它
                                        this._defineModels(o.define(this.bookshelf));
                                }
                                else if(ns.endsWith('.*') && typeof o == 'object') {
                                        for(var exported in o) {
                                                var Clazz = o[exported];
                                                if(typeof  Clazz == 'function' && typeof Clazz.prototype.define == 'function') {
                                                        //导出了一个类，实例化它
                                                        this._defineModels(new Clazz().define(this.bookshelf));
                                                }
                                                if(typeof Clazz == 'function' && typeof Clazz.define == 'function') {
                                                        //导出了一个类，实例化它
                                                        this._defineModels(Clazz.define(this.bookshelf));
                                                }
                                                else if(typeof Clazz == 'object' && typeof Clazz.define == 'function') {
                                                        this._defineModels(Clazz.define(this.bookshelf));
                                                }
                                                else {
                                                        logger.error('invalid model definition ['+ns+']['+exported+']');
                                                }
                                        }
                                }
                                else if(typeof o == 'object' && typeof o.define == 'function') {
                                        this._defineModels(o.define(this.bookshelf));
                                }
                                else {
                                        this._defineModels(logger.error('invalid model definition ['+ns+']'));
                                }
                        }
                }

                _defineModels(exported) {
                        _.extend(this.models, exported);
                }

                /**
                 * 返回包装的knex实例。
                 *
                 * @method getKnex
                 * @return {knex} 返回包装的knex实例。
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                getKnex() {
                        assert(this.knex, 'knex has not been initialized');
                        return this.knex;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = Bookshelf;
})();