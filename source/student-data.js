var SUPABASE_URL = 'https://cvltwxxfkfckbixwhnhl.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_wv9niqm-nwI8Gpfaoi_fKg_pHa-FocS';
var supabaseClient = null;
try {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );
        console.log('✅ Supabase client initialized');
    } else {
        console.warn('⚠️ Supabase not loaded yet');
    }
} catch(e) {
    console.error('❌ Supabase init error:', e);
}
function getStudents() {
    return new Promise(function(resolve, reject) {
        if (!supabaseClient) {
            try {
                var data = localStorage.getItem('hendesyar_students_data');
                if (data) {
                    resolve(JSON.parse(data));
                } else {
                    resolve([]);
                }
            } catch(e) {
                resolve([]);
            }
            return;
        }
        supabaseClient
            .from('students')
            .select('*')
            .then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data || []);
                }
            })
            .catch(reject);
    });
}
function findStudentByCode(studentCode) {
    return new Promise(function(resolve, reject) {
        if (!supabaseClient) {
            try {
                var students = JSON.parse(localStorage.getItem('hendesyar_students_data') || '[]');
                var student = students.find(function(s) { return s.studentCode === studentCode; });
                resolve(student || null);
            } catch(e) {
                resolve(null);
            }
            return;
        }
        supabaseClient
            .from('students')
            .select('*')
            .eq('student_code', studentCode)
            .single()
            .then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data);
                }
            })
            .catch(reject);
    });
}
function findStudentByCodeAndSchool(studentCode, schoolId) {
    return new Promise(function(resolve, reject) {
        if (!supabaseClient) {
            try {
                var students = JSON.parse(localStorage.getItem('hendesyar_students_data') || '[]');
                var student = students.find(function(s) {
                    return s.studentCode === studentCode && Number(s.schoolId) === Number(schoolId);
                });
                resolve(student || null);
            } catch(e) {
                resolve(null);
            }
            return;
        }
        supabaseClient
            .from('students')
            .select('*')
            .eq('student_code', studentCode)
            .eq('school_id', schoolId)
            .single()
            .then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data);
                }
            })
            .catch(reject);
    });
}
function findStudent(studentCode, schoolId, classVal) {
    return new Promise(function(resolve, reject) {
        if (!supabaseClient) {
            try {
                var students = JSON.parse(localStorage.getItem('hendesyar_students_data') || '[]');
                var student = students.find(function(s) {
                    return s.studentCode === studentCode && 
                           Number(s.schoolId) === Number(schoolId) &&
                           s.class === classVal;
                });
                resolve(student || null);
            } catch(e) {
                resolve(null);
            }
            return;
        }
        supabaseClient
            .from('students')
            .select('*')
            .eq('student_code', studentCode)
            .eq('school_id', schoolId)
            .eq('class', classVal)
            .single()
            .then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data);
                }
            })
            .catch(reject);
    });
}
function addStudent(studentData) {
    return new Promise(function(resolve, reject) {
        if (!supabaseClient) {
            try {
                var students = JSON.parse(localStorage.getItem('hendesyar_students_data') || '[]');
                var newId = students.length > 0 ? Math.max.apply(null, students.map(function(s) { return s.id; })) + 1 : 1;
                var newStudent = {
                    id: newId,
                    studentCode: studentData.studentCode || ("S" + (1000 + newId)),
                    password: studentData.password || "123456",
                    name: studentData.name || "New Student",
                    class: studentData.class || "هشتم",
                    schoolId: studentData.schoolId,
                    progress: studentData.progress || { completed: 0, total: 5, score: 0, weakness: "-" }
                };
                students.push(newStudent);
                localStorage.setItem('hendesyar_students_data', JSON.stringify(students));
                resolve(newStudent);
            } catch(e) {
                reject(e);
            }
            return;
        }
        var studentCode = studentData.studentCode || studentData.student_code || ('S' + Date.now().toString().slice(-6));
        var schoolId = studentData.schoolId || studentData.school_id;
        var className = studentData.class || 'هشتم';
        var name = studentData.name || 'New Student';
        var password = studentData.password || '123456';
        var progress = studentData.progress || { completed: 0, total: 5, score: 0, weakness: '-' };
        var newStudent = {
            student_code: studentCode,
            password: password,
            name: name,
            class: className,
            school_id: schoolId,
            progress: progress
        };
        supabaseClient
            .from('students')
            .insert([newStudent])
            .select()
            .then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data ? result.data[0] : null);
                }
            })
            .catch(reject);
    });
}
function updateStudent(studentCode, updates) {
    return new Promise(function(resolve, reject) {
        if (!supabaseClient) {
            try {
                var students = JSON.parse(localStorage.getItem('hendesyar_students_data') || '[]');
                var index = -1;
                for (var i = 0; i < students.length; i++) {
                    if (students[i].studentCode === studentCode) {
                        index = i;
                        break;
                    }
                }
                if (index === -1) {
                    resolve(null);
                    return;
                }
                for (var key in updates) {
                    if (updates.hasOwnProperty(key)) {
                        students[index][key] = updates[key];
                    }
                }
                localStorage.setItem('hendesyar_students_data', JSON.stringify(students));
                resolve(students[index]);
            } catch(e) {
                reject(e);
            }
            return;
        }
        supabaseClient
            .from('students')
            .update(updates)
            .eq('student_code', studentCode)
            .select()
            .then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data ? result.data[0] : null);
                }
            })
            .catch(reject);
    });
}
function updateStudentProgress(studentCode, progressData) {
    return updateStudent(studentCode, { progress: progressData });
}
function deleteStudent(studentCode) {
    return new Promise(function(resolve, reject) {
        if (!supabaseClient) {
            try {
                var students = JSON.parse(localStorage.getItem('hendesyar_students_data') || '[]');
                var filtered = students.filter(function(s) { return s.studentCode !== studentCode; });
                if (filtered.length === students.length) {
                    resolve(false);
                    return;
                }
                localStorage.setItem('hendesyar_students_data', JSON.stringify(filtered));
                resolve(true);
            } catch(e) {
                reject(e);
            }
            return;
        }
        supabaseClient
            .from('students')
            .delete()
            .eq('student_code', studentCode)
            .then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(true);
                }
            })
            .catch(reject);
    });
}
function getStudentsBySchool(schoolId) {
    return new Promise(function(resolve, reject) {
        if (!supabaseClient) {
            try {
                var students = JSON.parse(localStorage.getItem('hendesyar_students_data') || '[]');
                var filtered = students.filter(function(s) { return Number(s.schoolId) === Number(schoolId); });
                resolve(filtered);
            } catch(e) {
                resolve([]);
            }
            return;
        }
        supabaseClient
            .from('students')
            .select('*')
            .eq('school_id', schoolId)
            .then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data || []);
                }
            })
            .catch(reject);
    });
}
function getStudentsBySchoolAndClass(schoolId, classVal) {
    return new Promise(function(resolve, reject) {
        if (!supabaseClient) {
            try {
                var students = JSON.parse(localStorage.getItem('hendesyar_students_data') || '[]');
                var filtered = students.filter(function(s) {
                    return Number(s.schoolId) === Number(schoolId) && s.class === classVal;
                });
                resolve(filtered);
            } catch(e) {
                resolve([]);
            }
            return;
        }
        supabaseClient
            .from('students')
            .select('*')
            .eq('school_id', schoolId)
            .eq('class', classVal)
            .then(function(result) {
                if (result.error) {
                    reject(result.error);
                } else {
                    resolve(result.data || []);
                }
            })
            .catch(reject);
    });
}
function getSchoolStats(schoolId) {
    return new Promise(function(resolve, reject) {
        getStudentsBySchool(schoolId)
            .then(function(students) {
                if (students.length === 0) {
                    resolve({ total: 0, avgScore: 0, completed: 0, weak: 0 });
                    return;
                }
                var total = students.length;
                var sum = 0;
                for (var i = 0; i < students.length; i++) {
                    sum += students[i].progress ? students[i].progress.score : 0;
                }
                var avgScore = Math.round(sum / total);
                var completed = 0;
                var weak = 0;
                for (var j = 0; j < students.length; j++) {
                    var p = students[j].progress;
                    if (p) {
                        if (p.completed === p.total) completed++;
                        if (p.completed < p.total / 2) weak++;
                    }
                }
                resolve({ total: total, avgScore: avgScore, completed: completed, weak: weak });
            })
            .catch(reject);
    });
}
if (typeof window !== 'undefined') {
    window.getStudents = getStudents;
    window.findStudent = findStudent;
    window.findStudentByCode = findStudentByCode;
    window.findStudentByCodeAndSchool = findStudentByCodeAndSchool;
    window.addStudent = addStudent;
    window.updateStudent = updateStudent;
    window.updateStudentProgress = updateStudentProgress;
    window.deleteStudent = deleteStudent;
    window.getStudentsBySchool = getStudentsBySchool;
    window.getStudentsBySchoolAndClass = getStudentsBySchoolAndClass;
    window.getSchoolStats = getSchoolStats;
}