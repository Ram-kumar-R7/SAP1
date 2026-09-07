sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], (
    Controller,
    UIComponent,
    MessageToast,
    MessageBox,
    Fragment
) => {

    "use strict";

    return Controller.extend(
        "vehicleordermanagement.controller.VehicleDetails",
        {

            // =====================================================
            // INIT
            // =====================================================

            onInit() {

                const oRouter =
                    UIComponent.getRouterFor(this);

                oRouter
                    .getRoute("VehicleDetails")
                    .attachPatternMatched(
                        this._onObjectMatched,
                        this
                    );
            },


            // =====================================================
            // VEHICLE SELECTED
            // =====================================================

            _onObjectMatched(oEvent) {

                const sVehicleId =
                    oEvent
                        .getParameter("arguments")
                        .vehicleId;

                const sPath =
                    `/Vehicles('${sVehicleId}')`;

                this.getView().bindElement({

                    path: sPath,

                    parameters: {
                        $expand: "state"
                    },

                    events: {
                        dataReceived: () => {
                            this._displayVehicleImage();
                        }
                    }

                });
            },


            // =====================================================
            // DATA RECEIVED
            // =====================================================

            _onVehicleDataReceived(oEvent) {

                const oData =
                    oEvent.getParameter("data");

                if (!oData) {
                    return;
                }

                this._displayVehicleImage(oData);
            },


            // =====================================================
            // DISPLAY IMAGE
            // =====================================================

            _displayVehicleImage() {

                const oContext = this.getView().getBindingContext();

                if (!oContext) {
                    return;
                }

                const oData = oContext.getObject();

                const oImage = this.byId("vehicleImage");
                const oNoImageText = this.byId("noImageText");

                if (!oData || !oData.ID) {

                    oImage.setVisible(false);
                    oNoImageText.setVisible(true);

                    return;
                }

                // No image uploaded
                if (!oData.imageType) {

                    oImage.setVisible(false);
                    oNoImageText.setVisible(true);

                    return;
                }

                const oModel = this.getView().getModel();

                const sServiceUrl = oModel.sServiceUrl;

                const sImageUrl =
                    `${sServiceUrl}Vehicles('${encodeURIComponent(oData.ID)}')/image`;

                console.log("Vehicle image URL:", sImageUrl);

                oImage.setSrc(sImageUrl);

                oImage.setVisible(true);
                oNoImageText.setVisible(false);
            },

            // =====================================================
            // CONVERT BINARY
            // =====================================================

            _convertBinaryToUint8Array(oBinary) {

                if (
                    oBinary instanceof ArrayBuffer
                ) {

                    return new Uint8Array(
                        oBinary
                    );
                }


                if (
                    oBinary instanceof Uint8Array
                ) {

                    return oBinary;
                }


                // Base64 string
                if (
                    typeof oBinary === "string"
                ) {

                    const sBase64 =
                        oBinary;

                    const sBinary =
                        atob(sBase64);

                    const aBytes =
                        new Uint8Array(
                            sBinary.length
                        );


                    for (
                        let i = 0;
                        i < sBinary.length;
                        i++
                    ) {

                        aBytes[i] =
                            sBinary.charCodeAt(i);
                    }

                    return aBytes;
                }


                throw new Error(
                    "Unsupported image format."
                );
            },


            // =====================================================
            // UPLOAD IMAGE
            // =====================================================
            async onUploadImage() {

                this._oImageFile = null;

                if (!this._oImageUploadDialog) {

                    this._oImageUploadDialog = await Fragment.load({
                        id: this.getView().getId(),
                        name: "vehicleordermanagement.fragment.ImageUpload",
                        controller: this
                    });

                    this.getView().addDependent(
                        this._oImageUploadDialog
                    );
                }

                const oUploader = Fragment.byId(
                    this.getView().getId(),
                    "vehicleImageUploader"
                );

                if (oUploader) {
                    oUploader.clear();
                }

                this._oImageUploadDialog.open();
            },


            // =====================================================
            // IMAGE FILE SELECT
            // =====================================================

            onImageFileChange(oEvent) {

                const oUploader = oEvent.getSource();

                const aFiles = oEvent.getParameter("files");

                const oFile =
                    aFiles && aFiles.length
                        ? aFiles[0]
                        : null;

                const oUploadButton =
                    this._oImageUploadDialog.getBeginButton();

                const oErrorText =
                    Fragment.byId(
                        this.getView().getId(),
                        "imageErrorText"
                    );


                // ==========================================
                // NO FILE
                // ==========================================

                if (!oFile) {

                    this._oImageFile = null;

                    oUploadButton.setEnabled(false);

                    if (oErrorText) {
                        oErrorText.setText(
                            "Please select an image."
                        );

                        oErrorText.setVisible(true);
                    }

                    return;
                }


                // ==========================================
                // FILE TYPE VALIDATION
                // ==========================================

                const aAllowedTypes = [
                    "image/jpeg",
                    "image/png"
                ];

                if (!aAllowedTypes.includes(oFile.type)) {

                    this._oImageFile = null;

                    oUploadButton.setEnabled(false);

                    oUploader.clear();

                    if (oErrorText) {
                        oErrorText.setText(
                            "Please select a JPG or PNG image."
                        );

                        oErrorText.setVisible(true);
                    }

                    return;
                }


                // ==========================================
                // FILE SIZE VALIDATION
                // ==========================================

                const iMaxSize =
                    5 * 1024 * 1024;

                if (oFile.size > iMaxSize) {

                    this._oImageFile = null;

                    oUploadButton.setEnabled(false);

                    oUploader.clear();

                    if (oErrorText) {
                        oErrorText.setText(
                            "Image size must not exceed 5 MB."
                        );

                        oErrorText.setVisible(true);
                    }

                    return;
                }


                // ==========================================
                // VALID FILE
                // ==========================================

                this._oImageFile = oFile;

                console.log(
                    "Selected file:",
                    oFile.name
                );

                console.log(
                    "File type:",
                    oFile.type
                );

                console.log(
                    "File size:",
                    oFile.size
                );


                // ==========================================
                // ENABLE UPLOAD BUTTON
                // ==========================================

                oUploadButton.setEnabled(true);


                // ==========================================
                // HIDE ERROR
                // ==========================================

                if (oErrorText) {
                    oErrorText.setVisible(false);
                }
            },

            // =====================================================
            // SAVE IMAGE
            // =====================================================

            async onImageUploadSave() {

                if (!this._oImageFile) {

                    MessageBox.error(
                        "Please select an image."
                    );

                    return;
                }

                try {

                    const oFile =
                        this._oImageFile;

                    // =============================================
                    // GET VEHICLE CONTEXT
                    // =============================================

                    const oContext =
                        this.getView().getBindingContext();

                    if (!oContext) {

                        MessageBox.error(
                            "Vehicle information not found."
                        );

                        return;
                    }


                    const oVehicle =
                        oContext.getObject();

                    const sVehicleId =
                        oVehicle.ID;


                    // =============================================
                    // SERVICE URL
                    // =============================================

                    const oModel =
                        this.getView().getModel();

                    const sServiceUrl =
                        oModel.sServiceUrl;


                    // =============================================
                    // BUILD MEDIA URL
                    // =============================================

                    const sImageUrl =
                        `${sServiceUrl}Vehicles('${encodeURIComponent(sVehicleId)}')/image`;


                    console.log(
                        "Image upload URL:",
                        sImageUrl
                    );


                    // =============================================
                    // GET CSRF TOKEN
                    // =============================================

                    const oTokenResponse =
                        await fetch(
                            sServiceUrl,
                            {
                                method: "GET",
                                headers: {
                                    "X-CSRF-Token": "Fetch"
                                },
                                credentials: "same-origin"
                            }
                        );


                    const sCsrfToken =
                        oTokenResponse.headers.get(
                            "X-CSRF-Token"
                        );


                    // =============================================
                    // UPLOAD IMAGE
                    // =============================================

                    const oUploadResponse =
                        await fetch(
                            sImageUrl,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type": oFile.type,

                                    ...(sCsrfToken
                                        ? {
                                            "X-CSRF-Token":
                                                sCsrfToken
                                        }
                                        : {})
                                },

                                body: oFile,

                                credentials: "same-origin"
                            }
                        );


                    // =============================================
                    // CHECK RESPONSE
                    // =============================================

                    if (!oUploadResponse.ok) {

                        const sError =
                            await oUploadResponse.text();

                        console.error(
                            "Image upload response:",
                            sError
                        );

                        throw new Error(
                            `Image upload failed (${oUploadResponse.status})`
                        );
                    }


                    // =============================================
                    // SUCCESS
                    // =============================================

                    MessageToast.show(
                        "Vehicle image uploaded successfully."
                    );


                    // =============================================
                    // CLOSE DIALOG
                    // =============================================

                    if (this._oImageUploadDialog) {

                        this._oImageUploadDialog.close();
                    }


                    // =============================================
                    // CLEAR FILE
                    // =============================================

                    this._oImageFile = null;


                    const oUploader =
                        this.byId("vehicleImageUploader");

                    if (oUploader) {

                        oUploader.clear();
                    }


                    // =============================================
                    // DISPLAY IMAGE
                    // =============================================

                    this._displayVehicleImage();

                } catch (oError) {

                    console.error(
                        "Image upload failed:",
                        oError
                    );

                    MessageBox.error(
                        oError.message ||
                        "Failed to upload image."
                    );
                }
            },




            // =====================================================
            // CANCEL IMAGE UPLOAD
            // =====================================================

            onImageUploadCancel() {

                if (this._oImageUploadDialog) {

                    this._oImageUploadDialog.close();
                }

                this._oImageFile = null;

                const oUploader =
                    this.byId("vehicleImageUploader");

                if (oUploader) {

                    oUploader.clear();
                }
            },



            async onPDFUpload() {

                if (this._bPDFUploading) {
                    return;
                }

                // =====================================================
                // GET VEHICLE CONTEXT
                // =====================================================

                const oContext =
                    this._oPDFVehicleContext;

                if (!oContext) {

                    MessageBox.error(
                        "Vehicle details are not available."
                    );

                    return;
                }


                // =====================================================
                // GET SELECTED PDF
                // =====================================================

                const oFile =
                    this._oSelectedPDF;

                if (!oFile) {

                    MessageBox.warning(
                        "Please select a PDF file."
                    );

                    return;
                }


                this._bPDFUploading =
                    true;


                try {

                    // =================================================
                    // GET VEHICLE ID
                    // =================================================

                    const sVehicleID =
                        oContext.getProperty("ID");

                    if (!sVehicleID) {

                        throw new Error(
                            "Vehicle ID is not available."
                        );
                    }


                    console.log(
                        "Uploading PDF for vehicle:",
                        sVehicleID
                    );


                    // =================================================
                    // GET ODATA MODEL
                    // =================================================

                    const oModel =
                        this.getView().getModel();


                    // =================================================
                    // SERVICE URL
                    // =================================================

                    let sServiceUrl =
                        oModel.sServiceUrl;

                    sServiceUrl =
                        sServiceUrl.trim().replace(
                            /\/+$/,
                            ""
                        );


                    // =================================================
                    // CORRECT PDF URL
                    // =================================================

                    const sPDFUrl =
                        `${sServiceUrl}/Vehicles('${encodeURIComponent(sVehicleID)}')/pdf`;


                    console.log(
                        "PDF URL:",
                        sPDFUrl
                    );


                    // =================================================
                    // GET CSRF TOKEN
                    // =================================================

                    const oTokenResponse =
                        await fetch(
                            `${sServiceUrl}/$metadata`,
                            {
                                method: "GET",

                                headers: {
                                    "X-CSRF-Token": "Fetch"
                                },

                                credentials:
                                    "same-origin"
                            }
                        );


                    const sCSRFToken =
                        oTokenResponse.headers.get(
                            "X-CSRF-Token"
                        );


                    // =================================================
                    // UPLOAD PDF
                    // =================================================

                    const oResponse =
                        await fetch(
                            sPDFUrl,
                            {
                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/pdf",

                                    "X-CSRF-Token":
                                        sCSRFToken || ""

                                },

                                body:
                                    oFile,

                                credentials:
                                    "same-origin"
                            }
                        );


                    // =================================================
                    // CHECK RESPONSE
                    // =================================================

                    if (!oResponse.ok) {

                        const sError =
                            await oResponse.text();

                        throw new Error(
                            `PDF upload failed (${oResponse.status}): ${sError}`
                        );
                    }


                    // =================================================
                    // SUCCESS
                    // =================================================

                    console.log(
                        "PDF uploaded successfully."
                    );


                    MessageToast.show(
                        `PDF uploaded successfully for ${sVehicleID}.`
                    );


                    // =================================================
                    // CLOSE DIALOG
                    // =================================================

                    if (this._oUploadPDFDialog) {

                        this._oUploadPDFDialog.close();
                    }


                    // =================================================
                    // CLEAR PDF
                    // =================================================

                    this._oSelectedPDF =
                        null;

                    this._oPDFVehicleContext =
                        null;


                    // =================================================
                    // CLEAR UPLOADER
                    // =================================================

                    const oUploader =
                        this.byId("pdfUploader");

                    if (oUploader) {

                        oUploader.clear();
                    }


                    // =================================================
                    // RESET FILE NAME
                    // =================================================

                    const oSelectedPDFText =
                        this.byId("selectedPDFText");

                    if (oSelectedPDFText) {

                        oSelectedPDFText.setText(
                            "No PDF selected"
                        );
                    }


                } catch (oError) {

                    console.error(
                        "PDF upload failed:",
                        oError
                    );

                    MessageBox.error(
                        oError.message ||
                        "Failed to upload PDF."
                    );

                } finally {

                    this._bPDFUploading =
                        false;
                }
            },
            onPDFSelected(oEvent) {

                const oFile =
                    oEvent.getParameter("files")?.[0];

                if (!oFile) {

                    this._oSelectedPDF = null;

                    return;
                }


                if (
                    oFile.type !== "application/pdf"
                ) {

                    MessageBox.error(
                        "Please select a PDF file."
                    );

                    this._oSelectedPDF = null;

                    return;
                }


                this._oSelectedPDF =
                    oFile;


                console.log(
                    "PDF selected successfully:",
                    oFile
                );


                const oText =
                    this.byId("selectedPDFText");

                if (oText) {

                    oText.setText(
                        `Selected: ${oFile.name}`
                    );
                }
            },

            async onPDFUpload() {

                // =====================================================
                // PREVENT DOUBLE CLICK
                // =====================================================

                if (this._bPDFUploading) {
                    return;
                }


                // =====================================================
                // CHECK SELECTED VEHICLE
                // =====================================================

                const oContext =
                    this._oPDFVehicleContext;

                if (!oContext) {

                    MessageBox.warning(
                        "Please select a vehicle first."
                    );

                    return;
                }


                // =====================================================
                // CHECK SELECTED PDF
                // =====================================================

                const oFile =
                    this._oSelectedPDF;

                if (!oFile) {

                    MessageBox.warning(
                        "Please select a PDF file."
                    );

                    return;
                }


                this._bPDFUploading = true;


                try {

                    // =================================================
                    // GET VEHICLE ID
                    // =================================================

                    const sVehicleID =
                        oContext.getProperty("ID");

                    if (!sVehicleID) {

                        throw new Error(
                            "Vehicle ID is not available."
                        );
                    }


                    console.log(
                        "Uploading PDF for vehicle:",
                        sVehicleID
                    );


                    // =================================================
                    // GET ODATA MODEL
                    // =================================================

                    const oModel =
                        this.getView().getModel();


                    // =================================================
                    // GET SERVICE URL
                    // =================================================

                    const sServiceUrl =
                        oModel.sServiceUrl;


                    // =================================================
                    // BUILD PDF MEDIA URL
                    // =================================================

                    const sPDFUrl =
                        `${sServiceUrl} / Vehicles('${encodeURIComponent(sVehicleID)}') / pdf / $value`;


                    console.log(
                        "PDF URL:",
                        sPDFUrl
                    );


                    // =================================================
                    // READ PDF FILE
                    // =================================================

                    const aBuffer =
                        await oFile.arrayBuffer();


                    // =================================================
                    // GET CSRF TOKEN
                    // =================================================

                    const oHeaders =
                        oModel.getHttpHeaders();

                    const sCSRFToken =
                        oHeaders["X-CSRF-Token"];


                    // =================================================
                    // UPLOAD PDF
                    // =================================================

                    const oResponse =
                        await fetch(
                            sPDFUrl,
                            {
                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/pdf",

                                    "X-CSRF-Token":
                                        sCSRFToken

                                },

                                body:
                                    aBuffer,

                                credentials:
                                    "same-origin"
                            }
                        );


                    // =================================================
                    // CHECK RESPONSE
                    // =================================================

                    if (!oResponse.ok) {

                        const sErrorText =
                            await oResponse.text();

                        throw new Error(
                            `PDF upload failed(${oResponse.status}): ${sErrorText}`
                        );
                    }


                    console.log(
                        "PDF uploaded successfully."
                    );


                    // =================================================
                    // CLOSE DIALOG
                    // =================================================

                    if (this._oUploadPDFDialog) {

                        this._oUploadPDFDialog.close();
                    }


                    // =================================================
                    // CLEAR PDF DATA
                    // =================================================

                    this._oSelectedPDF =
                        null;

                    this._oPDFVehicleContext =
                        null;


                    // =================================================
                    // SUCCESS MESSAGE
                    // =================================================

                    MessageToast.show(
                        `PDF uploaded successfully for ${sVehicleID}.`
                    );


                } catch (oError) {

                    console.error(
                        "PDF upload failed:",
                        oError
                    );


                    MessageBox.error(
                        oError.message ||
                        "Failed to upload PDF."
                    );


                } finally {

                    this._bPDFUploading = false;
                }
            },

            onPDFDialogCancel() {

                if (this._oUploadPDFDialog) {

                    this._oUploadPDFDialog.close();
                }

                this._oSelectedPDF =
                    null;
            },



            async onUploadPDF() {

                try {

                    // ==========================================
                    // GET VEHICLE CONTEXT
                    // ==========================================

                    const oContext =
                        this.getView().getBindingContext();

                    if (!oContext) {

                        MessageBox.error(
                            "Vehicle details are not available."
                        );

                        return;
                    }


                    // ==========================================
                    // GET VEHICLE ID
                    // ==========================================

                    const sVehicleID =
                        oContext.getProperty("ID");

                    if (!sVehicleID) {

                        MessageBox.error(
                            "Vehicle ID is not available."
                        );

                        return;
                    }


                    console.log(
                        "Vehicle selected for PDF upload:",
                        sVehicleID
                    );


                    // ==========================================
                    // STORE CONTEXT
                    // ==========================================

                    this._oPDFVehicleContext =
                        oContext;


                    // ==========================================
                    // LOAD FRAGMENT
                    // ==========================================

                    if (!this._oUploadPDFDialog) {

                        console.log(
                            "Loading UploadPDF fragment..."
                        );

                        this._oUploadPDFDialog =
                            await Fragment.load({

                                id:
                                    this.getView().getId(),

                                name:
                                    "vehicleordermanagement.fragment.UploadPDF",

                                controller:
                                    this

                            });

                        console.log(
                            "UploadPDF fragment loaded:",
                            this._oUploadPDFDialog
                        );


                        // ======================================
                        // ADD DEPENDENT
                        // ======================================

                        this.getView().addDependent(
                            this._oUploadPDFDialog
                        );
                    }


                    // ==========================================
                    // OPEN DIALOG
                    // ==========================================

                    this._oUploadPDFDialog.open();

                    console.log(
                        "Upload PDF dialog opened."
                    );


                } catch (oError) {

                    console.error(
                        "Upload PDF fragment error:",
                        oError
                    );

                    MessageBox.error(
                        oError.message ||
                        "Unable to open PDF upload dialog."
                    );
                }
            },




            // =====================================================
            // PDF
            // =====================================================

            // onUploadPDF() {

            //     MessageToast.show(
            //         "PDF upload will be added next."
            //     );
            // },


            // =====================================================
            // BACK
            // =====================================================

            onNavBack() {

                window.history.back();

            },


            // =====================================================
            // CLEANUP
            // =====================================================

            onExit() {

                if (this._sImageUrl) {

                    URL.revokeObjectURL(
                        this._sImageUrl
                    );

                    this._sImageUrl = null;
                }
            }

        }
    );
});









