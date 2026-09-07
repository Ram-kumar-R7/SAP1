sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "../model/formatter"
], (
    Controller,
    UIComponent,
    MessageToast,
    MessageBox,
    Fragment,
    formatter
) => {

    "use strict";

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png"];

    return Controller.extend(
        "vehicleordermanagement.controller.VehicleDetails",
        {

            formatter: formatter,

            onInit() {

                const oRouter =
                    UIComponent.getRouterFor(this);

                oRouter
                    .getRoute("VehicleDetails")
                    .attachPatternMatched(
                        this._onObjectMatched,
                        this
                    );

                this._oImageFile = null;
            },

            // ... rest of the controller exactly as in my last message
        }
    );
});