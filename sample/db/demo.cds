namespace ProjectManagement;

entity Employee {
    key ID : UUID;
    name   : String;
    role   : String;
    age : String;
    assignments : Association to many Assignment
        on assignments.employee = $self;
}

entity Project {
    key ID      : UUID;
    projectName : String;
    startDate   : Date;
    endDate     : Date;
    manager : Association to Employee;   
    assignments : Association to many Assignment
        on assignments.project = $self;
}

entity Assignment {
    key employee : Association to Employee;
    key project  : Association to Project;
    assignedDate  : DateTime;
    roleInProject : String;

}











