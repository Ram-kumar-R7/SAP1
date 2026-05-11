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
                $Type: 'UI.DataField',
                Label: 'status',
                Value: status,
            },
           
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.SelectionFields           : [
        bookName,
        Author,
        genre
    ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'ID',
            Value: ID,
        },
        {
            $Type: 'UI.DataFieldWithUrl',
            Label: 'BookName',
            Value: bookName,
            Url:'https://www.google.com/'
        },
        {
            $Type: 'UI.DataField',
            Label: 'Author',
            Value: Author,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Genre',
            Value: genre,
        },
        {
            $Type      : 'UI.DataField',
            Label      : 'Stock',
            Value      : stock,
            Criticality: stockCriticality
        },
        {
            $Type: 'UI.DataField',
            Label: 'Genre',
            Value: genre,
        },
        {
            $Type      : 'UI.DataField',
            Label      : 'Status',
            Value      : status,
            Criticality: statusCriticality
        },
         {
                $Type : 'UI.DataFieldForAction',
                Action: 'MyService.Active',
                Label : 'SetActive',
                Inline: true
            }
    ],

    UI.PresentationVariant:{
        MaxItems:5,
        Visualizations:['@UI.LineItem']
    },
    UI.HeaderInfo                : {
        TypeName      : 'Book',
        TypeNamePlural: 'Books',
        Title         : {Value: bookName},
        Description   : {Value: Author}
    }
);

annotate service.Book with {
    genre @Common.ValueList: {
        CollectionPath: 'Book',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: genre,
            ValueListProperty: 'genre'
        }]
    };
};

annotate service.Book with @Capabilities.FilterRestrictions: {FilterExpressionRestrictions: [{
    Property          : genre,
    AllowedExpressions: 'MultiValue'
}]};


// annotate service.booKCriticality with @(
//     UI.LineItem: [
//         {
//             $Type : 'UI.DataField',
//             Label : 'Stock',
//             Value: stock,
//             Criticality: stockCriticality
//         }
//     ]
// );
