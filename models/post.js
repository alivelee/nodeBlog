var mongo = require('./db');
var markdown = require('markdown').markdown;
function Post(name,title,post){
    this.name = name;
    this.title = title;
    this.post = post;
}
module.exports = Post;

Post.prototype.save = function(callback){
    var date = new Date();
    var time = {
        date:date,
        year:date.getFullYear(),
        month:date.getFullYear() + "-" + (date.getMonth() + 1),
        day:date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute:date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ?'0' + date.getMinutes():date.getMinutes())
    }
    var post = {
        name:this.name,
        time:time,
        title:this.title,
        post:this.post
    }
    mongo.open(function(err,db){
        if (err){
            return callback(err);
        }
        db.collection('post',function(err,collection){
            if (err){
              mongo.close();
              return callback(err);
            }
            collection.insert(post,{
                safe:true
            },function(err){
                mongo.close();
                if(err){
                  return callback(err);
                }
                callback(null);
            });
        });
    });
};
Post.getAll = function(name,callback){
    mongo.open(function(err,db){
        if (err){
          return callback(err);
        }
        db.collection('post',function(err,collection){
          if (err){
            mongo.close();
            return callback(err);
          }
          var query = {};
          if (name) {
              query.name = name;
          }
          collection.find(query).sort({
              time:-1 
          }).toArray(function(err,docs){
              mongo.close();
              if (err){
                return callback(err);
              }
              docs.forEach(function(doc){
                  doc.post = markdown.toHTML(doc.post);
              });
              callback(null,docs);
          });
        });
    });
}
Post.getOne = function (name,day,title,callback){
    mongo.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.collection('post',function(err,collection){
            if (err) {
                mongo.close();
                return callback(err);
            }
            collection.findOne({
                "name":name,
                "title.day":day,
                "title":title
            },function(err,doc){
                mongo.close();
                if (err) {
                    return callback(err);
                }
                doc.post = markdown.toHTML(doc.post);
                callback(null,doc);
            });
        });
    });
}