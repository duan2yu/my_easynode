var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var AbstractRouteFactory = using('easynode.framework.server.http.AbstractRouteFactory');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var _ = require('underscore');

(function () {
        /**
         * Class BookshelfModelProxyRouteFactory
         *
         * @class easynode.framework.db.BookshelfModelProxyRouteFactory
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class BookshelfModelProxyRouteFactory extends AbstractRouteFactory {
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
                        this.bookshelf = null;
                        this.modelName = null;
                        this.uriPrefix = null;
                        this.proxies = ['create', 'read', 'update', 'delete', 'list'];
                        this.restful = true;
                        this.contentType = 'create(json);read(json);update(json);delete(json);list(json);';
                        this.view = null;                                       //format create(xxxx);read(xxx);
                        this.viewDir = null;
                        this._model = null;
                }

                _getContentType(name) {
                        var regExp = new RegExp(name + '\\((.*?)\\);');
                        if (regExp.test(this.contentType)) {
                                return regExp.exec(this.contentType)[1];
                        }
                        return 'json';
                }

                _getView(name) {
                        var regExp = new RegExp(name + '\\((.*?)\\);');
                        if (regExp.test(this.view)) {
                                return regExp.exec(this.view)[1];
                        }
                        return null;
                }

                createHandler(bookshelf, model, route) {
                        return function * () {
                                EasyNode.DEBUG && logger.debug('executing create...');
                                //TODO model field analyze
                                //TODO model field validation
                                var ret = yield model.forge(this.parameter.params()).save();
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                readHandler(bookshelf, model, route) {
                        return function * () {
                                EasyNode.DEBUG && logger.debug('executing read...');
                                var id = this.params.id;
                                var ret = yield model.forge({id : id}).fetch();
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                updateHandler(bookshelf, model, route) {
                        return function * () {
                                EasyNode.DEBUG && logger.debug('executing update...');
                                //TODO model field analyze
                                //TODO model field validation
                                var id = this.params.id;
                                var ret = yield model.forge(this.parameter.params()).set({id : id}).save();
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                deleteHandler(bookshelf, model, route) {
                        return function * () {
                                EasyNode.DEBUG && logger.debug('executing delete...');
                                var id = this.params.id;
                                var ret = yield model.forge({id : id}).destroy();
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                listHandler(bookshelf, model, route) {
                        return function * () {
                                EasyNode.DEBUG && logger.debug('executing list...');
                                //TODO query condition, query condition organization apply
                                var ret = yield model.forge().where(this.parameter.params()).fetch();
                                return ActionResult.createSuccessResult(ret);
                        };
                }

                _getCreateRoute() {
                        var method = this.restful ? 'post' : 'post/get';
                        var uri = this.restful ? this.uriPrefix : (this.uriPrefix + '/create');
                        var route = {
                                uri: uri,
                                methods: method,
                                contentType: this._getContentType('create'),
                                view: this._getView('create'),
                                viewDir: this.viewDir
                        };
                        route.handler = this.createHandler(this.bookshelf, this._model, route);
                        return route;
                }

                _getReadRoute() {
                        var method = 'get';
                        var uri = this.restful ? (this.uriPrefix + '/:id') : (this.uriPrefix + '/read/:id');
                        var route = {
                                uri: uri,
                                methods: method,
                                contentType: this._getContentType('read'),
                                view: this._getView('read'),
                                viewDir: this.viewDir
                        };
                        route.handler = this.readHandler(this.bookshelf, this._model, route);
                        return route;
                }

                _getUpdateRoute() {
                        var method = this.restful ? 'put' : 'post/get';
                        var uri = this.restful ? (this.uriPrefix + '/:id') : (this.uriPrefix + '/update/:id');
                        var route = {
                                uri: uri,
                                methods: method,
                                contentType: this._getContentType('update'),
                                view: this._getView('update'),
                                viewDir: this.viewDir
                        };
                        route.handler = this.updateHandler(this.bookshelf, this._model, route);
                        return route;
                }

                _getDeleteRoute() {
                        var method = this.restful ? 'delete' : 'post/get';
                        var uri = this.restful ? (this.uriPrefix + '/:id') : (this.uriPrefix + '/delete/:id');
                        var route = {
                                uri: uri,
                                methods: method,
                                contentType: this._getContentType('delete'),
                                view: this._getView('delete'),
                                viewDir: this.viewDir
                        };
                        route.handler = this.deleteHandler(this.bookshelf, this._model, route);
                        return route;
                }

                _getListRoute() {
                        var method = 'get';
                        var uri = this.restful ? this.uriPrefix : (this.uriPrefix + '/list/:id');
                        var route = {
                                uri: uri,
                                methods: method,
                                contentType: this._getContentType('list'),
                                view: this._getView('list'),
                                viewDir: this.viewDir
                        };
                        route.handler = this.listHandler(this.bookshelf, this._model, route);
                        return route;
                }

                getRoutes() {
                        assert(this.bookshelf && this.modelName && this.uriPrefix, 'Invalid values [bookshelf, modelName, uriPrefix]');
                        this._model = this.bookshelf.models[this.modelName];
                        var routes = [];
                        if (_.contains(this.proxies, 'create')) {
                                routes.push(this._getCreateRoute());
                        }
                        if (_.contains(this.proxies, 'read')) {
                                routes.push(this._getReadRoute());
                        }
                        if (_.contains(this.proxies, 'update')) {
                                routes.push(this._getUpdateRoute());
                        }
                        if (_.contains(this.proxies, 'delete')) {
                                routes.push(this._getDeleteRoute());
                        }
                        if (_.contains(this.proxies, 'list')) {
                                routes.push(this._getListRoute());
                        }
                        return routes;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = BookshelfModelProxyRouteFactory;
})();