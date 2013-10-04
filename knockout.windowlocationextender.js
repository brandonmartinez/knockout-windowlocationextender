function KnockoutWindowLocationExtender() {
	'use strict';
	// Private Variables
	var self = this, updateHashTimeout, refreshHashTimeout, previousHash = '', hashChanging = false, targets = {}, currentHashValues = {};

	// Private Functions
	function buildEncodedUrl(base, initialPrefix, objectToEncode) {
		var p, prop, hash = base, prefix = initialPrefix;

		for (p in objectToEncode) {
			if (objectToEncode.hasOwnProperty(p)) {
				prop = objectToEncode[p];

				hash += prefix + p + '=' + escape(prop);
				prefix = '&';
			}
		}

		return hash;
	}

	function splitHash(hashString) {
		var hashes, h, hsh, hashName, hashValue, hashObject = {
		};
		hashes = hashString.split('&');
		for (h = 0; h < hashes.length; h++) {
			hsh = hashes[h].split('=');
			hashName = hsh[0];
			hashValue = unescape(hsh[1]);
			hashObject[hashName] = hashValue;
		}
		return hashObject;
	}
	
	function locationHash() {
		if (!window.location.hash || !window.location.hash.substring(1)) {
			return null;
		}

		return window.location.hash.substring(1);
	}

	function refreshHash() {
		if (refreshHashTimeout) {
			clearTimeout(refreshHashTimeout);
		}

		refreshHashTimeout = setTimeout(function () {
			var hash = locationHash();
			
			if (!hash) {
				return;
			}
			
			if (!hashChanging && hash !== previousHash) {
				var hashObject = splitHash(hash), ho, obj, vmobj;

				// reset cached hash values
				currentHashValues = {};

				for (ho in hashObject) {
					if (hashObject.hasOwnProperty(ho)) {
						obj = hashObject[ho];
						vmobj = targets[ho];

						// We're only going to set observables
						if (vmobj && ko.isWriteableObservable(vmobj) && (!self.InitialRefresh() || String(vmobj()) !== obj)) {
							vmobj(obj);
							currentHashValues[ho] = obj;
						}
					}
				}

				self.hashRefreshed(currentHashValues);

				previousHash = hash;
				self.InitialRefresh(true);
			}
		}, 1);
	}
	
	function createSubscription(target, name) {
		return function(newValue) {
			var hash = self.Hash();

			// if we have a value, set it, if not, remove it from our collection
			if (typeof newValue !== 'undefined' && newValue !== null) {
				targets[name] = target;
				hash[name] = newValue;
			} else {
				delete targets[name];
				delete hash[name];
			}
			self.Hash(hash);
		};
	}
	
	function parseOptions(option) {
		var options = {};
		
		if (option && typeof option === 'string') {
			options.Name = option;
		} else if (option && typeof option === 'object') {
			if (option.Name) {
				options.Name = option.Name;
			} else {
				throw "A property of 'Name' must be specified.";
			}
		} else {
			throw "Either a string or an object with a property of 'Name' must be specified.";
		}

		return options;
	}

	function windowLocationExtenderFunction(target, option) {
		var options = parseOptions(option);

		targets[options.Name] = target;

		target.subscribe(createSubscription(target, options.Name));

		return target;
	}

	// Public Properties

	self.InitialRefresh = ko.observable(false);

	self.Hash = ko.observable({});
	self.Hash.subscribe(function (newValue) {
		if (updateHashTimeout) {
			clearTimeout(updateHashTimeout);
		}

		updateHashTimeout = setTimeout(function () {
			var hashed = buildEncodedUrl('#', '', newValue);
			hashChanging = true;
			if (history && history.replaceState) {
				history.replaceState(history.state, window.title, window.location.href.split('#')[0] + hashed);
			} else {
				window.location.hash = hashed;
			}
			hashChanging = false;
		}, 1);
	});
	
	// Public Functions

	self.hashRefreshed = function () {
		// nothing to do by default; reassign function to have as a callback
	};

	self.register = function () {
		ko.extenders.windowLocation = windowLocationExtenderFunction;
	};

	self.bind = function() {
		// check to see if there is a hash
		if (locationHash()) {
			refreshHash();
		} else {
			self.hashRefreshed(currentHashValues);
			self.InitialRefresh(true);
		}

		// Wire listener
		window.addEventListener("hashchange", refreshHash, false);
	};

	self.init = function() {
		self.register();
		self.bind();
	};
}
