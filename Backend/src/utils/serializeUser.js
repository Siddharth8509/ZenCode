const serializeUser = (userDoc) => ({
    _id: userDoc._id,
    firstname: userDoc.firstname,
    lastname: userDoc.lastname,
    age: userDoc.age,
    gender: userDoc.gender,
    emailId: userDoc.emailId,
    role: userDoc.role,
    profilePic: userDoc.profilePic || "",
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
});

export default serializeUser;
