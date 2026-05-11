const cds = require('@sap/cds')


module.exports = cds.service.impl(async function () {

    const Api = await  cds.connect.to('locationAPI')

   this.on('getUser',async (req) => {
     
 const result =await Api.get('/users')

    return result
   })


})

