(function() {
	var MARKETPLACE_URI = '/v1/marketplaces/TEST-MP5JtbXVDZkSGruOJyNasPqy',
		URL = 'https://api.balancedpayments.com/v1/api_keys';

	var queryParams = $.parseParams(document.location.search),
		redirectUri = queryParams.redirect_uri;

	if (!redirectUri) {
		// TODO: if no redirect url, what do we show?
		return;
	}

	var utils = {
		addQueryParamsToUrl: function(url, params) {
			var paramStr = $.param(params);
			return (url.indexOf('?') !== -1 ? url.split('?')[0] + '?' + paramStr + '&' + url.split('?')[1] : (url.indexOf('#') !== -1 ? url.split('#')[0] + '?' + paramStr + '#' + url.split('#')[1] : url + '?' + paramStr));
		},

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

		leftPad: function(number, targetLength) {
			var output = Math.floor(number) + '';

			while (output.length < targetLength) {
				output = '0' + output;
			}

			return output;
		},

		getIp: function() {
			if (utils.ipInfo) {
				return;
			}

			$.getJSON('//smart-ip.net/geoip-json?callback=?', function(data) {
				utils.ipInfo = data;
			});
		},

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

	$(document).ready(function() {
		var $form = $('form.full-page-form');

		var KYCLib = {
			DEFAULT_ERROR_MESSAGE: 'This is a required field.',

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

			fillInFormWithQueryParams: function() {
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
				fillInWithQueryParam('#name', ['name', 'merchant[person[name]]', 'person[name]', 'merchant[name]']);
				fillInWithQueryParam('#phone_number', ['name', 'merchant[name]', 'merchant[person[name]]']);
				fillInWithQueryParam('#street_address', ['name', 'merchant[name]', 'merchant[person[name]]']);
				fillInWithQueryParam('#postal_code', ['name', 'merchant[name]', 'merchant[person[name]]']);

				// Bank Account
				fillInWithQueryParam('#account_name', ['account_name', 'bank_account[name]', 'merchant[account_name]']);
				fillInWithQueryParam('#account_number', ['account_number', 'bank_account[account_number]', 'merchant[account_number]']);
				fillInWithQueryParam('#routing_number', ['routing_number', 'bank_account[routing_number]', 'merchant[routing_number]']);
				fillInWithQueryParam('#account_type', ['account_type', 'bank_account[account_type]', 'merchant[account_type]']);
				fillInWithQueryParam('#ssn_last4', ['tax_id', 'merchant[person[tax_id]]', 'person[tax_id]', 'merchant[tax_id]']);

				if (applicationType === 'business') {
					fillInWithQueryParam('#ein', ['tax_id', 'merchant[tax_id]']);
					fillInWithQueryParam('#business_name', ['name', 'merchant[name]']);
				}

				var dob = queryParams['dob'] || queryParams['merchant[dob]'] || queryParams['merchant[person[dob]]'];
				if (dob) {
					var dobParts = dob.split('-');

					$form.find('#dob_year').val(dobParts[0] || '');
					$form.find('#dob_month').val(dobParts[2] || '');
					$form.find('#dob_day').val(dobParts[1] || '');
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
				var bankAccount = KYCLib.getBankAccount(form);
				var base = KYCLib.getMerchant(form);

				var jsonPayload = {
					email_address: base.email_address,
					merchant: base,
					bank_account: bankAccount,
					name: base.name,
					meta: utils.getCapabilities()
				};

				return jsonPayload;
			},

			sendPayload: function(payload, success, failure) {
				return $.ajax({
					url: URL,
					type: 'POST',
					data: payload,
					dataType: 'json',
					success: success,
					error: failure
				});
			},

			redirectMerchant: function(resp) {
				var merchant = resp.merchant;
				if (merchant) {
					window.location = utils.addQueryParamsToUrl(redirectUri, [{
						email_address: merchant.email_address
					}, {
						merchant_uri: merchant.uri
					}]);
				} else {
					// There are errors validating the document
				}
			},

			parseErrorFromAjax: function() {
				console.log('error', arguments);
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

				KYCLib.validateField(form['terms-and-conditions'] === 'on', '.terms .control-group');

				if (form['dob_month'] && form['dob_day'] && form['dob_year']) {
					var month = parseInt(form['dob_month'], 10);
					var day = parseInt(form['dob_day'], 10);
					var year = parseInt(form['dob_year'], 10);

					if (KYCLib.validateField((month >= 1 && month <= 12) &&
						(day >= 1 && day <= 31) &&
						(form['dob_year'].length === 4 && year >= 1900 &&
							year <= (new Date().getFullYear())),
						'.personal-info .dob', 'Oops, your date of birth appears malformed.')) {
						form['dob'] = form['dob_year'] + '-' + utils.leftPad(month, 2) + '-' + utils.leftPad(day, 2);
					}
				}

				KYCLib.validateField(form['email_address'], '.personal-info .email_address', KYCLib.DEFAULT_ERROR_MESSAGE);

				return form;
			}
		};

		$('.application-type a').off('.balanced-kyc').on('click.balanced-kyc', function(evt) {
			evt.preventDefault();

			var $self = $(this);
			$('.application-type a').removeClass('selected');
			$self.addClass('selected');
			KYCLib.setType(KYCLib.getType());

			return false;
		});

		KYCLib.fillInFormWithQueryParams();

		$form.off('.balanced-kyc').on('submit.balanced-kyc', function(evt) {
			evt.preventDefault();

			var form = $form.serializeObject();
			form.type = KYCLib.getType();
			form = KYCLib.validateForm(form);

			if (!form || $form.find('.control-group.error').length >= 1) {
				return false;
			}

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

		$(document.body).off('.balanced-kyc').on('click.balanced-kyc', function(evt) {
			var $target = $(evt.target);

			if (!$target.is('.popover') && !$target.parents('.popover').length && !$target.is('[data-toggle="popover"]')) {
				$form.find('[data-toggle="popover"]').popover('hide');
			}
		});

		setTimeout(function() {
			utils.getIp();
		}, 100);
	});
}());
