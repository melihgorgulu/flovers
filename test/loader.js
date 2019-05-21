const fs = require("fs"),
    request = require("request"),
    path = require("path");

let defaultServer = 'http://127.0.0.1:5000/classify'

const labels=["Daisy","Dandelion","Rose","Sunflower","Tulip"];

var walkSync = function(dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkSync(path.join(dir, file), filelist);
      }
      else {
        filelist.push(file);
      }
    });
    return filelist;
  };



module.exports.getTestData = function () {
    let arr = [];
    labels.forEach((dir,i)=>{
        dir=dir.toLowerCase();
        list=walkSync(path.resolve(__dirname,"dataset",dir)).slice(-20);
        list.forEach(fil=>{ 
            if(!fil.endsWith(".jpg")){
                return;
            }      
            arr.push({
                file:dir+"/"+fil,
                label:i
            });
        });
    });
    return arr;
};

module.exports.testImg = function (img, server, cb) {
    if (typeof server === "function") {
        cb = server
        server = defaultServer
    }


    request.post(server, {
        formData: {
            file: fs.createReadStream(path.resolve(__dirname, "dataset", img))
        }
        //,proxy:'http://localhost:8888'
    }, cb)

}
