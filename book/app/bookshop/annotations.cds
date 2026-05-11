using MyService as service from '../../srv/services';

annotate service.Book with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'ID',
                Value: ID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'bookName',
                Value: bookName,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Author',
                Value: Author,
            },
            {
                $Type: 'UI.DataField',
                Label: 'genre',
                Value: genre,
            },
            {
                $Type      : 'UI.DataField',
                Label      : 'status',
                Value      : status,
                Criticality: statusCriticality,
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Label : 'Availability',
                Value : stock,
                Target: '@UI.DataPoint#Availability'
            },
        ],
    },
    UI.DataPoint #Availability   : {
        Visualization: #Progress,
        Value        : stock,
        TargetValue  : totalStock
    },
    UI.FieldGroup #Two           : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Price',
                Value: price,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Stock',
                Value: stock
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Label : 'Review',
                Value : rating,
                Target: '@UI.DataPoint#Rating'
            }

        ]
    },
    UI.DataPoint #Rating         : {
        Visualization: #Rating,
        Value        : rating
    },
    UI.Facets                    : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet2',
            Label : 'Sales Information',
            Target: '@UI.FieldGroup#Two'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Members Borrow',
            Target: 'membersBorrow/@UI.LineItem'
        },

    ],
    UI.SelectionFields           : [
        bookName,
        Author,
        genre,
    ],
    UI.HeaderFacets              : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'DetailFacet',
        Label : 'Details',
        Target: '@UI.FieldGroup#DetailInfo'
    }],
    UI.FieldGroup #DetailInfo    : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'genre',
                Value: genre,
            },
            {
                $Type      : 'UI.DataField',
                Label      : 'status',
                Value      : status,
                Criticality: statusCriticality,
            },
        ]
    },
    UI.LineItem                  : [
        {
            $Type             : 'UI.DataField',
            Label             : 'ID',
            Value             : ID,
            @HTML5.CssDefaults: {width: '70px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Image',
            Value             : image,
            @HTML5.CssDefaults: {width: '70px'}
        },
        {
            $Type             : 'UI.DataFieldWithUrl',
            Label             : 'bookName',
            Value             : bookName,
            Url               : 'https://www.google.com/',
            @HTML5.CssDefaults: {width: '150px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Author',
            Value             : Author,
            @HTML5.CssDefaults: {width: '150px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'genre',
            Value             : genre,
            @HTML5.CssDefaults: {width: '100px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Stock',
            Value             : stock,
            @HTML5.CssDefaults: {width: '70px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Price',
            Value             : price,
            @HTML5.CssDefaults: {width: '70px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'status',
            Value             : status,
            Criticality       : statusCriticality,
            @HTML5.CssDefaults: {width: '100px'}
        },
        {
            $Type             : 'UI.DataFieldForAction',
            Action            : 'MyService.SetActive',
            Label             : 'SetActive',
            Inline            : true,
            @HTML5.CssDefaults: {width: '100px'}
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'MyService.EntityContainer/ResetAllBooksStatus',
            Label : 'Reset All Books',
            Inline: false
        }
    ],
    UI.PresentationVariant       : {
        MaxItems      : 7,
        Visualizations: ['@UI.LineItem']
    },
    UI.HeaderInfo                : {
        TypeName      : 'Book',
        TypeNamePlural: 'Books',
        Title         : {Value: bookName},
        Description   : {Value: Author},
        ImageUrl      : image
    }
);


annotate service.Book with actions {
    SetActive @Common.IsActionCritical: true
              @Common.SideEffects     : {TargetProperties: [
        'status',
        'statusCriticality'
    ]};
};

// annotate service.ResetAllBooksStatus with @(
//     Common.IsActionCritical: true,
//     Common.SideEffects     : {TargetProperties: [
//         'status',
//         'statusCriticality'
//     ]}
// );

annotate service.ResetAllBooksStatus with @(
    Common.IsActionCritical: true,
    Common.SideEffects: {
        TargetEntities: [
            '/MyService.EntityContainer/Book'
        ]
    }
);


annotate service.Book with {
    genre @Common.ValueList: {
        CollectionPath: 'Book',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: genre,
                ValueListProperty: 'genre'
            },
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: Author,
                ValueListProperty: 'Author'
            },
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: price,
                ValueListProperty: 'price'
            }
        ]
    }
};


annotate service.Book with {
    status @Common.ValueList: {
        CollectionPath: 'Book',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: status,
            ValueListProperty: 'status'
        }]

    }
};

annotate service.Book with {
    genre    @Common.Label: 'Genre';
    bookName @Common.Label: 'Book Name';
};

annotate service.Borrow with @(
    UI.HeaderInfo            : {
        TypeName      : 'Borrow',
        TypeNamePlural: 'Borrows',
        Title         : {Value: member.name},
        Description   : {Value: book.bookName},
        ImageUrl : member.image
    },

    UI.FieldGroup #BorrowInfo: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Member Name',
                Value : member.name
            },
            {
                $Type: 'UI.DataField',
                Label: 'Email',
                Value: member.email
            },
            {
                $Type: 'UI.DataField',
                Label: 'Phone Number',
                Value: member.phoneNumber
            },
            {
                $Type: 'UI.DataField',
                Label: 'Member Address',
                Value: member.address
            },
            {
                $Type: 'UI.DataField',
                Label: 'Book Name',
                Value: book.bookName
            },
            {
                $Type: 'UI.DataField',
                Label: 'Author',
                Value: book.Author
            },
            {
                $Type: 'UI.DataField',
                Label: 'Genre',
                Value: book.genre
            },
            {
                $Type: 'UI.DataField',
                Label: 'Borrow Date',
                Value: borrowDate
            },
            {
                $Type: 'UI.DataField',
                Label: 'Return Date',
                Value: returnDate
            }
        ]
    },

    UI.Facets                : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Borrow Information',
        Target: '@UI.FieldGroup#BorrowInfo'
    }],
    UI.LineItem              : [
        {
            $Type: 'UI.DataField',
            Label: 'Member ID',
            Value: member_ID
        },
        {
            $Type: 'UI.DataFieldForAnnotation',
            Label: 'Member Name',
            Value: member.name,
            Target:'member/@Communication.Contact'
        },
        {
            $Type: 'UI.DataField',
            Label: 'Email',
            Value: member.email
        },
        {
            $Type: 'UI.DataField',
            Label: 'Phone Number',
            Value: member.phoneNumber
        },
        {
            $Type: 'UI.DataField',
            Label: 'Member Address',
            Value: member.address
        },
        {
            $Type: 'UI.DataField',
            Label: 'Book ID',
            Value: book_ID
        },
        {
            $Type: 'UI.DataField',
            Label: 'Book Name',
            Value: book.bookName
        },
        {
            $Type: 'UI.DataField',
            Label: 'Author',
            Value: book.Author
        },
        {
            $Type: 'UI.DataField',
            Label: 'Genre',
            Value: book.genre
        },
        {
            $Type: 'UI.DataField',
            Label: 'Borrow Date',
            Value: borrowDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Return Date',
            Value: returnDate
        }
    ]
);


annotate service.Book with {
    price @UI.Hidden: (status = 'Inactive');
    stock @UI.Hidden: (status = 'Inactive');
};

annotate service.Member with @(
    Communication.Contact : {
        fn   : name,
        photo: image,

        email: [{
            type   : #work,
            address: email
        }],

        adr: [{
            type   : #work,
            country: address
        }],
        tel: [{
            type: #work,
            uri : phoneNumber
        }]
    }
);



