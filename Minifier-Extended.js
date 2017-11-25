var emin = function(url, callback) {
	"Use Strict";

	/**
 	 *	@Module: loadedModules
	 *	@Description: An array to hold the loaded modules stored in window object.
	 */
	var loadedModules = [];

	/**
 	 *	@Module: buildHistory
	 *	@Description: A string object to hold the previously created download url blob object.
	 */
	var buildHistory = null;

	/**
 	 *	@Module: MODULES
	 *	@Description: An array to hold the modules stored in the given script distributed by Module type.
	 */
	var MODULES = [];

	/**
 	 *	@Module: extension
	 *	@Description: A string to define the extension of the final minified file.
	 */
	var extension = ".emin.js";

	/**
 	 *	@Module: filename
	 *	@Description: A string to define the name of the final minified file.
	 */
	var filename = "Untitled";

	/**
 	 *	@Module: generatedScript
	 *	@Description: A string to hold the generated script text content.
	 */
	var generatedScript = null;

	/**
 	 *	@Module: scriptText
	 *	@Description: A string to hold the retrived script as text.
	 */
	var scriptText = null;

	/**
 	 *	@Module: originalScript
	 *	@Description: A list of modules stored originally in window object.
	 */
	var originalScript = null;

	/**
 	 *	@Module: DOCUMENT
	 *	@Description: A DOM object to refer to the iframe document object
	 */
	var DOCUMENT = null;

	/**
 	 *	@Module: WINDOW
	 *	@Description: A DOM object to refer to the iframe window object
	 */
	var WINDOW = null;

	/**
 	 *	@Module: loadScript
	 *	@Description: Dynamically load script into a iframe to test the added modules.
	 *	@Dependencies: DOCUMENT, findLoaded, loadScriptText
	 *	@Param name: The url of the script to be minified
	 *	@Param callback: A callback function to be passed to findLoaded method
	 */
	var loadScript = function(name, callback) {
		// Load Script
		var script = DOCUMENT.createElement("script");
		script.onload = function() {
			findLoaded(callback);

			setTimeout(function() {
				DOCUMENT.body.removeChild(script);
			}, 1000);
		}
		script.setAttribute("src", name);
		DOCUMENT.body.appendChild(script);

		loadScriptText(name);
	}

	/**
 	 *	@Module: loadScriptText
	 *	@Description: Create a AJAX request to receive script text
	 *	@Dependencies: scriptText
	 *	@Param url: The url of the script to be minified
	 */
	var loadScriptText = function(url) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				scriptText = this.responseText;
			}
		}
		request.open("GET", url, true);
		request.send()
	}

	/**
 	 *	@Module: findLoaded
	 *	@Description: Identify modules from the loaded script.
	 *	@Dependencies: WINDOW, originalScript, MODULES, buildScripts
	 *	@Param callback: A callback method to be called after the MODULES has been identified.
	 */
	var findLoaded = function(callback) {
		// Match loaded scripts
		var scripts = Object.keys(WINDOW);
		var filteredScript = [];
		
		for(var script of scripts) {
			// Add typeof WINDOW[script] == "function" to remove constants
			if(originalScript.indexOf(script) == -1)
				filteredScript.push(script);
		}

		MODULES = filteredScript;
		buildScripts();

		if(typeof callback == "function")
			callback();
	}

	/**
 	 *	@Module: findOriginal
	 *	@Description: Identify original modules of window object of iframe.
	 *	@Dependencies: WINDOW, originalScript
	 */
	var findOriginal = function() {
		// Populate Original Scripts
		originalScript = Object.keys(WINDOW);
	}

	/**
 	 *	@Module: buildScripts
	 *	@Description: Build a script string containing selected modules. If no module is selected, then all the modules are added.
	 *	@Dependencies: generatedScript, loadedModules, MODULES, WINDOW, 
	 *	@Param progress: A callback method to be called after each module has been added.
	 */
	var buildScripts = function(progress) {
		// Build scripts string using loaded scripts
		// Add to generatedScript
		generatedScript = "";
		var counter = 0;
		if(loadedModules.length == 0) {
			// No Module selected, Add all modules
			for(var module of MODULES) {
				var temp = "";
				if(typeof WINDOW[module] == "function") {
					temp = "var " + WINDOW[module].name + "=" + WINDOW[module].toString() + ";\n";
				} else {
					temp = "var " + module + "=" + JSON.stringify(WINDOW[module]) + ";\n";
				}
				generatedScript += temp;
				counter++;

				if(typeof progress == "function")
					progress(parseInt(counter/MODULES.length * 50));
			}
		} else {
			// Build script with the given modules
			for(var module of loadedModules) {
				var temp = "";
				if(typeof WINDOW[module] == "function") {
					temp = "var " + WINDOW[module].name + "=" + WINDOW[module].toString() + ";\n";
				} else {
					temp = "var " + module + "=" + JSON.stringify(WINDOW[module]) + ";\n";
				}
				generatedScript += temp;
				counter++;

				if(typeof progress == "function")
					progress(parseInt(counter/MODULES.length * 50));
			}
		}
	}

	/**
 	 *	@Module: ajax
	 *	@Description: Send a XMLHttpRequest to send data to a defined URL. This allows minification process.
	 *	@Dependencies: generatedScript
	 *	@Param url: URL string containing the destination.
	 *	@Param data: A data string containing script to be minified.
	 *	@Param callback: A callback method to be called on success with the received data.
	 */
	var ajax = function(url, data, callback) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				generatedScript = this.responseText;
				if(typeof callback == "function")
					callback(this.responseText);
			}
		}
		request.open("POST", url, true);
 		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		request.send("content=" + data)
	}

	/**
 	 *	@Module: minify
	 *	@Description: Send a XMLHttpRequest to send data to a defined URL. This allows minification process.
	 *	@Dependencies: generatedScript, ajax
	 *	@Param text: A data string containing script to be minified.
	 *	@Param progress: A callback method to be called on success to define end of process.
	 */
	var minify = function(text, progress) {
		// Minify the given script
		text = text.replace("\n", "");
		ajax("/request.php", text, function(res) {
			generatedScript = res;
			progress(100);
		});
	}

	/**
 	 *	@Module: buildFile
	 *	@Description: Creates a blob object to store newly created minified file and revoke previously created file.
	 *	@Dependencies: buildHistory
	 *	@Param data: A data string containing minified script.
	 *	@Param filename: The name of final script.
	 *	@Param type: Type/extension of the script
	 */
	var buildFile = function(data, filename, type) {
		// Build a blob file to download
		var file = new Blob([data], {type: type});
		var url = URL.createObjectURL(file);

		// remove previous generated url if exists
		if(buildHistory != null && buildHistory.length != 0)
			window.URL.revokeObjectURL(buildHistory);
		buildHistory = url;

		return url;
	}

	/**
 	 *	@Module: createNewFrame
	 *	@Description: Creates a iframe object to provide a virtual environment for the dynamic script to be loaded.
	 *	@Dependencies: WINDOW, DOCUMENT
	 */
	var createNewFrame = function() {
		var frame = document.createElement("iframe");
		document.body.appendChild(frame);
		frame.style.display = "none";

		var iframe = frame.contentWindow || frame.contentWindow.document;

		WINDOW = iframe.window;
		DOCUMENT = iframe.document;	
	}

	/**
 	 *	@Module: showExtendedOptions
	 *	@Description: Creates a UI to help with the minification process.
	 *	@Dependencies: MODULES, ExtendedOptions, loadedModules, buildScripts, minify, buildFile
	 *	@Param bool: A boolean variable to show or hide the UI.
	 */
	var showExtendedOptions = function(bool) {
		// Show or Hide Extended Options
		var list = [];
		for(var module of MODULES) {
			list.push([module, typeof WINDOW[module]]);
		}

		ExtendedOptions(document.body, list, function(list, progress, success) {
			loadedModules = list;
			buildScripts(progress);
			minify(generatedScript, progress);	
			var url = buildFile(generatedScript, "", "js");
			var name = filename + extension;

			setTimeout(function() {
				if(typeof success == "function")
					success(name, url);
			}, 200);
		});	
	}

	/**
 	 *	@Module: init
	 *	@Description: Initialze the application
	 *	@Dependencies: createNewFrame, findOriginal
	 */
	var init = function() {
		// Initialize constants
		createNewFrame();
		findOriginal();
	}

	/**
 	 *	@Module-Anonymous
	 *	@Description: Initialze the application
	 *	@Dependencies: init
	 */
	init();

	/* ****************************** Display Construtor ********************** */
	
	/**
 	 *	@Module: ExtendedOptions
	 *	@Description: Creates a UI to help with the minification process.
	 *	@Param container: A DOM object to hold the HTML created by the UI.
	 *	@Param modules: A list of modules to be shown to the user.
	 *	@Param callback: A callback method to be called with list of selected modules and two callbacks to show progress and success reports to the user.
	 */
	var ExtendedOptions = function(container, modules, callback) {

		/**
	 	 *	@Module: styleName
		 *	@Description: Dynamic style to be loaded for proper functioning of UI
		 */
		var styleName = "popup.css";

		/**
	 	 *	@Module: buildDiv
		 *	@Description: Creates a empty TYpe element with the classname and text.
		 *	@Param classname: class assigned to DOM element.
		 *	@Param type: Type of DOM element.
		 *	@Param text: Text content of the DOM element.
		 */
		var buildDiv = function(classname, type, text) {
			if(typeof type == "undefined")
				type = "div";
			var container = document.createElement(type);
			container.className = classname;

			if(typeof text == "string")
				container.innerText = text;

			return container;
		}

		/**
	 	 *	@Module: buildSearchInput
		 *	@Description: Creates a input type for search input.
		 */
		var buildSearchInput = function() {
			var input = document.createElement("input");
			input.setAttribute("type", "text");
			input.setAttribute("name", "search");
			input.setAttribute("placeholder", "Search Modules");

			return input;
		}

		/**
	 	 *	@Module: buildButton
		 *	@Description: Creates a empty button element with the given class, id and text.
		 *	@Param classname: class assigned to button element.
		 *	@Param idname: ID assigned to button element.
		 *	@Param text: Text content of the button element.
		 */
		var buildButton = function(classname, idname, text) {
			var button = document.createElement("button");
			button.className = classname;
			button.id = idname;

			if(typeof text == "string")
				button.innerText = text;

			return button;
		}

		/**
	 	 *	@Module: buildHead
		 *	@Description: Dynamically add meta and style tags to the wrapper.
	 	 *	@Dependencies: buildDiv
		 *	@Param wrapper: head tag of the iframe.
		 */
		var buildHead = function(wrapper) {
			// Build META RESPONSIVE tag
			var meta = buildDiv("", "meta");
			meta.setAttribute("name", "viewport");
			meta.setAttribute("content", "width=device-width, initial-scale=1");

			wrapper.appendChild(meta);

			// Build CSS file
			var link = buildDiv("", "link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("type", "text/css");
			link.setAttribute("href", styleName);

			wrapper.appendChild(link);
		}

		/**
	 	 *	@Module: buildBody
		 *	@Description: Create DOM elements to support the UI.
	 	 *	@Dependencies: buildDiv, buildSearchInput, buildButton
		 *	@Param wrapper: body tag of the iframe.
		 */
		var buildBody = function(wrapper) {
			// Build container
			var container = buildDiv("container");
			container.setAttribute("data-loader", "2");

			// Build Sidebar
			container.appendChild(buildDiv("sidebar"));

			// Build Main Content Container
			var main = buildDiv("main");
			var content = buildDiv("content");

			// Build the search bar and add it to content
			var search = buildDiv("search");
			search.appendChild(buildSearchInput());
			search.appendChild(buildDiv("icon", "span"));
			content.appendChild(search);

			// Build the modules and add it to content
			var modules = buildDiv("modules");
			modules.setAttribute("id", "modules_container");
			content.appendChild(modules);

			// Add controls to the container
			var control = buildDiv("control");
			control.appendChild(buildButton("", "compile", "compile"));


			main.appendChild(content);
			main.appendChild(control);

			container.appendChild(main);

			// Build loader
			var loader = buildDiv("loader");
			loader.appendChild(buildDiv("progress_2", "span"));
			container.appendChild(loader);

			// Build download page
			var download = buildDiv("download");
			download.appendChild(buildDiv("download_text", "span", "abc.emin.js"));
			download.appendChild(buildButton("download_btn", "", "Download"));
			download.appendChild(buildDiv("goback", "span", "Go Back"));
			container.appendChild(download);

			// Build close button
			container.appendChild(buildDiv("close"));

			wrapper.appendChild(container);

			// Build start buttons
			var div = buildDiv("emin_popup");
			div.appendChild(buildButton("", "s_min", "Show Minifier"));

			wrapper.appendChild(div);
		}

		/**
	 	 *	@Module: buildWrapper
		 *	@Description: Create iframe elements to hold the entire UI.
	 	 *	@Dependencies: buildHead, buildBody
		 *	@Param con: container DOM object for the iframe object.
		 */
		var buildWrapper = function(con) {
			var frame = document.createElement("iframe");
			//frame.style.width = "60vw";
			//frame.style.height = "80vh";
			con.appendChild(frame);

			var iframe = frame.contentDocument || frame.contentWindow || frame.contentWindow.document;

			buildHead(iframe.head);
			buildBody(iframe.body);

			return iframe;
		}

		/**
	 	 *	@Module: DOCUMENT
		 *	@Description: Create iframe elements to hold the entire UI.
	 	 *	@Dependencies: buildWrapper, container
		 */
		var DOCUMENT = buildWrapper(container);

		/**
	 	 *	@Module: addProgress
		 *	@Description: Show progress to user as a UI element.
		 *	@Param target: A progress bar DOM object to show current progress.
		 *	@Param value: Current progress.
		 */
		var addProgress = function(target, value) {
			target.style.width = value + "%";
		}

		/**
	 	 *	@Module: BuildModule
		 *	@Description: Create a single instance of list item displaying modules.
	 	 *	@Dependencies: DOCUMENT, selectedModules
		 *	@Param name: Name associated with the module.
		 *	@Param type: Type associated with the module. (Method | Constant)
		 *	@Param content: Optional description of the module.
		 */
		var BuildModule = function(name, type, content) {
			var holder = DOCUMENT.createElement("div");
			holder.className = "module";
			holder.setAttribute("data-name", name);

			// Handle selection
			if(selectedModules.indexOf(name) == -1)
				holder.setAttribute("data-selected", "false");
			else {
				holder.setAttribute("data-selected", "true");
				holder.className = "module selected";
			}

			var title = DOCUMENT.createElement("h2");
			title.innerText = name;
			holder.appendChild(title);

			var moduleType = DOCUMENT.createElement("span");
			moduleType.innerText = type;
			holder.appendChild(moduleType);

			if(typeof content == "string") {
				var desc = DOCUMENT.createElement("p");
				desc.innerText = content;
				holder.appendChild(desc);
			}

			holder.addEventListener("click", function() {
				if(holder.getAttribute("data-selected") == "true") {
					holder.className = "module";
					holder.setAttribute("data-selected", "false");
					selectedModules.splice(selectedModules.indexOf(holder.getAttribute("data-name")), 1);
				} else {
					holder.className = "module selected";
					holder.setAttribute("data-selected", "true");
					selectedModules.push(holder.getAttribute("data-name"));
				}
			});

			return holder;
		}

		/**
	 	 *	@Module: showModules
		 *	@Description: Create a list of modules to be shown to user.
	 	 *	@Dependencies: DOCUMENT, BuildModule
		 *	@Param modules: A list of modules to be shown to the user.
		 */
		var showModules = function(modules) {
			var container = DOCUMENT.getElementsByClassName("modules")[0];
			container.innerHTML = "";

			for(mod of modules)
				container.appendChild(BuildModule(mod[0], mod[1]));
		}

		/**
	 	 *	@Module: showDownloadBar
		 *	@Description: Create a DOM element to allow user to download the minified version of script.
		 *	@Param name: Name of the minified file.
		 *	@Param url: Url generated by the blob object.
		 */
		var showDownloadBar = function(name, url) {
			var downloadBar = DOCUMENT.getElementsByClassName("download")[0];
			downloadBar.style.display = "block";

			var backbtn = DOCUMENT.getElementsByClassName("goback")[0];
			backbtn.addEventListener("click", function() {
				var container = DOCUMENT.getElementsByClassName("container")[0];
				var loader = DOCUMENT.getElementsByClassName("loader")[0];

				container.setAttribute("data-loader", 0);
				for(child of container.children) {
					child.style.display = "inline-block";
				}
				loader.style.display = "none";
				downloadBar.style.display = "none";
			});

			var downloadbtn = DOCUMENT.getElementsByClassName("download_btn")[0];

			var a = DOCUMENT.createElement("a");
			a.setAttribute("href", url);
			a.setAttribute("download", name);
			downloadbtn.appendChild(a);
			downloadbtn.addEventListener("click", function(e) {
				// download file
				a.click();
			});

			var downloadName = DOCUMENT.getElementsByClassName("download_text")[0];
			downloadName.innerText = name;
		}

		/**
	 	 *	@Module: search
		 *	@Description: Return a list of modules matching the given keyword.
	 	 *	@Dependencies: showModules
		 *	@Param keyword: string to be search amongst the available modules.
		 *	@Param list: A list of available modules.
		 */
		var search = function(keyword, list) {
			if(keyword.replace(/\s+/).length > 0) {
				var modules = list.filter(function(p) { return p[0].toLowerCase().indexOf(keyword.toLowerCase()) != -1; });
				showModules(modules);
			} else {
				showModules(list);
			}
		}

		/**
	 	 *	@Module: selectedModules
		 *	@Description: An array to store the final list of selected modules.
		 */
		var selectedModules = [];

		/**
	 	 *	@Module-Anonymous
		 *	@Description: Initialize the UI.
	 	 *	@Dependencies: DOCUMENT, addProgress, showDownloadBar, showModules, search, selectedModules
		 */
		(function() {
			var compiler = DOCUMENT.getElementById("compile");
			var container = DOCUMENT.getElementsByClassName("container")[0];
			var loader = DOCUMENT.getElementsByClassName("loader")[0];
			var closebtn = DOCUMENT.getElementsByClassName("close")[0];
			var showbtn = DOCUMENT.getElementById("s_min");
			var searchinput = DOCUMENT.getElementsByTagName("input")[0];

			var toShow = true;
			//var modules = [["ajfg", "Method"], ["kjhsjfd", "Method"], ["airhf", "String"], ["asfhg", "Boolean"]];

			compiler.addEventListener("click", function(e) {
				for(child of container.children) {
					child.style.display = "none";
				}
				container.setAttribute("data-loader", 1);
				loader.style.display = "block";
				closebtn.style.display = "block";

				var progressBar = DOCUMENT.getElementsByClassName("progress_2")[0];
				progressBar.style.width = "0%";
				toShow = true;

				if(typeof callback == "function") {
					callback(selectedModules, function(value) {
						addProgress(progressBar, value);
					}, function(name, url) {
						loader.style.display = "none";
						showDownloadBar(name, url);
					});
				}	
			});

			closebtn.addEventListener("click", function(e) {
				// close the options window
				for(child of container.children) {
					child.style.display = "none";
				}

				toShow = false;

				container.setAttribute("data-loader", 2);
				setTimeout(function() {
					container.style.display = "none";
					DOCUMENT.getElementsByClassName("emin_popup")[0].style.display = "block";
				}, 250);
			});

			showbtn.addEventListener("click", function(e) {
				DOCUMENT.getElementsByClassName("emin_popup")[0].style.display = "none";
				container.style.display = "block";
				container.setAttribute("data-loader", 0);
				setTimeout(function() {
					for(child of container.children) {
						child.style.display = "inline-block";
					}

					loader.style.display = "none";
					DOCUMENT.getElementsByClassName("download")[0].style.display = "none";
				}, 250);
				showModules(modules);
			});

			searchinput.addEventListener("keyup", function(e) {
				search(searchinput.value, modules);
			});
		})();
	}

	/* ****************************** Object Properties *********************** */
	
	/**
 	 *	@Module: showExtended
	 *	@Description: Build the UI to help with the minification process.
	 *	@Dependencies: showExtendedOptions
	 */
	this.showExtended = function() {
		// Generate DOM Tree to allow user to select extended options for script minifier
		showExtendedOptions(true);
	}

	/**
 	 *	@Module: hideExtended
	 *	@Description: Remove the generated UI from the DOM.
	 *	@Dependencies: showExtendedOptions
	 */
	this.hideExtended = function() {
		// Remove DOM Tree belonging to extended options
		showExtendedOptions(false);
	}

	/**
 	 *	@Module: compile
	 *	@Description: Minify the given script URL
	 *	@Dependencies: loadScript
	 *	@Param scriptURL: The URL of the dynamic script to be minified.
	 *	@Param callback: A callback method to be called upon success minification.
	 */
	this.compile = function(scriptURL, callback) {
		// Build the script with the changes made
		if(scriptURL.indexOf('.') != -1)
			filename = scriptURL.substr(0, scriptURL.indexOf('.'));
		else
			filename = scriptURL;

		loadScript(scriptURL, callback);
	}

	/**
 	 *	@Module: getScriptText
	 *	@Description: Returns the generated script in string form.
	 *	@Dependencies: generatedScript
	 */
	this.getScriptText = function() {
		// Return the generated script using extended options
		return generatedScript;
	}

	/**
 	 *	@Module: add
	 *	@Description: Add the given module to the list of selected modules.
	 *	@Dependencies: MODULES, loadedModules, buildScripts
	 *	@Param module: Name of the module to be added to selected modules list.
	 */
	this.add = function(module) {
		if(typeof module != "string" || MODULES.indexOf(module) == -1)
			throw "Invalid Module Name!";

		loadedModules.push(module);
		buildScripts();
	}

	/**
 	 *	@Module: remove
	 *	@Description: Remove the given module to the list of selected modules.
	 *	@Dependencies: MODULES, loadedModules, buildScripts
	 *	@Param module: Name of the module to be removed from selected modules list.
	 */
	this.remove = function(module) {
		if(typeof module != "string" || loadedModules.indexOf(module) == -1)
			throw "Invalid Module Name!";

		loadedModules.splice(loadedModules.indexOf(module), 1);
		buildScripts();
	}

	/**
 	 *	@Module: debug
	 *	@Description: For debugging purposes only
	 *	@Dependencies: createNewFrame
	 */
	this.debug = function() {
		return createNewFrame();
	}

	/**
 	 *	@Module-Anonymous
	 *	@Description: Automatically start the application if a URL is provided.
	 *	@Dependencies: compile
	 */
	if(typeof url == "string")
		this.compile(url, callback);
}

/************************ TODO *************************
 *	Add constants to generated scripts automatically
 *	Show only Methods to user.
 *	Constants can be shown to user but cannt be removed
 *	Parse javascript to remove methods and isolate constants and objects
 *	Identify Dependencies among modules and constants
 *	Show dependency based UI to automatically add modules required to build the application
 *	Read comments to identify module name, description, dependency and parameter list.
 *	Comments format:
 *		@Module: module name in string text
 *		@Description: module description in string text
 *		@Dependency: module names separated by comma
 *		@Param name: parameter description in string text
 *******************************************************/