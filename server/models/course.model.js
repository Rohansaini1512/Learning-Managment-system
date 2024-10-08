import { model , Schema } from "mongoose";

const courseSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [4, 'Title must be atleast 4 characters'],
        maxLength: [50, 'Title cannot be more than 50 characters'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minLength: [20, 'Description must be atleast 20 characters long'],
        maxLength: [200, 'Title cannot be more than 200 characters'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
    },
    thumbnail: {
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                    required: true
                },
                secure_url: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    numberOfLectures: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const Course = model('Course', courseSchema);

export default Course;