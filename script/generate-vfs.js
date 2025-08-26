/**
 * 生成虚拟文件系统的元数据
 * 用于编辑器的文件浏览器
 */
import fs from 'fs';
import path from 'path';

var args = process.argv.splice(2);
var drive = args[0] || '';
var rootPath = args[1] || '';
var rootDir = args[2] || './';

var root = path.join(process.cwd(), rootDir);
console.info("root", root);

function metadataRecurse(parent, pp){
    var parentPath = path.join(root, parent);
    console.info("parentPath", parentPath);

    var files = fs.readdirSync(parentPath)
    var metadata = {data:{files:[]}};
    for (var i=0; i < files.length; i++){
        var file = files[i];
        if(file == ".folder.json" || file == ".all.json" || file == "uni.json" || file == "Thumbs.db")continue;

        var ext = path.extname(file);
        if(ext && ext.indexOf(".") == 0)ext = ext.substr(1); //去掉.
        
        var child = (parent == "/" ? parent : parent + "/") + file;
        var childPath = path.join(parentPath, file);
        var fileinfo = fs.statSync(childPath);
        var type = "FILE"; 

        //如果是目录，就先递归
        if(!fileinfo.isFile()) {
            type = "FOLDER";
            metadataRecurse(child, parent);
        }
        //文件信息
        var meta = {
            "path": parent,
            "name": file,
            "ext": ext,
            "type": type,
            "size": 0,
            "time": null,
            "url": `/${drive}${rootPath}${parent}/${file}`
        }
        if(type == "FOLDER"){
            //目录
            metadata.data.files.unshift(meta);
        } else {
            //文件
            metadata.data.files.push(meta);
        }
    }
    // //上一级
    // metadata.data.files.unshift({
    //     "path": parent,
    //     "name": parent,
    //     "ext": "",
    //     "type": "parent",
    // })
    
    //保存
    metadata.code = 0;
    var text = JSON.stringify(metadata, null, 2);
    var metafile = path.join(parentPath, '.folder.json');
    fs.writeFileSync(metafile, text); 
}




function metadataAll(root){
  var recurse = function(metadata, parent, pp){
    var parentPath = path.join(root, parent);
    console.info("parentPath", parentPath);

    var files = fs.readdirSync(parentPath)
    for (var i=0; i < files.length; i++){
        var file = files[i];
        if(file == ".folder.json" || file == ".all.json" || file == "uni.json" || file == "Thumbs.db")continue;

        var ext = path.extname(file);
        if(ext && ext.indexOf(".") == 0)ext = ext.substr(1); //去掉.
        
        var child = (parent == "/" ? parent : parent + "/") + file;
        var childPath = path.join(parentPath, file);
        var fileinfo = fs.statSync(childPath);
        var type = "FILE"; 

        //如果是目录，就先递归
        if(!fileinfo.isFile()) {
            type = "FOLDER";
            recurse(metadata, child, parent);
        }
        //文件信息
        var meta = {
            "path": parent,
            "name": file,
            "ext": ext,
            "type": type,
            "size": 0,
            "time": null,
            "url": `/${drive}${rootPath}${parent}/${file}`
        }
        if(type == "FOLDER"){
            //目录
            //metadata.data.files.unshift(meta);
        } else {
            //文件
            metadata.data.files.push(meta);
        }
    }
  }
    
  var metadata = {data:{files:[]}};
  recurse(metadata, "/", null);

  //保存
  metadata.code = 0;
  var text = JSON.stringify(metadata, null, 2);
  var metafile = path.join(root, '.all.json');
  fs.writeFileSync(metafile, text); 
}

console.info("==============metadataRecurse===============");
metadataRecurse("/", null);
console.info("==============metadataAll===============");
metadataAll(root);