var MathExercise = require('./math_exercise');
var uuid = require('uuid');

var AWS = require('aws-sdk');
var MathView = function(lj, ah) {
    this.learnjs = lj;
    this.auth_handler = ah;
    this.generator = new MathExercise();
}
module.exports = MathView;

MathView.prototype.create = function() {
    var self = this;
    var view = this.learnjs.template('math-view');
    var allExercises = [];
    for(var idx=0; idx<10; idx++ ) {
        var obj = this.generator.generate_exercise(10);
        var p = this.learnjs.template('math-problem');
        this.learnjs.applyObject1(this.generator.toObject(obj), p);
        view.find('.math-panel-1').append(p);
        allExercises.push(obj);
    }

    for(var idx=0; idx<10; idx++ ) {
        var obj = this.generator.generate_exercise(10);
        var p = this.learnjs.template('math-problem');
        this.learnjs.applyObject1(this.generator.toObject(obj), p);
        view.find('.math-panel-2').append(p);
        allExercises.push(obj);
    }
    var idx = 0;
    view.find('input').each(function(it, elem){
        $(elem).attr('data-index', idx);
        idx = idx + 1;
    });
    console.log(allExercises);

    this.getLastExerciseNum().
        then(function(last_ex_id) {
            console.log("getLastExId returned: ", last_ex_id);
            var nextid = 0;
            if(last_ex_id.Count>0) {
                nextid = last_ex_id.Items[last_ex_id.Count-1].exerciseNum+1;
            } 
            console.log("nextid="+nextid);
            self.saveMathExercise(allExercises, nextid)
                .then( function() {
                    console.log("saveMathExercise done ");
                },function(err){
                    console.log("saveMathExercise err, ", err);
                });
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
        self.sendSolutionToTopic("hithere").then(function() {
            console.log("sns done");
        }, function(err) {
            console.log("sns fail", err);
        });
    });
    return view; 
}

MathView.prototype.sendSolutionToTopic = function(data) {
    console.log("sending to topic");
    var self = this;
    var sns = new AWS.SNS();
    return this.auth_handler.identity.then(function(identity) {
        var msg = "hithere";//{created: new Date().toJSON(), solution: data};
        var params = {
            Message: JSON.stringify({default: msg}),
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

MathView.prototype.saveMathExercise = function(exerciseData, last_ex_id) {
    var self = this;
    var exId = uuid.v4();
    console.log("saving math exercise, "+last_ex_id);
    return this.auth_handler.identity.then(function(identity) {
        console.log("userid "+identity.id);
        var now = new Date();
        var db = new AWS.DynamoDB.DocumentClient();
        var item = {
            TableName: 'math_exercises',
            Item: {
                userId: identity.id,
                exerciseNum: last_ex_id,
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
