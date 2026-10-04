const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const rawName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim().replace(/^["']|["']$/g, "");

cloudinary.config({
  cloud_name: rawName,
  api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
});

if (!rawName || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️  Cloudinary is not fully configured (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET) — image uploads will fail.");
}

const storage = new multer.memoryStorage();

// Cloud names are case-sensitive in the API. A very common mistake is typing the
// account/display name ("Root") instead of the cloud name ("root"), so if Cloudinary
// says the cloud name is invalid we try the lowercase version once and remember it.
let workingName = null;
async function imageUploadUtil(file) {
  const attempt = (name) =>
    cloudinary.uploader.upload(file, { resource_type: "auto", ...(name ? { cloud_name: name } : {}) });

  if (workingName) return attempt(workingName);
  try {
    return await attempt();
  } catch (err) {
    const msg = String(err?.message || err?.error?.message || "");
    if (/invalid cloud_name/i.test(msg) && rawName && rawName !== rawName.toLowerCase()) {
      const result = await attempt(rawName.toLowerCase());
      workingName = rawName.toLowerCase();
      console.warn(`✅ Cloudinary accepted "${workingName}" (lowercase). Set CLOUDINARY_CLOUD_NAME=${workingName} on the server to make this permanent.`);
      return result;
    }
    throw err;
  }
}

// Turns Cloudinary's errors into instructions an admin can act on
function friendlyUploadError(error) {
  const msg = String(error?.message || error?.error?.message || "unknown error");
  if (/invalid cloud_name/i.test(msg)) {
    return `Cloudinary doesn't recognise the cloud name "${rawName}". In your Cloudinary dashboard copy the exact "Cloud name" (it is usually all lowercase letters/numbers and is NOT the same as your account name), set it as CLOUDINARY_CLOUD_NAME on the server, and redeploy.`;
  }
  if (/api[_ ]key|invalid signature|unauthorized|401/i.test(msg)) {
    return "Cloudinary rejected the API key or secret. Re-copy CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET from the Cloudinary dashboard into the server settings.";
  }
  if (/file size|too large/i.test(msg)) return "That image is too large for Cloudinary. Try a smaller one.";
  return `Image upload failed: ${msg}`;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil, friendlyUploadError };
