describe('LearnJS', function() {
    it('can show a problem view', function() {
        learnjs.showView("#problem-1");
        expect($('.view-container .problem-view').length).toEqual(1);
    });
    
    it('shows a landing page when there is no hash', function() {
        learnjs.showView('');
        expect($('.view-container .landing-view').length).toEqual(1);
    });
    
    it('passes the view parameter to the viewFn', function() {
        spyOn(learnjs, 'problemView');
        learnjs.showView("#problem-42");
        expect(learnjs.problemView).toHaveBeenCalledWith('42');
    });
    
    it('invokes the router when the page is loaded', function() {
        spyOn(learnjs, 'showView');
        learnjs.appOnReady();
        expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
    });
    
    it('subscribes to the hash change event', function() {
      learnjs.appOnReady();
      spyOn(learnjs, 'showView');
      $(window).trigger('hashchange');
      expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
    });

    describe('problemView', function() {
        var view;
        beforeEach(function() { 
            view = learnjs.problemView("1"); 
        });
        
        it('has a title that shows the problem number', function() {
            expect(view.find(".title").text().trim()).toEqual('Problem #1');
        });

        describe('answer section', function() {
          it('can check a correct answer by hitting a button', function() {
            view.find('.answer').val('true');
            view.find('.check-btn').click();
            expect(view.find('.result').text().trim()).toEqual('Correct! Next problem');
          });

          it('rejects an incorrect answer', function() {
            view.find('.answer').val('false');
            view.find('.check-btn').click();
            expect(view.find('.result').text().trim()).toEqual('Incorrect!');
          });
        });

    });
    
    
});
