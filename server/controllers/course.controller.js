import Course from "../models/course.model.js";
import asyncHandler from '../middleware/asyncHandler.middleware.js';
import AppError from "../utils/error.utils.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary';

const getAllCourses = async function(req , res, next){
    try{
        const courses = await Course.find({}).select('-lecture');

    res.status(200).json({
        success: true,
        message: 'All courses',
        courses,
    });
    }catch(e){
        return next(
            new AppError(e.message, 500)
        )
    }
    
}

const getLectureByCourseId = async function(req,res,next){
    try{
        const { id } = req.params;

        const course = await Course.findById(id);

        if(!course){
            return next(
                new AppError('Invalid course id', 400)
            )
        }

        res.status(200).json({
            success: true,
            message: 'Course lectures fetched successfully',
            lectures: course.lectures
        })
    }catch(e){
        return next(
            new AppError(e.message, 501)
        )
    }
}

const createCourse = async(req,res , next) => {
    const { title, description , category , createdBy } = req.body;

    if(!title || !description || !category || !createdBy){
        return next(
            new AppError('All fields are required' , 405)
        )
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: 'Dummy',
            secure_url: 'Dummy'
        }
    });

    if(!course){
        return next(
            new AppError('Course could not created , please try again' , 500)
        )
    }

    if (req.file) {
        try {
          const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms', // Save files in a folder named lms
          });
    
          // If success
          if (result) {
            // Set the public_id and secure_url in array
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url;
          }
    
          // After successful upload remove the file from local storage
          fs.rm(`uploads/${req.file.filename}`);
        } catch (error) {
          // Empty the uploads directory without deleting the uploads directory
          for (const file of await fs.readdir('uploads/')) {
            await fs.unlink(path.join('uploads/', file));
          }
    
          // Send the error message
          return next(
            new AppError(
              JSON.stringify(error) || 'File not uploaded, please try again',
              400
            )
          );
        }
    }

    await course.save();

    res.status(200).json({
        success: true,
        message: 'Course created successfully',
        course,
    });
}

const updateCourse = async( req,res,next) => {
    try{
        const { id } = req.params;
        const course = await Course.findByIdAndUpdate(
            id,{
                $set: req.body
            },{
                runValidators: true
            }
        );

        if(!course){
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }

        res.status({
            success: true,
            message: 'Course updated successfully!',
            course,
        })
    }catch(e){
        return next(
            new AppError(e.message, 500)
        )
    }
}

const removeCourse = async(req,res,next) => {
    try{
        const { id } = req.params;
        const course = await Course.findById(id);

        if(!course){
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }

        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message:'Course deleted successfully'

        })
    }catch(e){
        return next(
            new AppError(e.message , 500)
        )
    }
}

const addLectureToCourseById = async(req,res,next) => {
    try{
        const { title , description } = req.body;
        const { id } = req.params;
    
        if(!title || !description){
            return next(
                new AppError('All fields are required' , 400)
            )
        }
        console.log("Received title and description");

        const course = await Course.findById(id);
        console.log("Fetched course by ID:", id);
    
        if(!course){
            return next(
                new AppError('Course with given id does not exist' , 500)
            )
        }
    
        const lectureData = {
            title,
            description,
            lecture: {},
        };
        console.log("1");
    
        if (req.file) {
            try {
              const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms', // Save files in a folder named lms
                chunk_size: 50000000, // 50 mb size
                resource_type: 'video',
              });
        
              // If success
              if (result) {
                // Set the public_id and secure_url in array
                lectureData.lecture.public_id = result.public_id;
                lectureData.lecture.secure_url = result.secure_url;
              }
        
              // After successful upload remove the file from local storage
              fs.rm(`uploads/${req.file.filename}`);
            } catch (error) {
              // Empty the uploads directory without deleting the uploads directory
              for (const file of await fs.readdir('uploads/')) {
                await fs.unlink(path.join('uploads/', file));
              }
        
              // Send the error message
              return next(
                new AppError(
                  JSON.stringify(error) || 'File not uploaded, please try again',
                  400
                )
              );
            }
        }
    
        course.lectures.push(lectureData);
    
        course.numberOfLectures = course.lectures.length;
    
        await course.save();
    
        res.status(200).json({
            success: true,
            message: 'Lecture successfully added to the course',
            course
        })
    }catch(e){
        return next(
            new AppError(e.message , 506)
        )
    }
}

 const removeLectureFromCourse = asyncHandler(async (req, res, next) => {
    // Grabbing the courseId and lectureId from req.query
    const { courseId, lectureId } = req.query;
  
    console.log(courseId);
  
    // Checking if both courseId and lectureId are present
    if (!courseId) {
      return next(new AppError('Course ID is required', 400));
    }
  
    if (!lectureId) {
      return next(new AppError('Lecture ID is required', 400));
    }
  
    // Find the course uding the courseId
    const course = await Course.findById(courseId);
  
    // If no course send custom message
    if (!course) {
      return next(new AppError('Invalid ID or Course does not exist.', 404));
    }
  
    // Find the index of the lecture using the lectureId
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lectureId.toString()
    );
  
    // If returned index is -1 then send error as mentioned below
    if (lectureIndex === -1) {
      return next(new AppError('Lecture does not exist.', 404));
    }
  
    // Delete the lecture from cloudinary
    await cloudinary.v2.uploader.destroy(
      course.lectures[lectureIndex].lecture.public_id,
      {
        resource_type: 'video',
      }
    );
  
    // Remove the lecture from the array
    course.lectures.splice(lectureIndex, 1);
  
    // update the number of lectures based on lectres array length
    course.numberOfLectures = course.lectures.length;
  
    // Save the course object
    await course.save();
  
    // Return response
    res.status(200).json({
      success: true,
      message: 'Course lecture removed successfully',
    });
  });

export {
    getAllCourses,
    getLectureByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    removeLectureFromCourse
}