const cds = require('@sap/cds');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');


module.exports = cds.service.impl(async function () {

    const { Vehicles, State, Dealers, Bill, Orders, Customer, Payments } = this.entities

    //  Customer Validation
    this.before('CREATE', Customer, async (req) => {

        const { customerName, phoneNo, email, addressDetail_street, addressDetail_city, addressDetail_pincode } = req.data

        if (!customerName || !phoneNo || !email ||
            !addressDetail_street || !addressDetail_city || !addressDetail_pincode) {
            return req.reject(400, 'All fields are required ')
        }

        const phoneRegax = /^[0-9]{10}$/

        if (!phoneRegax.test(phoneNo)) {
            return req.reject(400, 'Enter vaild phone number')
        }

        const existEmail = await SELECT.one.from(Customer).where({ email })

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return req.reject(400, "Invalid email format")
        }

        if (existEmail) {
            return req.reject(400, 'Email already exists')
        }

    })

    // Dealers validation ------------------------------------------------------

    this.before('CREATE', Dealers, async (req) => {

        const { dealername, location } = req.data

        if (!dealername || !location) {
            return req.reject(400, 'Dealer name and location are required.')
        }
        
        const dealernameRegex = /^[a-zA-Z ]{2,30}$/

        if (!dealernameRegex.test(dealername)) {
            return req.reject(400, 'Dealer name should contain only letters')
        }

        const existDealer = await SELECT.one.from(Dealers).where({ dealername })

        if (existDealer) {
            return req.reject(400, 'Dealer already exists')
        }

    })


    // State Validation -------------------------------------------------------------------


    this.before(['CREATE', 'UPDATE'], State, async (req) => {

        const { name, stateCode, tax } = req.data

        if (req.event === 'CREATE') {

            if (!name || !stateCode || !tax) {
                return req.reject(400, 'All fields are required.')
            }

            const state = await SELECT.one.from(State).where({ stateCode })
            if (state) {
                return req.reject(400, 'state already exists')
            }
        }

        if (tax <= 0 || tax > 100) {
            return req.reject(400, 'Invaild tax %')
        }
    })


    // order validation ----------------------------------------------------

    this.before('CREATE', Orders, async (req) => {
        const { quantity } = req.data

        if (quantity <= 0) {
            return req.reject(400, "Quantity must be greater than 0")
        }

        const customer = await SELECT.one.from(Customer).where({ ID: req.data.customer_ID })

        if (!customer) {
            return req.reject(404, "Customer not found.")
        }

        const vehicle = await SELECT.one.from(Vehicles).where({ ID: req.data.vehicle_ID })

        if (!vehicle) {
            return req.reject(404, "vehicle not found.")
        }

    })

    // Vehicles Creation ------------------------------------------------------------------------

    this.before('CREATE', Vehicles, async (req) => {

        const dealerID = await SELECT.one.from(Dealers).where({ ID: req.data.dealer_ID })

        if (!dealerID) {
            req.reject(400, `Dealer not found`)
        }

        const state = await SELECT.one.from(State).where({ ID: req.data.state_ID })

        if (!state) {
            req.reject(404, 'State not found.')
        }

        const result = await SELECT.one.from(Vehicles).columns`count(*) as total`
        const TotalVehicels = result.total + 1

        req.data.ID = `${state.stateCode}-${String(TotalVehicels).padStart(4, '0')}`
        let tax = state.tax
        req.data.taxPrice = req.data.currentPrice * tax
        req.data.totalPrice = req.data.currentPrice + (req.data.currentPrice * tax)

    })

   

    // Vehicle Update

    this.on('UPDATE', Vehicles, async function (req) {

        if (req.data.currentPrice) {

            const vehicle = await SELECT.one.from(Vehicles).where({ ID: req.data.ID })

            if (vehicle) {
                req.data.oldPrice = vehicle.currentPrice
            }

            await UPDATE(Vehicles).set({ currentPrice: req.data.currentPrice, oldPrice: req.data.oldPrice }).where({ ID: req.data.ID })
            return req.data

        }
    })


//    this.on('READ', Vehicles, async (req) => {
//     const data = await SELECT.from(Vehicles).where(req.query.SELECT.where)

//     const filtered = data.filter(v => v.status == 'Approved')

//     return filtered
// })



// Bill Creation -----------------------------------------------------------------

    this.before('CREATE', Bill, async (req) => {

        const existOrder = await SELECT.one.from(Orders)
            .where({ ID: req.data.order_ID })
            .columns('quantity', 'vehicle_ID')

        if (!existOrder) {
            return req.reject(404, 'Order not found')
        }

        if (!existOrder.vehicle_ID) {
            return req.reject(400, 'Vehicle not assigned to this order')
        }

        const vehicle = await SELECT.one.from(Vehicles)
            .where({ ID: existOrder.vehicle_ID })
            .columns('taxPrice', 'totalPrice')

        if (!vehicle) {
            return req.reject(400, 'Vehicle record not found')
        }

        const BillCount = await SELECT.one.from(Bill).columns`count(*) as total`
        const nextNumber = BillCount.total + 1
        const year = new Date().getFullYear()

        req.data.billNumber = `INV-${year}-${String(nextNumber).padStart(4, '0')}`
        req.data.billDate = new Date()
        req.data.taxPrice = vehicle.taxPrice
        req.data.totalAmount = vehicle.totalPrice * existOrder.quantity

    })

// payment validations

    this.before('CREATE', Payments, async (req) => {

        const { amount, order_ID } = req.data

        if (!amount || amount <= 0) {
            return req.reject(400, 'Payment amount must be greater than 0')
        }

        const order = await SELECT.one.from(Orders).where({ ID: order_ID })

        if (!order) {
            return req.reject(404, 'Order not found')
        }

        const vehicle = await SELECT.one.from(Vehicles).where({ ID: order.vehicle_ID })
          
        if (!vehicle) {
            return req.reject(400, 'Vehicle not found for this order')
        }

    })

})


