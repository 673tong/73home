//增加EPSG:4610
Proj4js.defs["EPSG:4610"] = "+proj=longlat +a=6378140 +b=6356755.288157528 +units=dd +no_defs";
Proj4js.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
Proj4js.defs["EPSG:3785"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +no_defs";
Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ";
Proj4js.defs["EPSG:4214"] = "+proj=longlat +a=6378140 +b=6356755.288157528 +units=dd +no_defs";

// zone=37
Proj4js.defs["EPSG:2361"] = "+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=37500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs";
// zone=38
Proj4js.defs["EPSG:2362"] = "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs";
// zone=39
Proj4js.defs["EPSG:2363"] = "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=39500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs";
// zong=40
Proj4js.defs["EPSG:2364"] = "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=40500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs";
// 41
Proj4js.defs["EPSG:2365"] = "+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=41500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs";
// 42
Proj4js.defs["EPSG:2366"] = "+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=42500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs";

Proj4js.defs["EPSG:2387"] = "+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs";

// 北京54 42带
Proj4js.defs["EPSG:2418"] = "+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=41500000 +y_0=0 +ellps=krass +units=m +no_defs ";
// 北京54 38带
Proj4js.defs["EPSG:2414"] = "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=krass +units=m +no_defs ";
//北京54 球面坐标
Proj4js.defs["EPSG:4214"] = "+proj=longlat +ellps=krass +no_defs";

//西安80坐标
//105E 6度带
Proj4js.defs["EPSG:2343"] = "+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs";


/**
 * 转换，从insr转换到outsr的坐标系
 * @param inSR 比如4326
 * @param outSR 比如2363
 * @param lonX 经度
 * @param latY 纬度
 * @returns {*}
 */
function proj4Transform(inSR,outSR,lonX,latY){
    var epsg=inSR+"";
    var outepsg=outSR+"";
    if(epsg.indexOf("EPSG")<0){
        var epsg = "EPSG:" + epsg;
    }
    if(outepsg.indexOf("EPSG")<0){
       outepsg = "EPSG:" + outepsg;
    }

    var targetProj =new Proj4js.Proj(outepsg);
    var currentProj =new Proj4js.Proj(epsg);
    // 投影
    var XY = new Proj4js.Point(lonX,latY); 
    var result=Proj4js.transform(currentProj,targetProj,XY);
    return result;
}

//平面转经纬度
function transfromMapzone(inSR,outSR,lonX,latY) {
	var epsg=inSR+"";
    var outepsg=outSR+"";
    if(epsg.indexOf("EPSG")<0){
        var epsg = "EPSG:" + epsg;
    }
    if(outepsg.indexOf("EPSG")<0){
       outepsg = "EPSG:" + outepsg;
    }

    var targetProj =new Proj4js.Proj(outepsg);
    var currentProj =new Proj4js.Proj(epsg);
	// 投影
	var XY = new OpenLayers.Geometry.Point(lonX,latY);
	var result=Proj4js.transform(currentProj,targetProj,XY);
    return result;
}

//经纬度坐标转换成度分秒的格式
function getFriePosLonLatFromPoint (lonX,latY) {
	var value = {};
	var temp;
	value.xD = parseInt(lonX);
	temp=(lonX - value.xD) * 60;
	value.xM = parseInt(temp);
	value.xS = parseInt((temp - value.xM) * 60);
	
	value.yD = parseInt(latY);
	temp=(latY - value.yD) * 60;
	value.yM = parseInt(temp);
	value.yS = parseInt((temp - value.yM) * 60);
	
	value.lon = value.xD+"&deg;"+value.xM+ "&prime;"+value.xS+"&Prime;";
	value.lat = value.yD+"&deg;"+value.yM+ "&prime;"+value.yS+"&Prime;";
	value.stringFormat = value.xD+"&deg;"+value.xM+ "&prime;"+value.xS+"&Prime;,&nbsp;"+value.yD+"&deg;"+value.yM+ "&prime;"+value.yS+"&Prime;";
	return value;
}

//把度分秒的经纬度转换成度的经纬度
function DMSConvertToDegree(strcoordinateD, strcoordinateM,strcoordinateS) {
	if (!validateNum(strcoordinateD) || !validateNum(strcoordinateM) || !validateNum(strcoordinateS)) {
		return "";
	}
	icoordinateD = parseInt(strcoordinateD);
	icoordinateM = parseInt(strcoordinateM) / 60;
	icoordinateS = parseInt(strcoordinateS) / 3600;
	return icoordinateD + icoordinateM + icoordinateS;
}

function validateNum(strCoordinate) {
	var reg = new RegExp("^[0-9]*$");
	if (!reg.test(strCoordinate)) {
		return false;
	}
	return true;
}

//^((0)|([1-9][0-9]*))\.[0-9]+$
function validateFloat(strCoordinate) {
	var reg = new RegExp("^((0)|([1-9][0-9]*))\.[0-9]+$");
	if (!reg.test(strCoordinate)) {
		return false;
	}
	return true;
}