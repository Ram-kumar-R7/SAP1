namespace my.Showroom;

using {managed} from '@sap/cds/common';

type PhoneNumber : String(10);
type Email       : String(50);

type Address {
    street  : String(200);
    city    : String(100);
    pincode : String(6);
}

entity Customer : managed {
    key ID            : String;
        customerName  : String(100);
        phoneNo       : PhoneNumber;
        email         : Email;
        addressDetail : Address;
}

entity State {
    key ID        : String;
        name      : String;
        stateCode : String;
        tax       : Decimal(11, 2);
}

entity Dealers {
    key ID         : String;
        dealername : String;
        location   : String;
        vehicles   : Association to many Vehicles
                         on vehicles.dealer = $self;
}

entity Vehicles : managed {
    key ID           : String;
        modelname    : String;
        currentPrice : Decimal(11, 2);
        oldPrice     : Decimal(11, 2);
        taxPrice     : Decimal(11, 2);
        totalPrice   : Decimal(11, 2);
        status       : String enum {
            Pending;
            Approved;
            Rejected;
        } default 'Pending';
        state        : Association to State;
        dealer       : Association to Dealers;
        orders       : Composition of many Orders
                           on orders.vehicle = $self;
}

entity Orders : managed {
    key ID       : String;
        quantity : Integer;
        customer : Association to Customer;
        vehicle  : Association to Vehicles;
        payments : Composition of many Payments
                       on payments.order = $self;
}

entity Payments : managed {
    key ID            : UUID;
        amount        : Decimal(11, 2);
        paymentMethod : String enum {
            Card;
            Cash;
            UPI;
        };
        order         : Association to Orders;
}


entity Bill : managed {
    key ID           : UUID;
        billNumber   : String;
        billDate     : Timestamp;
        taxPrice     : Decimal(11, 2);
        totalAmount  : Decimal(11, 2);
        order        : Association to Orders;
}


















