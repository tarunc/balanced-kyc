module('KYC Page', {
	teardown: function() {
		balanced.kyc.reset();
	}
});

$.ajaxSetup({
	async: false
});

function valueEqual(field, val) {
	return equal($('#' + field).val(), val, field + ' fields are equal');
}

function hasClassError(selector) {
	ok($(selector).hasClass('error'), selector + ' has class error');
}

test('form exists and fields exists', function(assert) {
	equal($('form.full-page-form:visible').length, 1, 'Form visible');
	equal($('form.full-page-form').find('input:visible').length, 0, 'Fields hidden');
	ok($('form.full-page-form').find('input').length > 10, 'Fields exist');
});

test('balanced.kyc context exists', function(assert) {
	ok(balanced && balanced.kyc && balanced.kyc.setQueryString && balanced.kyc.reset);
});

test('empty form works', function(assert) {
	var serialized = balanced.kyc.serializeAndValidateForm($('form.full-page-form'));
	ok(!serialized, 'empty serialization doesnt work');
});

test('clicking on application-type', function(assert) {
	$('.application-type .business').click();
	equal(balanced.kyc.getType(), 'business');

	ok($('form.full-page-form').find('input:visible').length > 10, 'Fields exist');
	ok($('form.full-page-form').find('.business-info').is(':visible'), 'Fields are visible');

	$('.application-type .person').click();
	equal(balanced.kyc.getType(), 'person');
	ok(!$('form.full-page-form').find('.business-info').is(':visible'), 'Fields are visible');
});

test('basic validation', function(assert) {
	$('.application-type .business').click();
	var serialized = balanced.kyc.serializeAndValidateForm($('form.full-page-form'));

	deepEqual(serialized, JSON_EMPTY_FORM_SERIALISATION);

	hasClassError('.control-group.name');
	hasClassError('.control-group.email_address');
	hasClassError('.control-group.dob');
	hasClassError('.control-group.street_address');
	hasClassError('.control-group.postal_code');
	hasClassError('.control-group.ssn_last4');
	hasClassError('.control-group.phone_number');

	hasClassError('.terms .control-group');

	hasClassError('.control-group.business_name');
	hasClassError('.control-group.ein');
});

test('business query string filling form works', function(assert) {
	var qs = $.param(JSON_BUSINESS_PAYLOAD);
	balanced.kyc.setQueryString(qs);

	ok($('.application-type .business').hasClass('selected'), 'Correct type selected');
	valueEqual('name', JSON_BUSINESS_PAYLOAD.merchant.person.name);
	valueEqual('business_name', JSON_BUSINESS_PAYLOAD.merchant.name);
	valueEqual('ein', JSON_BUSINESS_PAYLOAD.merchant.tax_id);
	valueEqual('street_address', JSON_BUSINESS_PAYLOAD.merchant.street_address);
	valueEqual('email_address', JSON_BUSINESS_PAYLOAD.email_address);
	valueEqual('postal_code', JSON_BUSINESS_PAYLOAD.merchant.postal_code);
	valueEqual('phone_number', JSON_BUSINESS_PAYLOAD.merchant.phone_number);
	valueEqual('ssn_last4', '');

	valueEqual('dob_year', JSON_BUSINESS_PAYLOAD.merchant.person.dob.split('-')[0]);
	valueEqual('dob_month', JSON_BUSINESS_PAYLOAD.merchant.person.dob.split('-')[1]);
	valueEqual('dob_day', JSON_BUSINESS_PAYLOAD.merchant.person.dob.split('-')[2]);

	valueEqual('account_name', JSON_BUSINESS_PAYLOAD.bank_account.name);
	valueEqual('account_number', JSON_BUSINESS_PAYLOAD.bank_account.account_number);
	valueEqual('routing_number', JSON_BUSINESS_PAYLOAD.bank_account.routing_number);
	valueEqual('account_type', JSON_BUSINESS_PAYLOAD.bank_account.type);

	var serialized = balanced.kyc.serializeAndValidateForm($('form.full-page-form'));
	deepEqual(serialized, JSON_BUSINESS_FORM_SERIALISATION);

	ok($('.control-group.ssn_last4').hasClass('error'), 'SSN error showed up');
	ok($('.terms .control-group').hasClass('error'), 'Terms error showed up');
});

