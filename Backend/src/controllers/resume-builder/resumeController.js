import imageKit from "../../config/imageKit.js";
import Resume from "../../model/ResumeBuilder.js";
import fs from "fs";

// get all resumes
export const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ updatedAt: -1 });
    return res.status(200).json({ resumes });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// create resume
export const createResume = async (req, res) => {
  try {
    const { title } = req.body;

    const newResume = await Resume.create({ title });

    return res
      .status(201)
      .json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// delete resume
export const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    await Resume.findByIdAndDelete(resumeId);

    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get resume by id
export const getResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get public resume
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ public: true, _id: resumeId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// update resume
export const updateResume = async (req, res) => {
  try {
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    let resumeDataCopy;

    if (typeof resumeData === "string") {
      resumeDataCopy = JSON.parse(resumeData);
    } else {
      resumeDataCopy = structuredClone(resumeData);
    }

    if (image) {
      if (!imageKit) {
        throw new Error("Image upload is not configured on the server. Please provide IMAGEKIT_PRIVATE_KEY in .env");
      }
      const imageBufferData = fs.createReadStream(image.path);

      const response = await imageKit.files.upload({
        file: imageBufferData,
        fileName: "resume.png",
        folder: "user-resumes",
        transformation: {
          pre:
            "w-300,h-300,fo-face,z-0.45" +
            (removeBackground ? ",e-bgremove" : ""),
        },
      });

      resumeDataCopy.personal_info.image = response.url;
    }

    const resume = await Resume.findByIdAndUpdate(
      resumeId,
      resumeDataCopy,
      { new: true }
    );

    return res.status(200).json({ message: "Saved successfully", resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};