
const cds = require('@sap/cds')

module.exports = cds.service.impl(async function () {

    const { Book } = this.entities

    this.before(['CREATE', 'UPDATE'], Book, async (req) => {
    const { status } = req.data

        req.data.statusCriticality = status === 'Active' ? 3 : 1
})



   this.after('READ', Book, (data) => {
    const books = Array.isArray(data) ? data : [data]
    for (const b of books) {
        if (b.stock !== undefined) {
            if (b.stock >= 15) {
                b.stockCriticality = 3
            } else if (b.stock > 5) {
                b.stockCriticality = 2
            } else {
                b.stockCriticality = 1
            }
        }
    }
})

    this.on('SetActive', Book, async (req) => {
        const { ID } = req.params[0]

        const book = await SELECT.one.from(Book).where({ ID })

        const newStatus = book.status === 'Active' ? 'Inactive' : 'Active'
        const criticality = newStatus === 'Active' ? 3 : 1

        await UPDATE(Book)
            .set({
                status: newStatus,
                statusCriticality: criticality
            })
            .where({ ID })

             req.info(`Successfully changed to ${newStatus}`)
        return { ID, status: newStatus }
    })


     this.on('ResetAllBooksStatus', async (req) => {

        await UPDATE(Book)
            .set({
                status: 'Active',
                statusCriticality: 3
            })

        req.info('All books changed to Active successfully')

        return 'All books changed to Active successfully'
    })

})



