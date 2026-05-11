
// const cds = require('@sap/cds')

// module.exports = cds.service.impl(async function () {

//     const { Book } = this.entities

//     this.before('READ', Book, async (req) => {
        
//         const { stock } = req.data
//         if (stock >= 15) {
//             req.data.stockCriticality = 3
//         } else if (stock > 5) {
//             req.data.stockCriticality = 2
//         } else {
//             req.data.stockCriticality = 1
//         }
//     })

//     this.on('Active', Book, async (req) => {
//         const { ID } = req.params[0]

//         const book = await SELECT.one.from(Book).where({ ID })

//         const newStatus = book.status === 'Active' ? 'Inactive' : 'Active'
//         const criticality = newStatus === 'Active' ? 3 : 1

//         await UPDATE(Book)
//             .set({
//                 status: newStatus,
//                 statusCriticality: criticality
//             })
//             .where({ ID })

//         return { ID, status: newStatus }
//     })


// })





const cds = require('@sap/cds')

module.exports = cds.service.impl(async function () {

    const { Book } = this.entities

    // this.before(['CREATE', 'UPDATE'], Book, async (req) => {
    //     const { stock, status } = req.data

    //     if (stock !== undefined) {
    //         if (stock >= 15) {
    //             req.data.stockCriticality = 3
    //         } else if (stock > 5) {
    //             req.data.stockCriticality = 2
    //         } else {
    //             req.data.stockCriticality = 1
    //         }
    //     }

    //         if (status === 'Active') {
    //             req.data.statusCriticality = 3
    //         } else {
    //             req.data.statusCriticality = 1
    //         }
        
    // })


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

    this.on('Active', Book, async (req) => {
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

        return { ID, status: newStatus }
    })

})



