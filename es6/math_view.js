var MathExercise = require('./math_exercise');
var uuid = require('uuid');

var MathView = function(lj, ah) {
    this.learnjs = lj;
    this.auth_handler = ah;
    this.generator = new MathExercise();
}
module.exports = MathView;

MathView.prototype.create = function() {
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
        this.saveMathExercise(allExercises)
            .then( function() {
                console.log("saveMathExercise done ");
            },function(err){
                console.log("saveMathExercise err, ", err);
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
        });
        return view; 
}

MathView.prototype.saveMathExercise = function(exerciseData) {
    var self = this;
    var exId = uuid.v4();
    console.log("saving math exercise, "+exId);
    return this.auth_handler.identity.then(function(identity) {
        console.log("gen exid "+identity.id);
        console.log("saving: "+exId);
        var data = {
            exerciseData: exerciseData,
            created: new Date()
        }
        var db = new AWS.DynamoDB.DocumentClient();
        var item = {
            TableName: 'math_exercises',
            Item: {
                userId: identity.id,
                exerciseId: 1,
                data: data,
                solutionData: []
            }
        };
        return self.auth_handler.sendAwsRequest(db.put(item), function(err) {
            console.log("cb fn called"+err);
            return self.saveMathExercise(exerciseData);
        })
    }, function(err){
        console.log("FAIL, "+err);
    });
};
