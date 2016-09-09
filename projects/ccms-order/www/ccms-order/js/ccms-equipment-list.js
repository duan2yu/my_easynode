/// <reference path="../../js/lib/jquery-1.11.3.min.js" />
///<reference path="../../bootstrap-3.3.4/js/bootstrap-select.js
///<reference path="../../bootstrap-3.3.4/js/bootstrap-datetimepicker.js
var app = angular.module('app', []);
app.controller("orderList", function ($scope, $http) {

        $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                        if (fn && (typeof(fn) === 'function')) {
                                fn();
                        }
                } else {
                        this.$apply(fn);
                }
        };
        $scope.queryKey = '';
        $scope.orderScope = 'all';
        $scope.orderProp = 'terminalId';
        $scope.param = {
                simNumber: '',
                rechargeTime: '',
                rechargeAmount: '',
                rechargeUser: '',
                expiryDate: ''
        };
        $scope.queryListTest = function () {
                //alert(2);
                $scope.safeApply(function () {

                        $scope.List = [];
                });
                $scope.List = [];
        };

        //$("#conditionSelect").selectpicker();
        $scope.deleteOrder = function (orderId) {
                EasyNode.confirm('提示', '确定要删除该条数据吗？', function () {
                        var param = {
                                orderIds: orderId
                        }
                        with (EasyNode.action) {
                                request('/ccms-order-order/D', param, 'get', function (result) {
                                        $scope.queryList();
                                })
                        }
                })

        };

        $scope.SelectChange = function (orderProp) {
                if(orderProp=='simBegindate'||orderProp=='simEnddate'){
                        $('#inputKey').val(EasyNode.dateUtil.toString(new Date(),'YYYY-M-D'));
                        $('#inputKey').datetimepicker({
                                format: 'yyyy-mm-dd',
                                language: 'zh',
                                weekStart: 1,
                                todayBtn: 1,
                                autoclose: 1,
                                todayHighlight: 1,
                                startView: 2,
                                minView: 3,
                                forceParse: 0
                        });
                }
        }
        $scope.queryList = function (page) {
                page = page || 1
                var param = {
                        _page: page,
                        _rpp: 10
                };
                if ($scope.queryKey.length > 0) {
                        param._page = page = 1;
                        param[$scope.orderProp] = $scope.queryKey;
                }
                ;
                switch ($scope.orderScope) {
                        case 'expired':
                                param._rpp = 1000;
                                param.simEnddate = "," + EasyNode.dateUtil.toString(new Date(), 'YYYY-MM-DD');
                                break;
                        case 'expiring':
                                param._rpp = 1000;
                                var newDate = new Date();
                                newDate.setDate(1)
                                newDate.setMonth(newDate.getMonth() + 1);
                                var newDate1 = new Date();
                                newDate1.setMonth(newDate1.getMonth() + 2);
                                newDate1.setDate(1);
                                param.simEnddate = EasyNode.dateUtil.toString(newDate, 'YYYY-MM-DD') + "," + EasyNode.dateUtil.toString(newDate1, 'YYYY-MM-DD');
                                break;
                        default :
                                param._rpp = 10;
                }

                //$http.get('/action/ccms-order-order/L', {params: param}).success(function (result) {
                //        //$scope.safeApply(function () {
                //        //$scope.list.length = 0;
                //        $scope.List = result.result.data;
                //        //})
                //});

                with (EasyNode.action) {
                        request('/ccms-order-order/L', param, 'get', function (result) {
                                //if (result.data.length == 0) {
                                //        $scope.safeApply(function () {
                                //                $scope.list = [];
                                //        })
                                //        $scope.list = [];
                                //        //$('body').scope().$digest();
                                //}
                                //else {
                                $scope.safeApply(function () {
                                        $scope.List = result.data;
                                })
                                //$scope.list = result.data;

                                //}

                                var options = {
                                        url: "ng-click",
                                        alignment: "right",
                                        currentPage: (result.pages == 0) ? 1 : page,
                                        totalPages: (result.pages == 0) ? 1 : result.pages,
                                        itemTexts: function (type, page, current) {
                                                switch (type) {
                                                        case "first":
                                                                return "<<";
                                                        case "prev":
                                                                return "<";
                                                        case "next":
                                                                return ">";
                                                        case "last":
                                                                return ">>";
                                                        case "page":
                                                                return page;
                                                }
                                        },
                                        pageUrl: function (type, page, current) {
                                                return page;
                                                //return "query("+page+")";
                                        }
                                }
                                $('#page1').bootstrapPaginator(options);

                                $('#page1 a').click(function () {
                                        if ($(this).parent().attr("class") == "active") {
                                                return;
                                        }
                                        $scope.queryList($(this).attr("ng-click"));
                                })
                        })
                }
        }


        $scope.queryList();

        $scope.DateTostring = function (dateStr) {
                return EasyNode.dateUtil.serverDate2String(dateStr, 'YYYY年M月D日')
        };
        $scope.addSimEnddate = function (MonthNum) {
                switch (MonthNum) {
                        case 3:
                                $scope.param.rechargeAmount = 30;
                                break;
                        case 6:
                                $scope.param.rechargeAmount = 60;
                                break;
                        default :
                                $scope.param.rechargeAmount = 100;
                }
                var date1 = EasyNode.dateUtil.parse($scope.tempSimEnddate);
                //date1.setDate(date1.getDate()+31*MonthNum) ;
                date1.setMonth(date1.getMonth() + MonthNum);
                $scope.safeApply(function () {
                        $scope.param.expiryDate = EasyNode.dateUtil.toString(date1);

                })
                $scope.param.expiryDate = EasyNode.dateUtil.toString(date1);
        }
        $scope.ToRenewals = function ($event) {
                //alert($(angular.element($event.currentTarget)).attr('simNumber'));
                $scope.param.simNumber = $(angular.element($event.currentTarget)).attr('simNumber');
                $scope.tempSimEnddate = $(angular.element($event.currentTarget)).attr('simEnddate');
                $scope.tempOrderId = $(angular.element($event.currentTarget)).attr('orderId');
                $scope.param.rechargeTime = EasyNode.dateUtil.toString(new Date());
                $scope.param.rechargeUser = $(angular.element($event.currentTarget)).attr('rechargeUser');
                $scope.safeApply(function () {
                        $scope.param.expiryDate = EasyNode.dateUtil.serverDate2String($(angular.element($event.currentTarget)).attr('simEnddate'), "YYYY-MM-DD");
                })
                $('#expiryDate').attr('data-date', EasyNode.dateUtil.serverDate2String($(angular.element($event.currentTarget)).attr('simEnddate'), "YYYY-MM-DD"));
                $('#expiryDate').val(EasyNode.dateUtil.serverDate2String($(angular.element($event.currentTarget)).attr('simEnddate'), "YYYY-MM-DD"));
                $('#expiryDate').datetimepicker({
                        //format: 'yyyy-mm-dd',
                        language: 'zh',
                        weekStart: 1,
                        todayBtn: 1,
                        autoclose: 1,
                        todayHighlight: 1,
                        startView: 2,
                        minView: 3,
                        forceParse: 0
                });
                $('#myModal').modal('show');
        }

        $scope.queryRechargeRecord = function (simNumber) {
                open('ccms-recharge-record.html?simNumbe=' + simNumber);
        };
        $scope.viewOrder = function (orderId) {
                open('ccms-order.html?action=view&orderId=' + orderId);
        };
        $scope.editOrder = function (orderId) {
                open('ccms-order.html?action=edit&orderId=' + orderId);
        };
        $scope.Renewals = function () {

                with (EasyNode.action) {
                        request('/ccms-order-order/U', {
                                orderId: $scope.tempOrderId,
                                simEnddate: $scope.param.expiryDate
                        }, 'get', function (result) {
                                request('/ccms-order-recharge/C', $scope.param, 'get', function (result) {
                                        $('#myModal').modal('hide');
                                        EasyNode.alert("提示", '续费成功', function () {
                                                $scope.queryList();
                                        });
                                        //alert("续费成功");

                                })
                        })

                }
        }
})




