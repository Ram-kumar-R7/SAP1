sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"project1/test/integration/pages/productList",
	"project1/test/integration/pages/productObjectPage"
], function (JourneyRunner, productList, productObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('project1') + '/test/flp.html#app-preview',
        pages: {
			onTheproductList: productList,
			onTheproductObjectPage: productObjectPage
        },
        async: true
    });

    return runner;
});

