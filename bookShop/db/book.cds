namespace bookShop;

entity Book {
    key ID            : String;
        bookName      : String;
        Author        : String;
        genre         : String;
        stock : Integer;
        status        : String enum {
            Active;
            InActive

        }
        statusCriticality:Integer
}




