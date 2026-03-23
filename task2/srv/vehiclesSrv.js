const cds = require('@sap/cds')
const { SELECT, orders } = require('@sap/cds/lib/ql/cds-ql')

module.exports = cds.service.impl(async function () {

    const { Vehicles, Dealers, Orders, State } = this.entities
    
        this.before('CREATE', 'Vehicles', async (req) => {

        const dealerID = req.data.dealers_ID

        const dealer = await SELECT.one.from(Dealers).where({ ID: dealerID })

        if (!dealer) {
            return req.reject(400, "Dealer not found")
        }

        const state = await SELECT.one.from(State).where({ ID: req.data.state_ID })

        if (!state) {
            return req.reject(400, "State not found")
        }

        const result = await SELECT.one.from(Vehicles).columns`count(*) as total`
        const next = result.total + 1

        req.data.ID = `${state.stateCode}-${String(next).padStart(4, '0')}`

        
        let tax = state.tax
        req.data.price = req.data.price + (req.data.price * tax)
    })
    
    this.on('approveVehicle', async (req) => {
        const { orderID } = req.data

        const existvehicle = await SELECT.one.from(Vehicles).where({ ID: orderID })

        if (!existvehicle) {
            req.reject(400, 'Not found')
        }

        if (existvehicle.status === 'Approved') {
            req.reject(400, 'Vehicle already Approved.')
        }

        await UPDATE(Vehicles).set({ status: 'Approved' }).where({ ID: orderID })

        return 'Vehicle Approved successfully..'

    })

    //function getTotalOrderValue
    this.on('getTotalOrderValue', async (req) => {
        const { orderID } = req.data

        const existvehicle = await SELECT.one.from(Vehicles).where({ ID: orderID })
        if (!existvehicle) {
            req.reject(400, 'User not found.')
        }

        const orderDetails = await SELECT.from(Orders).where({ vehiclesRef_ID: orderID })
        if (!orderDetails) {
            req.reject(400, 'order not found.')
        }
        console.log(orderDetails);

        const totalValue = orderDetails.reduce((acc, val) => acc + val.quantity, 0) * existvehicle.price
        return totalValue

    })

    //Generic Event Handle
    this.before('CREATE', '*', async (req) => {
        const allEntity = req.target.name
        // console.log(`Entity name ${allEntity}`);

        const requireFeilds = {
            'MyVehicles.Vehicles': ['price', 'modelname', 'dealers_ID'],
            'MyVehicles.Dealers': ['dealername', 'price'],
            'MyVehicles.Orders': ['quantity', 'vehiclesRef_ID']
        }

        const validation = requireFeilds[allEntity]

        if (!validation) return

        for (const e of validation) {
            if (!req.data[e]) {
                return req.reject(400, `${e} field is missing`)
            }
        }
    })

})



















