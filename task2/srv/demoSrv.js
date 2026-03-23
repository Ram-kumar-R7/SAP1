const cds = require('@sap/cds')


module.exports = cds.service.impl(async function () {
    const { EmailAddress,Email } = this.entities

    const connection = await cds.connect.to('API_BUSINESS_PARTNER');
    this.on('READ', EmailAddress, async (req) => {
        // console.log(req.query)
        const result = await connection.run(req.query)
        // console.log(result);
        for( const e of result){
            await UPSERT.into(Email).entries({
                AddressID : e.AddressID,
                Person : e.Person,
                EmailAddress :e.EmailAddress,

            })
        }
        return result

    })
})







