var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var SqlUtil = using('easynode.framework.util.SqlUtil');
var _ = require('underscore');

(function () {
        /**
         * Class MotorConsoleUtil
         *
         * @class #NAMESPACE#.MotorConsoleUtil
         * @extends easynode.GenericObject
         * @since 0.1.0
         * @author zlbbq
         * */
        class MotorConsoleUtil extends GenericObject {
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
                        this.constants = {
                                IMEI_LENGTH : 15,
                                DEFAULT_RPP : 20,
                                ADMIN_VENDOR : 1,
                                INSTALLED_DEVICE : 0,
                                UNINSTALLED_DEVICE : 1,
                                DEFAULT_REGCODE : '123456',
                                INVENTORY_IN : 0,
                                INVENTORY_OUT : 1,
                                INVENTORY_TYPE_BATCH_IN : 0,
                                INVENTORY_TYPE_BATCH_OUT : 1,
                                INVENTORY_TYPE_SINGLE_IN : 2,
                                INVENTORY_TYPE_SINGLE_OUT : 3,
                                VENDOR_ENABLED : 0,
                                VENDOR_DISABLED : 1,
                                STATUS_ENABLE:1,
                                STATUS_DISABLE:0
                        };
                }

                checkSession(ctx) {
                        if(ctx.session.USER == null) {
                                return ActionResult.createNoSessionError();
                        }
                }

                isAdmin(ctx) {
                        return ctx.session.USER && ctx.session.USER.vendorId === this.constants.ADMIN_VENDOR;
                }

                setDownloadHeader(ctx, fileName, contentType) {
                        var userAgent = (ctx.header['user-agent']||'').toLowerCase();
                        if(userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
                                ctx.set('Content-Disposition', 'attachment; filename=' + encodeURIComponent(fileName));
                        } else if(userAgent.indexOf('firefox') >= 0) {
                                ctx.set('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(fileName)+'"');
                        } else {
                                /* safari等其他非主流浏览器只能自求多福了 */
                                //this.set('Content-Disposition', 'attachment; filename=' + new Buffer(fileName[0]).toString('binary'));
                                ctx.set('Content-Disposition', 'attachment; filename=' + encodeURIComponent(fileName));
                        }
                        ctx.status = 200;
                        ctx.type = contentType;
                }

                //orderBy : string或array.
                /*
                * countAndQuery(qb, page, rpp, 'columnName', ...);       order by coumnName ASC
                * countAndQuery(qb, page, rpp, 'columnName DESC', ...);       order by coumnName DESC
                * countAndQuery(qb, page, rpp, ['columnNameA', 'columnB DESC'], ...);       order by columnNameA ASC, columnNameB DESC
                *
                * */
                countAndQuery(qb, page, rpp, orderBy, ...columns) {
                        return SqlUtil.doPaginationSelect.call(null, qb, page, rpp, orderBy, columns);
                }

                getRegExps() {
                        return {
                                mobile : /^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/,                    //手机号
                                email : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,        //邮箱
                                regCode : /^\d{6}$/,                                                                        //设备注册码
                                tel:/^(0?1[358]\d{9})$|^((0(10|2[1-3]|[3-9]\d{2}))?[1-9]\d{6,7})$/
                };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = MotorConsoleUtil;
})();