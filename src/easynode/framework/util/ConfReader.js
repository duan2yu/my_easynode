var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var fs = require('co-fs');
var S = require('string');

(function () {
        /**
         * Class ConfReader
         *
         * @class easynode.framework.util.ConfReader
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class ConfReader extends GenericObject {
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
                 * 读取conf配置文件。
                 *
                 * @method read
                 * @param {String} absPath conf文件的绝对路径
                 * @return {Object} 配置项键值对
                 * @static
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                static read(absPath) {
                        var content = yield fs.readFile(absPath, 'utf8');
                        var lines = content.split('\n');
                        var ret = {};
                        lines.forEach(line => {
                                if(!line) return;                               //empty line
                                if(line.startsWith('#')) return;       //comment
                                var idx = line.indexOf('=');
                                if(idx <= 0) return;                          //error format
                                var key = S(line.substring(0, idx)).trim();
                                var val = S(line.substring(idx + 1)).trim();
                                ret[key] = val;
                        });
                        return ret;
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        ConfReader.SAME_MAJOR_VERSION = 0;
        ConfReader.SAME_MINOR_VERSION = 0;

        module.exports = ConfReader;
})();