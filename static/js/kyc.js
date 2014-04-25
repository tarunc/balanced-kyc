(function(ctx) {
	var MARKETPLACE_URI = window.location.pathname || window.location.path,
		URL = 'https://api.balancedpayments.com/v1/api_keys';
	var EMAIL_VALIDATOR_REGEX = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var PHONE_VALIDATOR_REGEX = /^(?:\+?(\d{1,3}))?[- (]*(\d{3})[- )]*(\d{3})[- ]*(\d{4})(?: *x(\d+))?\b$/;

	var queryParams = $.parseParams(document.location.search),
		redirectUri = queryParams.redirect_uri;

	if (!redirectUri) {
		// TODO: if no redirect url, what do we show?
		$(function() {
			$('form.full-page-form').prepend('<div class="control-group error"><span class="control-label">No <pre>redirect_uri</pre> query parameter provided</span></div>');
		});
		throw new Error('No Redirect URI provided!');
	}

	var utils = {
		// Quick function to add params to a url.
		// Supports urls with params already (with ?foo=bar) and hashes (#html5App)
		addQueryParamsToUrl: function(url, params) {
			var paramStr = $.param(params);

			return (url.indexOf('?') !== -1 ?
				url.split('?')[0] + '?' + paramStr + '&' + url.split('?')[1] :
				(url.indexOf('#') !== -1 ?
					url.split('#')[0] + '?' + paramStr + '#' + url.split('#')[1] :
					url + '?' + paramStr));
		},

		//  Return a copy of the object only containing the whitelisted properties.
		pick: function(obj) {
			var copy = {};
			var keys = Array.prototype.slice.call(arguments, 1);

			$.each(keys, function(i, key) {
				if (key in obj) {
					copy[key] = obj[key];
				}
			});

			return copy;
		},

		// Left pads a number by target amount.
		leftPad: function(number, targetLength) {
			var output = Math.floor(number) + '';

			while (output.length < targetLength) {
				output = '0' + output;
			}

			return output;
		},

		// Sets a param ipInfo in utils
		getIp: function() {
			if (utils.ipInfo) {
				return;
			}

			$.getJSON('//smart-ip.net/geoip-json?callback=?', function(data) {
				utils.ipInfo = data;
			});
		},

		// Gets system capabilities
		getCapabilities: function() {
			var capabilities = {
				'screen_width': $(window).width(),
				'screen_length': $(window).height(),
				'user_agent': window.navigator.userAgent
			};

			if (utils.ipInfo) {
				capabilities.system_timezone = utils.ipInfo.timezone;
				capabilities.ip_address = utils.ipInfo.host;
			}

			return capabilities;
		}
	};

	$(function() {
		var $form = $('form.full-page-form').first();

		var KYCLib = {
			DEFAULT_ERROR_MESSAGE: 'This is a required field',

			getType: function() {
				return $form.find('.person').hasClass('selected') ? 'person' : $form.find('.business').hasClass('selected') ? 'business' : false;
			},

			setType: function(type) {
				var $toUnHide = $form.find('fieldset.hide');

				if (type !== 'business') {
					$form.find('fieldset.business-info').addClass('hide');
					$toUnHide = $toUnHide.not('.business-info');
				}

				$toUnHide.removeClass('hide');
			},

			fillInFormWithQueryParams: function($form, queryParams) {
				var applicationType = queryParams['merchant[type]'];
				if (applicationType) {
					$('.application-type a.' + applicationType).trigger('click');
				}

				function fillInWithQueryParam(selector, keys) {
					$.each(keys, function(i, key) {
						if (queryParams[key]) {
							$form.find(selector).val(queryParams[key]);
							return false;
						}
					});
				}

				fillInWithQueryParam('#email_address', ['email_address']);
				fillInWithQueryParam('#name', ['merchant[person][name]', 'name', 'person[name]', 'merchant[name]']);
				fillInWithQueryParam('#phone_number', ['phone_number', 'merchant[phone_number]', 'merchant[person][phone_number]', 'person[phone_number]']);
				fillInWithQueryParam('#street_address', ['street_address', 'merchant[street_address]', 'merchant[person][street_address]', 'person[street_address]']);
				fillInWithQueryParam('#postal_code', ['postal_code', 'merchant[postal_code]', 'merchant[person][postal_code]', 'person[postal_code]']);
				fillInWithQueryParam('#region', ['region', 'merchant[region]', 'merchant[person][region]', 'person[region]']);

				// Bank Account
				fillInWithQueryParam('#account_name', ['account_name', 'bank_account[name]', 'merchant[account_name]']);
				fillInWithQueryParam('#account_number', ['account_number', 'bank_account[account_number]', 'merchant[account_number]']);
				fillInWithQueryParam('#routing_number', ['routing_number', 'bank_account[routing_number]', 'merchant[routing_number]']);
				fillInWithQueryParam('#account_type', ['account_type', 'bank_account[type]', 'merchant[account_type]']);

				if (applicationType === 'business') {
					fillInWithQueryParam('#ein', ['tax_id', 'merchant[tax_id]']);
					fillInWithQueryParam('#business_name', ['name', 'merchant[name]']);
				}

				var dob = queryParams['dob'] || queryParams['merchant[dob]'] || queryParams['merchant[person][dob]'] || queryParams['person[dob]'];
				if (dob) {
					var dobParts = dob.split('-');

					$form.find('#dob_year').val(dobParts[0] || '');
					$form.find('#dob_month').val(dobParts[1] || '');
					$form.find('#dob_day').val(dobParts[2] || '');
				}
			},

			getBankAccount: function(form) {
				var bankAccount = utils.pick(form, 'routing_number', 'account_number');
				bankAccount.name = form.account_name;
				bankAccount.type = form.account_type;

				if (!bankAccount.routing_number || !bankAccount.account_number) {
					bankAccount = {};
				}

				return bankAccount;
			},

			getMerchant: function(form) {
				var applicationType = form.type;

				var base = {
					type: applicationType,
					email_address: form.email_address
				};

				if (MARKETPLACE_URI.indexOf('TEST') >= 0) {
					base['production'] = false;
				}

				var personal = utils.pick(form, 'phone_number', 'postal_code', 'street_address', 'name', 'dob');
				personal.tax_id = form.ssn_last4;

				if (applicationType === 'business') {
					var business = utils.pick(form, 'phone_number', 'postal_code', 'street_address');
					business.name = form.business_name;
					business.tax_id = form.ein;

					if (form.region) {
						personal.region = form.region;
						business.region = form.region;
					}

					base.person = personal;
					base = $.extend(base, business);
				} else {
					if (form.region) {
						personal.region = form.region;
					}

					base = $.extend(base, personal);
				}

				return base;
			},

			createPayload: function(form) {
				if (!form) {
					return;
				}

				var bankAccount = KYCLib.getBankAccount(form);
				var base = KYCLib.getMerchant(form);

				var jsonPayload = {
					email_address: base.email_address,
					merchant: base,
					bank_account: bankAccount,
					name: base.name,
					meta: utils.getCapabilities()
				};

				if (MARKETPLACE_URI.indexOf('TEST') >= 0) {
					jsonPayload.production = false;
				}

				return jsonPayload;
			},

			sendPayload: function(payload, success, failure) {
				return $.ajax({
					url: URL,
					type: 'POST',
					data: JSON.stringify(payload),
					dataType: 'json',
					success: success,
					error: failure,
					contentType: 'application/json; charset=UTF-8'
				});
			},

			redirectMerchant: function(resp) {
				var merchant = resp.merchant;
				if (merchant) {

					var url = utils.addQueryParamsToUrl(redirectUri, {
						email_address: merchant.email_address,
						merchant_uri: merchant.uri
					});

					window.location = url;
				} else {
					// There are errors validating the document
				}
			},

			parseErrorFromAjax: function(xhr) {
				var parsedError = JSON.parse(xhr.responseText || xhr.responseXML);
				var errors = {};
				if (parsedError.extras) {
					errors = parsedError.extras;
				} else if (parsedError.description.indexOf('KYC failed') >= 0) {
					var kycKeys = [
						'street_address',
						'postal_code',
						'dob_year',
						'name',
						'ssn_last4',
						'email_address'
					];

					$.each(kycKeys, function(i, value) {
						errors[value] = 'Please check this entry';
					});
				}

				$.each(errors, function(key, value) {
					KYCLib.addError(key + '.control-group', value);
				});

				$form.find('.actions').addClass('error');
			},

			addError: function(selector, errorMessage) {
				var $group = $form.find(selector).addClass('error');

				if (errorMessage) {
					var $label = $group.find('label');
					$label.data('originalHtml', $label.html());
					$label.html(errorMessage);
				}
			},

			clearError: function(selector) {
				var $group = $form.find(selector).removeClass('error');
				var $label = $group.find('label');
				var originalHtml = $label.data('originalHtml');

				if (originalHtml) {
					$label.html(originalHtml);
				}
			},

			validateField: function(isValid, selector, message) {
				if (isValid) {
					KYCLib.clearError(selector);
				} else {
					KYCLib.addError(selector, message);
				}

				return isValid;
			},

			validateForm: function(form) {
				if (!form.type) {
					return false;
				}

				function defaultValidation(name) {
					return KYCLib.validateField(form[name] && form[name].length > 0, '.' + name, KYCLib.DEFAULT_ERROR_MESSAGE);
				}

				// Returns true if field is at least minLength big and is less than maxLength

				function lengthCheck(field, minLength, maxLength) {
					return field.length >= minLength && field.length <= maxLength;
				}

				$.each(['phone_number', 'ssn_last4', 'postal_code',
					'street_address', 'email_address', 'name'
				], function(i, key) {
					defaultValidation(key);
				});

				if (form.type === 'business') {
					$.each(['business_name', 'ein'], function(i, key) {
						defaultValidation(key);
					});

					KYCLib.validateField(lengthCheck(form['ein'], 9, 11), '.ein', 'This is not a valid <a target="_blank" href="http://www.irs.gov/Businesses/Small-Businesses-%26-Self-Employed/Apply-for-an-Employer-Identification-Number-(EIN)-Online">Employer Identification Number</a>');
				}

				KYCLib.validateField(form['terms-and-conditions'] === 'on', '.terms .control-group');

				if (KYCLib.validateField(form['dob_month'] && form['dob_day'] && form['dob_year'],
					'.personal-info .dob', 'Please enter your date of birth.')) {
					var month = parseInt(form['dob_month'], 10);
					var day = parseInt(form['dob_day'], 10);
					var year = parseInt(form['dob_year'], 10);

					if (KYCLib.validateField((month >= 1 && month <= 12) &&
						(day >= 1 && day <= 31) &&
						(form['dob_year'].length === 4 && year >= 1900 &&
							year <= (new Date().getFullYear())),
						'.personal-info .dob', 'Please enter your date of birth.')) {
						form['dob'] = form['dob_year'] + '-' + utils.leftPad(month, 2) + '-' + utils.leftPad(day, 2);
					}
				}

				KYCLib.validateField(lengthCheck(form['ssn_last4'], 4, 11), '.ssn_last4', 'This is not a valid <a target="_blank" href="http://www.ssa.gov/ssnumber/">Social Security Number</a>');
				KYCLib.validateField(EMAIL_VALIDATOR_REGEX.test(form['email_address']), '.email_address', 'Please enter a valid email');

				KYCLib.validateField(form['name'].split(' ').length > 1, '.name', 'Please enter YOUR FIRST and LAST name');

				KYCLib.validateField(PHONE_VALIDATOR_REGEX.test(form['phone_number']), '.phone_number', 'Please enter a valid phone number');

				return form;
			},

			serializeAndValidateForm: function($form) {
				var form = $form.serializeObject();
				form.type = KYCLib.getType();
				form = KYCLib.validateForm(form);

				return form;
			},

			setQueryString: function(queryString) {
				queryParams = $.parseParams(queryString);
				redirectUri = queryParams.redirect_uri || redirectUri;
				if (queryParams.production === false) {
					KYCLib.setMarketPlaceUri('TEST-MP123');
				}

				KYCLib.fillInFormWithQueryParams($form, queryParams);
			},

			reset: function() {
				$form[0].reset();
				$form.find('.control-group,.actions').removeClass('error');
				$('.application-type a').removeClass('selected');
			},

			setMarketPlaceUri: function(uri) {
				MARKETPLACE_URI = uri;
			}
		};

		$('.application-type a').on('click.balanced', function(evt) {
			evt.preventDefault();

			var $self = $(this);
			$('.application-type a').removeClass('selected');
			$self.addClass('selected');
			KYCLib.setType(KYCLib.getType());

			return false;
		});

		KYCLib.fillInFormWithQueryParams($form, queryParams);

		$form.on('submit.balanced', function(evt) {
			evt.preventDefault();

			var form = KYCLib.serializeAndValidateForm($form);

			if (!form || $form.find('.control-group.error').length >= 1) {
				$form.find('.actions').addClass('error');
				return false;
			}

			$form.find('.actions.error').removeClass('error');

			var payload = KYCLib.createPayload(form);
			KYCLib.sendPayload(payload, KYCLib.redirectMerchant, KYCLib.parseErrorFromAjax);

			return false;
		});

		// Dynamically insert popovers
		$form.find('.account_number,.routing_number').append('<a class="icon-tooltip" data-toggle="popover" data-placement="top" data-title="Account &amp; Routing Number">&nbsp;</a>');

		$form.find('[data-toggle="popover"]').popover({
			html: true,
			content: '<img class="check_image_tool_tip" src="/images/check_image_tool_tip.png"/>'
		});

		$(document.body).on('click.balanced', function(evt) {
			var $target = $(evt.target);

			if (!$target.is('.popover') && !$target.parents('.popover').length && !$target.is('[data-toggle="popover"]')) {
				$form.find('[data-toggle="popover"]').popover('hide');
			}
		});

		setTimeout(function() {
			utils.getIp();
		}, 100);

		ctx.balanced = ctx.balanced || {};
		ctx.balanced.kyc = KYCLib;
	});
})(this);
