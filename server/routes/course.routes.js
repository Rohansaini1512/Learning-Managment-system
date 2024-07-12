import { Router } from "express";
import { addLectureToCourseById, createCourse, getAllCourses, getLectureByCourseId, removeCourse, removeLectureFromCourse, updateCourse } from "../controllers/course.controller.js";
import { authorizeSubscriber, authorizedRoles, isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('thumbnail'),
        createCourse
    )
    .delete(isLoggedIn , authorizedRoles('ADMIN') , removeLectureFromCourse);

router.route('/:id')
    .get(isLoggedIn , authorizeSubscriber,getLectureByCourseId)
    .put(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        updateCourse
    )
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        removeCourse
    )
    
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('lecture'),
        addLectureToCourseById
    );
    

export default router;