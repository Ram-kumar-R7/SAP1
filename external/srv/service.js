const cds = require('@sap/cds');

module.export = cds.service.impl(async function () {

    const s4 = await cds.connect.to('ExchangeRate_APIs');
    const db = await cds.connect.to('db');
    this.on("READ",'externalApi',async(req)=>{
        const d = await s4.run(req.query);
        await db.run(INSERT.into('MyService.externalApi').entries(d));
        return d;
        
    });
    
})











