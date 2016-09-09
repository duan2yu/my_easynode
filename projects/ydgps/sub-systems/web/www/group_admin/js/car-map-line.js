
var map;//地图
var positionArr=[];
var positionIndex=0;
var startI=0;
var marker;
var positionArrLenth=0;
var positionDate=[];
var setTimeFn;
var dayTime=0;
var imei=ddche.GetQueryString("imei");
var beginTime="";
var endTime="";
var stopTime=true;//暂停

//画图参数
var polyline;
function initialize() {
    var markerOption,mar,geocoder,lnglatXY;
    //开始位置*************************************************
    for(var q=0;q<positionArr.length;q++){
      if(q==0){
        markerOption = {
          map:map,                 
          icon:"images/start.png",
          position:positionArr[q],
          offset:new AMap.Pixel(-15,-35)
        };
      }else if(q==(positionArr.length-1)){
        markerOption = {
          map:map,                 
          icon:"images/end.png",
          position:positionArr[q],
          offset:new AMap.Pixel(-15,-35)
        };
      }else{
        markerOption = {
          map:map,                 
          icon:"images/map_icon.png",
          position:positionArr[q],
          offset:new AMap.Pixel(-8,-13)
        };
      }
      mar = new AMap.Marker(markerOption);  
      lnglatXY = positionArr[q];
      AMap.service(["AMap.Geocoder"], function() {       
        geocoder = new AMap.Geocoder({
          radius: 1000,
          extensions: "all"
        });
        //逆地理编码
        geocoder.getAddress(lnglatXY, function(status, result){
          //取回逆地理编码结果
          if(status === 'complete' && result.info === 'OK'){
          
            if(q==0){
              $(".start").html("起点：<br/>"+result.regeocode.formattedAddress);
            }else if(q==(positionArr.length-1)){
              $(".over").html("终点：<br/>"+result.regeocode.formattedAddress);
            }
          }
        });
      });
    }        
    
}

//汇点
function addMarker() {

    var speed=$(".list .on").attr("rel");
  setTimeFn=setTimeout(function(){
    if(startI<positionArr.length){
      if(stopTime){
      $(".times i").html(startI+1);
      $(".speed i").html(parseInt(positionDate[startI].speed/10));
      $(".time i").html(positionDate[startI].time);
      $(".line_ok").css("width",((startI+1)/positionArr.length*100+"%"));
      if(startI==0){
        marker = new AMap.Marker({          
            icon: "images/start.png",
            position:positionArr[startI],
            offset:new AMap.Pixel(-15,-35)
          });
      }else if(startI==(positionArr.length-1)){
        marker = new AMap.Marker({          
            icon: "images/end.png",
            position:positionArr[startI],
            offset:new AMap.Pixel(-15,-35)
          });
      }else{
      marker = new AMap.Marker({          
            icon: "images/map_icon.png",
            position:positionArr[startI],
            offset:new AMap.Pixel(-8,-13)
          });
      }
      marker.setMap(map);  //在地图上添加点
        map.setCenter(positionArr[startI]);
      startI++;
      }
      addMarker(speed);
    }else{
      startI=0;

      $("#showicon").attr("step",0).removeClass("btn_on");
      stopTime=true;
    }
  },speed);
}

