/**
 * 国际标准坐标转换成火星坐标
 * @param wgLon
 * @param wgLat
 * @returns {*[]}
 * @constructor
 */
var wg2mg = function (wgLon, wgLat) {
  if (wg2mg._outOfChina(wgLon, wgLat)) return [wgLon, wgLat];
  var dLat = wg2mg._transformLat(wgLon - 105.0, wgLat - 35.0);
  var dLon = wg2mg._transformLon(wgLon - 105.0, wgLat - 35.0);
  var radLat = wgLat / 180.0 * Math.PI;
  var magic = Math.sin(radLat);
  magic = 1 - wg2mg.EE * magic * magic;
  var sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((wg2mg.A * (1 - wg2mg.EE)) / (magic * sqrtMagic) * Math.PI);
  dLon = (dLon * 180.0) / (wg2mg.A / sqrtMagic * Math.cos(radLat) * Math.PI);
  return [wgLon + dLon, wgLat + dLat];
};
wg2mg.A = 6378245.0;
wg2mg.EE = 0.00669342162296594323;
wg2mg._transformLat = function (x, y) {
  var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
  return ret;
};
wg2mg._transformLon = function (x, y) {
  var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
  return ret;
};
wg2mg._outOfChina = function (lon, lat) {
  if (lon < 72.004 || lon > 137.8347)
    return true;
  if (lat < 0.8293 || lat > 55.8271)
    return true;
  return false;
};
wg2mg.transform = function (wgLon, wgLat) {
  if (wg2mg._outOfChina(wgLon, wgLat)) return [wgLon, wgLat];
  var dLat = wg2mg._transformLat(wgLon - 105.0, wgLat - 35.0);
  var dLon = wg2mg._transformLon(wgLon - 105.0, wgLat - 35.0);
  var radLat = wgLat / 180.0 * Math.PI;
  var magic = Math.sin(radLat);
  magic = 1 - wg2mg.EE * magic * magic;
  var sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((wg2mg.A * (1 - wg2mg.EE)) / (magic * sqrtMagic) * Math.PI);
  dLon = (dLon * 180.0) / (wg2mg.A / sqrtMagic * Math.cos(radLat) * Math.PI);
  return [wgLon + dLon, wgLat + dLat];
};