
var map;//地图
var positionArr=[];
var positionIndex=0;
var startI=0;
var marker;
var positionArrLenth=0;
var positionDate=[];
var setTimeFn;
var dayTime=0;
var mapVedioId=GetQueryString("id");
var stopTime=true;//暂停

//画图参数
var polyline;
function initialize() {
		var markerOption,mar,geocoder,lnglatXY;
		//开始位置*************************************************
		if(positionArr.length<=0) return;
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

function addMarker() {
		var speed=$(".list .on").attr("rel");
	setTimeFn=setTimeout(function(){
		if(startI<positionArr.length){
			if(stopTime){
			$(".times i").html(startI+1);
			$(".speed i").html((positionDate[startI].speed/10).toFixed(1));
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
var nodwdate=GetQueryString("time")||new Date().getTime();
  begin(nodwdate);
  var dayTime=new Date();
  dayTime.setTime(nodwdate);
  $(".day label").html(dayTime.getDate());

	$(".circle").tap(function(){
		$(".circle").removeClass("on");
		$(this).addClass("on");
	});
	$("#showicon").tap(function(){
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
			stopTime=false;
				$(this).removeClass("btn_on");
			}else{
			stopTime=true;
				$(this).addClass("btn_on");
			}
		}
	});
	$("body").mousemove(function(e){
		var xx = e.pageX; 
		var yy = e.pageY; 
		var ll = map.containTolnglat(new AMap.Pixel(xx,yy));  
		$("#geo").html(ll.getLng()+","+ll.getLat());
	});
	
  //日期选择
  /*$("body").tap(function(){
  	if($(".dayChoose").val()!=""){
		if($(".dayChoose").val().split("-")[2]!=dayTime){
			dayTime=$(".dayChoose").val().split("-")[2];
			$(".day label").html(dayTime);
		}
	}
  });*/
  $(".day").tap(function(){
	$("#test").click();
	});
  
  $("#test").change(function(){
		$(".day label").html($(this).val().split("/")[2]);
		var date=$(this).val();
		var newDate=new Date();
		newDate.setFullYear(date.split("/")[0],parseInt(date.split("/")[1])-1,parseInt(date.split("/")[2]));
  		//alert(location.href());
  		location.href=location.href.split("?")[0]+"?time="+newDate.getTime();
  });
});


function begin(nodwdate){
	var url=releaseUrl+"api/device/"+deviceId+"/datetrack/"+nodwdate;
  var zoom=12;
	$.ajax({
		type:"get",
		url:url,
		success:function(data){
			if(data.length>0){
			data=eval(data);
			if(data.length)
			var last=data[data.length-1];
			var dataNew=deletLoc(data,0.002);
			data=dataNew;
			if(data[data.length-1].lng!=last.lng){
				data.push(last);
			}
			$.each(data,function(i,e){
                if(!e.lat || !e.lng) return;
				e.spark=wg2mg(data[i].lng,data[i].lat);
				positionArr.push(new AMap.LngLat(e.spark[0],e.spark[1]));
				positionArr[positionIndex].pf=e.lng*e.lng+e.lat*e.lat;
				positionIndex++;
				e.clockTime=new Date();
				e.clockTime.setTime(e.st);
				e.clockTime=timeFormat(e.clockTime.getHours())+":"+timeFormat(e.clockTime.getMinutes())+":"+timeFormat(e.clockTime.getSeconds());
				positionDate.push({speed:e.speed,time:e.clockTime});
			});
			positionArrLenth=positionArr.length;
			$(".times").html("进度：<i>0</i>/"+positionArrLenth);
			}
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
}

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