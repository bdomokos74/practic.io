"use strict";

var learnjs = {};

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

learnjs.problemView = function(data) {
  var problemNumber = parseInt(data, 10);
  var view = learnjs.template('problem-view');
  var problemData = learnjs.problems[problemNumber - 1];
  var resultFlash = view.find('.result');

  function checkAnswer() {
    var answer = view.find('.answer').val();
    // var test = problemData.code.replace('__', answer) + '; problem();';
    // return eval(test);
    return problemData.answer.trim()===answer;
  }

  function checkAnswerClick() {
    if (checkAnswer()) {
      var flashContent = learnjs.buildCorrectFlash(problemNumber);
      learnjs.flashElement(resultFlash, flashContent);
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

  view.find('.check-btn').click(checkAnswerClick);
  view.find('.title').text('Problem #' + problemNumber);
  learnjs.applyObject(problemData, view);
  return view;
}

learnjs.landingView = function() {
    return learnjs.template('landing-view');
}

learnjs.showView = function(hash) {
    var routes = {
        '#problem': learnjs.problemView,
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

learnjs.appOnReady = function() {
    window.onhashchange = function() {
        learnjs.showView(window.location.hash);        
    }
    learnjs.showView(window.location.hash);
};
