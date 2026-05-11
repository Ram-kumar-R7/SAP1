namespace LibraryManagementSystem;

entity Member {
    key ID          : String;
        name        : String;
        email       : String;
        phoneNumber : String;
        image       : String @UI.IsImageURL: true;
        address     : String;
        booksBorrow : Association to many Borrow
                          on booksBorrow.member = $self
}

entity Book {
    key ID                : Integer;
        bookName          : String;
        Author            : String;
        genre             : String;
        stock             : Integer @UI.Hidden    : (status = 'Inactive');
        totalStock        : Integer;
        price             : Integer @UI.Hidden    : (status = 'Inactive');
        status            : String enum {
            Active;
            Inactive
        }
        statusCriticality : Integer;
        rating            : Decimal;
        image             : String  @UI.IsImageURL: true;
        membersBorrow     : Association to many Borrow
                                on membersBorrow.book = $self;
}

entity Borrow {
    key member     : Association to Member;
    key book       : Association to Book;
        borrowDate : DateTime;
        returnDate : DateTime
}
