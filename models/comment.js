var mongo = require('./db');
function Comment(name,day,title,comment) {
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}
module.exports = Comment;

Comment.prototype.save = function(callback){
    var name = this.name,
        day = this.day,
        title = this.title,
        comment = this.comment;
    mongo.open(function(err,db){
        if (err) {
            return callback(err);
        }
        db.collection('post',function(err,collection){
            if (err) {
                mongo.close();
                return callback(err);
            }
            collection.update({
                "name":name,
                "time.day":day,
                "title":title
            },{
                $push:{"comments":comment}
            },function(err){
                mongo.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};