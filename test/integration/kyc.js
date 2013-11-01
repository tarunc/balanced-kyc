module('KYC');

test('can visit page', function(assert) {
	console.log($('body').html());
	assert(1 === 1)
});

