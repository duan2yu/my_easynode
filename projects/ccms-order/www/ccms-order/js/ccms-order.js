/// <reference path="../../js/lib/jquery-1.11.3.min.js" />
///<reference path="../../bootstrap-3.3.4/js/bootstrap-select.js"/>
///<reference path="../../js/lib/angular-1.3.16.min.js"/>
//var bb=setInterval()
var app = angular.module('app', []);
app.controller("order", function ($scope, $http, $timeout) {
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
        $scope.DateBind = function () {
                $('.date').datetimepicker({
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

        $("#orderAttachment").fileinput({
                showPreview: true,
                showUpload: true,
                showCaption: false,
                maxFilesNum: 1,
                uploadUrl: '/upload',
                maxFileCount: 1,
                showUploadedThumbs: true
        });
        $('#orderAttachment').on('fileuploaded', function (event, data, previewId, index) {
                var form = data.form, files = data.files, extra = data.extra,
                        response = data.response, reader = data.reader;
                $scope.orderAttachment = response.result.file_data.path;
                $scope.param.orderAttachment = response.result.file_data.path;

                $scope.imgName = $scope.param.orderAttachment.split('/')[4];
                console.log('File uploaded triggered');
        });
        $scope.DeleteorderAttachment=function(){
                $scope.safeApply(function(){
                        $scope.orderAttachment = '';
                })
                $scope.imgName='';
                $scope.param.orderAttachment ='';
        }
        var newDate = new Date();
        var newDate1 = new Date();
        newDate1.setFullYear(newDate1.getFullYear() + 1);
        newDate1.setDate(newDate1.getDate() - 1);
        $scope.orderAttachment='';
        $scope.linesJson = {
                line_6: 0,
                line_8: 0,
                line_10: 0,
                line_15: 0,
                line_20: 0,
                printer: 1,
                buzzer: 1,
                line_20ping: 1,
                gpsAntenna: 1,
                cdmaAntenna: 1,
                monitor:0
        };
        $scope.sensorsJson = [
                {number: '', certificateNumber: '', certificateDate: ''}
        ];
        $scope.param = {
                orderCode: "",
                orderDate: EasyNode.dateUtil.toString(newDate, 'YYYY-MM-DD'),
                manufacturer: '镇江康飞机器制造有限公司',
                batchNumber: '',
                customerName: '',
                customerAccount: '',
                customerPwd: '',
                expressNumber: '',
                expressPrice: '',
                terminalId: '',
                vehicleCode: '',
                factoryDate: EasyNode.dateUtil.toString(newDate, 'YYYY-MM-DD'),
                terminalType: '三代机',
                simNumber: '',
                simRealNumber: '',
                simPwd: '',
                simBegindate: EasyNode.dateUtil.toString(newDate, 'YYYY-MM-DD'),
                simEnddate: EasyNode.dateUtil.toString(newDate1, 'YYYY-MM-DD'),
                sensorsJson: [
                        {number: '', certificateNumber: '', certificateDate: ''}
                ],
                linesJson: {
                        line_6: 0,
                        line_8: 0,
                        line_10: 0,
                        line_15: 0,
                        line_20: 0,
                        printer: 1,
                        buzzer: 1,
                        line_20ping: 1,
                        gpsAntenna: 1,
                        cdmaAntenna: 1,
                        monitor:0
                },
                orderAttachment: '',
                orderState: 0,
                comment: "",
                totalAmount: 0
        }
        $scope.PriceList = {
                HostComputer: 1500,
                'line_20ping': 80,
                sensors: 180,
                line_6: 25,
                line_8: 28,
                line_10: 33,
                line_15: 46,
                line_20: 60,
                printer: 300,
                buzzer: 12,
                sim: 360,
                certificate: 200,
                cdmaAntenna: 0,
                gpsAntenna: 0,
                monitor:0

        };

        $scope.EstimateSimEnddate=function(simBegindate){

                var begindate=new Date(simBegindate);
                begindate.setFullYear(begindate.getFullYear()+1);
                begindate.setDate(begindate.getDate()-1);
                $scope.param.simEnddate=EasyNode.dateUtil.toString(begindate,'YYYY-MM-DD') ;
        }
        $scope.OnlyNum=function(key,val){
                $scope.linesJson[key]=$.trim(val);

                if(isNaN(val)||val=='') {
                        $scope.linesJson[key]=0;
                }
                else{
                        if(val.length>1){
                                var reg=/^[1-9]\d+$/;
                                if(!reg.test(val)){
                                        $scope.linesJson[key]=0;
                                }
                        }else{
                                var reg=/^[1-9]/;
                                if(!reg.test(val)){
                                        $scope.linesJson[key]=0;
                                }
                        }
                }
        }
        $scope.NumList = {
                HostComputer: 0,
                sensors: 0,
                sim: 0,
                certificate: 0
        };
        $scope.numStatistics = function () {
                var certificateNum = 0
                $(".hascertificateNumber:visible").each(function () {
                        if ($(this).val().trim() != '' && $(this).siblings('.certificateDate').val().trim() != '') {
                                certificateNum += 1;
                        }
                })

                $scope.NumList.line_6 = $scope.linesJson.line_6;
                $scope.NumList.line_8 = $scope.linesJson.line_8;
                $scope.NumList.line_10 = $scope.linesJson.line_10;
                $scope.NumList.line_15 = $scope.linesJson.line_15;
                $scope.NumList.line_20 = $scope.linesJson.line_20;
                $scope.NumList.printer = $scope.linesJson.printer;
                $scope.NumList.monitor = $scope.linesJson.monitor;
                $scope.NumList.buzzer = $scope.linesJson.buzzer;
                $scope.NumList.line_20ping = $scope.linesJson.line_20ping;
                $scope.NumList.gpsAntenna = $scope.linesJson.gpsAntenna;
                $scope.NumList.cdmaAntenna = $scope.linesJson.cdmaAntenna;
                $scope.NumList.HostComputer = $(".hashostComputer:visible").length;
                $scope.NumList.sim = $(".hassim:visible").length;
                $scope.NumList.sensors = $('.hasnumber:visible').length;
                $scope.NumList.certificate = certificateNum;
                $scope.param.totalAmount = 0;
                if ($scope.NumList.HostComputer > 0 && $scope.NumList.sim > 0 && $scope.NumList.sensors > 1 &&
                        $scope.linesJson.cdmaAntenna > 0 && $scope.linesJson.gpsAntenna > 0 && $scope.linesJson.buzzer > 0 &&
                        $scope.linesJson.line_20ping > 0 &&
                        $scope.linesJson.line_6 + $scope.linesJson.line_8 + $scope.linesJson.line_10 + $scope.linesJson.line_15 + $scope.linesJson.line_20>1) {
                        $scope.NumList.HostComputer -= 1;
                        $scope.NumList.sim -= 1;
                        $scope.NumList.sensors -= 2;
                        $scope.NumList.cdmaAntenna -= 1;
                        $scope.NumList.gpsAntenna -= 1;
                        $scope.NumList.buzzer -= 1;
                        $scope.NumList.line_20ping -= 1;
                        var clearline = 0;
                        var lineList = [20, 15, 10, 8, 6];
                        for (var _i = 0; _i < lineList.length; _i++) {
                                var _name = "line_" + lineList[_i];
                                if ($scope.NumList[_name] > 0) {
                                        if ($scope.NumList[_name] > 1) {
                                                $scope.NumList[_name] -= 2;
                                                break;
                                        } else {
                                                $scope.NumList[_name] -= 1;
                                                clearline += 1;
                                                if (clearline == 2) {
                                                        break;
                                                }
                                        }
                                }

                        }
                        $scope.param.totalAmount = 3033;
                        $scope.hasPackage=1;
                }
                else{
                        $scope.hasPackage=0;
                }

                $.each($scope.NumList, function (name, value) {
                        $scope.param.totalAmount += $scope.NumList[name] * $scope.PriceList[name];
                })
                //$scope.param.totalAmount=
                $timeout($scope.numStatistics, 1000);
        }
        $scope.numStatistics();
        $scope.imgUpload = function (sr) {

        }


        $scope.setOrderState = function (state) {
                $(".OrderState").eq(state).addClass('active');
                $(".OrderState").eq(state).siblings('.OrderState').removeClass('active');
                $scope.param.orderState = state;
        }
        $scope.queryOrderById = function (orderId, callback) {
                var param = {
                        orderId: orderId
                }

                with (EasyNode.action) {
                        request('/ccms-order-order/R', param, 'post', function (result) {
                                result.factoryDate = EasyNode.dateUtil.serverDate2String(result.factoryDate, 'YYYY-MM-DD');
                                result.orderDate = EasyNode.dateUtil.serverDate2String(result.orderDate, 'YYYY-MM-DD');
                                result.simBegindate = EasyNode.dateUtil.serverDate2String(result.simBegindate, 'YYYY-MM-DD');
                                result.simEnddate = EasyNode.dateUtil.serverDate2String(result.simEnddate, 'YYYY-MM-DD');
                                result.simBegindate = EasyNode.dateUtil.serverDate2String(result.simBegindate, 'YYYY-MM-DD');
                                $.each(result, function (name, value) {
                                        if(value=='null'){
                                                result[name]='';
                                        }
                                })
                                $scope.param = result;
                                $scope.linesJson = $scope.param.linesJson;
                                $scope.$apply(function () {
                                        $scope.sensorsJson = $scope.param.sensorsJson;
                                })
                                if ($scope.sensorsJson.length == 1 && $.trim($scope.sensorsJson[0]["number"]) == '') {
                                        $(".sensor .remove").click();
                                }
                                if ($.trim($scope.param.terminalId) == '') {
                                        $(".hostComputer .remove").click();
                                }
                                if ($.trim($scope.param.simNumber) == '') {
                                        $(".sim .remove").click();
                                }
                                $scope.setOrderState($scope.param.orderState);
                                $scope.orderAttachment=$scope.param.orderAttachment;
                                if($scope.param.orderAttachment=='null'){
                                        $scope.orderAttachment='';
                                }
                                if ($scope.param.orderAttachment!= 'null') {
                                        $scope.imgName = $scope.param.orderAttachment.split('/')[4];
                                }

                                callback && callback();
                        })
                }

        };
        $scope.saveOrder = function () {
                if ($('.hostComputer input').eq(0).is(':hidden')) {
                        $scope.param.terminalId = '';
                        $scope.param.factoryDate = '';
                        $scope.param.vehicleCode = '';
                }
                if ($('.sim input').eq(0).is(':hidden')) {
                        $scope.param.simNumber = '';
                        $scope.param.simRealNumber = '';
                        $scope.param.simPwd = '';
                        $scope.param.simBegindate = '';
                        $scope.param.simEnddate = '';
                }
                $scope.sensorsJson = [];
                $(".sensor").each(function () {
                        if ($(this).find('.number').is(":visible")) {
                                $scope.sensorsJson.push({
                                        number: $(this).find(".number").val(),
                                        certificateNumber: $(this).find(".certificateNumber").val(),
                                        certificateDate: $(this).find(".certificateDate").val()
                                })
                        }
                        else {
                                $scope.sensorsJson.push({
                                        number: '',
                                        certificateNumber: '',
                                        certificateDate: ''
                                })
                        }
                })
                $scope.param.orderAttachment=$scope.orderAttachment;
                //alert(JSON.stringify($scope.linesJson));
                //alert(JSON.stringify($scope.param));
                $scope.param.sensorsJson = JSON.stringify($scope.sensorsJson);
                $scope.param.linesJson = JSON.stringify($scope.linesJson);

                if (GetQueryString("action") == "edit") {
                        with (EasyNode.action) {
                                request('/ccms-order-order/U', $scope.param, 'post', function (result) {
                                        EasyNode.alert("提示", '修改成功');
                                })
                        }
                }
                else {
                        if (GetQueryString("action") == "view") {
                                window.close();
                        }
                        else {
                                with (EasyNode.action) {
                                        request('/ccms-order-order/C', $scope.param, 'post', function (result) {
                                                EasyNode.alert("提示", "添加成功");
                                        })
                                }

                        }
                }


        }
        $(".selectpicker").selectpicker();
        if (GetQueryString("action") == "view") {
                $scope.queryOrderById(GetQueryString("orderId"), function () {
                        //$("input,button").attr("disabled", "");
                        $(".form-control").attr("readonly", "readonly");
                        $(".selectpicker").prop('disabled', true);

                });
                $('title').html('查看订单');
                return;
        }


        if (GetQueryString("action") == "edit") {
                $scope.queryOrderById(GetQueryString("orderId"), function () {
                        //$(".notModify input").attr("disabled", "");
                        $scope.DateBind();
                });
                $('title').html('修改订单');
        }
        $timeout(function () {
                $scope.DateBind();
        }, 2000);

        $(".pa").delegate(".remove", "click", function () {
                if ($($(this).parent().attr("typ")).length > 1) {
                        $(this).parent().remove();
                }
                else {
                        $(this).siblings("input").val("").hide();
                        $(this).siblings(".clear").val("").hide();
                        $(this).hide();
                        $(this).siblings(".add").show();

                }
        })
        $(".pa").delegate(".add", "click", function () {
                if ($(this).siblings("input:visible").length > 0 && $(this).attr("max") != 1) {
                        $(this).parent().after($(this).parent().prop("outerHTML"));
                        $scope.DateBind();
                } else {
                        $(this).siblings().show();
                        if ($(this).attr("max") == 1) {
                                $(this).hide();
                        }
                }
        })

        $scope.minus = function ($event) {
                var lineName = $(angular.element($event.currentTarget)).siblings("input").attr('ng-model').split('.')[1];
                if ($scope.linesJson[lineName] > 0) {
                        $scope.linesJson[$(angular.element($event.currentTarget)).siblings("input").attr('ng-model').split('.')[1]]=parseInt( $scope.linesJson[$(angular.element($event.currentTarget)).siblings("input").attr('ng-model').split('.')[1]]) - 1;

                }
        }
        $scope.plus = function ($event) {
                $scope.linesJson[$(angular.element($event.currentTarget)).siblings("input").attr('ng-model').split('.')[1]]=parseInt( $scope.linesJson[$(angular.element($event.currentTarget)).siblings("input").attr('ng-model').split('.')[1]]) + 1;
        }

        $(".minus").click(function () {
                if ($(this).next().val() > 0)
                        $(this).next().val($(this).next().val() - 1);
        })
        $(".plus").click(function () {
                $(this).prev().val(parseInt($(this).prev().val()) + 1);
        })


})


function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)return unescape(r[2]);
        return null;
}




