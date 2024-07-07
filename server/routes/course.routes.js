import { Router } from "express";
import { addLectureToCourseById, createCourse, getAllCourses, getLectureByCourseId, removeCourse, removeLecture, updateCourse } from "../controllers/course.controller.js";
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
    );

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

router.route('/lectures/:id')
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        removeLecture
    )

export default router;