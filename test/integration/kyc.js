module('KYC Page', {
	teardown: function() {
		balanced.kyc.reset();
	}
});

function valueEqual(field, val) {
	return equal($('#' + field).val(), val, field + ' fields are equal');
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
	var serialized = balanced.kyc.serializeAndValidateForm();
	ok(!serialized, 'empty serialization doesnt work');
});

test('clicking on application-type', function(assert) {
	$('.application-type .business').click();
	equal(balanced.kyc.getType(), 'business');

	ok($('form.full-page-form').find('input:visible').length > 10, 'Fields exist');
	ok($('form.full-page-form').find('.business-info').is(':visible'), 'Fields are visible');

	$('.application-type .personal').click();
	equal(balanced.kyc.getType(), 'personal');
	ok(!$('form.full-page-form').find('.business-info').is(':visible'), 'Fields are visible');
});

test('basic validation', function(assert) {
	$('.application-type .business').click();
	equal(balanced.kyc.getType(), 'business');

	ok($('form.full-page-form').find('input:visible').length > 10, 'Fields exist');
	ok($('form.full-page-form').find('.business-info').is(':visible'), 'Fields are visible');

	$('.application-type .personal').click();
	equal(balanced.kyc.getType(), 'personal');
	ok(!$('form.full-page-form').find('.business-info').is(':visible'), 'Fields are visible');
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

	var serialized = balanced.kyc.serializeAndValidateForm();
	deepEqual(serialized, JSON_BUSINESS_FORM_SERIALISATION);

	ok($('.control-group.dob').hasClass('error'), 'Dob error showed up');
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

	var serialized = balanced.kyc.serializeAndValidateForm();
	deepEqual(serialized, JSON_BUSINESS_FORM_SERIALISATION);

	ok($('.control-group.dob').hasClass('error'), 'Dob error showed up');
	ok($('.control-group.ssn_last4').hasClass('error'), 'SSN error showed up');
	ok($('.terms .control-group').hasClass('error'), 'Terms error showed up');
});
