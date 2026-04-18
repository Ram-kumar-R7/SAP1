// namespace LibraryManagementSystem;

// type phoneNumber : Integer;

// entity Member {
//     key ID : UUID;
//     name : String;
//     phoneNumber : phoneNumber;
//     booksBorrow : Association to many Borrow on booksBorrow.member = $self
// }

// entity Book {
//     key ID : UUID;
//     bookName : String;
//     Author : String;
//     genre : String;
//     membersBorrow : Association to many Borrow on membersBorrow.book = $self  ;
// }

// entity Borrow{
//     key member : Association to Member;
//     key book : Association to Book;
//     borrowDate : DateTime;
//     returnDate : DateTime

// }







namespace ProjectManagement;

entity Employee {
    key ID : UUID;
    name   : String;
    role   : String;

    assignments : Association to many Assignment
        on assignments.employee = $self;
}

entity Project {
    key ID      : UUID;
    projectName : String;
    startDate   : Date;
    endDate     : Date;

    manager : Association to Employee;   // ✅ correct

    assignments : Association to many Assignment
        on assignments.project = $self;
}

entity Assignment {
    key employee : Association to Employee;
    key project  : Association to Project;

    assignedDate  : DateTime;
    roleInProject : String;
}














// namespace FoodDeliverySystem;

// type Address {
//     DoorNo   : Integer;
//     street   : String;
//     landMark : String;
//     pincode  : Integer;

// }


// entity Customer {
//     key ID          : UUID;
//         name        : String;
//         address     : Address;
//         phoneNumber : Integer;
// }

// entity Restaurant {
//     key ID             : UUID;
//         restaurantName : String;
//         address        : Address;

// }

// entity MenuItem {
//     key ID         : UUID;
//         dishesName : String;
//         restaurant : Association to  Restaurant;


// }

// entity Order {
//     key ID          : UUID;
//         orderDate   : DateTime;
//         totalAmount : Decimal;
//         orderItem : Composition of OrderItem;
//         customer : Association to Customer;

// }

// entity OrderItem {
//     key ID       : UUID;
//         quantity : Integer;
//         price    : Decimal;
//         menuItem : Association to MenuItem;
// }













