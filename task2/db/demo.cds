namespace my.demoproject;

using { API_BUSINESS_PARTNER as api } from '../srv/external/API_BUSINESS_PARTNER';

entity EmailAddress as projection on api.A_AddressEmailAddress{
    key AddressID,
    key Person,
    EmailAddress
}

















