 
$(function(){
  var map = new AMap.Map("container", {
      resizeEnable: true,
      center: [116.397428, 39.90923],
      zoom: 5
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
    $(".addressBtn").click(function(){
         map.clearMap();
        if($(".enteraddress").val()!=""){
            placeSearch($(".enteraddress").val());
       }
    });
   
    


    var mar

    $("#container").mouseup(function(){
       var position=mar.getPosition();
       //map.setFitView();
       $(this).closest("form").find("[name='lng']").val(position.lng);
       $(this).closest("form").find("[name='lat']").val(position.lat);
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
    function addmarker(i,d){
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
     
       /* var infoWindow = new AMap.InfoWindow({
            content:"<h3><font color=\"#00a6ac\">  "+(i+1) + "."+ d.name +"</h3></font>"+TipContents(d.type,d.address,d.tel),
            size:new AMap.Size(300,0),
            autoMove:true ,
            offset:new AMap.Pixel(0,-20)
        }); 
        windowsArr.push(infoWindow);   
        var aa = function(e){infoWindow.open(map,mar.getPosition());}; 
        AMap.event.addListener(mar,"mouseover",aa); */
    }
    //回调函数
    function placeSearch_CallBack(data){ 
        var resultStr="";
        var resultArr = data.poiList.pois;
        var resultCount = data.poiList.pois.length; 

        //for (var i = 0; i < resultCount; i++) { 
            var i=0;
            //resultStr += "<div id='divid"+(i+1)+"' onmouseover='openMarkerTipById1("+i+",this)' onmouseout='onmouseout_MarkerStyle("+(i+1)+",this)' style=\"font-size: 12px;cursor:pointer;padding:2px 0 4px 2px; border-bottom:1px solid #C1FFC1;\"><table><tr><td><img src=\"http://webapi.amap.com/images/marker_sprite.png\"></td>"+"<td><h3><font color=\"#00a6ac\">名称: "+resultArr[i].name+"</font></h3>";
            //resultStr += TipContents(resultArr[i].type, resultArr[i].address, resultArr[i].tel)+"</td></tr></table></div>";
            //addmarker(i, resultArr[i]);
            addmarker(i, resultArr[i]);
            map.setFitView();
        //}
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
 




