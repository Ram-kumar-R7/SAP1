namespace my.Showroom;

using { managed } from '@sap/cds/common';

// =====================================================
// TYPES
// =====================================================

type PhoneNumber : String(10);
type Email       : String(50);


// =====================================================
// ADDRESS
// =====================================================

type Address {
    street  : String(200);
    city    : String(100);
    pincode : String(6);
}


// =====================================================
// CUSTOMER
// =====================================================

entity Customer : managed {

    key ID : String(20);

    customerName : String(100);
    phoneNo      : PhoneNumber;
    email        : Email;

    addressDetail : Address;
}


// =====================================================
// STATE
// =====================================================

entity State {

    key ID : String(20);

    name      : String(100);
    stateCode : String(10);
    tax       : Decimal(11,2);
}


// =====================================================
// VEHICLES
// =====================================================

entity Vehicles : managed {
    key ID : String;

    modelname    : String(100);
    currentPrice : Decimal(11,2);
    oldPrice     : Decimal(11,2);
    taxPrice     : Decimal(11,2);
    totalPrice   : Decimal(11,2);

    status : String enum {
        Available;
        Approved;
        Rejected;
    } default 'Available';

    state : Association to State;

    // =========================================
    // VEHICLE IMAGE
    // =========================================

    image     : LargeBinary @Core.MediaType: 'imageType' @Core.ContentDisposition.Type: 'inline';

    imageType : String(100) @Core.IsMediaType : true;

        pdf     : LargeBinary
        @Core.MediaType: 'pdfType'
        @Core.ContentDisposition.Type: 'inline';

    pdfType : String(100)
        @Core.IsMediaType : true;

    orders : Composition of many Orders
        on orders.vehicle = $self;
}


// =====================================================
// ORDERS
// =====================================================

entity Orders : managed {

    key ID : String(20);

    quantity : Integer;

    // Order belongs to one Customer
    customer : Association to Customer;

    // Order belongs to one Vehicle
    vehicle : Association to Vehicles;

    // One Order can have many Payments
    payments : Composition of many Payments
        on payments.order = $self;
}


// =====================================================
// PAYMENTS
// =====================================================

entity Payments : managed {

    key ID : UUID;

    amount : Decimal(11,2);

    paymentMethod : String enum {
        Card;
        Cash;
        UPI;
    };

    // Payment belongs to one Order
    order : Association to Orders;
}


// =====================================================
// BILL
// =====================================================

entity Bill : managed {

    key ID : UUID;

    billNumber  : String(50);
    billDate    : Timestamp;

    taxPrice    : Decimal(11,2);
    totalAmount : Decimal(11,2);

    // Bill belongs to one Order
    order : Association to Orders;
}