
using { ProjectManagement as db } from '../db/demo';


service MyService {

    entity Employee as projection on db.Employee;
    entity Assignment as projection on db.Assignment;
    entity Project as projection on db.Project;

    entity employeeView as select from Employee{
              name as empName,
              role
    }

    entity AssignmentView as select from Assignment{
        employee.name as empName,
        project.projectName as projectName,
        roleInProject

    }

    entity ProjectView  as select from  Project{
        projectName,
        manager.name as managerName,
        startDate,
        endDate
    }

    entity projecmanagerName as select from Project{
         projectName,
         manager.name as managerName

    }

    entity LeadAssignmentsView as select from Assignment {
    employee.name       as employeeName,
    project.projectName as projectName,
    roleInProject
}
  where roleInProject = 'Lead';


  entity YourViewName as select from Assignment {
    project.projectName as projectName,
    count(*) as totalEmployees
}
    group by project.projectName;


entity havingView as select from Assignment{
    project.projectName as projectName,
    count(*) as totalEmployees
}
group by project.projectName having count(*)>1;

entity orderByView as select from Assignment{

    employee.name as employeeName,
    count(*) as totalEmployees

} group by employee.name  having count(*) ;


entity projectStatus as select from Project{
    projectName,
    startDate,
    endDate,

    case 
    when endDate < CURRENT_DATE then 'Completed'
    when startDate > CURRENT_DATE then 'Upcomming'
    else 'ongoing'

    end as Status
}








}



















