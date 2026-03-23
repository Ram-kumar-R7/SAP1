namespace my.showroom;

entity Vehicles {
    key ID        : String;
        price     : Decimal;
        modelname : String;
        status    : String enum {
            Pending;
            Approved;
            Rejected;
        } default 'Pending';
        state     : Association to State;
        dealers   : Association to Dealers;
        orders    : Composition of many Orders
                        on orders.vehiclesRef = $self
}

entity Dealers {
    key ID         : String;
        dealername : String;
        location   : String;
        vehicles   : Association to many Vehicles
                         on vehicles.dealers = $self;
}

entity Orders {
    key ID          : String;
        quantity    : Integer;
        vehiclesRef : Association to Vehicles;
}

entity State {
    key ID : String;
    name : String;
    stateCode : String;
    tax : Decimal;
}

