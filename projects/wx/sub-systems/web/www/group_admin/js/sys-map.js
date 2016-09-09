
    var map;
    var circle;
    var searchPosition=[];
    var marker;
$(function(){
    var toolBar = null;
    
    var deviceId=ddche.GetQueryString("deviceId");
    var positionArr;

    //新增电子围栏
    $("#addNewCrawl").click(function(){
      var form=$("#crawlFrom");
      $(".sys-crawl").show();
      form.find("input").val("");
      $("#drewCircle").val(100);
      form.attr("action","/api/electronic-fence/create");
      map.clearMap();
    })

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
          form.attr("action","/api/electronic-fence/update/"+data.id);
          for(var x in data){
            form.find("[name='"+x+"']").val(data[x]);
          }
          addMarck([data.lng,data.lat],data.radius);
          crawl.show();
      });

      $("#save-crawl").click(function(e){
          e.preventDefault();
          if(marker){
            $("[name='lng']").val(marker.getPosition().lng);
            $("[name='lat']").val(marker.getPosition().lat);
          }
          $(this).closest("form").submit();
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