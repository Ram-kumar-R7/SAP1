sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"bookshop/test/integration/pages/BookList",
	"bookshop/test/integration/pages/BookObjectPage"
], function (JourneyRunner, BookList, BookObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('bookshop') + '/test/flp.html#app-preview',
        pages: {
			onTheBookList: BookList,
			onTheBookObjectPage: BookObjectPage
        },
        async: true
    });

    return runner;
});

