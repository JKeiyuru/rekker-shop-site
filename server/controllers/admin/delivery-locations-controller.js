// server/controllers/admin/delivery-locations-controller.js
// Admin controller for managing delivery zones and fees.
// The seedFromStaticData function reads from server/config/kenya-location-data-seed.js
// and inserts locations into MongoDB, skipping any that already exist.

const DeliveryLocation = require("../../models/DeliveryLocation");

// GET all delivery locations (supports ?county=X&active=true filtering)
const getAllDeliveryLocations = async (req, res) => {
  try {
    const { county, subCounty, active } = req.query;
    const query = {};
    if (county) query.county = county;
    if (subCounty) query.subCounty = subCounty;
    if (active !== undefined) query.isActive = active === "true";

    const locations = await DeliveryLocation.find(query).sort({
      county: 1,
      subCounty: 1,
      location: 1,
    });

    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    console.error("Get delivery locations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch delivery locations" });
  }
};

// GET a single delivery location by ID
const getDeliveryLocationById = async (req, res) => {
  try {
    const location = await DeliveryLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    res.status(200).json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch location" });
  }
};

// POST create a new delivery location
const createDeliveryLocation = async (req, res) => {
  try {
    const { county, subCounty, location, deliveryFee, isFreeDelivery, notes } = req.body;

    if (!county || !subCounty || !location) {
      return res.status(400).json({
        success: false,
        message: "County, sub-county, and location name are required",
      });
    }

    const newLocation = new DeliveryLocation({
      county: county.trim(),
      subCounty: subCounty.trim(),
      location: location.trim(),
      deliveryFee: isFreeDelivery ? 0 : Number(deliveryFee) || 0,
      isFreeDelivery: !!isFreeDelivery,
      notes: notes || "",
      isActive: true,
    });

    await newLocation.save();
    res
      .status(201)
      .json({ success: true, data: newLocation, message: "Location added successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A location with this county / sub-county / location name already exists",
      });
    }
    console.error("Create delivery location error:", error);
    res.status(500).json({ success: false, message: "Failed to create delivery location" });
  }
};

// PUT update a delivery location
const updateDeliveryLocation = async (req, res) => {
  try {
    const { county, subCounty, location, deliveryFee, isFreeDelivery, isActive, notes } =
      req.body;

    const updateData = {
      ...(county && { county: county.trim() }),
      ...(subCounty && { subCounty: subCounty.trim() }),
      ...(location && { location: location.trim() }),
      deliveryFee: isFreeDelivery ? 0 : Number(deliveryFee) ?? 0,
      isFreeDelivery: !!isFreeDelivery,
      isActive: isActive !== undefined ? !!isActive : true,
      notes: notes ?? "",
    };

    const updated = await DeliveryLocation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    res
      .status(200)
      .json({ success: true, data: updated, message: "Location updated successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A location with this county / sub-county / location name already exists",
      });
    }
    console.error("Update delivery location error:", error);
    res.status(500).json({ success: false, message: "Failed to update location" });
  }
};

// DELETE a delivery location
const deleteDeliveryLocation = async (req, res) => {
  try {
    const deleted = await DeliveryLocation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    res.status(200).json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    console.error("Delete delivery location error:", error);
    res.status(500).json({ success: false, message: "Failed to delete location" });
  }
};

// GET all unique counties (for dropdowns)
const getCounties = async (req, res) => {
  try {
    const counties = await DeliveryLocation.distinct("county", { isActive: true });
    res.status(200).json({ success: true, data: counties.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch counties" });
  }
};

// GET sub-counties for a given county
const getSubCounties = async (req, res) => {
  try {
    const { county } = req.params;
    const subCounties = await DeliveryLocation.distinct("subCounty", {
      county,
      isActive: true,
    });
    res.status(200).json({ success: true, data: subCounties.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch sub-counties" });
  }
};

// GET locations for a given county + subCounty (for user address form)
const getLocationsForArea = async (req, res) => {
  try {
    const { county, subCounty } = req.params;
    const locations = await DeliveryLocation.find({
      county,
      subCounty,
      isActive: true,
    })
      .select("location deliveryFee isFreeDelivery")
      .sort({ location: 1 });

    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch locations" });
  }
};

// POST /seed — bulk-insert locations from the static config file.
// Already-existing entries (same county + subCounty + location) are skipped,
// so it is safe to call this endpoint multiple times — it is idempotent.
const seedFromStaticData = async (req, res) => {
  try {
    // Load the server-side seed config
    const { kenyaLocationData } = require("../../config/kenya-location-data-seed");

    let created = 0;
    let skipped = 0;

    for (const [countyKey, countyData] of Object.entries(kenyaLocationData)) {
      for (const [subCountyKey, subCountyData] of Object.entries(countyData.subCounties)) {
        for (const loc of subCountyData.locations) {
          try {
            await DeliveryLocation.create({
              county: countyKey,
              subCounty: subCountyKey,
              location: loc.name,
              deliveryFee: loc.deliveryFee,
              // Mark as free delivery when fee is 0 (e.g. Nairobi CBD)
              isFreeDelivery: loc.deliveryFee === 0,
              isActive: true,
            });
            created++;
          } catch (e) {
            if (e.code === 11000) {
              // Duplicate — already exists, skip silently
              skipped++;
            } else {
              throw e;
            }
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Seed complete: ${created} location(s) added, ${skipped} already existed and were skipped.`,
      created,
      skipped,
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ success: false, message: "Seed failed: " + error.message });
  }
};

module.exports = {
  getAllDeliveryLocations,
  getDeliveryLocationById,
  createDeliveryLocation,
  updateDeliveryLocation,
  deleteDeliveryLocation,
  getCounties,
  getSubCounties,
  getLocationsForArea,
  seedFromStaticData,
};