(function($){
	
	$.idleTimeout = function(options, callback){
		
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
			
			// callback to fire when the session is resumed (by clicking the resume link)
			onTimeout: function(){
				window.location = "timeout.htm";
			}
		}, options);
		
		
		var IdleTimeout = {
			init: function(){
				var self = this;
				
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
					$bar = $("#idletimeout"),
					$countdown = $bar.find("span"),
					timer,
					counter = options.warningLength;
				
				$bar.slideDown();
				
				// set inital value in the countdown placeholder
				$countdown.html( counter );
	
				// show the warning bar
				$bar.slideDown();
	
				// create a timer that runs every second
				timer = setInterval(function(){
					counter -= 1;
					
					if(counter === 0){
						options.onTimeout();
						clearInterval(timer);
					} else {
						$countdown.html( counter );
					};
					
				}, 1000);
				
				// if the continue link is clicked..
				$bar.find("a").click(function(e){
					e.preventDefault();
					
					clearInterval(timer); // stop the countdown
					$bar.slideUp(); // hide the warning bar
					self.countdownOpen = false; // stop countdown
					self._startTimer(); // start up the timer again
				});
			},
			
			_startTimer: function(){
				var self = this;
				
				this.timer = setInterval(function(){
					self._keepAlive();
				}, options.interval * 1000);
			},
				
			_stopTimer: function(){
				
				// reset the failed requests counter
				this.failedRequests = options.failedRequests;
				
				// stop the timer
				clearInterval(this.timer);
			},
			
			// fires if the keepalive request failed
			_failed: function(){
				this.failedRequests--;
			},
			
			_keepAlive: function(){
				var self = this;
				
				// if too many requests failed, abort
				if(!this.failedRequests){
					this._stopTimer();
					return;
				}
				
				$.ajax({
					timeout: 250,
					url: options.keepAliveURL,
					error: function(){
						self._failed();
					},
					success: function(response){
					
						// the response from the server must equal OK
						if($.trim(response) !== options.serverResponseEquals){
							self._failed();
						}
					}
				});
			}
		}
		
		// run this thang
		IdleTimeout.init();
 	}
	
})(jQuery);
