// server/helpers/trade.js
// Trade (stockist / wholesaler / distributor) request rules.
// MOQ = minimum order quantity, in units, PER BRAND. Set it per brand in
// Admin → Brands ("Trade MOQ"). Brands with no value use DEFAULT_MOQ.
const DEFAULT_MOQ = Number(process.env.DEFAULT_TRADE_MOQ) || 12;

const moqFor = (brand) => (brand && Number(brand.wholesaleMoq) > 0 ? Number(brand.wholesaleMoq) : DEFAULT_MOQ);

module.exports = { DEFAULT_MOQ, moqFor };
