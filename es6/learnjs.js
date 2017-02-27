var uuid = require('uuid');

var AWS = require('aws-sdk');
//var auth_handler = require('./auth_handler');
var MathView = require('./math_view');

var LearnJS = function(ah) {
    this.auth_handler = ah;
    this.math_view = new MathView(this, ah);
};
module.exports = LearnJS;

LearnJS.prototype.appOnReady = function() {
    var self = this;
    console.log("apponready called");
    window.onhashchange = function() {
        self.showView(window.location.hash);        
    }
    this.showView(window.location.hash);
    this.auth_handler.on('signin', function(identity) {
        console.log('signon emitted');
        self.showProfileLink(identity);
        $('.profile-view .email').text(identity.email);
    });
    this.auth_handler.on('signout', function(identity) {
        console.log('signoff emitted');
        self.hideProfileLink(identity);
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


LearnJS.prototype.wordView = function() {
    return this.template('word-view');
}

LearnJS.prototype.landingView = function() {
    return this.template('landing-view');
}


LearnJS.prototype.profileView = function() {
    var self = this;
    var view = this.template('profile-view');
    $(view).find('.logout-link').on('click', function() {
        self.auth_handler.logout();
    });
    return view;
}

LearnJS.prototype.showView = function(hash) {
    var self = this;
    var routes = {
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

LearnJS.prototype.showProfileLink = function(profile) {
    var profileLink = $('.signin-bar .profile-link');
    console.log(profileLink);
    if(!profileLink.length) {
        profileLink = this.template('profile-link');
        $('.signin-bar').prepend(profileLink);
    }
    $('.signin-bar .profile-link a').text(profile.email);
    $('.signin-button').addClass('hidden');
    $('.profile-link').removeClass('hidden');
};

LearnJS.prototype.hideProfileLink = function(profile) {
     $('.signin-bar .profile-link').addClass('hidden'); 
     $('.signin-bar .signin-button').removeClass('hidden'); 
}

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

