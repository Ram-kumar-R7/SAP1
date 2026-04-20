
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


entity moreThan1Employee as select from Assignment{
    project.projectName as projectName,
    count(*) as totalEmployees
}
group by project.projectName having count(*)>1

   
    
}



















