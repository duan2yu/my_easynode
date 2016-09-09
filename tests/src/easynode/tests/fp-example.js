var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');

(function () {
        var o = {
                init : function() {
                        logger.error('fp-example initialized');
                        //logger.error(this.bookshelf);
                }
        };
        module.exports = o;
})();