test('personal query string filling form works', function(assert) {
	var qs = $.param(JSON_PERSONAL_PAYLOAD);
	balanced.kyc.setQueryString(qs);

	ok($('.application-type .person').hasClass('selected'), 'Correct type selected');
	valueEqual('name', JSON_PERSONAL_PAYLOAD.merchant.name);
	valueEqual('business_name', '');
	valueEqual('ein', '');
	valueEqual('street_address', JSON_PERSONAL_PAYLOAD.merchant.street_address);
	valueEqual('email_address', JSON_PERSONAL_PAYLOAD.email_address);
	valueEqual('postal_code', JSON_PERSONAL_PAYLOAD.merchant.postal_code);
	valueEqual('phone_number', JSON_PERSONAL_PAYLOAD.merchant.phone_number);
	valueEqual('ssn_last4', '');

	valueEqual('dob_year', JSON_PERSONAL_PAYLOAD.merchant.dob.split('-')[0]);
	valueEqual('dob_month', JSON_PERSONAL_PAYLOAD.merchant.dob.split('-')[1]);
	valueEqual('dob_day', JSON_PERSONAL_PAYLOAD.merchant.dob.split('-')[2]);

	valueEqual('account_name', JSON_PERSONAL_PAYLOAD.bank_account.name);
	valueEqual('account_number', JSON_PERSONAL_PAYLOAD.bank_account.account_number);
	valueEqual('routing_number', JSON_PERSONAL_PAYLOAD.bank_account.routing_number);
	valueEqual('account_type', JSON_PERSONAL_PAYLOAD.bank_account.type);

	var serialized = balanced.kyc.serializeAndValidateForm($('form.full-page-form'));
	deepEqual(serialized, JSON_PERSONAL_FORM_SERIALISATION);

	ok($('.control-group.dob').hasClass('error'), 'Dob error showed up');
	ok($('.control-group.ssn_last4').hasClass('error'), 'SSN error showed up');
	ok($('.terms .control-group').hasClass('error'), 'Terms error showed up');
});

test('creating payload works', function(assert) {
	var serialized = $.extend({}, JSON_PERSONAL_FORM_SERIALISATION, {
		ssn_last4: '3992',
		dob: '1842-01-02'
	});
	var payload = balanced.kyc.createPayload(serialized);

	equal(payload.email_address, JSON_PERSONAL_PAYLOAD.email_address);
	equal(payload.name, JSON_PERSONAL_PAYLOAD.merchant.name);
	deepEqual(payload.bank_account, JSON_PERSONAL_PAYLOAD.bank_account);
	ok(payload.meta);

	delete payload.merchant.email_address;
	payload.merchant.country_code = 'USA';
	deepEqual(payload.merchant, JSON_PERSONAL_PAYLOAD.merchant);
});

asyncTest('parsing errors work', 1, function(assert) {
	balanced.kyc.sendPayload(JSON_PERSONAL_PAYLOAD, function(success) {}, balanced.kyc.parseErrorFromAjax);

	ok($('.actions').hasClass('error'), 'Error showed up');
	start();
});

asyncTest('parsing errors work', 1, function(assert) {
	balanced.kyc.sendPayload(JSON_PERSONAL_PAYLOAD, function(success) {}, balanced.kyc.parseErrorFromAjax);

	ok($('.actions').hasClass('error'), 'Error showed up');
	start();
});

asyncTest('submitting success works', 3, function(assert) {
	balanced.kyc.sendPayload(SUCCESS_PERSONAL_PAYLOAD, function(resp) {
		ok(resp.merchant.email_address, 'merchant has email address');
		ok(resp.merchant.uri, 'merchant has uri');
	}, function(xhr) {
		console.log('error', xhr.responseText);
	});

	ok(!$('.actions').hasClass('error'), 'Error showed up');
	start();
});
