//
// 文件名:   diandongche.js
// 创建人:   han.zw
// 创建日期:  2015-08-09


var ddche={
//左侧导航
  leftNav:function(){ 
    var left='<li class="header">主导航</li>'+
      '<li class="treeview ">'+
       ' <a href="#">'+
         ' <i class="fa fa-cogs"></i> <span>电动车厂商管理</span> <i class="fa fa-angle-left pull-right"></i>'+
       ' </a>'+
     '  <ul class="treeview-menu">'+
       '   <li><a href="agent-add.html"><i class="fa fa-circle-o"></i>厂商添加</a></li>'+
       '  <li><a href="agent-list.html"><i class="fa fa-circle-o"></i>厂商列表</a></li>'+
        '</ul>'+
      '</li>'+
      '<li class="treeview ">'+
        '<a href="#">'+
          '<i class="fa fa-cogs"></i> <span>库存设备管理</span> <i class="fa fa-angle-left pull-right"></i>'+
        '</a>'+
       '<ul class="treeview-menu">'+
          '<li><a href="device-add.html"><i class="fa fa-circle-o"></i>入库(单台)</a></li>'+
          '<li><a href="device-madd.html"><i class="fa fa-circle-o"></i>入库(批量)</a></li>'+
          '<li><a href="device-out.html"><i class="fa fa-circle-o"></i>出库(批量)</a></li>'+
          '<li><a href="device-search.html"><i class="fa fa-circle-o"></i>查询库存</a></li>'+
        '</ul>'+
      '</li>'+
      '<li class="treeview ">'+
        '<a href="#">'+
          '<i class="fa fa-cogs"></i> <span>已售设备管理</span> <i class="fa fa-angle-left pull-right"></i>'+
        '</a>'+
       '<ul class="treeview-menu">'+
          '<li><a href="sale-madd.html"><i class="fa fa-circle-o"></i>导入设备装配表</a></li>'+
          '<li><a href="sale-madd-no.html"><i class="fa fa-circle-o"></i>未装配设备查询</a></li>'+
          '<li><a href="sale-madd-yes.html"><i class="fa fa-circle-o"></i>已装配设备查询</a></li>'+
          '<li><a href="sale-device.html"><i class="fa fa-circle-o"></i>设备列表</a></li>'+
          '<li><a href="sale-device-detail.html"><i class="fa fa-circle-o"></i>车辆管理</a></li>'+
          '<li><a href="sale-device-warm.html"><i class="fa fa-circle-o"></i>车辆报警查询</a></li>'+
          '<li><a href="sale-device-gps.html"><i class="fa fa-circle-o"></i>车辆GPS查询</a></li>'+
        '</ul>'+
      '</li>'+
      '<li class="treeview ">'+
        '<a href="#">'+
          '<i class="fa fa-building-o"></i> <span>设备调拨历史</span> <i class="fa fa-angle-left pull-right"></i>'+
        '</a>'+
       '<ul class="treeview-menu">'+
          '<li><a href="stroe-out.html"><i class="fa fa-circle-o"></i>出库记录</a></li>'+
          '<li><a href="stroe-in.html"><i class="fa fa-circle-o"></i>入库记录</a></li>'+
        '</ul>'+
      '</li>'+
      '<li class="treeview ">'+
        '<a href="#">'+
          '<i class="fa fa-cog"></i> <span>系统设置</span> <i class="fa fa-angle-left pull-right"></i>'+
        '</a>'+
       '<ul class="treeview-menu">'+
          '<li><a href="user-add.html"><i class="fa fa-circle-o"></i>用户添加</a></li>'+
          '<li><a href="user-search.html"><i class="fa fa-circle-o"></i>用户查询</a></li>'+
          '<li><a href="user-modify.html"><i class="fa fa-circle-o"></i>修改资料</a></li>'+
          '<li><a href="javascript:" id="loginOut"><i class="fa fa-circle-o"></i>退出系统</a></li>'+
        '</ul>'+
      '</li>';

     $("#sidebar-menu").html(left);
     $("#sidebar-menu a").each(function(){
        if(location.pathname.indexOf($(this).attr("href"))!=-1){
            $(this).closest(".treeview").addClass("active");
       }
     });

//登陆信息
     $("nav.navbar-static-top").append(`
        <div class="navbar-custom-menu" style="height: 50px; line-height: 50px; padding-right: 10px;">
        <span class="hidden-xs" style="color: #fff;">
         ${localStorage.name}, 您好 | <a href="javascript:" id="loginOut" style="color: #fff;">退出</a></span>
      </div>
      `);
  },
  //form表单提交
  formAjax:function(){
    $("[rel='ajaxIframe']").load(function(){
      var resultData=ddche.zIframeXm(this.id);
      if(resultData.code==0){
        showSuccessMsg(resultData.msg);
      }else{
        showErrorMsg(resultData.msg);
      }
    });
  },
  //form表单提交搜索
  formAjaxSaerch:function(){
    $("[rel='ajaxSearch']").load(function(){
      var resultData=ddche.zIframeXm(this.id);
      if(resultData.code==0){
        showSuccessMsg(resultData.msg);
        eval($(this).attr("call")+"(resultData)");
      }else{
        showErrorMsg(resultData.msg);
      }
    });
   
  },
  //获取iframe加载信息
  zIframeXm:function(id) {
    var io = document.getElementById(id);
    var xml = {};
    if (io.contentWindow) {
      xml.responseText = io.contentWindow.document.body ? io.contentWindow.document.body.innerHTML : null;
      xml.responseXML = io.contentWindow.document.XMLDocument ? io.contentWindow.document.XMLDocument : io.contentWindow.document;

    } else if (io.contentDocument) {
      xml.responseText = io.contentDocument.document.body ? io.contentDocument.document.body.innerHTML : null;
      xml.responseXML = io.contentDocument.document.XMLDocument ? io.contentDocument.document.XMLDocument : io.contentDocument.document;
    }
    var resultData;
    try {
      eval("resultData=" + xml.responseText.slice(xml.responseText.indexOf(">") + 1, xml.responseText.indexOf("</")));
      return resultData;
    } catch (e) {
      console.log(e.msg);
      return resultData;
    }
  }
  ,stringReplace_com:function(data,template) {
    var temp=$("#"+template).html();
      var arr=[];
      arr=arr.concat(data);
      var str="";
      for(var i=0;i<arr.length;i++){
          str+=temp.replace(/\{\w+\}/g, function(word) {
              word=word.replace("{","");
              word=word.replace("}","");
              if(arr[i][word]==0) return 0;
              return arr[i][word] || '';
          });
      }
      return str;
  }
  ,GetQueryString:function(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null)return r[2];
      return "";
  },
  //获取select清单
  getQuery:function(){
     if($(".vendorSelect").length>0){
        $.ajax({
          type:"get",
          url:"/api/user/visibleVendors",
          dataType:"json"
        }).done(function(data){
              //下拉框
            if(data.code==0){
                var vendorSelect=data.result;
                var html="";
                for(var i=0,l=vendorSelect.length;i<l;i++){
                    html+='<option value="'+vendorSelect[i].id+'">'+vendorSelect[i].name+'</option>';
                }
                $(".vendorSelect").html(html);
            }
        });
    }
    //获取设备类型
    if($("select[name='deviceType']").length>0){
        $.ajax({
          type:"get",
          url:"/api/device/deviceTypes",
          dataType:"json"
        }).done(function(data){
              //下拉框
            if(data.code==0){
                var vendorSelect=data.result;
                var html="";
                for(var i=0,l=vendorSelect.length;i<l;i++){
                    html+='<option value="'+vendorSelect[i].deviceType+'">'+vendorSelect[i].deviceType+'</option>';
                }
                $("select[name='deviceType']").html(html);
            }
        });
    }
  },
    //获取用户信息
    getUser:function(){
        var href=location.href;
        if(location.href.indexOf("login")!=-1)return;
        $.ajax({
            type:"get",
            url:"/api/user/getLoginUser",
            dataType:"json"
        }).done(function(data){
            //下拉框
            if(!data.result.name){
                location.href="login.html?href="+href;
            }
        });
    }

};



