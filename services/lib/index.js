var http = require('http');
var AWS = require('aws-sdk');

AWS.config_region = 'europe-central-1';

var config = {
    dynamoTableName: 'learnjs'
};

exports.dynamodb = new AWS.DynamoDB.DocumentClient();

function reduceItems(memo, items){
    items.forEach(function(item) {
        memo[item.answer] = (memo[item.answer] || 0) + 1;
    });
    return memo;
}

function byCount(e1, e2) {
    return e2[0] - e1[0];
}

function filterItems(items) {
    var values = [];
    for(var i in items) {
        values.push([items[i], i]);
    }
    var topFive = {};
    values.sort(byCount).slice(0, 5).forEach(function(e) {
        topFive[e[1]] = e[0];
    });
    return topFive;
}

exports.popularAnswers = function(json, context) {
    exports.dynamodb.scan({
        FilterExpression: "problemId = :problemId",
        ExpressionAttributeValues: { 
            ":problemId": json.problemNumber
        },
        TableName: config.dynamoTableName
    }, function(err, data) {
        if(err) {
            context.fail(err);
        } else {
            context.succeed(filterItems(reduceItems({}, data.Items)));
        }
    });
};

exports.echo = function(json, context) {  
  context.succeed(["Hello from the cloud! You sent " + JSON.stringify(json)]);
};

exports.saveExerciseSolution = function(json, context) {
    var snsdata = JSON.parse(json.Records[0].Sns.Message);
    var key = {
        exerciseId: snsdata.exerciseId
    };
    var solutionData = exports.dynamodb.get({
        TableName: 'exercise_results',
        Key: key
    }, gotExistingSolution);

    function gotExistingSolution(err, solutionData) {
        if(err) {
            console.log("error getting data, exerciseId="+snsdata.exerciseId);
            console.log(err);
        } else {
            var currDate = new Date();
            var itemDate = new Date(currDate.getTime()+3600000).toJSON();
            var newItem;
            if(solutionData.Item) {
                newItem = solutionData.Item;
            } else {
                newItem = { 
                    userId: snsdata.userId,
                    exerciseId: snsdata.exerciseId,
                    solution: []
                };
            }
            newItem.solution.push({data: snsdata.solution, created: itemDate});
            console.log(newItem);
            exports.dynamodb.put({
                TableName: 'exercise_results',
                Item: newItem
            }, function(err, data) {
                if(err) {
                    context.fail(err, data);
                } else {
                    context.succeed("done");
                }
            });
        }
    }
};
