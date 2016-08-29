module.exports = {
  // function to clone an object
  clone: function(obj) {
    var newobj = {};
    for(var keys = Object.keys(obj), l = keys.length; l; --l) {
       newobj[keys[l-1]] = obj[keys[l-1]];
    }
    
    return newobj;
  },
  extend: function(a, b) {
    var newvar = this.clone(a);
    for(var x in b) {
      newvar[x] = b[x];
    }
    
    return newvar;
  },
  createGUID: function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
  }
}