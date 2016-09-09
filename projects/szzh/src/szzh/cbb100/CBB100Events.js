var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);

(function () {
        module.exports = {
                DEVICE_ONLINE : 'device-online',
                DEVICE_OFFLINE : 'device-offline',
                DEVICE_ALARM : 'device-alarm',
                DEVICE_MSG_RECEIVED : 'device-msg-received',
                DEVICE_REPORT_DATA : 'device-report-data'
        };
})();