// server/routes/shop/delivery-routes.js
// Public routes for users to look up delivery zones and fees

const express = require("express");
const router = express.Router();
const DeliveryLocation = require("../../models/DeliveryLocation");

// GET all active counties
router.get("/counties", async (req, res) => {
  try {
    const counties = await DeliveryLocation.distinct("county", { isActive: true });
    res.json({ success: true, data: counties.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch counties" });
  }
});

// GET sub-counties for a county
router.get("/subcounties/:county", async (req, res) => {
  try {
    const subCounties = await DeliveryLocation.distinct("subCounty", {
      county: req.params.county,
      isActive: true,
    });
    res.json({ success: true, data: subCounties.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch sub-counties" });
  }
});

// GET locations (with fees) for a county + subCounty
router.get("/locations/:county/:subCounty", async (req, res) => {
  try {
    const locations = await DeliveryLocation.find({
      county: req.params.county,
      subCounty: req.params.subCounty,
      isActive: true,
    })
      .select("location deliveryFee isFreeDelivery _id")
      .sort({ location: 1 });

    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch locations" });
  }
});

// GET fee for a specific location
router.get("/fee/:county/:subCounty/:location", async (req, res) => {
  try {
    const loc = await DeliveryLocation.findOne({
      county: req.params.county,
      subCounty: req.params.subCounty,
      location: req.params.location,
      isActive: true,
    }).select("deliveryFee isFreeDelivery");

    if (!loc) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    res.json({ success: true, data: loc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch fee" });
  }
});

module.exports = router;