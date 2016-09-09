var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var AbstractScheduleExecutor = using('easynode.framework.schedule.AbstractScheduleExecutor');

(function () {
        /**
         * 计划任务执行接口
         *
         * @class szzh.cbb100.sync.SyncDailyStatScheduler
         * @extends easynode.framework.schedule.AbstractScheduleExecutor
         * @since 0.1.0
         * @author zlbbq
         * */
        class SyncDailyStatScheduler extends AbstractScheduleExecutor {
                /**
                 * 构造函数。
                 *
                 * @method 构造函数
                 * @protected
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                constructor() {
                        super();
                        //调用super()后再定义子类成员。
                        this.cache = null;                                                  //IoC
                        this.bookshelf = null;                                          //IoC
                }
                /**
                 * 执行计划任务入口函数。
                 *
                 * @method execute
                 * @param {Date} date 统计执行时间，默认为系统当前时间，实际统计日期为date前一天
                 * @async
                 * @since 0.1.0
                 * @author zlbbq
                 * */
                execute (date) {
                        var me = this;
                        return function * () {
                                var nowTime = new Date().getTime();
                                var statDate = date || new Date();
                                var yesterday = statDate.getTime() - 86400000;
                                var dateStr = new Date(yesterday).toFormat('YYYY-MM-DD');
                                logger.info('start daily statistics -> ' + dateStr);
                                var cachePrefix = 'DAILY-STAT-' + dateStr + '-';
                                var devices = yield me.bookshelf.knex('motor_device').select('id', 'imei');
                                for(var i = 0;i<devices.length;i++) {
                                        var IMEI = devices[i].imei;
                                        var stat = yield me.cache.get(cachePrefix + IMEI);
                                        /*
                                        stat = stat || {
                                                        distance : 0,
                                                        time : 0,
                                                        stop : 0,
                                                        alarmMovement : 0,
                                                        alarmPowerOff : 0,
                                                        alarmShock : 0,
                                                        alarmSpeedy : 0,
                                                        alarmDoorOpened : 0,
                                                        alarmEnterEF : 0,
                                                        alarmLeaveEF : 0
                                                };
                                         */
                                        if(!stat) {
                                                continue;
                                        }
                                        var args = [
                                                devices[i].id,
                                                dateStr,
                                                stat.distance,
                                                stat.time,
                                                stat.stop,
                                                stat.alarmMovement,
                                                stat.alarmPowerOff,
                                                stat.alarmShock,
                                                stat.alarmSpeedy,
                                                stat.alarmDoorOpened,
                                                stat.alarmEnterEF,
                                                stat.alarmLeaveEF,
                                                nowTime
                                        ];
                                        yield me.bookshelf.knex.raw('replace into device_statistics(deviceId, date, distance, time, stop, alarmMovement, alarmPowerOff, alarmShock, alarmSpeedy, alarmDoorOpened, alarmEnterEF, alarmLeaveEF, statTime) values (?,?,?,?,?,?,?,?,?,?,?,?,?)', args);
                                        yield me.cache.del(cachePrefix + IMEI);
                                }
                                var span = new Date().getTime() - nowTime;
                                logger.info(`daily statistics for [${devices.length}] devices cost ${parseInt(span / 1000)} seconds...`);
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = SyncDailyStatScheduler;
})();