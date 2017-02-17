var uuid = require('uuid');

var AWS = require('aws-sdk');
//var auth_handler = require('./auth_handler');
var MathView = require('./math_view');

var LearnJS = function(ah) {
    this.auth_handler = ah;
    this.math_view = new MathView(this, ah);
    this.problems = [
        {
            description: "What is truth?",
            code: "function problem() { return __; }",
            answer: "true"
        },
        {
            description: "Simple Math",
            code: "function problem() { return 42 === 6 * __; }",
            answer: "7"
        },
        {
            description: "Q1",
            code: "function problem() { return _; }",
            answer: "ans1"
        }

    ];

};
module.exports = LearnJS;

LearnJS.prototype.appOnReady = function() {
    var self = this;
    console.log("apponready called");
    window.onhashchange = function() {
        self.showView(window.location.hash);        
    }
    this.showView(window.location.hash);
    this.auth_handler.identity.done(function(identity) {
        self.addProfileLink(identity);
    });
    
    $("#imgInp").change(function(){
        console.log("onchange");
        self.readURL(this);
    });
    $("input.num-input").on('keypress', function(event) {
        if(event.charCode===13) {
            event.preventDefault();
            var inp = event.target;
            var idx = Number($(inp).attr('data-index'));
            $('input[data-index='+(idx+1)+']').focus();
        } else {
            return event.charCode >= 48 && event.charCode <= 57;
        }
    })
}

LearnJS.prototype.template = function(name) {
    return $('.templates .'+name).clone();
}

LearnJS.prototype.applyObject = function(obj, elem) {
    for(var key in obj) {
        elem.find('[data-name="'+key+'"]').text(obj[key]);
    }
}

LearnJS.prototype.applyObject1 = function(obj, elem) {
    for(var key in obj) {
        if(obj[key] !== null) {
            if(key.startsWith('mp_var')){
                elem.find('[data-name="'+key+'"]').attr('data-result', obj[key]);
            } else {
                elem.find('[data-name="'+key+'"]').text(obj[key]);
            }
        } else {
            elem.find('[data-name="'+key+'"]').remove();

        }
    }
}

LearnJS.prototype.flashElement = function(elem, content) {
    elem.fadeOut('fast', function() {
        elem.html(content);
        elem.fadeIn();
    });
}

LearnJS.prototype.buildCorrectFlash = function (problemNum) {
    var correctFlash = this.template('correct-flash');
    var link = correctFlash.find('a');
    if (problemNum < this.problems.length) {
        link.attr('href', '#problem-' + (problemNum + 1));
    } else {
        link.attr('href', '');
        link.text("You're Finished!");
    }
    return correctFlash;
}

LearnJS.prototype.triggerEvent = function(name, args) {
    console.log("triggerevent called, "+name);
    $(".view-container>*").trigger(name, args);
}

LearnJS.prototype.popularAnswers = function(problemId) {
    var self = this;
    return this.auth_handler.identity.then(function() {
        var lambda = new AWS.Lambda();
        var params = {
            FunctionName: "learnjs_popularAnswers",
            Payload: JSON.stringify({problemNumber: problemId})
        };
        return self.auth_handler.sendAwsRequest(lambda.invoke(params), function() {
            return self.popularAnswers(problemId);
        });
    });
}
    
