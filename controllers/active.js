var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = 'mongodb://localhost:27017/wdshare';
var ObjectId = mongo.ObjectID;
var Q = require('q');
var activeControl = {};

activeControl.create = function(ao){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');
        ao.aUsers = [];
        collection.findOneAndReplace({aName:ao.aName},ao,{w:1, upsert: true}, function(err, result) {
            if(err){
                deferred.reject(err);
                return;
            }
            console.log(result);

            deferred.resolve(err);
        });

    });
    return deferred.promise;
};

activeControl.update = function(id,ao){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');
        var obj = {
            "aName" : ao["aName"],
            "aTime" : ao["aTime"],
            "aJoinEndTime":ao["aJoinEndTime"],
            "aAddress" : ao["aAddress"],
            "aStatus" : ao["aStatus"],
            "aContent" : ao["aContent"],
            "aUsers":[]
        }
        collection.findOneAndUpdate({_id:new ObjectId(id)},obj,{w:1, upsert: true}, function(err, result) {
            if(err){
                deferred.reject(err);
                return;
            }
            deferred.resolve(result);
        });
    });
    return deferred.promise;
};

activeControl.find = function(query){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');
        collection.find(query).toArray(function(err, result) {
            if(err){
                deferred.reject(err);
                return;
            }
            deferred.resolve(result);
        });

    });
    return deferred.promise;
};

activeControl.join = function(aid,joinObj){
    var deferred = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if(err){
            deferred.reject(err);
            return ;
        }
        var collection = db.collection('active');
        //console.log(joinObj);

        collection.findOne({
            _id:new ObjectId(aid),
            aUsers: { $elemMatch: { mail: joinObj.mail }}
        },function(err,result){
            if(!result){
                collection.update({
                        _id:new ObjectId(aid)
                    },
                    {$push:{aUsers:joinObj}},
                    {w:1},
                    function(err,result){
                        if(err){
                            console.log('err',err);
                            deferred.reject(err);
                            return;
                        }
                        deferred.resolve(result);
                    })
            }else{
                collection.update({
                        _id:new ObjectId(aid),
                        aUsers: { $elemMatch: { mail: joinObj.mail }}
                    },
                    {$set:{"aUsers.$":joinObj}},
                    {w:1},
                    function(err,result){
                        if(err){
                            console.log('err',err);
                            deferred.reject(err);
                            return;
                        }
                        deferred.resolve(result);
                    });
            }
        });


        //{
        //    }
        //},
        //function(err, result) {
        //    if(err){
        //        deferred.reject(err);
        //        return;
        //    }
        //    console.log('ele',result);
        //    deferred.resolve(err);
        //}

        //collection.insert([joinObj],function(err,result){
        //    console.log("Connected correctly to server");
        //    deferred.resolve(result);
        //    db.close();
        //});
    });
    return deferred.promise;
};

module.exports = activeControl;