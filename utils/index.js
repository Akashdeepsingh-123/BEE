export function createPageUrl(name) {
  switch (name) {
    case 'Dashboard':
      return '/dashboard';
    case 'Students':
      return '/students';
    case 'Faculty':
      return '/faculty';
    case 'Courses':
      return '/courses';
    case 'Enrollments':
      return '/enrollments';
    case 'Fees':
      return '/fees';
    case 'Attendance':
      return '/attendance';
    case 'Exams':
      return '/exams';
    case 'MyCourses':
      return '/mycourses';
    case 'MyAttendance':
      return '/myattendance';
    case 'MyGrades':
      return '/mygrades';
    case 'MyFees':
      return '/myfees';
    case 'MyStudents':
      return '/mystudents';
    case 'Notifications':
      return '/notifications';
    default:
      return '/';
  }
}


