const cds = require('@sap/cds')
module.exports = cds.service.impl(async function () {

    const { Customer, Payment, OrderHeader, OrderDetail, ProductReturns, Refund, Bill, Product, ProductCategory } = this.entities

    //before

    this.before('CREATE', Customer, async (req) => {
        const { customerName, phoneNo, addresses, userEmail, password } = req.data

        if (!customerName || !phoneNo || !addresses || !userEmail || !password) {
            return req.error(400, 'All fields are required');
        }

        const existEmail = await SELECT.one.from(Customer).where({ userEmail })
        if (existEmail) {
            req.error(400, 'User already exists')
        }

        this.before('CREATE', Payment, async (req) => {
            if (req.data.amount <= 0) {
                return req.error(400, 'Payment amount must be greater than zero')
            }
        })
    })

    // action 

    this.on('cancelOrder', async (req) => {
        const { orderID } = req.data

        const existsOrder = await SELECT.one.from(OrderHeader).where({ ID: orderID })
        if (!existsOrder) {
            return req.error(404, "order not found.")
        }

        if (existsOrder.status === 'Cancelled') {
            return req.error(400, 'order already Cancelled')
        }

        await UPDATE(OrderHeader).set({ status: 'Cancelled' }).where({ ID: orderID })

        await UPDATE(OrderDetail).set({ status: 'Cancelled' }).where({ order_ID: orderID })

        // await this.emit('refundAmount',{orderID : ID})
        await this.send('refundAmount', { orderID });

        return { message: 'order cancelled successfully.' }


    })

    this.on('refundAmount', async (req) => {

        const { orderID } = req.data

        const orderExists = await SELECT.one.from(OrderHeader).where({ ID: orderID })

        if (!orderExists) {
            return req.error(404, 'order not found.')
        }

        const paymentExists = await SELECT.one.from(Payment).where({ order_ID: orderID })

        if (!paymentExists) {
            return req.error(404, 'payment not found.')
        }

        const refundProducts = await SELECT.one.from(ProductReturns).where({ order_ID: orderID })

        let returnId = null;

        if (refundProducts) {
            returnId = refundProducts.ID;
        }
        // Create Refund
        const refund = await INSERT.into(Refund).entries({
            returnRef_ID: returnId,
            payment_ID: paymentExists.ID,
            refundAmount: paymentExists.amount,
            paymentStatus: 'Paid'
            
        });

        return "refund completed";

    })

    this.on('newOrder', async (req) => {
        const { orderID } = req.data

        const order = await SELECT.one.from(OrderHeader).where({ ID: orderID })

        if (!order) {
            req.reject(404, 'Order not found')
        }
        await this.send('billGen', { orderID });
        return { message: 'Product ordered successfully.' }

    })


    // this.on('billGen', async (req) => {
    //     const { orderID } = req.data
    //     const order = await SELECT.one.from(OrderHeader).where({ ID: orderID })

    //     if (!order) {
    //         req.reject(404, 'Order not found')
    //     }


       

    //     const lastNumber = 1; // from DB
    //     const nextNumber = lastNumber + 1;

    //     const year = new Date().getFullYear();
    //       const next = count[0].total + 1;

    //     // const billNumber = `INV-${year}-${String(nextNumber).padStart(4, "0")}`;

    //     // console.log(billNumber);

    //     await INSERT.into(Bill).entries({
    //         order_ID: orderID,
    //         billNumber: `INV-${year}-${String(next).padStart(4, "0")}`,
    //         // billNumber : `INV${Date.now()}`,
    //         billDate: Date.now(),
    //         totalAmount: order.totalAmount,
    //         paymentStatus: 'Pending'
    //     })
    // })
    this.on('billGen', async (req) => {

    const { orderID } = req.data

    const order = await SELECT.one
        .from(OrderHeader)
        .where({ ID: orderID })

    if (!order) {
        return req.reject(404, 'Order not found')
    }

    // Get total bills count
    const count = await SELECT.from(Bill).columns('count(*) as total')

    const next = count[0].total + 1
    const year = new Date().getFullYear()

    await INSERT.into(Bill).entries({
        order_ID: orderID,
        billNumber: `INV-${year}-${String(next).padStart(4, "0")}`,
        billDate: new Date(),
        totalAmount: order.totalAmount,
        paymentStatus: 'Pending'
    })
})



})












