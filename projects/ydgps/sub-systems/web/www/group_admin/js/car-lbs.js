var map;
$(function(){
    map = new AMap.Map("container", {
              resizeEnable: true,
              center: [128.00233,39.002030],
              zoom: 13
            });
	getGroup()
    
});


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