function addIcon(){
  var  polyline = new AMap.Polyline({ 
         path:positionArr, //设置线覆盖物路径
         strokeColor:"#3366FF", //线颜色
         strokeOpacity:1, //线透明度 
         strokeWeight:5, //线宽
         strokeStyle:"solid", //线样式
         strokeDasharray:[10,5] //补充线样式 
       }); 
       polyline.setMap(map);
}
$(function(){
  beginTime=decodeURI(ddche.GetQueryString("beginTime"))||(moment(new Date()).format("YYYY-MM-DD")+" 00:00:00");
  endTime=decodeURI(ddche.GetQueryString("endTime"))||(moment(new Date()).format("YYYY-MM-DD")+" 00:00:00");
  $("#beginTime").val(beginTime);
  $("#endTime").val(endTime);
  var url="/api/device/track/"+imei;
  var zoom=12;
  $.ajax({
    type:"get",
    url:url,
    data:{
      beginTime:beginTime,
      endTime:endTime
    },
    dataType:'json', 
    success:function(data){
      data=data.result;
      var last=data[data.length-1];
      var dataNew=deletLoc(data,0.002);
            if(data.length>20){
              data=dataNew;
            }
      if(data.length>0){
        if(data[data.length-1].lng!=last.lng){
          data.push(last);
        }
      }
      
      $.each(data,function(i,e){
                 if(!e.lat || !e.lng) return;

        e.spark=wg2mg(e.lng,e.lat);
        positionArr.push(new AMap.LngLat(e.spark[0],e.spark[1]));
        positionArr[positionIndex].pf=e.lng*e.lng+e.lat*e.lat;
        positionIndex++;
        //e.clockTime=new Date();
        //e.clockTime.setTime(e.time);
        //e.clockTime=timeFormat(e.clockTime.getHours())+":"+timeFormat(e.clockTime.getMinutes())+":"+timeFormat(e.clockTime.getSeconds());
        e.clockTime=moment(e.st).format("hh:mm:ss");
        positionDate.push({speed:e.speed,time:e.clockTime||0});
      });
      positionArrLenth=positionArr.length;
      $(".times").html("进度：<i>0</i>/"+positionArrLenth);
      map=new AMap.Map("container",{
          view: new AMap.View2D({//创建地图二维视口
          center:positionArr[parseInt(positionArr.length/2)],//创建中心点坐标
          zoom:zoom, //设置地图缩放级别
          rotation:0 //设置地图旋转角度
         }),
         lang:"zh_cn"//设置地图语言类型，默认：中文简体
        });//创建地图实例;//地图
      map.plugin(["AMap.MapType"],function(){
        //地图类型切换
        var mapType= new AMap.MapType({
          defaultType:0,//默认显示卫星图
          showRoad:true //叠加路网图层
        });
        map.addControl(mapType);
      }); 
      
      //加载地图
      initialize();
      
      //划线
      //addIcon();
    },
        error:function(data){
            alert(JSON.parse(data.response).msg);
        }
   });
  $(".circle").click(function(){
    $(".circle").removeClass("on");
    $(this).addClass("on");
  });
  $("#showicon").click(function(){
    if($(this).attr("step")=="0"){
      //开始
      $(this).attr("step",1);
      $(".times i").html(0);
      $(".speed i").html(0);
      $(".time i").html("00:00:00");
      $(".line_ok").css("width",0);
      map.clearMap();
      startI=0;
      addMarker();
      $(this).attr("rel",false);
        $(this).addClass("btn_on");
    }else if($(this).attr("step")=="1"){
      //暂停
      if(stopTime){
        $(this).removeClass("btn_on");
        stopTime=false;
      }else{
        $(this).addClass("btn_on");
        stopTime=true;
      }
    }
  });
   //日期选择
   $("#chooseDay").click(function(){
      var beginTime=$("#beginTime").val();
      var endTime=$("#endTime").val();
      if(beginTime==""||endTime=="")return;
      if(beginTime.replace(/-/g,"").replace(/:/g,"").replace(" ","")>
        endTime.replace(/-/g,"").replace(/:/g,"").replace(" ","")){
        $(".modal_alert").modal().find(".modal-body").html("开始时间必须小于结束时间");
        return;
      }
      location.href="car-mapline.html?imei="+imei+"&beginTime="+beginTime+"&endTime="+endTime;
   });
});



function deletLoc(arr,tj){
  tj=tj||0;
  var newarr=[];
  var isclear=true;
  newarr=newarr.concat(arr);
  function re(){
    for(var i=1;i<newarr.length;i++){
      distance=(newarr[i].lng-newarr[(i-1)].lng)*(newarr[i].lng-newarr[(i-1)].lng)+
      (newarr[i].lat-newarr[(i-1)].lat)*(newarr[i].lat-newarr[(i-1)].lat);
      
      distance=Math.sqrt(distance);
      if(distance<tj){
        newarr.splice(i,1);
        arguments.callee();
        //arguments.callee(newarr,tj);
        //return newarr;
      }
    }
  }
  re();
  
    return newarr;
}