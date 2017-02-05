var uuid = require('uuid');

var generator = require('./math_exercise');

var learnjs = {
    poolId: 'eu-central-1:f628cc78-2e40-4d11-82a2-696f8a5b5e30',
    region: 'eu-central-1'
};

learnjs.identity = new $.Deferred();

learnjs.problems = [
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

learnjs.template = function(name) {
    return $('.templates .'+name).clone();
}

learnjs.applyObject = function(obj, elem) {
    for(var key in obj) {
        elem.find('[data-name="'+key+'"]').text(obj[key]);
    }
}

learnjs.applyObject1 = function(obj, elem) {
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

learnjs.flashElement = function(elem, content) {
  elem.fadeOut('fast', function() {
    elem.html(content);
    elem.fadeIn();
  });
}

learnjs.buildCorrectFlash = function (problemNum) {
  var correctFlash = learnjs.template('correct-flash');
  var link = correctFlash.find('a');
  if (problemNum < learnjs.problems.length) {
    link.attr('href', '#problem-' + (problemNum + 1));
  } else {
    link.attr('href', '');
    link.text("You're Finished!");
  }
  return correctFlash;
}

learnjs.triggerEvent = function(name, args) {
    console.log("triggerevent called, "+name);
    $(".view-container>*").trigger(name, args);
}

learnjs.popularAnswers = function(problemId) {
    return learnjs.identity.then(function() {
        var lambda = new AWS.Lambda();
        var params = {
            FunctionName: "learnjs_popularAnswers",
            Payload: JSON.stringify({problemNumber: problemId})
        };
        return learnjs.sendAwsRequest(lambda.invoke(params), function() {
            return learnjs.popularAnswers(problemId);
        });
    });
}
    
learnjs.problemView = function(data) {
  var problemNumber = parseInt(data, 10);
  var view = learnjs.template('problem-view');
  var problemData = learnjs.problems[problemNumber - 1];
  var resultFlash = view.find('.result');
  var answer = view.find('.answer');
    
  function checkAnswer() {
    // var test = problemData.code.replace('__', answer) + '; problem();';
    // return eval(test);
    return problemData.answer.trim()===answer.val();
  }

  function checkAnswerClick() {
    if (checkAnswer()) {
      var flashContent = learnjs.buildCorrectFlash(problemNumber);
      learnjs.flashElement(resultFlash, flashContent);
      learnjs.saveAnswer(problemNumber, answer.val());
    } else {
      learnjs.flashElement(resultFlash, 'Incorrect!');
    }
    return false;
  }

  console.log("problemview");
  if (problemNumber < learnjs.problems.length) {
    console.log("notlast");
    var buttonItem = learnjs.template('skip-btn');
    buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));
    $('.nav-list').append(buttonItem);
    view.bind('removingView', function() {
        console.log('removingView evt, this='+this);
      buttonItem.remove();
    });
  }

  learnjs.fetchAnswer(problemNumber).then(function(data) {
      if(data.Item) {
          answer.val(data.Item.answer);
      }
  });
  
  view.find('.check-btn').click(checkAnswerClick);
  view.find('.title').text('Problem #' + problemNumber);
  learnjs.applyObject(problemData, view);

  return view;
}

learnjs.wordView = function() {
    return learnjs.template('word-view');
}

learnjs.landingView = function() {
    return learnjs.template('landing-view');
}

learnjs.mathView = function() {
    var view = learnjs.template('math-view');
    var ex = generator.generate_exercise();
    for(var idx in ex ) {
        var obj = ex[idx];
        var p = learnjs.template('math-problem');
        learnjs.applyObject1(obj, p);
        view.find('.math-panel-1').append(p);
    }

    var ex2 = generator.generate_exercise();
    for(var idx in ex2 ) {
        var obj = ex2[idx];
        p = learnjs.template('math-problem');
        learnjs.applyObject1(obj, p);
        view.find('.math-panel-2').append(p);
    }
    var idx = 0;
    view.find('input').each(function(it, elem){
        console.log(elem);
        console.log("index="+idx);
        $(elem).attr('data-index', idx);
        idx = idx + 1;
    })    
    learnjs.saveMathExercise(ex.concat(ex2))
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
            console.log(inp.val()===inp.attr('data-result'));

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

learnjs.profileView = function() {
    var view = learnjs.template('profile-view');
    learnjs.identity.done( function(identity) {
        view.find('.email').text(identity.email);
    });
    return view;
}

learnjs.showView = function(hash) {
    var routes = {
        '#problem': learnjs.problemView,
        '#profile': learnjs.profileView,
        '#words': learnjs.wordView,
        '#math': learnjs.mathView,
        '#':  learnjs.landingView,
        '':  learnjs.landingView
    };
    var hashParts = hash.split('-');
    var viewFn = routes[hashParts[0]];
    learnjs.triggerEvent('removingView', []);
    if(viewFn) {
         console.log("applying route: "+hashParts[0]);
        $('.view-container').empty().append(viewFn(hashParts[1]));
    } else {
        console.log("unknown route: "+hashParts[0]);
        console.log("routes: "+Object.keys(routes));
    }
}

learnjs.addProfileLink = function(profile) {
    var link = learnjs.template('profile-link');
    link.find('a').text(profile.email);
    $('.signin-bar').prepend(link);
};

learnjs.readURL = function(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.blah:first').attr('src', e.target.result);
            window.imgresult = e.target.result;
            
        }
        reader.readAsDataURL(input.files[0]);
    }
}

