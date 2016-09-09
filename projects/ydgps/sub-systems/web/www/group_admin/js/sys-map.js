
    var map;
    var circle;
    var searchPosition=[];
    var marker;
$(function(){
    var toolBar = null;
    
    var deviceId=ddche.GetQueryString("deviceId");
    var positionArr;
    //获取分组设备
    getGroup();
    //新增电子围栏
    $("#addNewCrawl").click(function(){
      var form=$("#crawlFrom");
      $(".sys-crawl").show();
      form.find("input:not([name='type'])").val("");
      $("#drewCircle").val(100);
      form.attr("action","/api/electronic-fence/create");
      map.clearMap();
      
    });

     map=new AMap.Map("container",{
          view: new AMap.View2D({//创建地图二维视口
          zoom:10, //设置地图缩放级别
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
      //在地图中添加ToolBar插件
      map.plugin(["AMap.ToolBar"], function () {
        toolBar = new AMap.ToolBar();
        map.addControl(toolBar);
      });


      //地图查找
      $("#searchMap").click(function(){
          placeSearch($("#place").val());
      });

      //画圆
      $("#drewCircle").change(function(){

          circle.setMap(null)
          addCircle(searchPosition,$(this).val());
      });

      //拖动点
      $("#container").mouseup(function(){
          if(marker){
            circle.setMap(null)
            addCircle([marker.getPosition().lng,marker.getPosition().lat],$("#drewCircle").val());
          }
      });


      //编辑电子围栏
      $(document).on("click",".sys-editor",function(){
          map.clearMap();
          var that=$(this);
          var data={
              id:that.attr("data-id"),
              name:that.attr("data-name"),
              groupId:that.attr("data-groupId"),
              lat:that.attr("data-lat"),
              lng:that.attr("data-lng"),
              radius:that.attr("data-radius"),
              address:that.attr("data-address")
          };
          var crawl=$(".sys-crawl");
          var form=$("#crawlFrom");
          $.ajax({
            type:"post",
            url:"/api/electronic-fence/"+data.id+"/devices",
            dataType:"json"
          }).done(function(data){
              if(data.code==0){
                $("#deviceGroup input").prop("checked",false);
                  for(var i=0;i<data.result.length;i++){
                      $("#deviceGroup input[value='"+data.result[i].deviceId+"']").prop("checked",true);
                  }
              }
          });
          form.attr("action","/api/electronic-fence/update/"+data.id);
          for(var x in data){
            form.find("[name='"+x+"']").val(data[x]);
          }
          addMarck([data.lng,data.lat],data.radius);
          crawl.show();
      });

      //保存
      $("#save-crawl").click(function(e){
          e.preventDefault();
          if(marker){
            $("[name='lng']").val(marker.getPosition().lng);
            $("[name='lat']").val(marker.getPosition().lat);
          }
          var devices="";
          for(var i=0;i<$(".allinput .well input:checked").length;i++){
            devices+=","+$(".allinput .well input:checked").eq(i).val();
          }
          //限速
          $("[name='maxSpeed']").val(0);
          $("[name='devices']").val(devices.slice(1));
          $(this).closest("form").submit();
      });

      //开启电子围栏
      $(document).on("click",".status",function(){
        var flag=$(this).attr("data-flasg");
        var imei=$(this).attr("data-imei");
        $(this).attr("data-flasg",!flag);
        $.ajax({
          type:"post",
          url:"/api/electronic-fence/toggle/"+imei+"/"+!flag,
          dataType:"json"
        }).done(function(data){
          if(data.code==0){
              if(flag){
                $(this).html("关闭");
              }else{
                $(this).html("开启");
              }
          }
        });

      });
 });

function placeSearch(name) {
        var MSearch;
        AMap.service(["AMap.PlaceSearch"], function() {
            MSearch = new AMap.PlaceSearch({ //构造地点查询类
                pageSize: 10,
                pageIndex: 1
            });
            //关键字查询
            MSearch.search(name, function(status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    addMarck([result.poiList.pois[0].location.lng,result.poiList.pois[0].location.lat]);
                }
            });
        });
    }

function addMarck(position){
          marker = new AMap.Marker({
            position: position,
            draggable: true,
            cursor: 'move',
            raiseOnDrag: true,
            dragend:function(e){
              console.log(e);
            }
          });

          map.setZoomAndCenter(12, position);
          marker.setMap(map);
          addCircle(position,$("#drewCircle").val())
}

function addCircle(position,num) {
        circle = new AMap.Circle({
            center: new AMap.LngLat(position[0], position[1]),// 圆心位置
            radius: num, //半径
            strokeColor: "#F33", //线颜色
            strokeOpacity: 1, //线透明度
            strokeWeight: 3, //线粗细度
            fillColor: "#ee2200", //填充颜色
            fillOpacity: 0.35//填充透明度
        });
        circle.setMap(map);

    }


//围栏建立成功
function crawlBuild(data){
  location.reload();
}


//获取所有设备
function getGroup(){
      $.ajax({
        type:"get",
        url:"/api/deviceGroup/listDetail",
        dataType:"json"
      }).done(function(data){
        var deviceHtml="";
        //deviceGroup
        if(data.code==0){
            for(var i=0;i<data.result.length;i++){
              if(data.result[i].devices.length>0){
                deviceHtml+='<div class="allinput">'+
                            '<div class="input-group">'+
                            '<span class="form-control">'+
                            '<label>'+
                            '<input type="checkbox" rel="allinput">'+data.result[i].name+
                            '</label></span>'+
                            '<span class="input-group-btn">'+
                            '<button class="btn btn-info btn-flat" type="button" role="button" data-toggle="collapse" href="#collapseExample'+i+'" aria-expanded="false" aria-controls="collapseExample'+i+'">'+
                            '<i class="fa fa-sort-down" ></i></button>'+
                            '</span>'+
                            '</div>'+
                            '<div class="collapse" id="collapseExample'+i+'">'+
                            '<div class="well">';
                          for(var q=0;q<data.result[i].devices.length;q++){
                            deviceHtml+='<label><input type="checkbox" value="'+data.result[i].devices[q].deviceId+
                            '">'+data.result[i].devices[q].deviceName+'</label>';
                          }
              deviceHtml+='</div></div></div>';
              }
            }
            
            $.ajax({
              type:"get",
              url:"/api/device/queryDeviceWithOutGroup",
              dataType:"json"
            }).done(function(d){
              if(d.code==0){
                deviceHtml+='<div class="allinput">'+
                            '<div class="input-group">'+
                            '<span class="form-control">'+
                            '<label>'+
                            '<input type="checkbox" rel="allinput">未分组设备'+
                            '</label></span>'+
                            '<span class="input-group-btn">'+
                            '<button class="btn btn-info btn-flat" type="button" role="button" data-toggle="collapse" href="#collapseExample'+i+'" aria-expanded="false" aria-controls="collapseExample'+i+'">'+
                            '<i class="fa fa-sort-down" ></i></button>'+
                            '</span>'+
                            '</div>'+
                            '<div class="collapse" id="collapseExample'+i+'">'+
                            '<div class="well">';
                          for(var q=0;q<d.result.length;q++){
                            deviceHtml+='<label><input type="checkbox" value="'+d.result[q].id+
                            '">'+d.result[q].deviceName+'</label>';
                          }
              deviceHtml+='</div></div></div>';
              $("#deviceGroup").html(deviceHtml);
              }
                
            });
        }
        
      });
}