function showErrorMsg(message, time) {

  closeMsg();
  $('body').append('<div class="alert alert-warning alert-dismissible fade in error-message text-center" role="alert">\n' +
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>' +
    '<strong>错误!</strong>&nbsp;' + message +
    '</div>');

  setTimeout(closeErrorMsg, time || 8000);
}

function showSuccessMsg(message) {
  closeMsg();
  $('body').append('<div class="alert alert-success alert-dismissible fade in success-message text-center" role="alert">\n' +
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>' +
    '<strong>成功!</strong>&nbsp;' + message +
    '</div>');

  setTimeout(closeSuccessMsg, 3000);
}

function closeMsg() {
  closeSuccessMsg();
  closeErrorMsg();
}

function closeErrorMsg() {

  var errorMsg = $('.error-message');
  if (errorMsg.length) {
    errorMsg.alert('close');
  }
}

function closeSuccessMsg() {
  var successMsg = $('.success-message');

  if (successMsg.length) {
    successMsg.alert('close');
  }
}

//查询处理
function canSearch(data){
    var html=ddche.stringReplace_com(data.result.data,"temp");
    $("#cont").html(html);
    var total=data.result.pagination.rows;
    var per=data.result.pagination.rpp;
    var pageCount=Math.ceil(total/per);
    var pageHtml='<li><a href="javascript:" rel="1">&laquo;</a></li>';
    for(var i=0;i<pageCount;i++){
        pageHtml+='<li><a href="javascript:" rel="'+(i+1)+'">'+(i+1)+'</a></li>';
    }
    pageHtml+='<li><a href="javascript:" rel="'+pageCount+'">&raquo;</a></li>';
    if(pageCount>1) {
        $("#page").html(pageHtml);
    }
}


