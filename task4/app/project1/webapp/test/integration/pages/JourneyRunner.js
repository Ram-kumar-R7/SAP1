sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"project1/test/integration/pages/CustomerList",
	"project1/test/integration/pages/CustomerObjectPage"
], function (JourneyRunner, CustomerList, CustomerObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('project1') + '/test/flp.html#app-preview',
        pages: {
			onTheCustomerList: CustomerList,
			onTheCustomerObjectPage: CustomerObjectPage
        },
        async: true
    });

    return runner;
});

