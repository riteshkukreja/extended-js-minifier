<?php
	header('Access-Control-Allow-Origin: *');  

	if(isset($_POST['content']))
		$content = $_POST['content'];
	else exit("No Data Found!");

	// setup the URL, the JavaScript and the form data
	$url = 'https://javascript-minifier.com/raw';
	$data = array(
	    'input' => $content,
	);
    
	// init the request, set some info, send it and finally close it
	$ch = curl_init($url);
    
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
	$minified = curl_exec($ch);
    
	curl_close($ch);
    
	// output the $minified
	echo $minified;
?>