//通用方法
$(function(){
  //加载失败
  $(document).ajaxError(function(){
      alert("数据请求失败!");
  });
  //列表加载
  if($("#temp").length>0){
    var temp=$("#temp");
    var page=ddche.GetQueryString("page")||1;
    var call=temp.attr("call");

    $.ajax({
      type:temp.attr("type"),
      url:temp.attr("rel"),
      data:{
        page:page
      }
    }).done(function(data){
      if(call){
        data=eval(call+"(data)");
      }
      if(data.code==0){
          var html=ddche.stringReplace_com(data.result.data,"temp");
          $("#cont").html(html);
          var total=data.result.pagination.rows;
          var per=data.result.pagination.rpp;
          var pageCount=Math.ceil(total/per);
          var pageHtml='<li><a href="'+location.pathname+'?page=1">&laquo;</a></li>';
          for(var i=0;i<pageCount;i++){
              pageHtml+='<li><a href="'+location.pathname+'?page='+(i+1)+'">'+(i+1)+'</a></li>';
          }
          pageHtml+='<li><a href="'+location.pathname+'?page='+pageCount+'">&raquo;</a></li>';

          if(pageCount>1) {
              $("#page").html(pageHtml);
          }
      }else{
        alert(data.msg);
      }
    })
  }


  //搜索列表翻页
  $(document).on("click","#page a",function(){
      var page=$(this).attr("rel");
      $(".btn-primary:visible").closest("form").find("[name='page']").val(page);
      $(".btn-primary:visible").click();
  });

    //删除弹出框
    $(document).on("click",".contral_delete", function (e) {
        var $this=$(this);
        var deleteModal = $('.modal');
        var deleteConfirmBtn = deleteModal.find('.modal-confirm');
        deleteModal.find(".modal-body").html($this.attr("msg")||"确定删除吗？");
        deleteModal.modal();
        deleteConfirmBtn.unbind('click');
        deleteConfirmBtn.on('click', function (e) {
            $.ajax({
                type:"get",
                url:$this.attr("action")
            }).done(function(data){
                if(data.code==0){
                    $this.closest("tr").remove();
                    showSuccessMsg(data.msg);
                }else{
                    alert(data.msg);
                }
            });
        })
    });
  

});


