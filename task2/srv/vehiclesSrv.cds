using {my.showroom as db } from '../db/vehicles';

service MyVehicles {

    entity Vehicles as projection on db.Vehicles;
    entity Dealers as projection on db.Dealers;
    entity Orders as projection on db.Orders;
    entity State as projection on db.State;

    action approveVehicle(orderID : String ) returns String;
//      Create a function named getTotalOrderValue.
    function getTotalOrderValue(orderID : String) returns String;

}























