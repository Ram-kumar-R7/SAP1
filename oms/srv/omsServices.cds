using my.oms as db from '../db/oms';

service OMSService {

    entity Customer        as projection on db.Customer;
    entity CustomerAddress as projection on db.CustomerAddress;
    entity Supplier        as projection on db.Supplier;
    entity ProductCategory as projection on db.ProductCategory;
    entity Product         as projection on db.Product;
    entity SupplierProduct as projection on db.SupplierProduct;
    entity WareHouse       as projection on db.WareHouse;
    entity Inventory       as projection on db.Inventory;
    entity OrderHeader     as projection on db.OrderHeader;
    entity OrderDetail     as projection on db.OrderDetail;
    entity Payment         as projection on db.Payment;
    entity Shipping        as projection on db.Shipping;
    entity ProductReturns  as projection on db.ProductReturns;
    entity Refund          as projection on db.Refund;
    entity Bill          as projection on db.Bill;

    //action cancelOrder

    action cancelOrder(orderID: UUID)  returns String;
    action refundAmount(orderID: UUID) returns String;

    //acton Bill
     action newOrder(orderID : UUID) returns String;
     action billGen(orderID : UUID) returns String;

}




