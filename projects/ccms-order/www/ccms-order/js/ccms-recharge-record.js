/// <reference path="../../js/lib/jquery-1.11.3.min.js" />
///<reference path="../../bootstrap-3.3.4/js/bootstrap-select.js
var app = angular.module('app', []);
app.controller("recordList", function ($scope, $http) {
        $scope.simNumber = GetQueryString('simNumbe')||'';
        $scope.queryListTest = function () {
                $scope.List = [];
        }
        $scope.queryList = function (page) {
                page = page || 1
                var param = {
                        _page: page,
                        _rpp: 10
                }
                if ($scope.simNumber.length > 0) {
                        param.simNumber = $scope.simNumber;
                }

                with (EasyNode.action) {
                        request('/ccms-order-recharge/L', param, 'get', function (result) {

                                $scope.List = result.data;
                                $('.tab-content').scope().$digest();

                                var options = {
                                        url: "ng-click",
                                        alignment: "right",
                                        currentPage: page,
                                        totalPages: result.pages == 0 ? 1 : result.pages,
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
        $scope.deleteRecord = function (recordId) {
                var param = {
                        rechargeids: recordId
                }
                with (EasyNode.action) {
                        EasyNode.confirm('提示','确认删除该条信息吗？',function(){
                                request('/ccms-order-recharge/D', param, 'get', function (result) {
                                        $scope.queryList();
                                        EasyNode.alert('提示','删除成功');
                                })
                        })
                }
        }


        $scope.queryList();

        $scope.orderProp = 'terminalId';

        $scope.DateTostring = function (dateStr) {
                return EasyNode.dateUtil.serverDate2String(dateStr,'YYYY年M月D日');
        };

        function GetQueryString(name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if (r != null)return unescape(r[2]);
                return null;
        }
})


