namespace my.store;
entity product   {

    key ID          : String;

        @Common.Label: '{i18n>productName}'
        name        : localized String;

        @Common.Label: '{i18n>productDesc}'
        description : localized String;

        @Common.Label: '{i18n>productPrice}'
        price       : Decimal;
        @Common.Label :'{i18n>productCategory}'
        category : String;
        
        status : String enum{
            Active;
            InActive;
        }default 'Active';

    
}