//页面操作
//入库
$(function(){
  ddche.getUser();
  ddche.getQuery();
  ddche.formAjax();
  ddche.formAjaxSaerch();
  $("#store_start_time, #deviceStart,#saleStart").val(moment().format('YYYY-MM')+"-01 00:00:00");
  $("#store_over_time ,#deviceEnd,#saleEnd").val(moment().format('YYYY-MM-DD hh:mm:ss'));
//设备查询device-search.html
  $(".device-search-sType").change(function(){
    var value=$(this).val();
    var that=$(this);
      that.closest("form").find("input").val("");
    if(value=="1"){
      //模糊查询
      $("form").hide().eq(0).show();
    }else{
      //精确查询
      $("form").hide().eq(1).show();
    }
  });
  //用户添加
  $(".user_add_all").change(function(){
      var check=$(this).prop("checked");
      $(this).closest(".box-body").find("input").prop("checked",check);
  });
  $(".user_add_all").closest(".box-body").find("input:not(.user_add_all)").each(function(){
    $(this).change(function(){
      var check=$(this).prop("checked");
      if(check){
        $(".user_add_all").closest(".box-body").find("input:not(.user_add_all)").each(function(){
          if(!$(this).prop("checked")){
            check=false;
          }
        });
        $(".user_add_all").prop("checked",check);
      }else{
        $(".user_add_all").prop("checked",false);
      }
    });
  });


  //厂商修改
  if(ddche.GetQueryString("agentEditor")=="true"){
      var agent_editor_Id=ddche.GetQueryString("id");
      $.ajax({
        type:"get",
        url:"/api/vendor/info/"+agent_editor_Id
      }).done(function(data){
        if(data.code==0){
          $("form").attr("action","/api/vendor/update/"+agent_editor_Id);
          for(var x in data.result.vendorId){
            $("form").find("input[name='"+x+"']").val(data.result.vendorId[x]);

          }
        }else{
          alert(data.msg);
        }
      });
  }
  //设备修改
  if(ddche.GetQueryString("deviceEditor")=="true"){
      var agent_editor_Id=ddche.GetQueryString("imei");
      $.ajax({
        type:"get",
        url:"/api/device/info/"+agent_editor_Id
      }).done(function(data){
        if(data.code==0){
          $("form").attr("action","/api/device/update/"+agent_editor_Id);
          for(var x in data.result){
            $("form").find("input[name='"+x+"']").val(data.result[x]);
          }
          $("[name='imei']").removeAttr("name");
        }else{
          alert(data.msg);
        }
      });
  }
  //用户修改
  if(ddche.GetQueryString("userEditor")=="true"){
      var userEditor_Id=ddche.GetQueryString("id");
      $.ajax({
        type:"get",
        url:"/api/user/info/"+userEditor_Id
      }).done(function(data){
        if(data.code==0){
          $("form").eq(0).attr("action","/api/user/update/"+userEditor_Id);
          for(var x in data.result){
            $("form").eq(0).find("input[name='"+x+"']").val(data.result[x]);
          }
        }else{
          alert(data.msg);
        }
      });
  }

  //出入库修改

  if(ddche.GetQueryString("stroeEditor")=="true"){
      var userEditor_Id=ddche.GetQueryString("id");
      $.ajax({
        type:"get",
        url:"/api/device/inventoryLog/"+userEditor_Id
      }).done(function(data){
        if(data.code==0){
          data.result.createTime=moment(data.result.createTime).format("YYYY-MM-DD hh:mm:ss");
          data.result.deviceDetail='<a href="'+data.result.deviceDetail+'">查看IMEI信息</a>';
          for(var x in data.result){
            $(".stroe_table").eq(0).find("td[name='"+x+"']").html(data.result[x]);
          }
        }else{
          alert(data.msg);
        }
      });
  }
    //当前用户信息修改
    if(location.href.indexOf("user-modify")!=-1){
        $.ajax({
            type:"get",
            url:"/api/user/getLoginUser",
            dataType:"json"
        }).done(function(data){
            if(data.code==0){

                for(var x in data.result){
                    $("form").eq(0).find("input[name='"+x+"']").val(data.result[x]);
                }
            }else{
                alert(data.msg);
            }
        });
    }

    //设备修改
    if(location.href.indexOf("saleDeviceImei")!=-1){
        $.ajax({
            type:"get",
            url:"/api/device/info/"+ddche.GetQueryString("saleDeviceImei"),
            dataType:"json"
        }).done(function(data){
            if(data.code==0){

                for(var x in data.result){
                    $("form").eq(0).find("input[name='"+x+"']").val(data.result[x]);
                }
            }else{
                alert(data.msg);
            }
        });
    }

    //退出
    $("#loginOut").click(function() {
        $.ajax({
            type: "get",
            url: "/api/user/logout",
            dataType:"json"
        }).done(function (data) {
            if(data.code==0){
                location.href="login.html";
                sessionStorage.name=null;
            }
        });
    });

    //设备操作
    $("#cont").on("click",".deviceModal",function(){
      var $this=$(this);
      var modal=$(".modal_"+$this.attr("rel"));
      modal.modal();
      modal.find(".modal-confirm").off("click");
      modal.find(".modal-confirm").on('click', function (e) {
        if($this.attr("action")){
            $.ajax({
                type:"get",
                url:$this.attr("action")
            }).done(function(data){
                if(data.code==0){
                    $this.closest("tr").remove();
                    showSuccessMsg(data.msg);
                }else{
                    alert(data.msg);
                }
            });
            }
        });
      if($this.attr("rel")=="status"){
        $.ajax({
          type:"get",
          url:"/api/device/snapshot/"+$this.attr("imei"),
          dataType:"json"
        }).done(function(data){
          if(!data)return;
            data.result
            for(var x in data.result){
              $(".modal_status span[name='"+x+"']").html(data.result[x]);
            }
        });
      }
    });


    //车辆管理页面
    var sale_device_html_center='<div class="form-group col-sm-6">'+
                '<label class="col-sm-4 control-label">中心报警处理方式</label>'+
                '<div class="col-sm-5">'+
                    '<select class="form-control" name="deviceType">'+
                      '<option value="30">电话+短信</option>'+
                      '<option value="40">纯短信</option>'+
                      '<option value="50">纯电话</option>'+
                      '<option value="60">不报警</option>'+
                  '</select>'+
                '</div>'+
              '</div>'+
              '<div class="form-group col-sm-6">'+
                '<label class="col-sm-6 control-label">中心报警每月电话数(0-10)</label>'+
                '<div class="col-sm-3">'+
                  '<input type="text" class="form-control" name="website" placeholder="">'+
                '</div>'+
              '</div>'+
              '<div class="form-group col-sm-6">'+
                '<label class="col-sm-6 control-label">中心报警每月短信数(0-10)</label>'+
                '<div class="col-sm-3">'+
                  '<input type="text" class="form-control" name="website" placeholder="">'+
                '</div>'+
              '</div>';
    var sale_device_html_self='<div class="form-group col-sm-6">'+
                '<label class="col-sm-4 control-label">车台报警处理方式</label>'+
                '<div class="col-sm-5">'+
                    '<select class="form-control" name="deviceType">'+
                      '<option value="30">电话+短信</option>'+
                      '<option value="40">纯短信</option>'+
                      '<option value="50">纯电话</option>'+
                      '<option value="60">不报警</option>'+
                  '</select>'+
                '</div>'+
              '</div>'+
              '<div class="form-group col-sm-6">'+
                '<label class="col-sm-6 control-label">车台报警每月电话数(0-10)</label>'+
                '<div class="col-sm-3">'+
                  '<input type="text" class="form-control" name="website" placeholder="">'+
                '</div>'+
              '</div>'+
              '<div class="form-group col-sm-6">'+
                '<label class="col-sm-6 control-label">车台报警每月短信数(0-10)</label>'+
                '<div class="col-sm-3">'+
                  '<input type="text" class="form-control" name="website" placeholder="">'+
                '</div>'+
              '</div>';
    $("#sale_device_card").change(function(){
      var option_normal='<option value="1">厦门移动卡</option>'+
      '<option value="2">南京联通卡</option>'
      ;
      var option_wul='<option value="1">厦门移动物联网卡</option>'+
      '<option value="2">安徽移动物联网卡</option>'
      ;
      if($(this).val()!=0){
        if($(this).val()==1){

          //预装普通卡
          $("#sale_device_card2").html(option_normal).show();
          $("#sale_card_status").show();
        }else if($(this).val()==2){
          // 物联网卡
          $("#sale_device_card2").html(option_wul).show();
          $("#sale_card_status").hide();
          $("[name='status']").eq(0).click();
        }
      }else{
        $("#sale_device_card2").hide();
          $("#sale_card_status").show();
      }
    });

    $("[name='status']").click(function(){
      var type=$(this).val();
      if(type==0){
          $("#sale_card_type").html(sale_device_html_center);
      }else if(type==1){
          $("#sale_card_type").html(sale_device_html_self);
      }
    });
});

