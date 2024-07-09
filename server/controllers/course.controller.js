import Course from "../models/course.model.js";
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
            new AppError(e.message, 500)
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
    
        const course = await Course.findById(id);
    
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
    
        if (req.file) {
            try {
              const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms', // Save files in a folder named lms
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
            new AppError(e.message , 500)
        )
    }
}

const removeLecture = async(req,res,next) => {
    try{
        const {id} = req.params;
        // const course = await Course.findById(id);

        const deletedLecture = await Lecture.findByIdAndDelete(id);

        if (!deletedLecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        return res.status(200).json({ message: 'Lecture deleted successfully' });
    }catch(e){
        return next(
            new AppError(e.message , 500)
        )
    }
}

export {
    getAllCourses,
    getLectureByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    removeLecture
}