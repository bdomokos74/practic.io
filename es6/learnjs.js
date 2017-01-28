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
        console.log("applying key: "+key);
        if(obj[key] !== null) {
            console.log('notnullkey='+key);
            if(key.startsWith('mp_var')){
                console.log("var found!"+key);
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

learnjs.getRandomIntInclusive = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
learnjs.getRandomBool = function() {
    return Math.random()>0.5;
}

learnjs.gen_exercise = function() {
    var res = [];
    for(var i = 0; i<10; i++) {
        var a = learnjs.getRandomIntInclusive(1, 9);
        var b = learnjs.getRandomIntInclusive(1, 9);
        var c;
        var op_str;
        if( a>b) {
            op_str = '-';
            c = a -b;
        } else {
            op_str = '+';
            c = b-a;
        }
        var side = learnjs.getRandomBool();

        var obj = {
            mp_num1: null,
            mp_var1: null,
            mp_op1 : null,
            mp_num2: null,
            mp_var2: null,
            mp_num3: null,
            mp_var3: null,
            mp_op2 : null,
            mp_num4: null,
            mp_var4: null
        }
        var n1, n2, n3;
        if(side) { //left
            obj['mp_op1'] = op_str;
            if(op_str==='-') {
                n1 = a;
                n2 = b;
                n3 = c;
            } else {
                n1 = c;
                n2 = a;
                n3 = b;
            }
            var nvar = learnjs.getRandomIntInclusive(1, 3);
            if(nvar===1) {
                obj['mp_var1'] = n1;
                obj['mp_num2'] = n2;
                obj['mp_num3'] = n3;
            } else if(nvar===2) {
                obj['mp_num1'] = n1;
                obj['mp_var2'] = n2;
                obj['mp_num3'] = n3;
            } else if(nvar===3) {
                obj['mp_num1'] = n1;
                obj['mp_num2'] = n2;
                obj['mp_var3'] = n3;
            }
        } else {
            obj['mp_op2'] = op_str;
            if(op_str==='-') {
                n1 = c;
                n2 = a;
                n3 = b;
            } else {
                n1 = b;
                n2 = a;
                n3 = c;
            }
            var nvar = learnjs.getRandomIntInclusive(1, 3);
            if(nvar===1) {
                obj['mp_var2'] = n1;
                obj['mp_num3'] = n2;
                obj['mp_num4'] = n3;
            } else if(nvar===2) {
                obj['mp_num2'] = n1;
                obj['mp_var3'] = n2;
                obj['mp_num4'] = n3;
            } else if(nvar===3) {
                obj['mp_num2'] = n1;
                obj['mp_num3'] = n2;
                obj['mp_var4'] = n3;
            }
        }
        res.push(obj);
    }
    return res;
}

learnjs.mathView = function() {
    var view = learnjs.template('math-view');
    var ex = learnjs.gen_exercise();
    console.log(ex);
    for(var idx in ex ) {
        var obj = ex[idx];
        var p = learnjs.template('math-problem');
        learnjs.applyObject1(obj, p);
        view.find('.math-panel-1').append(p);
    }

    ex = learnjs.gen_exercise();
    for(var idx in ex ) {
        var obj = ex[idx];
        p = learnjs.template('math-problem');
        learnjs.applyObject1(obj, p);
        view.find('.math-panel-2').append(p);
    }
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


learnjs.appOnReady = function() {
    window.onhashchange = function() {
        learnjs.showView(window.location.hash);        
    }
    learnjs.showView(window.location.hash);
    learnjs.identity.done(learnjs.addProfileLink);
    
    $("#imgInp").change(function(){
        console.log("onchange");
        learnjs.readURL(this);
    });

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