//设备查询
function deviceSearch(data){
    for(var i= 0;i<data.result.data.length;i++){
        data.result.data[i].inventoryInTime=moment(data.result.data[i].inventoryInTime).format('L');
    }
    var html=ddche.stringReplace_com(data.result.data,"temp-search");
    $("#cont").html(html);
    var total=data.result.pagination.rows;
    var per=data.result.pagination.rpp;
    var pageCount=Math.ceil(total/per);
    var pageHtml='<li><a href="javascript:" rel="1">&laquo;</a></li>';
    for(var i=0;i<pageCount;i++){
        pageHtml+='<li><a href="javascript:" rel="'+(i+1)+'">'+(i+1)+'</a></li>';
    }
    pageHtml+='<li><a href="javascript:" rel="'+pageCount+'">&raquo;</a></li>';
    if(pageCount>1) {
        $("#page").html(pageHtml);
    }
}

//厂商查询
function storeSearch(data){
    for(var i= 0;i<data.result.data.length;i++){
        data.result.data[i].createTime=moment(data.result.data[i].createTime).format('L');
    }
   
}

function userSearch(data){
    var html=ddche.stringReplace_com(data.result.data,"temp-search");
    $("#cont_agent").html(html);
    var total=data.result.pagination.rows;
    var per=data.result.pagination.rpp;
    var pageCount=Math.ceil(total/per);
    var pageHtml='<li><a href="javascript:" rel="1">&laquo;</a></li>';
    for(var i=0;i<pageCount;i++){
        pageHtml+='<li><a href="javascript:" rel="'+(i+1)+'">'+(i+1)+'</a></li>';
    }
    pageHtml+='<li><a href="javascript:" rel="'+pageCount+'">&raquo;</a></li>';
    if(pageCount>1){
        $("#page").html(pageHtml);
    }
}

