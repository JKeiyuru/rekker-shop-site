// server/routes/admin/delivery-locations-routes.js
// Routes for admin to manage delivery zones and fees

const express = require("express");
const router = express.Router();
const {
  getAllDeliveryLocations,
  getDeliveryLocationById,
  createDeliveryLocation,
  updateDeliveryLocation,
  deleteDeliveryLocation,
  getCounties,
  getSubCounties,
  getLocationsForArea,
  seedFromStaticData,
} = require("../../controllers/admin/delivery-locations-controller");

// CRUD
router.get("/", getAllDeliveryLocations);
router.get("/:id", getDeliveryLocationById);
router.post("/", createDeliveryLocation);
router.put("/:id", updateDeliveryLocation);
router.delete("/:id", deleteDeliveryLocation);

// Helpers
router.get("/counties/list", getCounties);
router.get("/subcounties/:county", getSubCounties);
router.get("/areas/:county/:subCounty", getLocationsForArea);

// One-time seed from static data
router.post("/seed", seedFromStaticData);

module.exports = router;