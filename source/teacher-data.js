function getTeachers() {
  let teachers = localStorage.getItem('hendesyar_teachers');
  if (teachers) return JSON.parse(teachers);
  const defaultTeachers = [
    { id: 1, username: "alemi", password: "123456", name: "آقای عالمی", schoolId: 5 },
    { id: 2, username: "karimi", password: "123456", name: "خانم کریمی", schoolId: 3 },
    { id: 3, username: "ahmadi", password: "123456", name: "آقای احمدی", schoolId: 14 },
    { id: 4, username: "mohammadi", password: "123456", name: "خانم محمدی", schoolId: 10 },
    { id: 5, username: "rezai", password: "123456", name: "آقای رضایی", schoolId: 12 }
  ];
  localStorage.setItem('hendesyar_teachers', JSON.stringify(defaultTeachers));
  return defaultTeachers;
}
function getStudents() {
  let students = localStorage.getItem('hendesyar_students_data');
  if (students) return JSON.parse(students);
  const defaultStudents = [
    { id: 1, studentCode: "S1001", password: "123456", name: "علی احمدی", class: "هشتم", schoolId: 5,
      progress: { completed: 4, total: 5, score: 85, weakness: "تشابه" } },
    { id: 2, studentCode: "S1002", password: "123456", name: "فاطمه حسینی", class: "نهم", schoolId: 5,
      progress: { completed: 5, total: 5, score: 95, weakness: "هم‌نهشتی" } },
    { id: 3, studentCode: "S1003", password: "123456", name: "رضا کریمی", class: "هشتم", schoolId: 5,
      progress: { completed: 2, total: 5, score: 45, weakness: "هم‌نهشتی و تشابه" } },
    { id: 4, studentCode: "S2001", password: "123456", name: "زهرا کریمی", class: "هشتم", schoolId: 3,
      progress: { completed: 5, total: 5, score: 100, weakness: "-" } },
    { id: 5, studentCode: "S3001", password: "123456", name: "نگین احمدی", class: "هفتم", schoolId: 14,
      progress: { completed: 3, total: 5, score: 55, weakness: "هم‌نهشتی" } },
    { id: 6, studentCode: "S4001", password: "123456", name: "حسین محمدی", class: "نهم", schoolId: 10,
      progress: { completed: 4, total: 5, score: 78, weakness: "تشابه" } },
    { id: 7, studentCode: "S5001", password: "123456", name: "سارا محمدی", class: "نهم", schoolId: 12,
      progress: { completed: 3, total: 5, score: 60, weakness: "تبدیل‌های هندسی" } }
  ];
  localStorage.setItem('hendesyar_students_data', JSON.stringify(defaultStudents));
  return defaultStudents;
}
function addStudentByTeacher(studentData) {
  const students = getStudents();
  const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
  const newStudent = {
    id: newId,
    studentCode: "S" + (1000 + newId),
    password: "123456",
    ...studentData,
    progress: { completed: 0, total: 5, score: 0, weakness: "-" }
  };
  students.push(newStudent);
  localStorage.setItem('hendesyar_students_data', JSON.stringify(students));
  return newStudent;
}