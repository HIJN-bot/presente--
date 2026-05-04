function checkRadio() {
    let form = document.getElementById("form");

    if (document.getElementById("teacher_radio").checked) {
        form.setAttribute("action", "teacher/index.php");
    }

    if (document.getElementById("student_radio").checked) {
        form.setAttribute("action", "student/index.php");
    }
}   