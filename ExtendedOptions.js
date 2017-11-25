var ExtendedOptions = function(container, modules, callback) {

	var scriptName = "popup.js",
		styleName = "popup.css";

	var selectedModules = [];

	var buildDiv = function(classname, type, text) {
		if(typeof type == "undefined")
			type = "div";
		var container = document.createElement(type);
		container.className = classname;

		if(typeof text == "string")
			container.innerText = text;

		return container;
	}

	var buildSearchInput = function() {
		var input = document.createElement("input");
		input.setAttribute("type", "text");
		input.setAttribute("name", "search");
		input.setAttribute("placeholder", "Search Modules");

		return input;
	}

	var buildButton = function(classname, idname, text) {
		var button = document.createElement("button");
		button.className = classname;
		button.id = idname;

		if(typeof text == "string")
			button.innerText = text;

		return button;
	}

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
		download.appendChild(buildDiv("", "span", "abc.emin.js"));
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

	var buildWrapper = function(con) {
		var frame = document.createElement("iframe");
		frame.style.width = "100vw";
		frame.style.height = "100vh";
		con.appendChild(frame);

		var iframe = frame.contentDocument || frame.contentWindow || frame.contentWindow.document;

		buildHead(iframe.head);
		buildBody(iframe.body);

		return iframe;
	}

	var DOCUMENT = buildWrapper(container);

	var addProgress = function(target, value) {
		target.style.width = value + "%";
	}

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

	var showModules = function(modules) {
		var container = DOCUMENT.getElementsByClassName("modules")[0];
		container.innerHTML = "";

		for(mod of modules)
			container.appendChild(BuildModule(mod[0], mod[1]));
	}

	var showDownloadBar = function() {
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
	}

	var search = function(keyword, list) {
		if(keyword.replace(/\s+/).length > 0) {
			var modules = list.filter(function(p) { return p[0].toLowerCase().indexOf(keyword.toLowerCase()) != -1; });
			showModules(modules);
		} else {
			showModules(list);
		}
	}

	var selectedModules = [];

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
				}, function() {
					loader.style.display = "none";
					showDownloadBar();
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