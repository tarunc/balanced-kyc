(function($) {
	var re = /([^&=]+)=?([^&]*)/g;

	var decode = function(str) {
		return decodeURIComponent(str.replace(/\+/g, ' '));
	};

	$.parseParams = function(query) {
		var params = {}, e;

		if (query) {
			if (query.substr(0, 1) === '?') {
				query = query.substr(1);
			}

			while (e = re.exec(query)) {
				var k = decode(e[1]);
				if (k.substr(-2) === '[]' && k.length > 2) {
					k = k.substr(0, k.length - 2);
				}

				var v = decode(e[2]);
				if (params[k] !== undefined) {
					if (!$.isArray(params[k])) {
						params[k] = [params[k]];
					}

					params[k].push(v);
				} else {
					params[k] = v;
				}
			}
		}

		return params;
	};
})(jQuery);