LearnJS.prototype.problemView = function(data) {
    var self = this;
    var problemNumber = parseInt(data, 10);
    var view = this.template('problem-view');
    var problemData = this.problems[problemNumber - 1];
    var resultFlash = view.find('.result');
    var answer = view.find('.answer');

    function checkAnswer() {
        // var test = problemData.code.replace('__', answer) + '; problem();';
        // return eval(test);
        return problemData.answer.trim()===answer.val();
    }

    function checkAnswerClick() {
        if (checkAnswer()) {
            var flashContent = self.buildCorrectFlash(problemNumber);
            self.flashElement(resultFlash, flashContent);
            self.saveAnswer(problemNumber, answer.val());
        } else {
            self.flashElement(resultFlash, 'Incorrect!');
        }
        return false;
    }

    console.log("problemview");
    if (problemNumber < this.problems.length) {
        console.log("notlast");
        var buttonItem = this.template('skip-btn');
        buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));
        $('.nav-list').append(buttonItem);
        view.bind('removingView', function() {
            console.log('removingView evt, this='+this);
            buttonItem.remove();
        });
    }

    this.fetchAnswer(problemNumber).then(function(data) {
        if(data.Item) {
            answer.val(data.Item.answer);
        }
    });

    view.find('.check-btn').click(checkAnswerClick);
    view.find('.title').text('Problem #' + problemNumber);
    this.applyObject(problemData, view);

    return view;
}

LearnJS.prototype.wordView = function() {
    return this.template('word-view');
}

LearnJS.prototype.landingView = function() {
    return this.template('landing-view');
}


LearnJS.prototype.profileView = function() {
    var view = this.template('profile-view');
    this.auth_handler.identity.done( function(identity) {
        view.find('.email').text(identity.email);
    });
    return view;
}

LearnJS.prototype.showView = function(hash) {
    var self = this;
    var routes = {
        '#problem': this.problemView.bind(this),
        '#profile': this.profileView.bind(this),
        '#words': this.wordView.bind(this),
        '#math': this.math_view.create.bind(this.math_view),
        '#':  this.landingView.bind(this),
        '':  this.landingView.bind(this)
    };
    var inits = {
        '#math': function() {
            $('input[data-index=0]').focus();
        }
    }
    var hashParts = hash.split('-');
    var viewFn = routes[hashParts[0]];
    this.triggerEvent('removingView', []);
    if(viewFn) {
        $('.view-container').empty().append(viewFn(hashParts[1]));
        if(inits[hashParts[0]]){
            inits[hashParts[0]]();
        }
    } else {
        console.log("unknown route: "+hashParts[0]);
        console.log("routes: "+Object.keys(routes));
    }
}

LearnJS.prototype.addProfileLink = function(profile) {
    var link = this.template('profile-link');
    link.find('a').text(profile.email);
    $('.signin-bar').prepend(link);
    $('.signin-button').addClass('hidden');
};

LearnJS.prototype.readURL = function(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.blah:first').attr('src', e.target.result);
            window.imgresult = e.target.result;
            
        }
        reader.readAsDataURL(input.files[0]);
    }
}

LearnJS.prototype.saveData = function(name, data) {
    var self = this;
    return this.auth_handler.identity.then(function(identity) {
        var s3 = new AWS.S3({region: self.region});
        var bucket = "item.data";
        var params = {
            Body: data,
            Bucket: bucket,
            Key: uuid.v4(),
            ACL: 'public-read',
            ContentLength: data.length(),
            ContentEncoding: 'base64'
        }
    })
}

LearnJS.prototype.saveAnswer = function(problemId, answer) {
    var self = this;
    return this.auth_handler.identity.then(function(identity) {
        var db = new AWS.DynamoDB.DocumentClient();
        var item = {
            TableName: 'learnjs',
            Item: {
                userId: identity.id,
                problemId: problemId,
                answer: answer
            }
        };
        return self.auth_handler.sendAwsRequest(db.put(item), function() {
            return self.saveAnswer(problemId, answer);
        })
    });
};

LearnJS.prototype.fetchAnswer = function(problemId) {
    var self = this;
    return this.auth_handler.identity.then(function(identity) {
        var db = new AWS.DynamoDB.DocumentClient();
        var item = {
            TableName: 'learnjs',
            Key: {
                userId: identity.id,
                problemId: problemId
            }
        };
        return self.auth_handler.sendAwsRequest(db.get(item), function() {
            return self.fetchAnswer(problemId);
        })
    });
};

