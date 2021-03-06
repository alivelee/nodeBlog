var mongo = require('./db');
var markdown = require('markdown').markdown;
function Post(name,title,post){
    this.name = name;
    this.title = title;
    this.post = post;
    this.tags = tags;
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
        post:this.post,
        tags:this.tags,
        comments:[],
        pageView:0
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
                "time.day":day,
                "title":title
            },function(err,doc){
                mongo.close();
                if (err) {
                    mongo.close();
                    return callback(err);
                }
                if (doc) {
                    collection.update({
                        "name":name,
                        "time.day":day,
                        "title":title
                    },{
                        $inc:{
                            "pageView":1
                        }
                    },function(){
                        mongo.close();
                        if (err) {
                           console.log(err);
                        }
                    });
                }
                doc.post = markdown.toHTML(doc.post);
                // doc.comments.forEach(function(comment){
                //   comment.content = markdown.toHTML(comment.content)
                // });
                callback(null,doc);
            });
        });
    });
};
Post.edit = function(name,day,title,callback){
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
                "time.day":day,
                "title":title
            },function(err,doc){
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null,doc);
            });
        });
    });
};
Post.update = function(name, day, title, post, callback) {
  mongo.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('post', function (err, collection) {
      if (err) {
        mongo.close();
        return callback(err);
      }
      collection.update({
        "name": name,
        "time.day": day,
        "title": title
      }, {
        $set: {post: post}
      }, function (err) {
        mongo.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};
Post.remove = function (name,day,title,callback){
    mongo.open(function(err,db){
        if (err) {
            mongo.close();
            callback(err);
        }
        db.collection('post',function(err,collection){
          if (err) {
              mongo.close();
              callback(err);
          }
          collection.remove({
              "name":name,
              "time.day":day,
              "title":title
          },{
              w:1
          },function (err){
              mongo.close();
              if (err) {
                  return callback(err);
              }
              callback(null);
          });
        });
    });
}
Post.getArchieve = function(callback){
    mongo.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.collection('post',function(err,collection){
            if (err) {
                mongo.close();
                return callback(err);
            }
            collection.find({},{
                "name":1,
                "time":1,
                "title":1
            }).sort({
                time:-1
            }).toArray(function(err,docs){
                mongo.close();
                if (err){
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
}
Post.getTags = function(callback){
    mongo.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.collection('post',function(err,collection){
            if (err) {
                mongo.close();
                return callback(err);
            }
            collection.distinct("tags",function(err,docs){
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
}
Post.getTag = function(tag,callback){
    mongo.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.collection('post',function(err,collection){
            if (err) {
                mongo.close();
                return callback(err);
            }
            collection.find({
                "tags":tag
            },{
                "name":1,
                "time":1,
                "title":1
            }).sort({
                time:-1
            }).toArray(function(err,docs){
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
}
Post.search = function(keyword,callback){
    mongo.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.collection('post',function(err,collection){
            if (err) {
                mongo.close();
                return callback(err);
            } 
            var pattern = new RegExp(keyword,"i");
            collection.find({
                "title":pattern
            },{
                "name":1,
                "time":1,
                "title":1
            }).sort({
                "time":-1
            }).toArray(function(err,docs){
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
}