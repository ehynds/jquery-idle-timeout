(function($){
	
	$.idleTimeout = function(options){
		
		options = $.extend({
		
			// number of seconds after user is idle to show the warning
			warningLength: 30,
			
			// url to call to keep the session alive while the user is active
			keepAliveURL: "",
			
			// the response from keepAliveURL must equal this text:
			serverResponseEquals: "OK",
			
			// user is considered idle after this many seconds.  10 minutes default
			idleAfter: 600,
			
			// a polling request will be sent to the server every X seconds
			interval: 60,
			
			// number of failed polling requests until we abort this script
			failedRequests: 5,
			
			// the keepalive AJAX call timeout in MILLISECONDS! 
			AJAXTimeout: 250,
			
			/*
				Callbacks
				"this" refers to the #idletimeout element.
			*/
			
			// callback to fire when the session is resumed (by clicking the resume link)
			onTimeout: function(){
				$(this).slideUp();
				window.location = "timeout.htm";
			},
			
			// fires when the user becomes idle
			onIdle: function(){
				$(this).slideDown(); // show the warning bar
			},
			
			// fires when the user resumes the session
			onResume: function(){
				$(this).slideUp(); // hide the warning bar
			},
			
			// callback to fire when the script is aborted due to too many failed requests
			onAbort: function(){}
			
		}, options);

		
		var IdleTimeout = {
			init: function(){
				var self = this;
				
				// cache elements once the DOM is ready
				$(function(){
					self.elements = {
						warning: $("#idletimeout"),
						resume: $("#idletimeout-resume"),
						countdown: $("#idletimeout-countdown")
					}
				});
				
				this.countdownOpen = false;
				this._startTimer();
				this.failedRequests = options.failedRequests;
				
				// start the idle timer
				$.idleTimer(options.idleAfter * 1000);
				
				// once the user becomes idle
				$(document).bind("idle.idleTimer", function(){
					
					// if the user is idle and a countdown isn't already running
					if( $.data(document, 'idleTimer') === 'idle' && !self.countdownOpen ){
					
						self._stopTimer();
						self.countdownOpen = true;
						
						// call the idle callback
						self._idle();
					}
				});
			},
			
			_idle: function(){
				var self = this, 
					warning = this.elements.warning[0],
					timer, counter = options.warningLength;
				
				// fire the onIdle function
				options.onIdle.call( warning );
				
				// set inital value in the countdown placeholder
				this.elements.countdown.html( counter );
				
				// create a timer that runs every second
				timer = window.setInterval(function(){
					counter -= 1;
					
					if(counter === 0){
						options.onTimeout.call();
						window.clearInterval(timer);
					} else {
						self.elements.countdown.html( counter );
					}
					
				}, 1000);
				
				// if the continue link is clicked..
				this.elements.resume.bind("click", function(e){
					e.preventDefault();
					
					window.clearInterval(timer); // stop the countdown
					self.countdownOpen = false; // stop countdown
					self._startTimer(); // start up the timer again
					options.onResume.call( warning ); // call the resume callback
				});
			},
			
			_startTimer: function(){
				var self = this;
				
				this.timer = window.setInterval(function(){
					self._keepAlive();
				}, options.interval * 1000);
			},
				
			_stopTimer: function(){
				
				// reset the failed requests counter
				this.failedRequests = options.failedRequests;
				
				// stop the timer
				window.clearInterval(this.timer);
			},
			
			_keepAlive: function(){
				var self = this;
				
				// if too many requests failed, abort
				if(!this.failedRequests){
					this._stopTimer();
					options.onAbort.call( this.elements.warning[0] );
					return;
				}
				
				$.ajax({
					timeout: options.AJAXTimeout,
					url: options.keepAliveURL,
					error: function(){
						self.failedRequests--;
					},
					success: function(response){
					
						// the response from the server must equal OK
						if($.trim(response) !== options.serverResponseEquals){
							self.failedRequests--;
						}
					}
				});
			}
		};
		
		// run this thang
		IdleTimeout.init();
	};
	
})(jQuery);
