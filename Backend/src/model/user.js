// This schema stores the long-lived identity for every ZenCode account.
// `problemSolved` doubles as the quick source of truth for progress-related UI.
import mongoose from "mongoose";
const { Schema } = mongoose;

const createEmptyLearningProgress = () => ({
    watchedVideoIds: [],
    lastWatchedVideoId: "",
    lastWatchedTopic: "",
    updatedAt: null,
});

const learningCourseProgressSchema = new Schema(
    {
        watchedVideoIds: {
            type: [String],
            default: [],
        },
        lastWatchedVideoId: {
            type: String,
            default: "",
        },
        lastWatchedTopic: {
            type: String,
            default: "",
        },
        updatedAt: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

const userSchema = new Schema(
    {
    firstname : {
        type : String,
        minlength : 2,
        maxlength : 10,
        required : true,
        trim : true
    },
    lastname : {
        type : String,
        minlength : 2,
        maxlength : 10,
        trim : true
    },
    age : {
        type : Number,
        min : 6,
        max : 60,
    },
    emailId : {
        type : String,
        required : true,
        immutable : true,
        trim : true,
        unique : true,
        lowercase : true
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 8
    },
    role : {
        type : String,
        enum : ["user","admin"],
        default : "user"
    },
    gender : {
        type : String,
        enum : ["male","female","others"],
    },
    profilePic: {
        type: String,
        default: ""
    },
    problemSolved : {
        type : [{
            type : Schema.Types.ObjectId,
            ref : "problem"
        }],
        default : []
    },
    aptitudeLearningProgress: {
        aptitude: {
            type: learningCourseProgressSchema,
            default: createEmptyLearningProgress,
        },
        logical: {
            type: learningCourseProgressSchema,
            default: createEmptyLearningProgress,
        },
        verbal: {
            type: learningCourseProgressSchema,
            default: createEmptyLearningProgress,
        },
        csCore: {
            type: learningCourseProgressSchema,
            default: createEmptyLearningProgress,
        },
    }
    },
    {
        timestamps : true
    }
)

const user = mongoose.model("user",userSchema);

export default user;
