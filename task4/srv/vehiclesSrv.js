const cds = require("@sap/cds");

module.exports = cds.service.impl(function () {

    const {
        Vehicles,
        State
    } = this.entities;


    // =====================================================
    // CREATE VEHICLE
    // =====================================================

    this.before("CREATE", Vehicles, async (req) => {

        const {
            modelname,
            currentPrice,
            state_ID
        } = req.data;


        // =================================================
        // VALIDATE MODEL NAME
        // =================================================

        if (!modelname || !modelname.trim()) {

            return req.reject(
                400,
                "Model name is required."
            );
        }


        // =================================================
        // VALIDATE PRICE
        // =================================================

        if (
            currentPrice === undefined ||
            currentPrice === null ||
            Number(currentPrice) <= 0
        ) {

            return req.reject(
                400,
                "Current price must be greater than 0."
            );
        }


        // =================================================
        // VALIDATE STATE
        // =================================================

        if (!state_ID) {

            return req.reject(
                400,
                "State is required."
            );
        }


        // =================================================
        // FIND STATE
        // =================================================

        const state = await SELECT.one
            .from(State)
            .where({
                ID: state_ID
            });


        if (!state) {

            return req.reject(
                404,
                "State not found."
            );
        }


        // =================================================
        // GENERATE VEHICLE ID
        // =================================================

        const stateCode = state.stateCode;

        // FIX: the whole LIKE pattern must be inside ${...} so it's
        // bound as a single safe parameter. Previously "-%" sat outside
        // the interpolation and was appended as raw SQL, producing a
        // malformed query that could hang instead of failing cleanly.
        const stateCodePattern = `${stateCode}-%`;

        const vehicles = await SELECT
            .from(Vehicles)
            .columns("ID")
            .where`ID like ${stateCodePattern}`;


        let maxNumber = 0;


        for (const vehicle of vehicles) {

            if (!vehicle.ID) {
                continue;
            }


            const parts =
                vehicle.ID.split("-");


            const number =
                Number(
                    parts[parts.length - 1]
                );


            if (
                !isNaN(number) &&
                number > maxNumber
            ) {

                maxNumber = number;
            }
        }


        const nextNumber =
            maxNumber + 1;


        req.data.ID =
            `${stateCode}-${String(nextNumber).padStart(4, "0")}`;


        // =================================================
        // CALCULATE TAX
        // =================================================

        const taxRate =
            Number(state.tax || 0) / 100;


        req.data.taxPrice =
            Number(currentPrice) * taxRate;


        // =================================================
        // CALCULATE TOTAL PRICE
        // =================================================

        req.data.totalPrice =
            Number(currentPrice) +
            Number(req.data.taxPrice);


        // =================================================
        // DEFAULT VALUES
        // =================================================

        req.data.oldPrice = 0;

        req.data.status = "Available";


        console.log(
            "Vehicle CREATE:",
            req.data
        );
    });


    // =====================================================
    // UPDATE VEHICLE
    // =====================================================

    this.before("UPDATE", Vehicles, async (req) => {

        // =================================================
        // GET VEHICLE ID
        // =================================================

        const ID =
            req.data.ID ||
            req.params?.[0]?.ID;


        if (!ID) {

            return req.reject(
                400,
                "Vehicle ID is required."
            );
        }


        // =================================================
        // GET EXISTING VEHICLE
        // =================================================

        const vehicle =
            await SELECT.one
                .from(Vehicles)
                .where({
                    ID: ID
                });


        if (!vehicle) {

            return req.reject(
                404,
                "Vehicle not found."
            );
        }


        // =================================================
        // GET CURRENT PRICE
        // =================================================

        const currentPrice =
            req.data.currentPrice !== undefined
                ? Number(req.data.currentPrice)
                : Number(vehicle.currentPrice);


        // =================================================
        // VALIDATE PRICE
        // =================================================

        if (
            isNaN(currentPrice) ||
            currentPrice <= 0
        ) {

            return req.reject(
                400,
                "Current price must be greater than 0."
            );
        }


        // =================================================
        // GET STATE
        // =================================================

        const stateID =
            req.data.state_ID ||
            vehicle.state_ID;


        if (!stateID) {

            return req.reject(
                400,
                "State is required."
            );
        }


        const state =
            await SELECT.one
                .from(State)
                .where({
                    ID: stateID
                });


        if (!state) {

            return req.reject(
                404,
                "State not found."
            );
        }


        // =================================================
        // OLD PRICE
        // =================================================

        const oldPrice =
            Number(vehicle.currentPrice || 0);


        // =================================================
        // CALCULATE TAX
        // =================================================

        const taxRate =
            Number(state.tax || 0) / 100;


        const taxPrice =
            currentPrice * taxRate;


        // =================================================
        // CALCULATE TOTAL
        // =================================================

        const totalPrice =
            currentPrice + taxPrice;


        // =================================================
        // SET VALUES
        // =================================================

        req.data.oldPrice =
            oldPrice;

        req.data.taxPrice =
            taxPrice;

        req.data.totalPrice =
            totalPrice;


        console.log(
            "Vehicle UPDATE:",
            req.data
        );
    });


    // =====================================================
    // VEHICLE SUMMARY
    // =====================================================

    this.on("getVehicleSummary", async (req) => {

        try {

            // =================================================
            // GET VEHICLES WITH STATE
            // =================================================

            const aVehicles = await SELECT
                .from(Vehicles)
                .columns(
                    "ID",
                    "state_ID"
                );


            // =================================================
            // TOTAL VEHICLES
            // =================================================

            const iTotalVehicles =
                aVehicles.length;


            // =================================================
            // COUNT VEHICLES BY STATE
            // =================================================

            const oStateCount = {};


            for (const oVehicle of aVehicles) {

                const sStateId =
                    oVehicle.state_ID;

                if (!sStateId) {
                    continue;
                }

                if (!oStateCount[sStateId]) {

                    oStateCount[sStateId] = 0;
                }

                oStateCount[sStateId]++;
            }


            // =================================================
            // GET STATE NAMES
            // =================================================

            const aStates = await SELECT
                .from(State)
                .columns(
                    "ID",
                    "name"
                );


            // =================================================
            // CREATE SUMMARY
            // =================================================

            const aSummary = [];


            for (const oState of aStates) {

                const iCount =
                    oStateCount[oState.ID] || 0;

                if (iCount > 0) {

                    aSummary.push(
                        `${oState.name}: ${iCount}`
                    );
                }
            }


            // =================================================
            // FINAL RESULT
            // =================================================

            const sResult =
                [
                    "Vehicle Summary",
                    "",
                    `Total Vehicles: ${iTotalVehicles}`,
                    "",
                    ...aSummary
                ].join("\n");


            console.log(
                "Vehicle Summary:",
                sResult
            );


            return sResult;

        } catch (oError) {

            console.error(
                "Vehicle Summary Error:",
                oError
            );

            return req.reject(
                500,
                "Failed to generate vehicle summary."
            );
        }

    });

});