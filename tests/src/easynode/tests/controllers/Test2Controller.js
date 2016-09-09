var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');

(function () {
        module.exports = {
                test2Demo : function * () {
                        logger.error(JSON.stringify(this.req.headers));
                        this.cookies.set('name','zlbbq');
                        return ActionResult.createSuccessResult({name : 'zlbbq-test2'});
                }
        };
})();