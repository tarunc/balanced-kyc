JSON_BUSINESS_PAYLOAD = {
	"name": "Levain Bakery",
	"email_address": "hugecookies@gmail.com",
	"merchant": {
		"type": "business",
		"name": "Levain Bakery",
		"tax_id": "253912384",
		"street_address": "167 West 74th Street",
		"postal_code": "10023",
		"phone_number": "+16505551234",
		"country_code": "USA",
		"person": {
			"name": "William James",
			"tax_id": "3992",
			"street_address": "167 West 74th Street",
			"postal_code": "10023",
			"dob": "1942-02-01",
			"phone_number": "+16505551234",
			"country_code": "USA",
		}
	},
	"bank_account": {
		"name": "Levain Bakery LLC",
		"account_number": "28304871049",
		"routing_number": "121042882",
		"type": "savings",
	},
	"production": false
};

SUCCESS_PERSONAL_PAYLOAD = {
	"email_address": "will.4562@gmail.com",
	"merchant": {
		"email_address": "will.4562@gmail.com",
		"type": "person",
		"name": "Mary Kane",
		"tax_id": "3992",
		"street_address": "21731 Lomita Ave",
		"postal_code": "95014",
		"dob": "1992-01-02",
		"phone_number": "+14088216511",
		"country_code": "USA",
		"production": false
	},
	"bank_account": {
		"name": "Levain Bakery LLC",
		"account_number": "28304871049",
		"routing_number": "121042882",
		"type": "savings",
	},
	"production": false
};

JSON_PERSONAL_PAYLOAD = {
	"email_address": "will@gmail.com",
	"merchant": {
		"type": "person",
		"name": "William James",
		"tax_id": "3992",
		"street_address": "167 West 74th Street",
		"postal_code": "10023",
		"dob": "1842-01-02",
		"phone_number": "+16505551234",
		"country_code": "USA",
	},
	"bank_account": {
		"name": "Levain Bakery LLC",
		"account_number": "28304871049",
		"routing_number": "121042882",
		"type": "savings",
	},
	"production": false
};

JSON_BUSINESS_FORM_SERIALISATION = {
	"business_name": "Levain Bakery",
	"ein": "253912384",
	"name": "William James",
	"email_address": "hugecookies@gmail.com",
	"dob_month": "02",
	"dob_day": "01",
	"dob_year": "1942",
	"dob": "1942-02-01",
	"street_address": "167 West 74th Street",
	"postal_code": "10023",
	"ssn_last4": "",
	"phone_number": "+16505551234",
	"account_name": "Levain Bakery LLC",
	"account_number": "28304871049",
	"routing_number": "121042882",
	"region": "",
	"account_type": "savings",
	"type": "business"
};

JSON_PERSONAL_FORM_SERIALISATION = {
	"business_name": "",
	"ein": "",
	"name": "William James",
	"email_address": "will@gmail.com",
	"dob_month": "01",
	"dob_day": "02",
	"dob_year": "1842",
	"street_address": "167 West 74th Street",
	"postal_code": "10023",
	"ssn_last4": "",
	"phone_number": "+16505551234",
	"account_name": "Levain Bakery LLC",
	"account_number": "28304871049",
	"routing_number": "121042882",
	"region": "",
	"account_type": "savings",
	"type": "person"
};

JSON_EMPTY_FORM_SERIALISATION = {
	"business_name": "",
	"ein": "",
	"name": "",
	"email_address": "",
	"dob_month": "",
	"dob_day": "",
	"dob_year": "",
	"street_address": "",
	"postal_code": "",
	"ssn_last4": "",
	"phone_number": "",
	"account_name": "",
	"account_number": "",
	"routing_number": "",
	"region": "",
	"account_type": "checking",
	"type": "business"
};
