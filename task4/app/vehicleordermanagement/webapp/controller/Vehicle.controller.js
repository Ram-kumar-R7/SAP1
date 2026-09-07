sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"

], (
    Controller,
    Filter,
    FilterOperator,
    Fragment,
    MessageToast,
    MessageBox,
    JSONModel

) => {

    "use strict";

    return Controller.extend(
        "vehicleordermanagement.controller.Vehicle",
        {

            onInit() {
                this._bEditMode = false;
                this._oEditContext = null;
                this._oPendingCreateContext = null;
                this._bSaving = false;
            },


            // =====================================================
            // SEARCH
            // =====================================================

            onSearch(oEvent) {

                const sValue =
                    oEvent.getParameter("newValue").trim();

                const oTable = this.byId("vehicleTable");
                const oBinding = oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }

                if (!sValue) {
                    oBinding.filter([]);
                    return;
                }

                const oIdFilter =
                    new Filter("ID", FilterOperator.Contains, sValue);

                const oModelFilter =
                    new Filter("modelname", FilterOperator.Contains, sValue);

                const oSearchFilter =
                    new Filter({
                        filters: [oIdFilter, oModelFilter],
                        and: false
                    });

                oBinding.filter(oSearchFilter);
            },


            // =====================================================
            // SHARED DIALOG LOADER
            // =====================================================

            async _getVehicleDialog() {

                if (!this._oCreateDialog) {

                    this._oCreateDialog =
                        await Fragment.load({
                            id: this.getView().getId(),
                            name: "vehicleordermanagement.fragment.CreateVehicle",
                            controller: this
                        });

                    this.getView().addDependent(this._oCreateDialog);
                }

                return this._oCreateDialog;
            },
            // -----------------------------------
            // =====================================================
            // OPEN VEHICLE DETAILS
            // =====================================================

            onVehiclePress(oEvent) {

                const oItem = oEvent.getSource();

                const oContext = oItem.getBindingContext();

                const sVehicleId = oContext.getProperty("ID");

                const oRouter =
                    sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo(
                    "VehicleDetails",
                    {
                        vehicleId: sVehicleId
                    }
                );
            },

            // --------------------------------------

            // =====================================================
            // CREATE
            // =====================================================

            async onCreate() {

                try {

                    this._bEditMode = false;
                    this._oEditContext = null;

                    const oDialog = await this._getVehicleDialog();

                    oDialog.setTitle("Create Vehicle");

                    this._clearCreateForm();

                    oDialog.open();

                } catch (oError) {

                    console.error("Create dialog error:", oError);

                    MessageBox.error("Unable to open Create Vehicle dialog.");
                }
            },


            // =====================================================
            // CANCEL — always clickable; aborts a stuck create if one
            // is in flight, instead of leaving it jammed forever
            // =====================================================

            onCancelCreate() {

                if (this._oPendingCreateContext) {

                    // abandon the stuck transient row - this cancels the
                    // underlying pending request and frees up the model's
                    // group queue for future create attempts
                    try {
                        this._oPendingCreateContext.delete();
                    } catch (oError) {
                        console.error("Could not cancel pending create:", oError);
                    }

                    this._oPendingCreateContext = null;
                }

                this._bSaving = false;

                const oSaveButton = this.byId("saveVehicleButton");
                if (oSaveButton) {
                    oSaveButton.setBusy(false);
                    oSaveButton.setEnabled(true);
                }

                if (this._oCreateDialog) {
                    this._oCreateDialog.close();
                }

                this._bEditMode = false;
                this._oEditContext = null;
            },


            // =====================================================
            // EDIT
            // =====================================================

            async onEdit() {

                const oTable = this.byId("vehicleTable");
                const oSelectedItem = oTable.getSelectedItem();

                if (!oSelectedItem) {
                    MessageToast.show("Please select a vehicle.");
                    return;
                }

                const oContext = oSelectedItem.getBindingContext();

                try {

                    this._bEditMode = true;
                    this._oEditContext = oContext;

                    const oDialog = await this._getVehicleDialog();

                    oDialog.setTitle("Edit Vehicle");

                    this.byId("modelNameInput").setValue(
                        oContext.getProperty("modelname")
                    );

                    this.byId("currentPriceInput").setValue(
                        String(oContext.getProperty("currentPrice"))
                    );

                    this.byId("stateSelect").setSelectedKey(
                        oContext.getProperty("state_ID")
                    );

                    oDialog.open();

                } catch (oError) {

                    console.error("Edit dialog error:", oError);

                    MessageBox.error("Unable to open Edit Vehicle dialog.");
                }
            },


            async onSaveVehicle(oEvent) {

                if (this._bSaving) {
                    // a save is already in progress - ignore this click
                    return;
                }

                const oDialog = this._oCreateDialog;

                if (!oDialog) {
                    MessageBox.error("Dialog is not available.");
                    return;
                }

                const oSaveButton = oEvent.getSource();

                this._bSaving = true;
                oSaveButton.setBusy(true);

                try {
                    await this._doSaveVehicle(oDialog);
                } finally {
                    this._bSaving = false;
                    oSaveButton.setBusy(false);
                }
            },


            // =====================================================
            // SAVE — actual logic (branches: Create vs Edit)
            // =====================================================

            // async _doSaveVehicle(oDialog) {

            //     const oModelInput = this.byId("modelNameInput");
            //     const oPriceInput = this.byId("currentPriceInput");
            //     const oStateSelect = this.byId("stateSelect");

            //     if (!oModelInput || !oPriceInput || !oStateSelect) {
            //         MessageBox.error("Form controls could not be found.");
            //         return;
            //     }

            //     const sModelName = oModelInput.getValue().trim();
            //     const sCurrentPrice = oPriceInput.getValue().trim();
            //     const sStateId = oStateSelect.getSelectedKey();

            //     if (!sModelName) {
            //         MessageBox.error("Please enter model name.");
            //         return;
            //     }

            //     if (!sCurrentPrice || Number(sCurrentPrice) <= 0) {
            //         MessageBox.error("Please enter a valid price.");
            //         return;
            //     }

            //     if (!sStateId) {
            //         MessageBox.error("Please select a state.");
            //         return;
            //     }

            //     // ================================================
            //     // EDIT MODE
            //     // ================================================

            //     if (this._bEditMode && this._oEditContext) {

            //         try {

            //             this._oEditContext.setProperty("modelname", sModelName);
            //             this._oEditContext.setProperty("currentPrice", Number(sCurrentPrice));
            //             this._oEditContext.setProperty("state_ID", sStateId);

            //             MessageToast.show("Vehicle updated successfully");

            //             oDialog.close();
            //             this._clearCreateForm();

            //             this._bEditMode = false;
            //             this._oEditContext = null;

            //         } catch (oError) {

            //             console.error("Vehicle update failed:", oError);

            //             MessageBox.error(oError.message || "Failed to update vehicle.");
            //         }

            //         return;
            //     }

            //     // ================================================
            //     // CREATE MODE
            //     // ================================================

            //     const oVehicleData = {
            //         modelname: sModelName,
            //         currentPrice: Number(sCurrentPrice),
            //         state_ID: sStateId
            //     };

            //     const oTable = this.byId("vehicleTable");
            //     const oTableBinding = oTable.getBinding("items");

            //     const oContext = oTableBinding.create(oVehicleData);

            //     // track it so Cancel can abort it if the request hangs
            //     this._oPendingCreateContext = oContext;

            //     try {

            //         await oContext.created();

            //         this._oPendingCreateContext = null;

            //         MessageToast.show("Vehicle created successfully");

            //         oDialog.close();
            //         this._clearCreateForm();

            //     } catch (oError) {

            //         this._oPendingCreateContext = null;

            //         console.error("Vehicle creation failed:", oError);

            //         MessageBox.error(oError.message || "Failed to create vehicle.");
            //     }
            // },


            // async _doSaveVehicle(oDialog) {

            //     const oModelInput = this.byId("modelNameInput");
            //     const oPriceInput = this.byId("currentPriceInput");
            //     const oStateSelect = this.byId("stateSelect");

            //     if (!oModelInput || !oPriceInput || !oStateSelect) {
            //         MessageBox.error("Form controls could not be found.");
            //         return;
            //     }

            //     const sModelName = oModelInput.getValue().trim();
            //     const sCurrentPrice = oPriceInput.getValue().trim();
            //     const sStateId = oStateSelect.getSelectedKey();

            //     // =====================================================
            //     // VALIDATION
            //     // =====================================================

            //     if (!sModelName) {
            //         MessageBox.error("Please enter model name.");
            //         return;
            //     }

            //     if (!sCurrentPrice || Number(sCurrentPrice) <= 0) {
            //         MessageBox.error("Please enter a valid price.");
            //         return;
            //     }

            //     if (!sStateId) {
            //         MessageBox.error("Please select a state.");
            //         return;
            //     }

            //     // =====================================================
            //     // EDIT MODE
            //     // =====================================================

            //     if (this._bEditMode && this._oEditContext) {

            //         try {

            //             this._oEditContext.setProperty(
            //                 "modelname",
            //                 sModelName
            //             );

            //             this._oEditContext.setProperty(
            //                 "currentPrice",
            //                 Number(sCurrentPrice)
            //             );

            //             this._oEditContext.setProperty(
            //                 "state_ID",
            //                 sStateId
            //             );

            //             MessageToast.show(
            //                 "Vehicle updated successfully"
            //             );

            //             oDialog.close();

            //             this._clearCreateForm();

            //             this._bEditMode = false;
            //             this._oEditContext = null;

            //         } catch (oError) {

            //             console.error(
            //                 "Vehicle update failed:",
            //                 oError
            //             );

            //             MessageBox.error(
            //                 oError.message ||
            //                 "Failed to update vehicle."
            //             );
            //         }

            //         return;
            //     }

            //     // =====================================================
            //     // CREATE MODE
            //     // =====================================================

            //     const oVehicleData = {

            //         modelname:
            //             sModelName,

            //         currentPrice:
            //             Number(sCurrentPrice),

            //         state_ID:
            //             sStateId

            //     };

            //     console.log(
            //         "Creating vehicle:",
            //         oVehicleData
            //     );

            //     try {

            //         const oModel =
            //             this.getView().getModel();

            //         // =================================================
            //         // Use a dedicated deferred batch group
            //         // =================================================

            //         const sGroupId = "vehicleCreateGroup";

            //         const oListBinding =
            //             oModel.bindList(
            //                 "/Vehicles",
            //                 undefined,
            //                 undefined,
            //                 undefined,
            //                 {
            //                     $$updateGroupId: sGroupId
            //                 }
            //             );

            //         // =================================================
            //         // CREATE
            //         // =================================================

            //         const oContext =
            //             oListBinding.create(
            //                 oVehicleData
            //             );

            //         this._oPendingCreateContext =
            //             oContext;

            //         console.log(
            //             "Vehicle create request prepared."
            //         );

            //         // =================================================
            //         // SEND REQUEST
            //         // =================================================

            //         await oModel.submitBatch(
            //             sGroupId
            //         );

            //         console.log(
            //             "Vehicle create batch submitted."
            //         );

            //         // =================================================
            //         // WAIT FOR BACKEND RESPONSE
            //         // =================================================

            //         await oContext.created();

            //         console.log(
            //             "Vehicle created:",
            //             oContext.getObject()
            //         );

            //         this._oPendingCreateContext = null;

            //         // =================================================
            //         // SUCCESS
            //         // =================================================

            //         MessageToast.show(
            //             "Vehicle created successfully"
            //         );

            //         oDialog.close();

            //         this._clearCreateForm();

            //         // =================================================
            //         // Refresh table
            //         // =================================================

            //         const oTable =
            //             this.byId("vehicleTable");

            //         const oTableBinding =
            //             oTable.getBinding("items");

            //         if (oTableBinding) {
            //             oTableBinding.refresh();
            //         }

            //     } catch (oError) {

            //         this._oPendingCreateContext = null;

            //         console.error(
            //             "Vehicle creation failed:",
            //             oError
            //         );

            //         let sMessage =
            //             "Failed to create vehicle.";

            //         if (oError.message) {
            //             sMessage = oError.message;
            //         }

            //         MessageBox.error(
            //             sMessage
            //         );
            //     }
            // },



            // async _doSaveVehicle(oDialog) {

            //     const oModelInput =
            //         this.byId("modelNameInput");

            //     const oPriceInput =
            //         this.byId("currentPriceInput");

            //     const oStateSelect =
            //         this.byId("stateSelect");


            //     // =====================================================
            //     // CHECK CONTROLS
            //     // =====================================================

            //     if (
            //         !oModelInput ||
            //         !oPriceInput ||
            //         !oStateSelect
            //     ) {

            //         MessageBox.error(
            //             "Form controls could not be found."
            //         );

            //         return;
            //     }


            //     // =====================================================
            //     // GET VALUES
            //     // =====================================================

            //     const sModelName =
            //         oModelInput
            //             .getValue()
            //             .trim();

            //     const sCurrentPrice =
            //         oPriceInput
            //             .getValue()
            //             .trim();

            //     const sStateId =
            //         oStateSelect
            //             .getSelectedKey();


            //     // =====================================================
            //     // VALIDATION
            //     // =====================================================

            //     if (!sModelName) {

            //         MessageBox.error(
            //             "Please enter model name."
            //         );

            //         return;
            //     }


            //     if (
            //         !sCurrentPrice ||
            //         Number(sCurrentPrice) <= 0
            //     ) {

            //         MessageBox.error(
            //             "Please enter a valid price."
            //         );

            //         return;
            //     }


            //     if (!sStateId) {

            //         MessageBox.error(
            //             "Please select a state."
            //         );

            //         return;
            //     }


            //     // =====================================================
            //     // EDIT MODE
            //     // =====================================================

            //     if (
            //         this._bEditMode &&
            //         this._oEditContext
            //     ) {

            //         const sGroupId =
            //             "vehicleEditGroup";

            //         try {

            //             // =================================================
            //             // GET ORIGINAL VEHICLE DATA
            //             // =================================================

            //             const oOldData =
            //                 this._oEditContext.getObject();

            //             console.log(
            //                 "Original vehicle:",
            //                 oOldData
            //             );


            //             // =================================================
            //             // UPDATE MODEL NAME
            //             // =================================================

            //             this._oEditContext.setProperty(
            //                 "modelname",
            //                 sModelName,
            //                 sGroupId
            //             );


            //             // =================================================
            //             // UPDATE CURRENT / NEW PRICE
            //             // =================================================

            //             this._oEditContext.setProperty(
            //                 "currentPrice",
            //                 Number(sCurrentPrice),
            //                 sGroupId
            //             );


            //             // =================================================
            //             // UPDATE STATE
            //             // =================================================

            //             this._oEditContext.setProperty(
            //                 "state_ID",
            //                 sStateId,
            //                 sGroupId
            //             );


            //             console.log(
            //                 "Vehicle update prepared:",
            //                 this._oEditContext.getObject()
            //             );


            //             // =================================================
            //             // SUBMIT UPDATE
            //             // =================================================

            //             const oModel =
            //                 this.getView().getModel();


            //             await oModel.submitBatch(
            //                 sGroupId
            //             );


            //             console.log(
            //                 "Vehicle update batch submitted successfully."
            //             );


            //             // =================================================
            //             // REFRESH TABLE
            //             // =================================================

            //             const oTable =
            //                 this.byId("vehicleTable");


            //             const oTableBinding =
            //                 oTable.getBinding("items");


            //             if (oTableBinding) {

            //                 await oTableBinding.requestRefresh();

            //             }


            //             // =================================================
            //             // CLOSE DIALOG
            //             // =================================================

            //             oDialog.close();


            //             // =================================================
            //             // CLEAR FORM
            //             // =================================================

            //             this._clearCreateForm();


            //             // =================================================
            //             // CLEAR EDIT STATE
            //             // =================================================

            //             this._bEditMode =
            //                 false;

            //             this._oEditContext =
            //                 null;


            //             // =================================================
            //             // SUCCESS
            //             // =================================================

            //             MessageToast.show(
            //                 "Vehicle updated successfully"
            //             );


            //         } catch (oError) {

            //             console.error(
            //                 "Vehicle update failed:",
            //                 oError
            //             );


            //             MessageBox.error(
            //                 oError.message ||
            //                 "Failed to update vehicle."
            //             );
            //         }


            //         return;
            //     }


            //     // =====================================================
            //     // CREATE MODE
            //     // =====================================================

            //     const oVehicleData = {

            //         modelname:
            //             sModelName,

            //         currentPrice:
            //             Number(sCurrentPrice),

            //         state_ID:
            //             sStateId

            //     };


            //     console.log(
            //         "Creating vehicle:",
            //         oVehicleData
            //     );


            //     try {

            //         const oModel =
            //             this.getView().getModel();


            //         // =================================================
            //         // CREATE GROUP
            //         // =================================================

            //         const sGroupId =
            //             "vehicleCreateGroup";


            //         // =================================================
            //         // CREATE LIST BINDING
            //         // =================================================

            //         const oListBinding =
            //             oModel.bindList(
            //                 "/Vehicles",
            //                 undefined,
            //                 undefined,
            //                 undefined,
            //                 {
            //                     $$updateGroupId:
            //                         sGroupId
            //                 }
            //             );


            //         // =================================================
            //         // CREATE VEHICLE
            //         // =================================================

            //         const oContext =
            //             oListBinding.create(
            //                 oVehicleData
            //             );


            //         this._oPendingCreateContext =
            //             oContext;


            //         console.log(
            //             "Vehicle create request prepared."
            //         );


            //         // =================================================
            //         // SUBMIT CREATE BATCH
            //         // =================================================

            //         await oModel.submitBatch(
            //             sGroupId
            //         );


            //         console.log(
            //             "Vehicle create batch submitted."
            //         );


            //         // =================================================
            //         // WAIT FOR BACKEND RESPONSE
            //         // =================================================

            //         await oContext.created();


            //         console.log(
            //             "Vehicle created:",
            //             oContext.getObject()
            //         );


            //         this._oPendingCreateContext =
            //             null;


            //         // =================================================
            //         // CLOSE DIALOG
            //         // =================================================

            //         oDialog.close();


            //         // =================================================
            //         // CLEAR FORM
            //         // =================================================

            //         this._clearCreateForm();


            //         // =================================================
            //         // REFRESH TABLE
            //         // =================================================

            //         const oTable =
            //             this.byId("vehicleTable");


            //         const oTableBinding =
            //             oTable.getBinding("items");


            //         if (oTableBinding) {

            //             await oTableBinding.requestRefresh();

            //         }


            //         // =================================================
            //         // SUCCESS
            //         // =================================================

            //         MessageToast.show(
            //             "Vehicle created successfully"
            //         );


            //     } catch (oError) {

            //         this._oPendingCreateContext =
            //             null;


            //         console.error(
            //             "Vehicle creation failed:",
            //             oError
            //         );


            //         let sMessage =
            //             "Failed to create vehicle.";


            //         if (oError.message) {

            //             sMessage =
            //                 oError.message;

            //         }


            //         MessageBox.error(
            //             sMessage
            //         );
            //     }
            // },


            async _doSaveVehicle(oDialog) {

                const oModelInput =
                    this.byId("modelNameInput");

                const oPriceInput =
                    this.byId("currentPriceInput");

                const oStateSelect =
                    this.byId("stateSelect");


                // =====================================================
                // CHECK CONTROLS
                // =====================================================

                if (
                    !oModelInput ||
                    !oPriceInput ||
                    !oStateSelect
                ) {

                    MessageBox.error(
                        "Form controls could not be found."
                    );

                    return;
                }


                // =====================================================
                // GET FORM VALUES
                // =====================================================

                const sModelName =
                    oModelInput
                        .getValue()
                        .trim();

                const sCurrentPrice =
                    oPriceInput
                        .getValue()
                        .trim();

                const sStateId =
                    oStateSelect
                        .getSelectedKey();


                // =====================================================
                // VALIDATION
                // =====================================================

                if (!sModelName) {

                    MessageBox.error(
                        "Please enter model name."
                    );

                    return;
                }


                if (
                    !sCurrentPrice ||
                    Number(sCurrentPrice) <= 0
                ) {

                    MessageBox.error(
                        "Please enter a valid price."
                    );

                    return;
                }


                if (!sStateId) {

                    MessageBox.error(
                        "Please select a state."
                    );

                    return;
                }


                // =====================================================
                // EDIT MODE
                // =====================================================

                if (
                    this._bEditMode &&
                    this._oEditContext
                ) {

                    const sGroupId =
                        "vehicleEditGroup";

                    try {

                        const oContext =
                            this._oEditContext;

                        const oOriginalData =
                            oContext.getObject();

                        console.log(
                            "Original vehicle:",
                            oOriginalData
                        );


                        // =================================================
                        // UPDATE MODEL NAME
                        // =================================================

                        oContext.setProperty(
                            "modelname",
                            sModelName,
                            sGroupId
                        );


                        // =================================================
                        // UPDATE CURRENT / NEW PRICE
                        // =================================================

                        oContext.setProperty(
                            "currentPrice",
                            Number(sCurrentPrice),
                            sGroupId
                        );


                        // =================================================
                        // UPDATE STATE
                        // =================================================

                        oContext.setProperty(
                            "state_ID",
                            sStateId,
                            sGroupId
                        );


                        console.log(
                            "Vehicle update prepared:",
                            oContext.getObject()
                        );


                        // =================================================
                        // SUBMIT UPDATE BATCH
                        // =================================================

                        const oModel =
                            this.getView().getModel();

                        await oModel.submitBatch(
                            sGroupId
                        );


                        console.log(
                            "Vehicle update batch submitted successfully."
                        );


                        // =================================================
                        // IMPORTANT
                        // =================================================
                        //
                        // DO NOT CALL:
                        //
                        // oTableBinding.requestRefresh()
                        //
                        // It can cause:
                        // "Must not overwrite: predicate"
                        //
                        // OData V4 updates the bound context automatically.
                        // =================================================


                        // =================================================
                        // CLOSE DIALOG
                        // =================================================

                        oDialog.close();


                        // =================================================
                        // CLEAR FORM
                        // =================================================

                        this._clearCreateForm();


                        // =================================================
                        // CLEAR EDIT STATE
                        // =================================================

                        this._bEditMode =
                            false;

                        this._oEditContext =
                            null;


                        // =================================================
                        // SUCCESS
                        // =================================================

                        MessageToast.show(
                            "Vehicle updated successfully"
                        );


                    } catch (oError) {

                        console.error(
                            "Vehicle update failed:",
                            oError
                        );

                        MessageBox.error(
                            oError.message ||
                            "Failed to update vehicle."
                        );
                    }

                    return;
                }


                // =====================================================
                // CREATE MODE
                // =====================================================

                const oVehicleData = {

                    modelname:
                        sModelName,

                    currentPrice:
                        Number(sCurrentPrice),

                    state_ID:
                        sStateId

                };


                console.log(
                    "Creating vehicle:",
                    oVehicleData
                );


                try {

                    const oModel =
                        this.getView().getModel();


                    // =================================================
                    // CREATE GROUP
                    // =================================================

                    const sGroupId =
                        "vehicleCreateGroup";


                    // =================================================
                    // CREATE LIST BINDING
                    // =================================================

                    const oListBinding =
                        oModel.bindList(
                            "/Vehicles",
                            undefined,
                            undefined,
                            undefined,
                            {
                                $$updateGroupId:
                                    sGroupId
                            }
                        );


                    // =================================================
                    // CREATE CONTEXT
                    // =================================================

                    const oContext =
                        oListBinding.create(
                            oVehicleData
                        );


                    this._oPendingCreateContext =
                        oContext;


                    console.log(
                        "Vehicle create request prepared."
                    );


                    // =================================================
                    // SUBMIT CREATE BATCH
                    // =================================================

                    await oModel.submitBatch(
                        sGroupId
                    );


                    console.log(
                        "Vehicle create batch submitted."
                    );


                    // =================================================
                    // WAIT FOR CREATE RESPONSE
                    // =================================================

                    await oContext.created();


                    console.log(
                        "Vehicle created:",
                        oContext.getObject()
                    );


                    this._oPendingCreateContext =
                        null;


                    // =================================================
                    // CLOSE DIALOG
                    // =================================================

                    oDialog.close();


                    // =================================================
                    // CLEAR FORM
                    // =================================================

                    this._clearCreateForm();


                    // =================================================
                    // SUCCESS
                    // =================================================

                    MessageToast.show(
                        "Vehicle created successfully"
                    );


                } catch (oError) {

                    this._oPendingCreateContext =
                        null;


                    console.error(
                        "Vehicle creation failed:",
                        oError
                    );


                    MessageBox.error(
                        oError.message ||
                        "Failed to create vehicle."
                    );
                }
            },






            // =====================================================
            // CLEAR FORM
            // =====================================================

            _clearCreateForm() {

                const oModelInput = this.byId("modelNameInput");
                const oPriceInput = this.byId("currentPriceInput");
                const oStateSelect = this.byId("stateSelect");

                if (oModelInput) {
                    oModelInput.setValue("");
                }

                if (oPriceInput) {
                    oPriceInput.setValue("");
                }

                if (oStateSelect) {
                    oStateSelect.setSelectedKey("");
                }
            },


            // =====================================================
            // DELETE (with confirmation)
            // =====================================================

            onDelete() {

                const oTable = this.byId("vehicleTable");
                const oSelectedItem = oTable.getSelectedItem();

                if (!oSelectedItem) {
                    MessageToast.show("Please select a vehicle.");
                    return;
                }

                const oContext = oSelectedItem.getBindingContext();
                const sVehicleId = oContext.getProperty("ID");
                const sModelName = oContext.getProperty("modelname");

                MessageBox.confirm(
                    `Are you sure you want to delete vehicle ${sVehicleId} (${sModelName})?`,
                    {
                        title: "Confirm Delete",
                        onClose: (sAction) => {

                            if (sAction !== MessageBox.Action.OK) {
                                return;
                            }

                            oContext.delete()
                                .then(() => {
                                    MessageToast.show("Vehicle deleted successfully");
                                })
                                .catch((oError) => {
                                    console.error("Delete failed:", oError);
                                    MessageBox.error(oError.message || "Failed to delete vehicle.");
                                });
                        }
                    }
                );
            },
            async onExcelUpload() {

                if (!this._oExcelDialog) {

                    this._oExcelDialog = await Fragment.load({

                        name:
                            "vehicleordermanagement.fragment.ExcelUpload",

                        controller: this

                    });

                    this.getView().addDependent(
                        this._oExcelDialog
                    );
                }

                this._oExcelDialog.open();
            },


            // =====================================================
            // EXCEL FILE SELECT
            // =====================================================

            onExcelFileChange(oEvent) {

                const oFile =
                    oEvent.getParameter("files")[0];

                if (!oFile) {
                    return;
                }

                console.log(
                    "Selected Excel file:",
                    oFile.name
                );

                this._oExcelFile = oFile;

                MessageToast.show(
                    "Excel file selected: " + oFile.name
                );
            },

            async onExcelUploadSave() {

                if (!this._oExcelFile) {

                    MessageBox.error(
                        "Please select an Excel file."
                    );

                    return;
                }

                try {

                    const XLSX = window.XLSX;

                    if (!XLSX) {

                        MessageBox.error(
                            "Excel library is not loaded."
                        );

                        return;
                    }

                    const oFile =
                        this._oExcelFile;

                    const aBuffer =
                        await oFile.arrayBuffer();

                    const oWorkbook =
                        XLSX.read(
                            aBuffer,
                            {
                                type: "array"
                            }
                        );

                    const sSheetName =
                        oWorkbook.SheetNames[0];

                    const oWorksheet =
                        oWorkbook.Sheets[sSheetName];

                    const aExcelData =
                        XLSX.utils.sheet_to_json(
                            oWorksheet,
                            {
                                defval: ""
                            }
                        );

                    console.log(
                        "Excel Data:",
                        aExcelData
                    );

                    if (!aExcelData.length) {

                        MessageBox.error(
                            "Excel file is empty."
                        );

                        return;
                    }


                    // =================================================
                    // VALIDATE EXCEL
                    // =================================================

                    for (
                        let i = 0;
                        i < aExcelData.length;
                        i++
                    ) {

                        const oRow =
                            aExcelData[i];

                        if (
                            !oRow.modelname ||
                            !String(oRow.modelname).trim()
                        ) {

                            MessageBox.error(
                                `Row ${i + 2}: Model Name is required.`
                            );

                            return;
                        }

                        if (
                            oRow.currentPrice === "" ||
                            oRow.currentPrice === undefined ||
                            Number(oRow.currentPrice) <= 0
                        ) {

                            MessageBox.error(
                                `Row ${i + 2}: Current Price must be greater than 0.`
                            );

                            return;
                        }

                        if (
                            oRow.state_ID === "" ||
                            oRow.state_ID === undefined
                        ) {

                            MessageBox.error(
                                `Row ${i + 2}: State ID is required.`
                            );

                            return;
                        }
                    }


                    // =================================================
                    // CREATE VEHICLES
                    // =================================================

                    const oModel =
                        this.getView().getModel();

                    const oListBinding =
                        oModel.bindList("/Vehicles");

                    let iSuccess = 0;

                    for (const oRow of aExcelData) {

                        const oVehicleData = {

                            modelname:
                                String(
                                    oRow.modelname
                                ).trim(),

                            currentPrice:
                                Number(
                                    oRow.currentPrice
                                ),

                            state_ID:
                                String(
                                    oRow.state_ID
                                )

                        };

                        console.log(
                            "Creating vehicle:",
                            oVehicleData
                        );

                        const oContext =
                            oListBinding.create(
                                oVehicleData
                            );

                        await oContext.created();

                        iSuccess++;
                    }


                    // =================================================
                    // SUCCESS
                    // =================================================

                    MessageToast.show(
                        `${iSuccess} vehicle(s) uploaded successfully.`
                    );

                    this._oExcelDialog.close();

                    this._oExcelFile = null;


                    // Refresh table

                    const oTable =
                        this.byId("vehicleTable");

                    const oTableBinding =
                        oTable.getBinding("items");

                    if (oTableBinding) {
                        oTableBinding.refresh();
                    }

                } catch (oError) {

                    console.error(
                        "Excel upload failed:",
                        oError
                    );

                    MessageBox.error(
                        oError.message ||
                        "Failed to upload Excel file."
                    );
                }
            },



            // =====================================================
            // EXPORT VEHICLE LIST TO EXCEL
            // =====================================================

            async onExportExcel() {

                try {

                    // ==============================================
                    // CHECK XLSX LIBRARY
                    // ==============================================

                    const XLSX = window.XLSX;

                    if (!XLSX) {

                        MessageBox.error(
                            "Excel library is not loaded."
                        );

                        return;
                    }


                    // ==============================================
                    // GET VEHICLE TABLE
                    // ==============================================

                    const oTable =
                        this.byId("vehicleTable");

                    const oBinding =
                        oTable.getBinding("items");

                    if (!oBinding) {

                        MessageBox.error(
                            "Vehicle data is not available."
                        );

                        return;
                    }


                    // ==============================================
                    // GET CONTEXTS
                    // ==============================================

                    const aContexts =
                        oBinding.getCurrentContexts();

                    if (!aContexts.length) {

                        MessageToast.show(
                            "No vehicles available to export."
                        );

                        return;
                    }


                    // ==============================================
                    // PREPARE EXCEL DATA
                    // ==============================================

                    const aExcelData = [];


                    for (const oContext of aContexts) {

                        const oVehicle =
                            oContext.getObject();

                        aExcelData.push({

                            "Vehicle ID":
                                oVehicle.ID || "",

                            "Model Name":
                                oVehicle.modelname || "",

                            "State":
                                oVehicle.state?.name || "",

                            "Old Price":
                                oVehicle.oldPrice || 0,

                            "New Price":
                                oVehicle.currentPrice || 0,

                            "Tax Price":
                                oVehicle.taxPrice || 0,

                            "Total Price":
                                oVehicle.totalPrice || 0,

                            "Status":
                                oVehicle.status || ""

                        });
                    }


                    console.log(
                        "Export Data:",
                        aExcelData
                    );


                    // ==============================================
                    // CREATE WORKSHEET
                    // ==============================================

                    const oWorksheet =
                        XLSX.utils.json_to_sheet(
                            aExcelData
                        );


                    // ==============================================
                    // CREATE WORKBOOK
                    // ==============================================

                    const oWorkbook =
                        XLSX.utils.book_new();


                    XLSX.utils.book_append_sheet(
                        oWorkbook,
                        oWorksheet,
                        "Vehicles"
                    );


                    // ==============================================
                    // DOWNLOAD EXCEL FILE
                    // ==============================================

                    XLSX.writeFile(
                        oWorkbook,
                        "Vehicle_List.xlsx"
                    );


                    // ==============================================
                    // SUCCESS
                    // ==============================================

                    MessageToast.show(
                        "Vehicle list exported successfully."
                    );

                } catch (oError) {

                    console.error(
                        "Excel export failed:",
                        oError
                    );

                    MessageBox.error(
                        oError.message ||
                        "Failed to export vehicle list."
                    );
                }
            },
            

            async onVehicleSummary() {

                try {

                    // =====================================================
                    // LOAD SUMMARY DIALOG
                    // =====================================================

                    if (!this._oVehicleSummaryDialog) {

                        this._oVehicleSummaryDialog =
                            await Fragment.load({

                                id: this.getView().getId(),

                                name:
                                    "vehicleordermanagement.fragment.VehicleSummary",

                                controller: this

                            });

                        this.getView().addDependent(
                            this._oVehicleSummaryDialog
                        );
                    }


                    // =====================================================
                    // GET CAP FUNCTION RESULT
                    // =====================================================

                    const oModel =
                        this.getView().getModel();

                    const oOperation =
                        oModel.bindContext(
                            "/getVehicleSummary(...)"
                        );

                    console.log("action:", oOperation);
                    

                   const result = await oOperation.execute();
                    
                    console.log(result);
                    

                    const sSummary =
                        oOperation
                            .getBoundContext()
                            .getObject()
                            .value;


                    console.log(
                        "Vehicle Summary:",
                        sSummary
                    );


                    // =====================================================
                    // PARSE SUMMARY
                    // =====================================================

                    const aLines =
                        sSummary
                            .split("\n")
                            .map(
                                sLine => sLine.trim()
                            )
                            .filter(
                                sLine => sLine
                            );


                    // =====================================================
                    // GET TOTAL
                    // =====================================================

                    const sTotalLine =
                        aLines.find(
                            sLine =>
                                sLine.startsWith(
                                    "Total Vehicles:"
                                )
                        );


                    const iTotal =
                        Number(
                            sTotalLine
                                .split(":")[1]
                                .trim()
                        );


                    // =====================================================
                    // GET STATE DATA
                    // =====================================================

                    const aStates = [];


                    for (const sLine of aLines) {

                        if (
                            sLine === "Vehicle Summary" ||
                            sLine.startsWith("Total Vehicles:")
                        ) {
                            continue;
                        }


                        const iColon =
                            sLine.indexOf(":");


                        if (iColon === -1) {
                            continue;
                        }


                        const sState =
                            sLine
                                .substring(0, iColon)
                                .trim();


                        const iCount =
                            Number(
                                sLine
                                    .substring(iColon + 1)
                                    .trim()
                            );


                        if (!isNaN(iCount)) {

                            const fPercentage =
                                iTotal > 0
                                    ? ((iCount / iTotal) * 100)
                                        .toFixed(1)
                                    : "0.0";


                            aStates.push({

                                state:
                                    sState,

                                count:
                                    iCount,

                                percentage:
                                    fPercentage

                            });
                        }
                    }


                    // =====================================================
                    // SET JSON MODEL
                    // =====================================================

                    const oSummaryModel =
                        new JSONModel({

                            total:
                                iTotal,

                            states:
                                aStates

                        });


                    this._oVehicleSummaryDialog.setModel(
                        oSummaryModel,
                        "summary"
                    );


                    // =====================================================
                    // OPEN DIALOG
                    // =====================================================

                    this._oVehicleSummaryDialog.open();


                } catch (oError) {

                    console.error(
                        "Vehicle Summary failed:",
                        oError
                    );

                    MessageBox.error(
                        oError.message ||
                        "Failed to load vehicle summary."
                    );
                }
            },

            onVehicleSummaryClose() {

                if (this._oVehicleSummaryDialog) {

                    this._oVehicleSummaryDialog.close();

                }

            },

            onExcelUploadCancel() {

                if (this._oExcelDialog) {
                    this._oExcelDialog.close();
                }

                this._oExcelFile = null;
            },
            async onCSVUpload() {

                try {

                    if (!this._oCSVDialog) {

                        this._oCSVDialog = await Fragment.load({

                            id: this.getView().getId(),

                            name:
                                "vehicleordermanagement.fragment.CSVUpload",

                            controller: this

                        });

                        this.getView().addDependent(
                            this._oCSVDialog
                        );
                    }

                    // Reset previous file
                    this._oCSVFile = null;

                    // Disable Upload button initially
                    const oUploadButton =
                        this._oCSVDialog.getBeginButton();

                    if (oUploadButton) {
                        oUploadButton.setEnabled(false);
                    }

                    // Clear uploader
                    const oUploader =
                        Fragment.byId(
                            this.getView().getId(),
                            "csvUploader"
                        );

                    if (oUploader) {
                        oUploader.clear();
                    }

                    this._oCSVDialog.open();

                } catch (oError) {

                    console.error(
                        "CSV dialog error:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to open CSV upload dialog."
                    );
                }
            },

            // =====================================================
            // CSV FILE SELECT
            // =====================================================

            onCSVFileChange(oEvent) {

                const aFiles =
                    oEvent.getParameter("files");

                const oFile =
                    aFiles && aFiles.length
                        ? aFiles[0]
                        : null;

                const oUploadButton =
                    this._oCSVDialog.getBeginButton();

                const oUploader =
                    oEvent.getSource();


                // =====================================================
                // NO FILE
                // =====================================================

                if (!oFile) {

                    this._oCSVFile = null;

                    oUploadButton.setEnabled(false);

                    return;
                }


                // =====================================================
                // FILE TYPE VALIDATION
                // =====================================================

                if (
                    !oFile.name
                        .toLowerCase()
                        .endsWith(".csv")
                ) {

                    this._oCSVFile = null;

                    oUploadButton.setEnabled(false);

                    oUploader.clear();

                    MessageBox.error(
                        "Please select a CSV file."
                    );

                    return;
                }


                // =====================================================
                // STORE FILE
                // =====================================================

                this._oCSVFile = oFile;

                console.log(
                    "CSV file selected:",
                    oFile.name
                );

                console.log(
                    "CSV file size:",
                    oFile.size
                );


                // =====================================================
                // ENABLE UPLOAD
                // =====================================================

                oUploadButton.setEnabled(true);

                MessageToast.show(
                    "CSV file selected: " + oFile.name
                );
            },
            async onCSVUploadSave() {

                if (!this._oCSVFile) {

                    MessageBox.error(
                        "Please select a CSV file."
                    );

                    return;
                }


                try {

                    // =================================================
                    // READ CSV FILE
                    // =================================================

                    const oFile =
                        this._oCSVFile;

                    const sCSVContent =
                        await oFile.text();


                    console.log(
                        "CSV Content:",
                        sCSVContent
                    );


                    // =================================================
                    // PARSE CSV
                    // =================================================

                    const aCSVData =
                        this._parseCSV(
                            sCSVContent
                        );


                    console.log(
                        "Parsed CSV Data:",
                        aCSVData
                    );


                    // =================================================
                    // GET ODATA MODEL
                    // =================================================

                    const oModel =
                        this.getView().getModel();


                    // =================================================
                    // CREATE LIST BINDING
                    // =================================================

                    const oListBinding =
                        oModel.bindList(
                            "/Vehicles"
                        );


                    // =================================================
                    // CREATE EACH VEHICLE
                    // =================================================

                    let iSuccess = 0;


                    for (
                        const oRow of aCSVData
                    ) {

                        // ---------------------------------------------
                        // EXACT SAME PAYLOAD AS EXCEL
                        // ---------------------------------------------

                        const oVehicleData = {

                            modelname:
                                String(
                                    oRow.modelname
                                ).trim(),

                            currentPrice:
                                Number(
                                    oRow.currentPrice
                                ),

                            state_ID:
                                String(
                                    oRow.state_ID
                                ).trim()

                        };


                        console.log(
                            "Creating vehicle:",
                            oVehicleData
                        );


                        // ---------------------------------------------
                        // CREATE VEHICLE
                        // ---------------------------------------------

                        const oContext =
                            oListBinding.create(
                                oVehicleData
                            );


                        // ---------------------------------------------
                        // WAIT FOR BACKEND
                        // ---------------------------------------------

                        await oContext.created();


                        iSuccess++;
                    }


                    // =================================================
                    // SUCCESS
                    // =================================================

                    MessageToast.show(
                        `${iSuccess} vehicle(s) uploaded successfully.`
                    );


                    // =================================================
                    // CLOSE DIALOG
                    // =================================================

                    if (this._oCSVDialog) {

                        this._oCSVDialog.close();
                    }


                    // =================================================
                    // CLEAR FILE
                    // =================================================

                    this._oCSVFile = null;


                    // =================================================
                    // REFRESH TABLE
                    // =================================================

                    const oTable =
                        this.byId(
                            "vehicleTable"
                        );

                    const oTableBinding =
                        oTable.getBinding(
                            "items"
                        );


                    if (oTableBinding) {

                        oTableBinding.refresh();
                    }


                } catch (oError) {

                    console.error(
                        "CSV upload failed:",
                        oError
                    );


                    MessageBox.error(
                        oError.message ||
                        "Failed to upload CSV file."
                    );
                }
            },


            _parseCSV(sCSVContent) {

                const aLines = sCSVContent
                    .replace(/^\uFEFF/, "")
                    .trim()
                    .split(/\r?\n/)
                    .map(sLine => sLine.trim())
                    .filter(sLine => sLine !== "");

                if (aLines.length < 2) {

                    throw new Error(
                        "CSV file must contain a header and at least one data row."
                    );
                }


                const aCleanLines = aLines.map(sLine => {

                    if (
                        sLine.startsWith('"') &&
                        sLine.endsWith('"')
                    ) {

                        return sLine.substring(
                            1,
                            sLine.length - 1
                        );
                    }

                    return sLine;
                });


                // =====================================================
                // READ HEADERS
                // =====================================================

                const aHeaders =
                    aCleanLines[0]
                        .split(",")
                        .map(
                            sHeader =>
                                sHeader
                                    .replace(/^"|"$/g, "")
                                    .trim()
                        );


                console.log(
                    "Original CSV Headers:",
                    aHeaders
                );


                // =====================================================
                // NORMALIZE HEADERS
                // =====================================================

                const aNormalizedHeaders =
                    aHeaders.map(
                        sHeader =>
                            sHeader
                                .replace(/^"|"$/g, "")
                                .trim()
                                .toLowerCase()
                    );


                console.log(
                    "Normalized CSV Headers:",
                    aNormalizedHeaders
                );


                // =====================================================
                // REQUIRED COLUMNS
                // =====================================================

                const iModelName =
                    aNormalizedHeaders.indexOf(
                        "modelname"
                    );

                const iCurrentPrice =
                    aNormalizedHeaders.indexOf(
                        "currentprice"
                    );

                const iStateId =
                    aNormalizedHeaders.indexOf(
                        "state_id"
                    );


                // =====================================================
                // VALIDATE HEADERS
                // =====================================================

                if (iModelName === -1) {

                    throw new Error(
                        "Missing required column: modelname"
                    );
                }


                if (iCurrentPrice === -1) {

                    throw new Error(
                        "Missing required column: currentPrice"
                    );
                }


                if (iStateId === -1) {

                    throw new Error(
                        "Missing required column: state_ID"
                    );
                }


                // =====================================================
                // PARSE VEHICLES
                // =====================================================

                const aVehicles = [];


                for (
                    let i = 1;
                    i < aCleanLines.length;
                    i++
                ) {

                    const aValues =
                        aCleanLines[i]
                            .split(",")
                            .map(
                                sValue =>
                                    sValue
                                        .replace(/^"|"$/g, "")
                                        .trim()
                            );


                    // Skip empty row

                    if (
                        !aValues.length ||
                        aValues.every(
                            sValue => !sValue
                        )
                    ) {
                        continue;
                    }


                    // =================================================
                    // GET VALUES
                    // =================================================

                    const sModelName =
                        aValues[iModelName];

                    const sCurrentPrice =
                        aValues[iCurrentPrice];

                    const sStateId =
                        aValues[iStateId];


                    // =================================================
                    // VALIDATE MODEL NAME
                    // =================================================

                    if (!sModelName) {

                        throw new Error(
                            `Row ${i + 1}: Model Name is required.`
                        );
                    }


                    // =================================================
                    // VALIDATE CURRENT PRICE
                    // =================================================

                    const nCurrentPrice =
                        Number(
                            sCurrentPrice
                        );


                    if (
                        !sCurrentPrice ||
                        Number.isNaN(nCurrentPrice) ||
                        nCurrentPrice <= 0
                    ) {

                        throw new Error(
                            `Row ${i + 1}: Current Price must be greater than 0.`
                        );
                    }


                    // =================================================
                    // VALIDATE STATE
                    // =================================================

                    if (!sStateId) {

                        throw new Error(
                            `Row ${i + 1}: State ID is required.`
                        );
                    }


                    // =================================================
                    // CREATE VEHICLE OBJECT
                    // =================================================

                    const oVehicleData = {

                        modelname:
                            String(
                                sModelName
                            ).trim(),

                        currentPrice:
                            nCurrentPrice,

                        state_ID:
                            String(
                                sStateId
                            ).trim()

                    };


                    console.log(
                        `CSV Row ${i + 1}:`,
                        oVehicleData
                    );


                    aVehicles.push(
                        oVehicleData
                    );
                }


                // =====================================================
                // CHECK RESULT
                // =====================================================

                if (!aVehicles.length) {

                    throw new Error(
                        "No valid vehicle records found in CSV."
                    );
                }


                console.log(
                    "Parsed CSV Vehicles:",
                    aVehicles
                );


                return aVehicles;
            },

            onCSVUploadCancel() {

                // =====================================================
                // CLOSE DIALOG
                // =====================================================

                if (this._oCSVDialog) {

                    this._oCSVDialog.close();
                }


                // =====================================================
                // CLEAR FILE
                // =====================================================

                this._oCSVFile = null;


                // =====================================================
                // CLEAR UPLOADER
                // =====================================================

                const oUploader =
                    Fragment.byId(
                        this.getView().getId(),
                        "csvUploader"
                    );


                if (oUploader) {

                    oUploader.clear();
                }


                // =====================================================
                // DISABLE UPLOAD BUTTON
                // =====================================================

                if (this._oCSVDialog) {

                    const oUploadButton =
                        this._oCSVDialog.getBeginButton();

                    if (oUploadButton) {

                        oUploadButton.setEnabled(
                            false
                        );
                    }
                }
            },


            // =====================================================
            // MULTIPLE CREATE
            // =====================================================

            async onMultipleCreate() {

                try {

                    if (!this._oMultipleCreateDialog) {

                        this._oMultipleCreateDialog =
                            await Fragment.load({

                                id: this.getView().getId(),

                                name:
                                    "vehicleordermanagement.fragment.MultipleCreate",

                                controller: this

                            });

                        this.getView().addDependent(
                            this._oMultipleCreateDialog
                        );
                    }

                    const oModel =
                        new JSONModel({
                            vehicles: [
                                {
                                    modelname: "",
                                    currentPrice: "",
                                    state_ID: ""
                                }
                            ]
                        });

                    this._oMultipleCreateDialog.setModel(
                        oModel,
                        "multipleCreate"
                    );

                    this._oMultipleCreateDialog.open();

                } catch (oError) {

                    console.error(
                        "Multiple Create dialog error:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to open Multiple Create dialog."
                    );
                }
            },
            onAddVehicleRow() {

                const oModel =
                    this._oMultipleCreateDialog.getModel(
                        "multipleCreate"
                    );

                const aVehicles =
                    oModel.getProperty("/vehicles");

                aVehicles.push({

                    modelname: "",
                    currentPrice: "",
                    state_ID: ""

                });

                oModel.setProperty(
                    "/vehicles",
                    aVehicles
                );
            },
            onRemoveVehicleRow(oEvent) {

                const oContext =
                    oEvent
                        .getSource()
                        .getBindingContext("multipleCreate");

                const iIndex =
                    Number(
                        oContext.getPath().split("/").pop()
                    );

                const oModel =
                    this._oMultipleCreateDialog.getModel(
                        "multipleCreate"
                    );

                const aVehicles =
                    oModel.getProperty("/vehicles");

                aVehicles.splice(iIndex, 1);

                oModel.setProperty(
                    "/vehicles",
                    aVehicles
                );
            },
            async onMultipleCreateSave() {

                if (this._bMultipleSaving) {
                    return;
                }

                const oDialog =
                    this._oMultipleCreateDialog;

                if (!oDialog) {
                    MessageBox.error(
                        "Multiple Create dialog is not available."
                    );
                    return;
                }

                const oMultipleModel =
                    oDialog.getModel("multipleCreate");

                const aVehicles =
                    oMultipleModel.getProperty("/vehicles");

                if (!aVehicles || !aVehicles.length) {

                    MessageBox.error(
                        "Please add at least one vehicle."
                    );

                    return;
                }

                // =====================================================
                // VALIDATION
                // =====================================================

                for (let i = 0; i < aVehicles.length; i++) {

                    const oVehicle =
                        aVehicles[i];

                    if (
                        !oVehicle.modelname ||
                        !oVehicle.modelname.trim()
                    ) {

                        MessageBox.error(
                            `Row ${i + 1}: Model Name is required.`
                        );

                        return;
                    }

                    if (
                        oVehicle.currentPrice === undefined ||
                        oVehicle.currentPrice === null ||
                        Number(oVehicle.currentPrice) <= 0
                    ) {

                        MessageBox.error(
                            `Row ${i + 1}: Current Price must be greater than 0.`
                        );

                        return;
                    }

                    if (!oVehicle.state_ID) {

                        MessageBox.error(
                            `Row ${i + 1}: State is required.`
                        );

                        return;
                    }
                }

                // =====================================================
                // TABLE
                // =====================================================

                const oTable =
                    this.byId("vehicleTable");

                const oTableBinding =
                    oTable.getBinding("items");

                if (!oTableBinding) {

                    MessageBox.error(
                        "Vehicle table binding is not available."
                    );

                    return;
                }

                this._bMultipleSaving = true;

                try {

                    // =================================================
                    // CREATE VEHICLES
                    // =================================================

                    const aCreatedContexts = [];

                    for (const oVehicle of aVehicles) {

                        const oVehicleData = {

                            modelname:
                                String(
                                    oVehicle.modelname
                                ).trim(),

                            currentPrice:
                                Number(
                                    oVehicle.currentPrice
                                ),

                            state_ID:
                                String(
                                    oVehicle.state_ID
                                ).trim()

                        };

                        console.log(
                            "Creating vehicle:",
                            oVehicleData
                        );

                        const oContext =
                            oTableBinding.create(
                                oVehicleData
                            );

                        aCreatedContexts.push(
                            oContext
                        );
                    }

                    // =================================================
                    // SUBMIT SAME GROUP
                    // =================================================

                    await this.getView()
                        .getModel()
                        .submitBatch(
                            "multipleCreate"
                        );

                    // =================================================
                    // WAIT FOR CREATION
                    // =================================================

                    await Promise.all(
                        aCreatedContexts.map(
                            oContext =>
                                oContext.created()
                        )
                    );

                    console.log(
                        "All vehicles created successfully."
                    );

                    // =================================================
                    // REFRESH TABLE
                    // =================================================

                    await oTableBinding.requestRefresh();

                    // =================================================
                    // CLOSE DIALOG
                    // =================================================

                    oDialog.close();

                    // =================================================
                    // CLEAR DATA
                    // =================================================

                    oMultipleModel.setProperty(
                        "/vehicles",
                        [
                            {
                                modelname: "",
                                currentPrice: "",
                                state_ID: ""
                            }
                        ]
                    );

                    // =================================================
                    // SUCCESS MESSAGE
                    // =================================================

                    MessageToast.show(
                        `${aVehicles.length} vehicle(s) created successfully.`
                    );

                } catch (oError) {

                    console.error(
                        "Multiple vehicle creation failed:",
                        oError
                    );

                    MessageBox.error(
                        oError.message ||
                        "Failed to create vehicles."
                    );

                } finally {

                    this._bMultipleSaving = false;
                }
            },
            onMultipleCreateCancel() {

                if (this._oMultipleCreateDialog) {

                    this._oMultipleCreateDialog.close();

                }

            },



            async onMultipleEdit() {

                try {

                    const oTable =
                        this.byId("vehicleTable");

                    const aContexts =
                        oTable.getSelectedContexts();

                    if (!aContexts.length) {

                        MessageBox.warning(
                            "Please select at least one vehicle."
                        );

                        return;
                    }

                    // =====================================================
                    // STORE ORIGINAL ODATA V4 CONTEXTS
                    // =====================================================

                    this._aMultipleEditContexts =
                        aContexts;

                    // =====================================================
                    // LOAD DIALOG
                    // =====================================================

                    if (!this._oMultipleEditDialog) {

                        this._oMultipleEditDialog =
                            await Fragment.load({

                                id: this.getView().getId(),

                                name:
                                    "vehicleordermanagement.fragment.MultipleEdit",

                                controller: this

                            });

                        this.getView().addDependent(
                            this._oMultipleEditDialog
                        );
                    }

                    // =====================================================
                    // PREPARE EDIT DATA
                    // =====================================================

                    const aVehicles = [];

                    for (const oContext of aContexts) {

                        const oData =
                            oContext.getObject();

                        aVehicles.push({

                            ID:
                                oData.ID,

                            modelname:
                                oData.modelname || "",

                            currentPrice:
                                oData.currentPrice ?? "",

                            state_ID:
                                oData.state_ID || ""

                        });
                    }

                    // =====================================================
                    // CREATE JSON MODEL
                    // =====================================================

                    const oMultipleEditModel =
                        new JSONModel({

                            vehicles:
                                aVehicles

                        });

                    this._oMultipleEditDialog.setModel(
                        oMultipleEditModel,
                        "multipleEdit"
                    );

                    // =====================================================
                    // OPEN DIALOG
                    // =====================================================

                    this._oMultipleEditDialog.open();

                } catch (oError) {

                    console.error(
                        "Multiple Edit dialog error:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to open Multiple Edit dialog."
                    );
                }
            },

            // ----------------------------------------------------

            async onMultipleEditSave() {

                // =====================================================
                // PREVENT DOUBLE SAVE
                // =====================================================

                if (this._bMultipleEditSaving) {
                    return;
                }


                // =====================================================
                // GET DIALOG
                // =====================================================

                const oDialog =
                    this._oMultipleEditDialog;


                if (!oDialog) {

                    MessageBox.error(
                        "Multiple Edit dialog is not available."
                    );

                    return;
                }


                // =====================================================
                // GET JSON MODEL
                // =====================================================

                const oEditModel =
                    oDialog.getModel("multipleEdit");


                if (!oEditModel) {

                    MessageBox.error(
                        "Multiple Edit model is not available."
                    );

                    return;
                }


                // =====================================================
                // GET VEHICLES
                // =====================================================

                const aVehicles =
                    oEditModel.getProperty("/vehicles");


                if (
                    !aVehicles ||
                    !aVehicles.length
                ) {

                    MessageBox.warning(
                        "No vehicles selected for editing."
                    );

                    return;
                }


                // =====================================================
                // VALIDATION
                // =====================================================

                for (
                    let i = 0;
                    i < aVehicles.length;
                    i++
                ) {

                    const oVehicle =
                        aVehicles[i];


                    // -------------------------------------------------
                    // MODEL NAME
                    // -------------------------------------------------

                    if (
                        !oVehicle.modelname ||
                        !oVehicle.modelname.trim()
                    ) {

                        MessageBox.error(
                            `Row ${i + 1}: Model Name is required.`
                        );

                        return;
                    }


                    // -------------------------------------------------
                    // CURRENT PRICE
                    // -------------------------------------------------

                    if (
                        oVehicle.currentPrice === undefined ||
                        oVehicle.currentPrice === null ||
                        Number(oVehicle.currentPrice) <= 0
                    ) {

                        MessageBox.error(
                            `Row ${i + 1}: Current Price must be greater than 0.`
                        );

                        return;
                    }


                    // -------------------------------------------------
                    // STATE
                    // -------------------------------------------------

                    if (!oVehicle.state_ID) {

                        MessageBox.error(
                            `Row ${i + 1}: State is required.`
                        );

                        return;
                    }
                }


                // =====================================================
                // GET ORIGINAL ODATA V4 CONTEXTS
                // =====================================================

                const aContexts =
                    this._aMultipleEditContexts;


                if (
                    !aContexts ||
                    aContexts.length !== aVehicles.length
                ) {

                    MessageBox.error(
                        "Vehicle contexts are not available. Please select the vehicles again."
                    );

                    return;
                }


                // =====================================================
                // START SAVING
                // =====================================================

                this._bMultipleEditSaving = true;


                try {

                    // =================================================
                    // GET ODATA MODEL
                    // =================================================

                    const oModel =
                        this.getView().getModel();


                    // =================================================
                    // UPDATE SELECTED VEHICLES
                    // =================================================

                    for (
                        let i = 0;
                        i < aVehicles.length;
                        i++
                    ) {

                        const oVehicle =
                            aVehicles[i];


                        const oContext =
                            aContexts[i];


                        // -------------------------------------------------
                        // CHECK CONTEXT
                        // -------------------------------------------------

                        if (
                            !oContext ||
                            typeof oContext.setProperty !== "function"
                        ) {

                            throw new Error(
                                `Invalid OData context for vehicle ${oVehicle.ID}.`
                            );
                        }


                        // =================================================
                        // MODEL NAME
                        // =================================================

                        oContext.setProperty(
                            "modelname",
                            String(
                                oVehicle.modelname
                            ).trim(),
                            "multipleEdit"
                        );


                        // =================================================
                        // CURRENT / NEW PRICE
                        // =================================================

                        oContext.setProperty(
                            "currentPrice",
                            Number(
                                oVehicle.currentPrice
                            ),
                            "multipleEdit"
                        );


                        // =================================================
                        // STATE
                        // =================================================

                        oContext.setProperty(
                            "state_ID",
                            String(
                                oVehicle.state_ID
                            ).trim(),
                            "multipleEdit"
                        );


                        console.log(
                            `Vehicle ${oVehicle.ID} update prepared.`
                        );
                    }


                    // =====================================================
                    // SUBMIT MULTIPLE EDIT BATCH
                    // =====================================================

                    await oModel.submitBatch(
                        "multipleEdit"
                    );


                    console.log(
                        "Multiple vehicle update batch submitted successfully."
                    );


                    oDialog.close();

                    const oTable =
                        this.byId("vehicleTable");


                    if (oTable) {

                        oTable.removeSelections(
                            true
                        );
                    }

                    this._aMultipleEditContexts =
                        null;

                    MessageToast.show(
                        `${aVehicles.length} vehicle(s) updated successfully.`
                    );


                } catch (oError) {

                    console.error(
                        "Multiple vehicle update failed:",
                        oError
                    );


                    MessageBox.error(
                        oError.message ||
                        "Failed to update vehicles."
                    );


                } finally {

                    this._bMultipleEditSaving =
                        false;
                }
            },



            onMultipleEditCancel() {

                if (this._oMultipleEditDialog) {

                    this._oMultipleEditDialog.close();

                }

            },



        }
    );
});




