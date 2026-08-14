// server/controllers/shop/address-controller.js
// Rekker address controller — supports Kenya location fields.
// Max 2 saved addresses per user is enforced on add.

const Address = require("../../models/Address");

const MAX_ADDRESSES = 2;

const addAddress = async (req, res) => {
  try {
    const {
      userId,
      county,
      subCounty,
      location,
      specificAddress,
      address,
      phone,
      notes,
      deliveryFee,
      isFreeDelivery,
    } = req.body;

    if (!userId || !county || !subCounty || !location || !phone) {
      return res.status(400).json({
        success: false,
        message: "userId, county, subCounty, location, and phone are required",
      });
    }

    // Enforce max addresses
    const existingCount = await Address.countDocuments({ userId });
    if (existingCount >= MAX_ADDRESSES) {
      return res.status(400).json({
        success: false,
        message: `You can save a maximum of ${MAX_ADDRESSES} addresses. Please delete one before adding another.`,
      });
    }

    const newAddress = new Address({
      userId,
      county,
      subCounty,
      location,
      specificAddress: specificAddress || "",
      address:         address || `${specificAddress || ""}, ${location}, ${subCounty}, ${county}`.replace(/^,\s*/, ""),
      phone,
      notes:           notes || "",
      deliveryFee:     deliveryFee    || 0,
      isFreeDelivery:  isFreeDelivery || false,
    });

    await newAddress.save();

    res.status(201).json({ success: true, data: newAddress });
  } catch (e) {
    console.error("addAddress error:", e);
    res.status(500).json({ success: false, message: "Error saving address" });
  }
};

const fetchAllAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User id is required" });
    }

    const addressList = await Address.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: addressList });
  } catch (e) {
    console.error("fetchAllAddress error:", e);
    res.status(500).json({ success: false, message: "Error fetching addresses" });
  }
};

const editAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const formData = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: "User and address id are required" });
    }

    // Rebuild formatted address string if location fields changed
    if (formData.specificAddress !== undefined || formData.location !== undefined) {
      const existing = await Address.findOne({ _id: addressId, userId });
      if (existing) {
        const specific  = formData.specificAddress ?? existing.specificAddress;
        const loc       = formData.location        ?? existing.location;
        const sub       = formData.subCounty       ?? existing.subCounty;
        const county    = formData.county          ?? existing.county;
        formData.address = [specific, loc, sub, county].filter(Boolean).join(", ");
      }
    }

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      formData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    console.error("editAddress error:", e);
    res.status(500).json({ success: false, message: "Error updating address" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: "User and address id are required" });
    }

    const deleted = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (e) {
    console.error("deleteAddress error:", e);
    res.status(500).json({ success: false, message: "Error deleting address" });
  }
};

module.exports = { addAddress, editAddress, fetchAllAddress, deleteAddress };