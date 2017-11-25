var addProgress = function(target, callback) {
	target.style.width = parseInt(target.style.width) + 10 + "%";
	if(parseInt(target.style.width) == 100) {
		if(typeof callback == "function")
			callback();
		return;
	}

	setTimeout(function() {
		addProgress(target, callback);
	}, 200);
}

var BuildModule = function(name, type, content) {
	var holder = document.createElement("div");
	holder.className = "module";
	holder.setAttribute("data-name", name);

	// Handle selection
	if(selectedModules.indexOf(name) == -1)
		holder.setAttribute("data-selected", "false");
	else {
		holder.setAttribute("data-selected", "true");
		holder.className = "module selected";
	}

	var title = document.createElement("h2");
	title.innerText = name;
	holder.appendChild(title);

	var moduleType = document.createElement("span");
	moduleType.innerText = type;
	holder.appendChild(moduleType);

	if(typeof content == "string") {
		var desc = document.createElement("p");
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
	var container = document.getElementsByClassName("modules")[0];
	container.innerHTML = "";

	for(mod of modules)
		container.appendChild(BuildModule(mod[0], mod[1]));
}

var showDownloadBar = function() {
	var downloadBar = document.getElementsByClassName("download")[0];
	downloadBar.style.display = "block";

	var backbtn = document.getElementsByClassName("goback")[0];
	backbtn.addEventListener("click", function() {
		var container = document.getElementsByClassName("container")[0];
		var loader = document.getElementsByClassName("loader")[0];

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
	var compiler = document.getElementById("compile");
	var container = document.getElementsByClassName("container")[0];
	var loader = document.getElementsByClassName("loader")[0];
	var closebtn = document.getElementsByClassName("close")[0];
	var showbtn = document.getElementById("s_min");
	var searchinput = document.getElementsByTagName("input")[0];

	var toShow = true;
	var modules = [["ajfg", "Method"], ["kjhsjfd", "Method"], ["airhf", "String"], ["asfhg", "Boolean"]];

	compiler.addEventListener("click", function(e) {
		for(child of container.children) {
			child.style.display = "none";
		}
		container.setAttribute("data-loader", 1);
		loader.style.display = "block";
		closebtn.style.display = "block";

		var progressBar = document.getElementsByClassName("progress_2")[0];
		progressBar.style.width = "0%";
		toShow = true;
		addProgress(progressBar, function() {
			loader.style.display = "none";

			// Show Download Button
			if(toShow)
				showDownloadBar();
		});
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
			document.getElementsByClassName("emin_popup")[0].style.display = "block";
		}, 250);
	});

	showbtn.addEventListener("click", function(e) {
		document.getElementsByClassName("emin_popup")[0].style.display = "none";
		container.style.display = "block";
		container.setAttribute("data-loader", 0);
		setTimeout(function() {
			for(child of container.children) {
				child.style.display = "inline-block";
			}

			loader.style.display = "none";
			document.getElementsByClassName("download")[0].style.display = "none";
		}, 250);
		showModules(modules);
	});

	searchinput.addEventListener("keyup", function(e) {
		search(searchinput.value, modules);
	});
})();