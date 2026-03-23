namespace my.oms;

using {managed} from '@sap/cds/common';

type PhoneNumber    : String(10);
type Email          : String(50);

type Address {
    street  : String(200);
    city    : String(100);
    pincode : String(6);
}

type ActiveStatus   : String enum {
    Active = 'Active';
    Inactive = 'Inactive';
}

type OrderStatus    : String enum {
    Ordered = 'Ordered';
    Shipped = 'Shipped';
    Delivered = 'Delivered';
    Cancelled = 'Cancelled';
}

type ShipmentStatus : String enum {
    Pending = 'Pending';
    Assigned = 'Assigned';
    PickedUp = 'PickedUp';
    InTransit = 'InTransit';
    Delivered = 'Delivered';
    Failed = 'Failed';
}

type PaymentMethod  : String enum {
    Cash = 'Cash';
    UPI = 'UPI';
    Card = 'Card';
}

type PaymentStatus  : String enum {
    Paid = 'Paid';
    Failed = 'Failed';
    Pending = 'Pending';
}

//  entities
entity Customer : managed {
    key ID           : UUID;
        customerName : String;
        phoneNo      : PhoneNumber;
        addresses    : Association to many CustomerAddress
                           on addresses.customer = $self;
        status       : ActiveStatus;
        userEmail    : Email;
        password     : String;
}

entity CustomerAddress : managed {
    key ID            : UUID;
        customer      : Association to Customer;
        addressDetail : Address;
        isDefault     : Boolean default false;
}

entity Supplier : managed {
    key ID            : UUID;
        supplierName  : String;
        contactNumber : PhoneNumber;
        address       : Address;
        status        : ActiveStatus;
        userEmail     : Email;
        password      : String;
}

entity ProductCategory : managed {
    key ID             : UUID;
        categoryName   : String;
        description    : String;
        parentCategory : Association to ProductCategory;
        status         : ActiveStatus;
}

entity Product : managed {
    key ID              : UUID;
        productName     : String;
        productCategory : Association to ProductCategory;
}

entity SupplierProduct : managed {
    key ID           : UUID;
        supplier     : Association to Supplier;
        product      : Association to Product;
        description  : String;
        leadTimeDays : Integer;
        price        : Decimal(11, 2);
        status       : ActiveStatus;

}

entity WareHouse : managed {
    key ID            : UUID;
        warehouseName : String(120);
        address       : Address;
}

entity Inventory : managed {
    key ID            : UUID;
        product       : Association to SupplierProduct;
        warehouse     : Association to WareHouse;
        stockQuantity : Integer;
}

entity OrderHeader : managed {
    key ID              : UUID;
        customer        : Association to Customer;
        status          : OrderStatus;
        items           : Composition of many OrderDetail
                              on items.order = $self;
        totalAmount     : Decimal(11, 2);
        shippingAddress : Association to CustomerAddress;
}

entity OrderDetail : managed {
    key ID       : UUID;
        order    : Association to OrderHeader;
        product  : Association to SupplierProduct;
        quantity : Integer;
        price    : Decimal(11, 2);
        status   : OrderStatus;
}

entity Payment : managed {
    key ID            : UUID;
        order         : Association to OrderHeader;
        paymentType   : PaymentMethod;
        paymentStatus : PaymentStatus;
        amount        : Decimal(11, 2);
        providerRef   : String(200);
}

entity Shipping : managed {
    key ID              : UUID;
        order           : Association to OrderHeader;
        shipmentStatus  : ShipmentStatus;
        shippingAddress : Association to CustomerAddress;
        shippedAt       : Timestamp;
        deliveredAt     : Timestamp;
        carrier         : String(100);
}

entity ProductReturns : managed {
    key ID         : UUID;
        orderItem  : Association to OrderDetail;
        order      : Association to OrderHeader;
        reason     : String;
        returnType : String enum {
            Refund = 'Refund';
            ReOrder = 'ReOrder';
        };
        quantity   : Integer;
        status     : String enum {
            Requested = 'Requested';
            Approved = 'Approved';
            Rejected = 'Rejected';
            Completed = 'Completed';

        };
}

entity Refund : managed {
    key ID            : UUID;
        returnRef     : Association to ProductReturns;
        payment       : Association to Payment;
        refundAmount  : Decimal(11, 2);
        paymentStatus : PaymentStatus;
        processedAt   : Timestamp;
}


entity Bill : managed {
    key ID            : UUID;
        order         : Association to OrderHeader;
        payment       : Association to Payment;
        billNumber    : String;
        billDate      : Timestamp;
        totalAmount   : Decimal(11, 2);
        paymentStatus : PaymentStatus;
}
