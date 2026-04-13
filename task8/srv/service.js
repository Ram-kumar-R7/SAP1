const cds = require('@sap/cds');
const { SELECT, UPDATE } = require('@sap/cds/lib/ql/cds-ql');

module.exports = cds.service.impl(function () {

  const { product } = this.entities;

  const bundle = cds.i18n.bundle4('i18n');

  this.before('CREATE', product, (req) => {
    if (req.data.price < 0) {
      req.error(400, bundle.at('invalidPrice'));
    }
  });

  this.on('getAllRecords', async () => {

    const activeData = await SELECT.from(product);
    const draftData = await SELECT.from(product.drafts);

    return [...activeData, ...draftData];
  });


  this.on('addDiscount',async (req) => {

    // const {ID} = req.params[0]
    const {ID,discount} = req.data

    const oldPirce = await SELECT.one.from(product).where({ ID});
    const newPricew = oldPirce.price - (oldPirce.price *discount / 100)

    await UPDATE(product).set({price : newPricew}).where({ID})

  })

  
   this.on('applyInActive',async(req)=>{

    const {ID} = req.params[0];

    const records = await SELECT.one.from(product).where({ID})

    const newRecords = records.status === 'Active' ? 'InActive' : 'Active';

    return await UPDATE(product).set({status : newRecords}).where({ID})




    // return await UPDATE(product).set({status: 'InActive'}).where({ID})

   })



});

