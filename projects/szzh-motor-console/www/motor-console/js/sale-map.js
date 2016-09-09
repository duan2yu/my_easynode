
$(function(){
    var toolBar = null;
    
    var deviceId=ddche.GetQueryString("deviceId");
    var map;
    var positionArr,
    time=0,
    gps="GPS";
    mapView();

function mapView(){

  /* $.ajax({
    type:"get",
    url:"/student/maplocation/"+deviceId,
    dataType:'json',
    success:function(data){
      if(!data[0].location[0] || !data[0].location[1]) return;
      time=data[0].upTime;
      if(data[0].gps==2){
        gps="基站";
      }else if(data[0].gps==3){
        gps="WIFI";
      }*/
      data=[{}]
      data[0].location=[122123213,38213123.123];
        var spark=wg2mg(data[0].location[0]/1000000,data[0].location[1]/1000000);
      positionArr=new AMap.LngLat(spark[0],spark[1]);
      map=new AMap.Map("container",{
          view: new AMap.View2D({//创建地图二维视口
          center:positionArr,//创建中心点坐标
          zoom:17, //设置地图缩放级别
          rotation:0 //设置地图旋转角度
         }),
         lang:"zh_cn"//设置地图语言类型，默认：中文简体
        });//创建地图实例;//地图
        //添加地图类型切换插件
      map.plugin(["AMap.MapType"],function(){
        //地图类型切换
        var mapType= new AMap.MapType({
          defaultType:0,//默认显示卫星图
          showRoad:true //叠加路网图层
        });
        map.addControl(mapType);
      }); 
      //加载地图
      //在地图中添加ToolBar插件
      map.plugin(["AMap.ToolBar"], function () {
        toolBar = new AMap.ToolBar();
        map.addControl(toolBar);
      });
      initialize(positionArr);
      

  /* },
    error:function(data){
      alert(JSON.parse(data.response).msg);
    }
   });*/
}
function initialize(positionArr) {
     
    map.clearMap();
    //开始位置*************************************************
    var lnglatXY =positionArr;//需转为地址描述的坐标
    var markerOption = {
              map:map,                 
              icon:"http://webapi.amap.com/images/0.png",  
              position:lnglatXY,
              offset:new AMap.Pixel(-15,-35)
          };            
    var mar = new AMap.Marker(markerOption);  
    //加载地理编码插件 
    var geocoder;
    AMap.service(["AMap.Geocoder"], function() {       
      geocoder = new AMap.Geocoder({
        radius: 1000,
        extensions: "all"
      });
      //逆地理编码
      geocoder.getAddress(lnglatXY, function(status, result){
        //取回逆地理编码结果
        if(status === 'complete' && result.info === 'OK'){
        
          $("#location").html("车辆位置:"+result.regeocode.formattedAddress+"("+gps+")  "+moment(time).format("YYYY-MM-DD hh:mm:ss"));
        }
      });
    });
}
$("#redraw").click(function(){
  redraw();
});
    function redraw(){
        var url="/student/maplocation/"+deviceId;
        $.ajax({
            type:"get",
            url:url,
            dataType:'json',
            success:function(data){
              if(!data[0].location[0] || !data[0].location[1]) return;
                var spark=wg2mg(data[0].location[0]/1000000,data[0].location[1]/1000000);
              positionArr=new AMap.LngLat(spark[0],spark[1]);
                map.setZoomAndCenter(17, [spark[0],spark[1]]);
                //加载地图
                initialize(positionArr);


            },
            error:function(data){
                alert(JSON.parse(data.response).msg);
            }
        });
    }


 });

