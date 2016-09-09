var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var TestCase = using('easynode.framework.test.TestCase');
var Action = using('easynode.framework.mvc.Action');
var ActionResult = using('easynode.framework.mvc.ActionResult');
var ActionFactory = using('easynode.framework.mvc.ActionFactory');

(function () {
        /**
         * Class ActionTest
         *
         * @class easynode.tests.ActionTest
         * @extends easynode.framework.test.TestCase
         * @since 0.1.0
         * @author zlbbq
         * */
        class ActionTest extends TestCase {
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

                createTestAction1() {
                        class TestAction extends Action {
                                constructor() {
                                        super();
                                }

                                process(ctx) {
                                        return function * () {
                                                return ActionResult.createSuccessResult('Hello, test action1');
                                        };
                                }
                        }
                        Action.define('mvc-test', 'action1', TestAction);
                        ActionFactory.register(TestAction);
                        logger.info('access [/rest/mvc-test/action1] to call action1');
                }

                createTestAction2() {
                        var action2 = new Action();
                        action2.addArg('p1 int p1-comment');
                        action2.addArg('p2 string p2-comment');
                        action2.process = function(ctx, p1, p2) {
                                return function * () {
                                        return ActionResult.createSuccessResult({
                                                from : 'action2',
                                                p1 : p1,
                                                p1Type : typeof p1,
                                                p2 : p2,
                                                p2Type : typeof p2
                                        });
                                };
                        };
                        Action.define('mvc-test', 'action2', action2);
                        ActionFactory.register(action2);
                        logger.info('access [/rest/mvc-test/action2] to call action2');
                }

                createTestAction3() {
                        var MethodDispatchedAction = using('easynode.framework.mvc.MethodDispatchedAction');
                        class Action3 extends MethodDispatchedAction {
                                constructor () {
                                        super();
                                        this.dispatch(this.action_action3);                    //here "action_" is the default prefix of dispatch action,
                                                                                                                        // "action3" is the real action name
                                }

                                action_action3() {
                                        return {
                                                defineArgs: function () {
                                                        this
                                                                .addArg('p1 int')
                                                                .addArg('p2 string')
                                                                .noop();
                                                },
                                                process: function (ctx, p1, p2) {
                                                        return function * () {
                                                                return ActionResult.createSuccessResult({
                                                                        from : 'action3',
                                                                        p1 : p1,
                                                                        p1Type : typeof p1,
                                                                        p2 : p2,
                                                                        p2Type : typeof p2
                                                                });
                                                        };
                                                }
                                        };
                                }
                        }
                        ActionFactory.registerMethodDispatchedAction(Action3, 'mvc-test');
                        logger.info('access [/rest/mvc-test/action3] to call action3');
                }

                createTestAction4 () {
                        // register all actions classes in the namespace
                        // The Action class should inherit from easynode.framework.mvc.Action
                        // and file name match the "Action File Pattern"(default to /^*Action.js$/)
                        // Note : ActionFactory.registerNamespace is an ASYNC function
                        return function * () {
                                yield ActionFactory.registerNamespace('easynode.tests');
                        };
                }

                start() {
                        var me = this;

                        return function * () {
                                var KOAHttpServer = using('easynode.framework.server.http.KOAHttpServer');
                                var server = new KOAHttpServer();                             //default koa http server port is 5000
                                me.createTestAction1();
                                me.createTestAction2();
                                me.createTestAction3();
                                yield me.createTestAction4();
                                yield server.start();
                        };
                }

                getClassName() {
                        return EasyNode.namespace(__filename);
                }
        }

        module.exports = ActionTest;
})();