learnjs.googleSignIn = function(googleUser) {
    console.log("google authresp:");
    var resp = googleUser.getAuthResponse();
    console.log(resp);
    var id_token = resp.id_token;
    AWS.config.update({
        region: 'eu-central-1',
        credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: learnjs.poolId,
        Logins: {
            'accounts.google.com': id_token
            }
        })
    });
    function refresh() {
      return gapi.auth2.getAuthInstance().signIn({
          prompt: 'login'
        }).then(function(userUpdate) {
        var creds = AWS.config.credentials;
        var newToken = userUpdate.getAuthResponse().id_token;
        creds.params.Logins['accounts.google.com'] = newToken;
        return learnjs.awsRefresh();
      });
    }
    learnjs.awsRefresh().then(function(id) {
      learnjs.identity.resolve({
        id: id,
        email: googleUser.getBasicProfile().getEmail(),
        refresh: refresh
      });
    });
}

learnjs.testfn = function() {
    console.log("testfn called");
}
learnjs.appOnReady = function() {
    console.log("apponready called");
    window.googleSignIn = learnjs.googleSignIn;
    window.onhashchange = function() {
        learnjs.showView(window.location.hash);        
    }
    learnjs.showView(window.location.hash);
    learnjs.identity.done(learnjs.addProfileLink);
    
    $("#imgInp").change(function(){
        console.log("onchange");
        learnjs.readURL(this);
    });
    $("input.num-input").on('keypress', function(event) {
        if(event.charCode===13) {
            event.preventDefault();
            var inp = event.target;
            var idx = Number($(inp).attr('data-index'));
            console.log("pressed: "+idx);
            console.log($('input[data-index='+(idx+1)+']'));
            $('input[data-index='+(idx+1)+']').focus();
        } else {
            return event.charCode >= 48 && event.charCode <= 57;
        }
    })
};

learnjs.awsRefresh = function() {
  var deferred = new $.Deferred();
  AWS.config.credentials.refresh(function(err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(AWS.config.credentials.identityId);
    }
  });
  return deferred.promise();
}


learnjs.sendAwsRequest = function(req, retry) {
    var promise = $.Deferred();
    req.on('error', function(error) {
        if(error.code === 'CredentialsError') {
            learnjs.identity.then(function(identity) {
                return identity.refresh().then(function() {
                    return retry();
                }, function() {
                    promise.reject(resp);
                });
            });
        } else {
            promise.reject(error);
        }
    });
    req.on('success', function(resp) {
        promise.resolve(resp.data);
    });
    req.send();
    return promise;
};

learnjs.saveData = function(name, data) {
    return learnjs.identity.then(function(identity) {
        var s3 = new AWS.S3({region: learnjs.region});
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

learnjs.saveMathExercise = function(exerciseData) {
    var exId = uuid.v4();
    console.log("saving math exercise, "+exId);
    return learnjs.identity.then(function(identity) {
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
        return learnjs.sendAwsRequest(db.put(item), function(err) {
            console.log("cb fn called"+err);
            return learnjs.saveMathExercise(exerciseData);
        })
    }, function(err){
        console.log("FAIL, "+err);
    });
};

learnjs.saveAnswer = function(problemId, answer) {
    return learnjs.identity.then(function(identity) {
        var db = new AWS.DynamoDB.DocumentClient();
        var item = {
            TableName: 'learnjs',
            Item: {
                userId: identity.id,
                problemId: problemId,
                answer: answer
            }
        };
        return learnjs.sendAwsRequest(db.put(item), function() {
            return learnjs.saveAnswer(problemId, answer);
        })
    });
};

learnjs.fetchAnswer = function(problemId) {
    return learnjs.identity.then(function(identity) {
        var db = new AWS.DynamoDB.DocumentClient();
        var item = {
            TableName: 'learnjs',
            Key: {
                userId: identity.id,
                problemId: problemId
            }
        };
        return learnjs.sendAwsRequest(db.get(item), function() {
            return learnjs.fetchAnswer(problemId);
        })
    });
};

module.exports = learnjs;