function deviceSearch(data){
    var html=ddche.stringReplace_com(data.result.data,"temp");
     $("#cont").html(html);
     var total=data.result.pagination.rows;
    var per=data.result.pagination.rpp;
    var pageCount=Math.ceil(total/per);
    var pageHtml='<li><a href="javascript:" rel="1">&laquo;</a></li>';
    for(var i=0;i<pageCount;i++){
        pageHtml+='<li><a href="javascript:" rel="'+(i+1)+'">'+(i+1)+'</a></li>';
    }
    pageHtml+='<li><a href="javascript:" rel="'+pageCount+'">&raquo;</a></li>';
    if(pageCount>1) {
        $("#page").html(pageHtml);
    }
}

//登陆逻辑
function loginForm(data){
    if(data.code==0){
      var href=ddche.GetQueryString("href");
                //保存用户名
        localStorage.name=data.result.name;
        if(href){
          location.href=href;
        }else{
          location.href="index.html";
        }
    }
}

//设备列表时间处理
function saleDeviceDate(data){
    for(var i=0;i<data.result.data.length;i++){
      data.result.data[i].serviceExpire=moment(data.result.data[i].serviceExpire).format("YYYY-MM-DD");
      data.result.data[i].simExpire=moment(data.result.data[i].simExpire).format("YYYY-MM-DD");
    }
    return data;
}

function saleDeviceWarn(data){
  var warnTYpe=[
  "非法位移报警",
  "断电报警",
  "震动报警",
  "超速报警",
  "开门报警",
  "进入电子围栏区域报警",
  "离开电子围栏区域报警"];
   for(var i=0;i<data.result.data.length;i++){
      data.result.data[i].alarmType=warnTYpe[data.result.data[i].alarmType];
      data.result.data[i].createTime=moment(data.result.data[i].serviceExpire).format("YYYY-MM-DD hh:mm:ss");
    }
    return data;
}

