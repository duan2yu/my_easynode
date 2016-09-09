$(function(){
  var map=new AMap.Map("container",{
          view: new AMap.View2D({//创建地图二维视口
          zoom:17, //设置地图缩放级别
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

    var markerOption ,mar;

$(document).on("click",".deviceModal",function(){
    var location=[$(this).attr("lng"),$(this).attr("lat")];
    /* marker = new AMap.Marker({          
            icon: "http://webapi.amap.com/images/0.png",
            position:location,
            offset:new AMap.Pixel(-8,-13)
          });
      
      marker.setMap(map);  //在地图上添加点
        map.setCenter(location);*/
         map.clearMap();
    //开始位置*************************************************
    var markerOption = {
              map:map,                 
              icon:"http://webapi.amap.com/images/0.png",  
              position:location,
              offset:new AMap.Pixel(-15,-35)
          };            
    var mar = new AMap.Marker(markerOption);  

                map.setZoomAndCenter(17, location);
  })
});