(function (global) {
    var STORAGE_KEY = 'hendesyar_completed';
    var QUIZ3_KEY = 'hendesyar_quiz3';
    var STUDENT_KEY = 'hendesyar_current_student';
    var STEP_KEYS = ['step1', 'step2', 'step3', 'step4', 'step5'];
    
    var WEAKNESS_LABELS = {
        1: 'تمرین‌های تشابه',
        2: 'تشابه مثلث‌ها',
        3: 'تمرین‌های هم‌نهشتی',
        4: 'هم‌نهشتی مثلث‌ها',
        5: '-'
    };

    function getSupabaseClient() {
        if (global.getSupabase) {
            return global.getSupabase();
        }
        try {
            if (global.supabase && global.SUPABASE_URL && global.SUPABASE_ANON_KEY) {
                return global.supabase.createClient(
                    global.SUPABASE_URL,
                    global.SUPABASE_ANON_KEY
                );
            }
        } catch (e) {}
        return null;
    }

    function getStudent() {
        try {
            var raw = localStorage.getItem(STUDENT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function saveStudent(student) {
        try {
            localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
        } catch (e) {}
    }

    function getGuestCompleted() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch (e) {
            return {};
        }
    }

    function saveGuestCompleted(completed) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
        } catch (e) {}
    }

    function getQuiz3Status() {
        try {
            return JSON.parse(localStorage.getItem(QUIZ3_KEY) || '{"q1":false,"q2":false,"q3":false}');
        } catch (e) {
            return { q1: false, q2: false, q3: false };
        }
    }

    function saveQuiz3Status(status) {
        try {
            localStorage.setItem(QUIZ3_KEY, JSON.stringify(status));
        } catch (e) {}
    }

    function markGuestStep(stepNum) {
        var completed = getGuestCompleted();
        var key = STEP_KEYS[stepNum - 1];
        if (key) {
            completed[key] = true;
            saveGuestCompleted(completed);
        }
    }

    function pushToSupabase(student) {
        var client = getSupabaseClient();
        if (!client || !student || !student.student_code) return;
        
        var updateData = {
            progress: student.progress
        };
        
        // ===== quiz3_status رو فعلاً نادیده میگیریم (چون ستون وجود نداره) =====
        // if (student.quiz3_status) {
        //     updateData.quiz3_status = student.quiz3_status;
        // }
        
        client
            .from('students')
            .update(updateData)
            .eq('student_code', student.student_code)
            .then(function (result) {
                if (result && result.error) {
                    console.warn('⚠️ Supabase sync warning:', result.error.message);
                }
            })
            .catch(function (err) {
                console.warn('⚠️ Supabase sync warning:', err.message);
            });
    }

    function markStep(stepNum) {
        var student = getStudent();
        
        if (student) {
            var progress = student.progress || { completed: 0, total: 5, score: 0, weakness: '-' };
            
            if (stepNum === 3) {
                var status = getQuiz3Status();
                if (!status.q1 || !status.q2 || !status.q3) {
                    console.warn('Hendesyar: step3 requires all quizzes completed');
                    return;
                }
            }
            
            if (progress.completed >= stepNum) return;
            
            progress.completed = stepNum;
            progress.score = progress.completed * 20;
            progress.weakness = WEAKNESS_LABELS[stepNum] || '-';
            
            student.progress = progress;
            saveStudent(student);
            pushToSupabase(student);
            
            markGuestStep(stepNum);
        } else {
            markGuestStep(stepNum);
        }
    }

    function markQuizPart(part) {
        var status = getQuiz3Status();
        var key = 'q' + part;
        
        if (status[key]) return;
        
        status[key] = true;
        saveQuiz3Status(status);
        
        var student = getStudent();
        if (student) {
            if (!student.quiz3_status) {
                student.quiz3_status = { q1: false, q2: false, q3: false };
            }
            student.quiz3_status[key] = true;
            saveStudent(student);
            // ===== این خط رو هم کامنت کن یا نگه دار (ولی خطا میده) =====
            // pushToSupabase(student);
        }
        
        if (status.q1 && status.q2 && status.q3) {
            console.log('✅ همه کوییزها کامل شدند، مرحله ۳ ثبت شد');
            markStep(3);
        }
    }

    function getCurrentProgress() {
        var student = getStudent();
        if (student && student.progress) {
            return student.progress.completed || 0;
        }
        var completed = getGuestCompleted();
        var count = 0;
        for (var key in completed) {
            if (completed[key] === true) count++;
        }
        return count;
    }

    function isStepCompleted(stepNum) {
        var student = getStudent();
        if (student && student.progress) {
            if (stepNum === 3) {
                var status = getQuiz3Status();
                return status.q1 && status.q2 && status.q3;
            }
            return student.progress.completed >= stepNum;
        }
        var completed = getGuestCompleted();
        var key = STEP_KEYS[stepNum - 1];
        return !!completed[key];
    }

    function autoMarkPageStep() {
        var path = window.location.pathname;
        var stepMap = {
            'level7.html': 1,
            'level8.html': 2,
            'level8_quiz1.html': 3,
            'level8_quiz2.html': 3,
            'level8_quiz3.html': 3,
            'level9.html': 4,
            'level9_quiz.html': 5
        };
        
        var step = null;
        for (var key in stepMap) {
            if (path.includes(key)) {
                step = stepMap[key];
                break;
            }
        }
        
        if (step) {
            if (!isStepCompleted(step)) {
                console.log('Hendesyar: auto-marking step', step, 'from page', path);
                markStep(step);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoMarkPageStep, 100);
        });
    } else {
        setTimeout(autoMarkPageStep, 100);
    }

    global.HendesyarProgress = {
        markStep: markStep,
        markQuizPart: markQuizPart,
        getCurrentProgress: getCurrentProgress,
        isStepCompleted: isStepCompleted,
        getQuiz3Status: getQuiz3Status
    };
})(window);