$(function(){
	
	var $bar = $("#idletimeout"), // id of the warning div
		$countdown = $bar.find('span'), // span tag that will hold the countdown value
		redirectAfter = 30, // number of seconds to wait before redirecting the user
		redirectTo = 'timeout.htm', // URL to relocate the user to once they have timed out
		keepAliveURL = 'keepalive.php', // URL to call to keep the session alive, if the link in the warning bar is clicked
		expiredMessage = 'Your session has expired.  You are being logged out for security reasons.', // message to show user when the countdown reaches 0
		running = false, // var to check if the countdown is running
		timer; // reference to the setInterval timer so it can be stopped
	 
	// start the idle timer.  the user will be considered idle after 2 seconds (2000 ms)
	$.idleTimer(2000);
	
	// bind to idleTimer's idle.idleTimer event
	$(document).bind("idle.idleTimer", function(){
		
		// if the user is idle and a countdown isn't already running
		if( $.data(document,'idleTimer') === 'idle' && !running ){
			var counter = redirectAfter;
			running = true;
		
			// set inital value in the countdown placeholder
			$countdown.html( redirectAfter );
			
			// show the warning bar
			$bar.slideDown();
			
			// create a timer that runs every second
			timer = setInterval(function(){
				counter -= 1;
				
				// if the counter is 0, redirect the user
				if(counter === 0){
					$bar.html( expiredMessage );
					window.location.href = redirectTo;
				} else {
					$countdown.html( counter );
				};
			}, 1000);
		};
	});
	
	// if the continue link is clicked..
	$("a", $bar).click(function(){
		
		// stop the timer
		clearInterval(timer);
		
		// stop countdown
		running = false;
		
		// hide the warning bar
		$bar.slideUp();
		
		// ajax call to keep the server-side session alive
		$.get( keepAliveURL );
		
		return false;
	});
});
