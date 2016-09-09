//=============================================================================
// 文件名:   diandongche.js
// 创建人:   han.zw
// 创建日期:  2015-08-09


var ddche={
//左侧导航
  leftNav:function(){ 
    var left='<li class="header">主导航</li>'+
      '<li class="treeview ">'+
        '<a href="#">'+
          '<i class="fa fa-cogs"></i> <span>车辆管理</span> <i class="fa fa-angle-left pull-right"></i>'+
        '</a>'+
       '<ul class="treeview-menu">'+
          '<li><a href="car-list.html"><i class="fa fa-circle-o"></i>车辆列表</a></li>'+
          '<li><a href="car-police.html"><i class="fa fa-circle-o"></i>报警信息</a></li>'+
          '<li><a href="car-group.html"><i class="fa fa-circle-o"></i>车辆分组</a></li>'+
          /*'<li><a href="car-del.html"><i class="fa fa-circle-o"></i>已删车辆</a></li>'+*/
          '<li><a href="car-recharge.html"><i class="fa fa-circle-o"></i>服务充值</a></li>'+
       '</ul>'+
      '</li>'+
      /*'<li class="treeview ">'+
        '<a href="#">'+
          '<i class="fa fa-cogs"></i> <span>统计分析</span> <i class="fa fa-angle-left pull-right"></i>'+
        '</a>'+
       '<ul class="treeview-menu">'+
          '<li><a href="count-park.html"><i class="fa fa-circle-o"></i>停车统计</a></li>'+
          '<li><a href="count-time.html"><i class="fa fa-circle-o"></i>工作时间</a></li>'+
          '<li><a href="count-static.html"><i class="fa fa-circle-o"></i>静止点分析</a></li>'+
       '</ul>'+
      '</li>'+*/
      '<li class="treeview ">'+
        '<a href="#">'+
          '<i class="fa fa-cogs"></i> <span>系统设置</span> <i class="fa fa-angle-left pull-right"></i>'+
        '</a>'+
       '<ul class="treeview-menu">'+
          '<li><a href="sys-crawl.html"><i class="fa fa-circle-o"></i>电子围栏</a></li>'+
          '<li><a href="sys-g2.html"><i class="fa fa-circle-o"></i>G2定时上报</a></li>'+
          '</ul>'+
      '</li>'+
      '<li class="treeview ">'+
        '<a href="#">'+
          '<i class="fa fa-cogs"></i> <span>公司与人员</span> <i class="fa fa-angle-left pull-right"></i>'+
        '</a>'+
       '<ul class="treeview-menu">'+
          '<li><a href="company.html"><i class="fa fa-circle-o"></i>公司信息</a></li>'+
          '<li><a href="company-station.html"><i class="fa fa-circle-o"></i>岗位管理</a></li>'+
          '<li><a href="company-admin.html"><i class="fa fa-circle-o"></i>操作员管理</a></li>'+
          '<li><a href="company-person-detail.html"><i class="fa fa-circle-o"></i>个人资料</a></li>'+  
        '</ul>'+
      '</li>'
      ;

     $("#sidebar-menu").html(left);
     $("#sidebar-menu a").each(function(){
        if(location.pathname.indexOf($(this).attr("href"))!=-1){
            $(this).closest(".treeview").addClass("active");
       }
     });

     $("nav.navbar-static-top").append('<div class="navbar-custom-menu" style="height: 50px; line-height: 50px; padding-right: 10px;">'+
      '<span class="hidden-xs" style="color: #fff;">'+
       localStorage.name+', 您好 | <a href="javascript:" id="loginOut" style="color: #fff;">退出</a></span>'+
      '</div>');
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
  //获取厂家信息
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
   
  },
    //获取用户信息
    getUser:function(){
        var href=location.href;
        if(location.href.indexOf("login")!=-1)return;

        //下拉框
        if(!localStorage.name){
            location.href="login.html?href="+href;
        }
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



$(function(){
    ddche.formAjaxSaerch();
    ddche.formAjax();
    ddche.getUser();
  //加载失败
 /* $(document).ajaxError(function(){
      alert("数据请求失败!");
  });*/
  //列表加载+分页
  if($("#temp").length>0){
    var temp=$("#temp");
    var page=parseInt(ddche.GetQueryString("page"))||1;
    var size=$("#page").attr("relPage")||5;//一次显示几页
    var call=temp.attr("call");
    var search=$("form:visible").serialize();

    $.ajax({
      type:temp.attr("type"),
      url:temp.attr("rel")+"?"+search,
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
          var numpage=0;//起始页数
          var perPage=Math.ceil(size/2);//中间页数
               if(page>perPage){
                  if((pageCount-page)<(size-perPage)){
                      numpage=pageCount-size+1;
                  }else{
                      numpage=page-size+perPage;
                  }
                }else{
                  numpage=1
                }
            for(var i=0;i<size;i++){

               if((numpage+i)==page){
                pageHtml+='<li class="active"><a href="'+location.pathname+'?page='+(i+numpage)+'&'+search+'">'+(i+numpage)+'</a></li>';
                continue;
               }
                pageHtml+='<li><a href="'+location.pathname+'?page='+(i+numpage)+'&'+search+'">'+(i+numpage)+'</a></li>';
            }
          
          pageHtml+='<li><a href="'+location.pathname+'?page='+pageCount+'">&raquo;</a></li>'+
                    ' <div class="pageJump">'+
                    '<input type="number">'+
                    '<label  data-total="'+pageCount+'">跳转</label>'+
                    '</div>'
          ;


          if(pageCount>1) {
              $("#page").html(pageHtml);
          }
          //翻页
          $(".pageJump label").click(function(){
              var page=parseInt($(this).closest(".pageJump").find("input").val());
              if(page){
                  if(page<=parseInt($(this).attr("data-total"))){
                       location.href=$(".pagination li").eq(0).find("a").attr("href").replace("1",page);
                  }else{
                      alert("超出最大页数!");
                  }
              }
          });
          $(".pageJump input").change(function(){
             if($(this).val()<0){
              $(this).val(0);
             }
          });
            }else{
              alert(data.msg);
            }
          });

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
        var deleteModal = $('.model_alert');
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
  
    //全选
    $("input[rel='all']").change(function(){
      var that=$(this);
      that.closest("table").find("tbody input[type='checkbox']").prop("checked",that.prop("checked"));
    });

    //全选 非表格
    $("input[rel='allinput']").click(function(){
        $(this).closest(".allinput").find("input:not([rel='allinput'])").prop("checked",$(this).prop("checked"));
    });

});


//页面操作
//入库
$(function(){
     //车辆列表
     /*$(document).on("click",".deviceModal",function(){
        var rel=$(this).attr("rel");
       、、 $(".modal_"+rel).modal();
     });
*/
     $(document).on("click",".modal_contral .modal-confirm",function(){
          if(true){
            $(".modal").modal("hide");
            $(".modal_contral_af").modal();
          }
     });

     //公司操作员管理
     $(document).on("click",".companyEditor",function(){
          $(".modal").modal();
     });

     //设置定时上报
     $("#sysSetTime").click(function(){
        $(".modal").modal();
     });

     
    //设备操作
    $("#cont").on("click",".deviceModal",function(){
      var $this=$(this);
      var modal=$(".modal_"+$this.attr("rel"));
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
          if(data.result.data){
             for(var x in data.result){
              $(".modal_status span[name='"+x+"']").html(data.result[x]);
            }
            modal.modal();
          }else{
            $(".model_alert").modal().find(".modal-body").html("暂无数据！");
          }
        });
      }else{
        modal.attr("imei",$this.attr("imei")).modal().find("input").prop("checked",false);
      }
    });

    //编辑分组详情
    $(document).on("click",".carGroupEditor",function(){

    });

    //分组详情操作
    //向左
    $(".fa-arrow-right").click(function(){
      var leftGroup=$("#leftGroup");
      var html="";
      if(leftGroup.find("option:checked").length>0){
        var arr=leftGroup.find("option:checked");
        for(var i=0;i<arr.length;i++){
            html+="<option>"+arr[i].text+"</option>";
            arr.eq(i).hide();
        }
        $("#rightGroup").append(html);
      }
    });


    //向右
    $(".fa-arrow-left").click(function(){
      var rightGroup=$("#rightGroup");
      var html="";
      if(rightGroup.find("option:checked").length>0){
        var arr=rightGroup.find("option:checked");
        for(var i=0;i<arr.length;i++){
            html+="<option>"+arr[i].text+"</option>";
            arr.eq(i).hide();
        }
        $("#leftGroup").append(html);
      }
    });

    //车辆详情
    if(location.href.indexOf("carDeviceId")!=-1){
        $.ajax({
            type:"get",
            url:"/api/device/read/"+ddche.GetQueryString("carDeviceId"),
            dataType:"json"
        }).done(function(data){
            if(data.code==0){
                for(var x in data.result){
                    $("form").eq(0).find("[name='"+x+"']").val(data.result[x]);
                }
            }else{
                alert(data.msg);
            }
        });
    }

    //车辆列表统计
    if(location.href.indexOf("car-list.html")!=-1){
        $.ajax({
            type:"get",
            url:"/api/device/count",
            dataType:"json"
        }).done(function(data){
            if(data.code==0){
              var html=' <label class="red">总计：'+data.result.total+'</label>'+
              '<label class="blue">在线：'+data.result.online+'</label>'+
              '<label class="off">掉线：'+data.result.offline+'</label>';
              $(".car_list_online").html(html);
            }
        });
    }

    //车辆报警搜索切换

    $(".car-police-type").change(function(){
      var v=$(this).val();
      if(v=="0"){
        $("#seachType").attr("name","imei");
      }else{
        $("#seachType").attr("name","vehicleNumber");
      }
    });
});

//登陆逻辑
function loginForm(data){
    if(data.code==0){
      var href=ddche.GetQueryString("href")||"index.html";
                //保存用户名
        localStorage.name=data.result.name;
        localStorage.groupId=data.result.groupId;
        if(href){
          location.href=href;
        }else{
          location.href="index.html";
        }
    }
}

//登出
$(document).on("click","#loginOut",function(){
    $.ajax({
        type:"get",
        url:"/api/user/logout",
        dataType:"json"
    }).done(function(data){
        if(data.code==0){
            localStorage.removeItem("name");
            localStorage.removeItem("groupId");
            location.href="login.html";
        }
    });

});


function carPolice(data){
  var warnTYpe=[
  "非法位移报警",
  "断电报警",
  "震动报警",
  "超速报警",
  "开门报警",
  "进入电子围栏区域报警",
  "离开电子围栏区域报警"];
   for(var i=0;i<data.result.data.length;i++){
      data.result.data[i].alarm=warnTYpe[data.result.data[i].alarm];
      data.result.data[i].createTime=moment(data.result.data[i].createTime).format("YYYY-MM-DD hh:mm:ss");
    }
    return data;
}
