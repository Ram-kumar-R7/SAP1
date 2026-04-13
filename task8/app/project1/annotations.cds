using MyService as service from '../../srv/service';
annotate service.product with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'ID',
                Value : ID,
            },
            {
                $Type : 'UI.DataField',
                Value : name,
            },
            {
                $Type : 'UI.DataField',
                Value : description,
            },
            {
                $Type : 'UI.DataField',
                Value : price,
            },
            {
                $Type : 'UI.DataField',
                Value : category,
            }
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'ID',
            Value : ID,
        },
        {
            $Type : 'UI.DataField',
            Value : name,
        },
        {
            $Type : 'UI.DataField',
            Value : description,
        },
        {
            $Type : 'UI.DataField',
            Value : price,
        },
        {
            $Type : 'UI.DataField',
            Value : category,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'MyService.EntityContainer/addDiscount',
            Label : '{i18n>Discount}',
            
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'MyService.applyInActive',
            Label : '{i18n>Inactive}',
            Inline : true,
        },
        // {
        //         $Type: 'UI.DataFieldForAction',
        //         Action : 'MyService.applyInActive',
        //         Value : applyInActive,
        //         Inline :true,
        //         Label: Inactive
        //     }
    ],
);

