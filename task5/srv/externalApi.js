
const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const { externalApi } = this.entities;
    const s4 = await cds.connect.to('ExchangeRate_APIs');
    this.on('READ', externalApi, async (req) => {
        console.log("hii");
        const res =  await s4.run(req.query);
        return res
    });

});

