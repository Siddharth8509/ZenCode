import ImageKit from "@imagekit/nodejs";

let imageKit;

if (process.env.RESUME_BUILDER_IMAGEKIT_PRIVATE_KEY && !process.env.RESUME_BUILDER_IMAGEKIT_PRIVATE_KEY.includes("<your")) {
  imageKit = new ImageKit({
    privateKey: process.env.RESUME_BUILDER_IMAGEKIT_PRIVATE_KEY,
  });
} else {
  console.warn("RESUME_BUILDER_IMAGEKIT_PRIVATE_KEY is missing or contains placeholder. Image uploads will not work.");
}


export default imageKit;
