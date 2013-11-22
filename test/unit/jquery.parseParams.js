module('jquery.parseParams');

function parseParams(queryString, expected) {
	var obj = $.parseParams(queryString);
	deepEqual(obj, expected);
}

test('Simple Test', function() {
	var expected = {
		ferko: 'suska',
		ee: 'huu'
	};

	parseParams('?ferko=suska&ee=huu', expected);
});

test('Simple without ? Test', function() {
	var expected = {
		ferko: 'suska',
		ee: 'huu'
	};

	parseParams('ferko=suska&ee=huu', expected);
});

test('Array with [] Test', function() {
	var expected = {
		ferko: 'suska',
		ee: 'huu',
		topics: ['seo', 'php']
	};

	parseParams('?ferko=suska&ee=huu&topics[]=seo&topics[]=php', expected);
});

test('Array without [] Test', function() {
	var expected = {
		ferko: 'suska',
		ee: 'huu',
		topics: ['seo', 'php']
	};

	parseParams('?ferko=suska&ee=huu&topics=seo&topics=php', expected);
});
