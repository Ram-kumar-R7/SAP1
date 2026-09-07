using { my.Showroom as db } from '../db/vehicles';

service MyVehicles {

    entity Customer  as projection on db.Customer;
    entity State     as projection on db.State;
    entity Vehicles  as projection on db.Vehicles;
    entity Orders    as projection on db.Orders;
    entity Payments  as projection on db.Payments;
    entity Bill      as projection on db.Bill;
    function getVehicleSummary() returns String;

}