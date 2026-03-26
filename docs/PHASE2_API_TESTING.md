# Phase 2: API Testing Evidence

This repository now includes an importable Postman collection for evaluator
testing.

## Included artifact

- `docs/postman/Student_Behavioral_Wellness_Tracker.postman_collection.json`

## Suggested Postman variables

- `baseUrl` = `http://localhost:5000`
- `teacherToken` = paste token from teacher login response
- `studentToken` = paste token from student login response
- `studentId` = created student id for CRUD checks

## Recommended evaluator flow

1. Register or log in a student
2. Log in a teacher
3. Create a student
4. List students
5. Create check-in and journal records
6. Trigger SOS
7. Read and acknowledge alerts
8. Exchange teacher-student messages
9. Delete a student to confirm full CRUD
