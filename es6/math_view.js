var MathExercise = require('./math_exercise');
var uuid = require('uuid');

var AWS = require('aws-sdk');
var MathView = function(lj, ah) {
    this.learnjs = lj;
    this.auth_handler = ah;
    this.generator = new MathExercise();
}
module.exports = MathView;

MathView.prototype.generate = function() {
    var allExercises = [];
    for(var idx=0; idx<20; idx++ ) {
        var obj = this.generator.generate_exercise(10);
        allExercises.push(obj);
    }

    return allExercises;
}

MathView.prototype.create = function() {
    var self = this;
    var view = this.learnjs.template('math-view');
    var idx = 0;
    var allExercises = this.generate();
    var len = allExercises.length;
    for(var i = 0; i<len; i++) {
        var p = this.learnjs.template('math-problem');
        var obj = allExercises[i];
        this.learnjs.applyObject1(this.generator.toObject(obj), p);
        if(i<len/2) {
            view.find('.math-panel-1').append(p);
        } else {
            view.find('.math-panel-2').append(p);
        }
    }

    view.find('input').each(function(it, elem){
        $(elem).attr('data-index', idx);
        idx = idx + 1;
    });
    console.log(allExercises);

    var exId = uuid.v4();
    this.getLastExerciseNum().
        then(function(last_ex_id) {
            self.gotLastExNum(last_ex_id, allExercises, exId);
        }, function(err) {
            console.log("getLastEx err", err);
        });

    var checkPanel= function(panel) {
        var panel = $(panel);
        var good=0, bad=0;
        panel.children().each(function(ret) {
            var inp = $(this).children('.num-input').first();

            if(inp.val()===inp.attr('data-result')){
                $(inp).siblings('i.result-ok').removeClass('hidden');
                good = good+1;
            } else {
                $(inp).siblings('i.result-nok').removeClass('hidden');
                bad = bad + 1;
            }
        });
        return {bad: bad, good: good};
    }
    view.find('.ready-button').on('click', function(e){
        console.log(e.target);
        $('.math-panel-1 i').addClass('hidden');
        $('.math-panel-2 i').addClass('hidden');

        var result1 = checkPanel('.math-panel-1');
        var result2 = checkPanel('.math-panel-2');
        $('.result-line').removeClass('hidden');
        $('.ok-num').text(result1['good']+result2['good']);
        $('.nok-num').text(result1['bad']+result2['bad']);
        self.sendSolutionToTopic({
            solution: self.getSolution(), 
            exerciseId: exId
        }).then(function() {
            console.log("sns done");
        }, function(err) {
            console.log("sns fail", err);
        });
    });
    return view; 
}

MathView.prototype.getSolution = function() {
    var values = [];
    $(".math-view input").each(function() {
        values.push($(this).val());
    });
    return values.join(",");
}

MathView.prototype.gotLastExNum = function(last_ex_id, allExercises, exId) {
    var self = this;
    console.log("getLastExId returned: ", last_ex_id);
    var nextid = 0;
    if(last_ex_id.Count>0) {
        nextid = last_ex_id.Items[last_ex_id.Count-1].exerciseNum+1;
    } 
    console.log("nextid="+nextid);
    self.saveMathExercise(allExercises, nextid, exId)
        .then( function() {
            self.exerciseId = exId;
            console.log("saveMathExercise done ");
        },function(err){
            console.log("saveMathExercise err, ", err);
        });
}

MathView.prototype.sendSolutionToTopic = function(data) {
    console.log("sending to topic");
    var self = this;
    var sns = new AWS.SNS();
    return this.auth_handler.identity.then(function(identity) {
        //var msg = "hithere";//{created: new Date().toJSON(), solution: data};
        data.userId = identity.id;
        var jsonData = JSON.stringify(data);
        var params = {
            Message: JSON.stringify({default: jsonData}),
            MessageStructure: 'json',
            TopicArn: 'arn:aws:sns:eu-central-1:577209811533:myTopic'
        };
        return self.auth_handler.sendAwsRequest(sns.publish(params), function(data) {
        console.log("sns, retry", data);    
        });
    }, function(err) {
        console.log("sns auth FAIL");
    });
}

MathView.prototype.getLastExerciseNum = function(exData) {
    var self = this;
    return this.auth_handler.identity.then(function(identity) {
        var db = new AWS.DynamoDB.DocumentClient();
        
        var params = {
            ExpressionAttributeValues: {
                ":v1": identity.id
            }, 
            KeyConditionExpression: "userId = :v1", 
            ProjectionExpression: "exerciseNum",
            Limit: 1,
            ScanIndexForward: false,
            TableName : 'math_exercises'
        };
        console.log("sending req: ", params);
        return self.auth_handler.sendAwsRequest(db.query(params), function(data) { 
            console.log("getLastEx retry", data);
        });
    }, function(err){
        console.log("FAIL identity, "+err);
    });
}

MathView.prototype.saveMathExercise = function(exerciseData, lastExNum, exId) {
    var self = this;
    console.log("saving math exercise, "+lastExNum);
    return this.auth_handler.identity.then(function(identity) {
        console.log("userid "+identity.id);
        var now = new Date();
        var db = new AWS.DynamoDB.DocumentClient();
        var item = {
            TableName: 'math_exercises',
            Item: {
                userId: identity.id,
                exerciseNum: lastExNum,
                exerciseId: exId,
                created: new Date().toJSON(),
                data: exerciseData,
                solutionData: []
            }
        };
        return self.auth_handler.sendAwsRequest(db.put(item), function() {
            console.log("cb fn called"+err);
            return self.saveMathExercise(exerciseData);
        })
    }, function(err){
        console.log("FAIL, "+err);
    });
};
