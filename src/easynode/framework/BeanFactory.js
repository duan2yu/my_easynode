var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var _ = require('underscore');
var fs = require('co-fs');
var path = require('path');
var Plugins = using('easynode.framework.plugin.Plugins');
var ofs = require('fs');

(function () {
        var configuration = {};
        var singletons = {};

        const INT_CONFIG_REGEXP = /^\$int\((.*)\)$/;
        const FLOAT_CONFIG_REGEXP = /^\$float\((.*)\)$/;
        const STRING_CONFIG_REGEXP = /^\$str\((.*)\)$/;
        const REQUIRE_REGEXP = /^\$require\((.*)\)$/;
        const PLUGIN_REGEXP = /^\$plugin\((.*)\)$/;
        const BEAN_REGEXP = /^\$(\w+)\.?(.*)$/;
        const PLUGIN_CLASS_REGEXP = /^plugin:(.+)@(.+)@(.*)$/;
        const INSTRUCTION_IMPORT = '@import';

        /**
         * Class BeanFactory
         *
         * @class easynode.framework.BeanFactory
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class BeanFactory extends GenericObject {
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
                 * 初始化BeanFactory。逐个读取参数中的文件，根据参数中的文件描述创建BeanFactory，实现IoC。这些文件应当是标准的JSON数据格式。
                 *
                 * @method initialize
                 * @static
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 *
                 * @example
                 *      yield BeanFactory.initialize('etc/beans/demo-easynode-beans.json', 'etc/beans/demo-easynode-beans-1.json');
                 * */
                static initialize() {
                        var arr = _.toArray(arguments);
                        return function * () {
                                for (var i = 0; i < arr.length; i++) {
                                        var file = EasyNode.real(arr[i]);
                                        var exists = yield fs.exists(file);
                                        if (!exists) {
                                                throw new Error(`beans configuration file [${file}] is not found`);
                                        }
                                        logger.info('loading bean description from configuration [' + file + ']');
                                        var content = yield fs.readFile(file);
                                        content = content.toString();
                                        var o = JSON.parse(content);
                                        for (var b in o) {
                                                if (b == INSTRUCTION_IMPORT) {
                                                        var p = o[b];
                                                        for(var j = 0;j<p.length;j++) {
                                                                var imported = p[j];
                                                                if (imported.startsWith('./') || imported.startsWith('../')) {
                                                                        imported = path.join(arr[i], '../', imported);
                                                                }
                                                                yield BeanFactory.initialize(imported);
                                                        }
                                                }
                                                else {
                                                        if (configuration[b]) {
                                                                logger.warn('duplicated bean name [' + b + ']');
                                                        }
                                                        configuration[b] = o[b];
                                                }
                                        }
                                }
                        };
                }

                /**
                 * 初始化BeanFactory。它是initialize函数的同步版本
                 *
                 * @method initialize
                 * @static
                 * @since 0.1.0
                 * @author zlbbq
                 *
                 * @example
                 *      BeanFactory.initializeSync('etc/beans/demo-easynode-beans.json', 'etc/beans/demo-easynode-beans-1.json');
                 * */
                static initializeSync() {
                        var arr = _.toArray(arguments);
                        for (var i = 0; i < arr.length; i++) {
                                var file = EasyNode.real(arr[i]);
                                var exists = ofs.existsSync(file);
                                if (!exists) {
                                        throw new Error(`beans configuration file [${file}] is not found`);
                                }
                                logger.info('loading bean description from configuration [' + file + ']');
                                var content = ofs.readFileSync(file);
                                content = content.toString();
                                var o = JSON.parse(content);
                                for (var b in o) {
                                        if (b == INSTRUCTION_IMPORT) {
                                                var p = o[b];
                                                for (var j = 0; j < p.length; j++) {
                                                        var imported = p[j];
                                                        if (imported.startsWith('./') || imported.startsWith('../')) {
                                                                imported = path.join(arr[i], '../', imported);
                                                        }
                                                        BeanFactory.initializeSync(imported);
                                                }
                                        }
                                        else {
                                                if (configuration[b]) {
                                                        logger.warn('duplicated bean name [' + b + ']');
                                                }
                                                configuration[b] = o[b];
                                        }
                                }
                        }
                }

                /**
                 * 根据bean ID获取Bean。
                 *
                 * @method get
                 * @param {String} id bean ID。
                 * @return {Object} bean实例。
                 * @static
                 * @since 0.1.0
                 * @author zlbbq
                 *
                 * @example
                 *      yield BeanFactory.initialize('etc/beans/demo-easynode-beans.json', 'etc/beans/demo-easynode-beans-1.json');
                 *      var bean1 = BeanFactory.get('bean1');
                 *      bean1.name1 = 'zlbbq';
                 *      bean1 = BeanFactory.get('bean1');
                 *      console.log(bean.name1);                //zlbbq, 使用singleton或prototype来描述创建bean的行为模式是单例还是原型。
                 * */
                static get(id) {
                        return BeanFactory.bean(id);
                }

                static init(id) {
                        return BeanFactory.get(id);
                }

                /**
                 * 放置一个单例bean至BeanFactory。可链式调用。
                 *
                 * @method put
                 * @param {String} id bean ID。
                 * @param {Object} obj bean实例。
                 * @return {easynode.framework.BeanFactory} 返回BeanFactory类，可链式调用
                 * @static
                 * @since 0.1.0
                 * @author zlbbq
                 *
                 * */
                static put(id, obj) {
                        assert(id && obj, 'Invalid argument');
                        if (configuration[id]) {
                                throw new Error('Duplicated bean id [${id}]');
                        }
                        configuration[id] = {
                                scope: 'singleton'
                        };
                        singletons[id] = obj;
                        return BeanFactory;
                }

                static bean(id) {
                        var cfg = configuration[id];
                        if (cfg == null) {
                                throw new Error(`bean [${id}] is not defined`);
                        }
                        if (typeof cfg != 'object') {
                                throw new Error(`definition of bean [${id}] is incorrect`);
                        }

                        var scope = cfg['scope'] || 'singleton';
                        if (scope == 'singleton') {
                                if (singletons[id] != null) {
                                        return singletons[id];
                                }
                                var o = BeanFactory.createBean(id, cfg);
                                return singletons[id] = o;
                        }
                        else if (scope == 'prototype') {
                                return BeanFactory.createBean(id, cfg);
                        }
                        else {
                                throw new Error(`Invalid bean scope [${scope}]`);
                        }
                }

                static createBean(id, cfg) {
                        var className = cfg['class'];
                        var init = cfg['init'];
                        var destroy = cfg['destroy'];
                        var props = cfg['props'];
                        var obj = null;

                        if (REQUIRE_REGEXP.test(className)) {
                                obj = require(EasyNode.real(REQUIRE_REGEXP.exec(className)[1]));
                        }
                        else if(PLUGIN_REGEXP.test(className)) {
                                var pluginFullName = PLUGIN_REGEXP.exec(className)[1];
                                var options = cfg['options'] || {};
                                for (var key in options) {
                                        var val = BeanFactory.eval(options[key]);
                                        options[key] = val;
                                }
                                obj = Plugins.createPluginInstance(pluginFullName, options);
                                return obj;
                        }
                        else if(PLUGIN_CLASS_REGEXP.test(className)) {
                                var [full, pluginName, pluginVersion, pluginClass] = PLUGIN_CLASS_REGEXP.exec(className);
                                var Clazz = Plugins.using(pluginClass, Plugins.getFullName(pluginName, pluginVersion));
                                if (typeof Clazz == 'function') {                                          //export a Class
                                        obj = new Clazz();
                                }
                                else {
                                        obj = Clazz;                                                                     //export a module or a literal object
                                }
                        }
                        else {
                                var Clazz = using(className);
                                if (typeof Clazz == 'function') {                                          //export a Class
                                        obj = new Clazz();
                                }
                                else {
                                        obj = Clazz;                                                                     //export a module or a literal object
                                }
                        }
                        if (props) {
                                assert(typeof props == 'object', `Invalid props config of bean [${id}]`);
                                for (var key in props) {
                                        var val = BeanFactory.eval(props[key]);
                                        obj[key] = val;
                                }
                        }

                        if (init) {
                                assert(typeof obj[init] == 'function', `Initialize function of bean [${id}] is not found`);
                                var initArgs = cfg['init-args'];
                                var initArgVals = [];
                                if (initArgs) {
                                        assert(_.isArray(initArgs), `Invalid init arguments`);
                                        for (var i = 0; i < initArgs.length; i++) {
                                                initArgVals.push(BeanFactory.eval(initArgs[i]));
                                        }
                                }
                                obj[init].apply(obj, initArgVals);
                        }

                        return obj;
                }

                static eval(exp) {
                        if (exp == null) return exp;

                        if (typeof exp == 'number') {
                                return exp;
                        }

                        if (typeof exp == 'object') {
                                for (var key in exp) {
                                        exp[key] = BeanFactory.eval(exp[key]);
                                }
                        }

                        if (INT_CONFIG_REGEXP.test(exp)) {
                                var configKey = INT_CONFIG_REGEXP.exec(exp)[1];
                                return parseInt(EasyNode.config(configKey, '0'));
                        }

                        if (FLOAT_CONFIG_REGEXP.test(exp)) {
                                var configKey = FLOAT_CONFIG_REGEXP.exec(exp)[1];
                                return parseFloat(EasyNode.config(configKey, '0'));
                        }

                        if (STRING_CONFIG_REGEXP.test(exp)) {
                                var configKey = STRING_CONFIG_REGEXP.exec(exp)[1];
                                return EasyNode.config(configKey);
                        }

                        if (BEAN_REGEXP.test(exp)) {
                                var arr = BEAN_REGEXP.exec(exp);
                                var beanId = arr[1] || '';
                                var o = BeanFactory.bean(beanId);
                                if (arr[2]) {
                                        var tempArr = arr[2].split('.');
                                        tempArr.forEach(part => {
                                                if (part) {
                                                        o = o[part];
                                                }
                                        });
                                }
                                return o;
                        }

                        return exp;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = BeanFactory;
})();