const cds = require('@sap/cds');
module.exports = cds.service.impl(async function () {
const{ A_BusinessPartner}=this.entities ;
const s4 = await cds.connect.to('API_BUSINESS_PARTNER')
let top=10;
let skip=0

 this.on('READ',A_BusinessPartner, async (req) => {
    req.query.SELECT.limit = {rows:{val: top},offset:{val:skip}}
    const businessPartner = await s4.run(req.query);
    await UPSERT.into(A_BusinessPartner).entries(businessPartner)
    // console.log(businessPartner);  
    skip += 10
    return businessPartner;
   
  })
});








