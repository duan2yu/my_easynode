 
$(function(){
    var map;
    $.ajax({
        type:"get",
        url:"/api/group/read/"+sessionStorage.groupId,
        dataType:"json"
    }).done(function(data){
        if(data.code==0){
            for(var x in data.result){
                $("form").eq(0).find("[name='"+x+"']").val(data.result[x]);
            }
            var local=[data.result.lng,data.result.lat];

            map = new AMap.Map("container", {
              resizeEnable: true,
              center: [local[0], local[1]],
              zoom: 13
            });
            //加载工具条

             map.plugin(["AMap.ToolBar"], function () {
                toolBar = new AMap.ToolBar();
                map.addControl(toolBar);
              });
            var markerOption = {
                map:map,
                icon:"http://webapi.amap.com/images/marker_sprite.png",
                position:new AMap.LngLat(local[0], local[1]),
                topWhenMouseOver:true,
                draggable: true
            };           
             mar = new AMap.Marker(markerOption); 
        }
    });

    var windowsArr = new Array(); 
   
    $(".province3").change(function(){
       map.clearMap();
       map.setCity($(this).val());
       setTimeout(function(){
            map.setCity($(".selectcity").val());
       },300);
    });

    $(".selectcity").change(function(){
        map.setCity($(this).val());
        setTimeout(function(){
          var mapCenter = map.getCenter();
        },300);
    });

    //根据位置在地图生成点
    $(".addressBtn").click(function(){
         map.clearMap();
        if($(".enteraddress").val()!=""){
            placeSearch($(".enteraddress").val());
       }
    });
   
    
    new PCAS("province","city","area");


  $("#companyForm").attr("action",$("#companyForm").attr("action")+sessionStorage.groupId);



    var mar

    $("#container").mouseup(function(){
       var position=mar.getPosition();
       //map.setFitView();
       $("#companyForm").find("[name='lng']").val(position.lng);
        $("#companyForm").find("[name='lat']").val(position.lat);
    });



    /*******************************************/
      var marker = [];
    var windowsArr = [];
    //基本地图加载
    
    //地点查询函数    
    function placeSearch(name){ 
        var MSearch;
        AMap.service(["AMap.PlaceSearch"], function() {       
            MSearch = new AMap.PlaceSearch(); //构造地点查询类
            //范围查询
           MSearch.searchInBounds(name, map.getBounds(), function(status, result){
              if(status === 'complete' && result.info === 'OK'){
                placeSearch_CallBack(result);
              }else{
                 MSearch = new AMap.PlaceSearch({ //构造地点查询类
                    pageSize:10,
                    pageIndex:1,
                    city:"021" //城市
                });
                 MSearch.search(name, function(status, result){
                    if(status === 'complete' && result.info === 'OK'){
                      placeSearch_CallBack(result);
                      $(".enteraddress").next("span").html("");
                    }else{
                        $(".enteraddress").next("span").html("无法定位到目标位置！");
                    }
                }); 
              }
            }); 

        }); 
    }
    //添加marker和infowindow  
    function addmarker(d){
        var lngX = d.location.getLng();
        var latY = d.location.getLat();
       var markerOption = {
            map:map,
            icon:"http://webapi.amap.com/images/marker_sprite.png",
            position:new AMap.LngLat(lngX, latY),
            topWhenMouseOver:true,
            draggable: true
        };           
         mar = new AMap.Marker(markerOption); 

        marker.push(new AMap.LngLat(lngX, latY));
    }
    //回调函数
    function placeSearch_CallBack(data){ 
        var resultStr="";
        var resultArr = data.poiList.pois;
        var resultCount = data.poiList.pois.length; 
            addmarker(resultArr[0]);
            map.setFitView();

       $("#companyForm").find("[name='lng']").val(resultArr[0].location.getLng());
       $("#companyForm").find("[name='lat']").val(resultArr[0].location.getLat());
    }   
    function TipContents(type,address,tel){  
        if (type == "" || type == "undefined" || type == null || type == " undefined" || typeof type == "undefined") { 
            type = "暂无"; 
        } 
        if (address == "" || address == "undefined" || address == null || address == " undefined" || typeof address == "undefined") { 
            address = "暂无"; 
        } 
        if (tel == "" || tel == "undefined" || tel == null || tel == " undefined" || typeof address == "tel") { 
            tel = "暂无"; 
        } 
        var str ="  地址：" + address + "<br />  电话：" + tel + " <br />  类型："+type; 
        return str; 
    } 
    function openMarkerTipById1(pointid,thiss){  //根据id打开搜索结果点tip 
        thiss.style.background='#CAE1FF'; 
       windowsArr[pointid].open(map,marker[pointid]);     
    } 
    function onmouseout_MarkerStyle(pointid,thiss) { //鼠标移开后点样式恢复 
       thiss.style.background=""; 
    }
});
 




