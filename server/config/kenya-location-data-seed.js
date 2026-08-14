// server/config/kenya-location-data-seed.js
// Complete Kenya delivery location data used by the one-time seed endpoint.
// When the admin clicks "Seed Default Data" on the delivery locations page,
// this data is inserted into the DeliveryLocation collection.
// Duplicate locations (same county + subCounty + location) are automatically
// skipped, so the button is safe to click multiple times.

const kenyaLocationData = {
  Nairobi: {
    name: "Nairobi",
    subCounties: {
      Westlands: {
        name: "Westlands",
        locations: [
          { name: "Westlands", deliveryFee: 150 },
          { name: "Parklands", deliveryFee: 150 },
          { name: "Highridge", deliveryFee: 180 },
          { name: "Karura", deliveryFee: 200 },
        ],
      },
      "Dagoretti North": {
        name: "Dagoretti North",
        locations: [
          { name: "Kilimani", deliveryFee: 120 },
          { name: "Kawangware", deliveryFee: 180 },
          { name: "Gatina", deliveryFee: 200 },
          { name: "Kileleshwa", deliveryFee: 150 },
        ],
      },
      "Dagoretti South": {
        name: "Dagoretti South",
        locations: [
          { name: "Mutu-ini", deliveryFee: 220 },
          { name: "Ngando", deliveryFee: 200 },
          { name: "Riruta", deliveryFee: 190 },
          { name: "Uthiru/Ruthimitu", deliveryFee: 250 },
        ],
      },
      Langata: {
        name: "Langata",
        locations: [
          { name: "Karen", deliveryFee: 200 },
          { name: "Nairobi West", deliveryFee: 150 },
          { name: "Mugumo-ini", deliveryFee: 180 },
          { name: "South C", deliveryFee: 150 },
          { name: "Nyayo Highrise", deliveryFee: 130 },
        ],
      },
      Kibra: {
        name: "Kibra",
        locations: [
          { name: "Kibera", deliveryFee: 150 },
          { name: "Sarang'ombe", deliveryFee: 180 },
          { name: "Woodley/Kenyatta Golf Course", deliveryFee: 140 },
          { name: "Laini Saba", deliveryFee: 160 },
        ],
      },
      Roysambu: {
        name: "Roysambu",
        locations: [
          { name: "Githurai", deliveryFee: 200 },
          { name: "Kahawa West", deliveryFee: 220 },
          { name: "Zimmerman", deliveryFee: 180 },
          { name: "Roysambu", deliveryFee: 190 },
          { name: "Kahawa", deliveryFee: 230 },
        ],
      },
      Kasarani: {
        name: "Kasarani",
        locations: [
          { name: "Clay City", deliveryFee: 200 },
          { name: "Mwiki", deliveryFee: 180 },
          { name: "Kasarani", deliveryFee: 170 },
          { name: "Njiru", deliveryFee: 220 },
          { name: "Ruai", deliveryFee: 280 },
        ],
      },
      Ruaraka: {
        name: "Ruaraka",
        locations: [
          { name: "Baba Dogo", deliveryFee: 180 },
          { name: "Utalii", deliveryFee: 160 },
          { name: "Mathare North", deliveryFee: 150 },
          { name: "Lucky Summer", deliveryFee: 170 },
          { name: "Korogocho", deliveryFee: 190 },
        ],
      },
      "Embakasi South": {
        name: "Embakasi South",
        locations: [
          { name: "Imara Daima", deliveryFee: 180 },
          { name: "Kwa Njenga", deliveryFee: 200 },
          { name: "Kwa Reuben", deliveryFee: 190 },
          { name: "Pipeline", deliveryFee: 170 },
          { name: "Kware", deliveryFee: 220 },
        ],
      },
      "Embakasi North": {
        name: "Embakasi North",
        locations: [
          { name: "Kariobangi North", deliveryFee: 180 },
          { name: "Dandora Area I", deliveryFee: 190 },
          { name: "Dandora Area II", deliveryFee: 190 },
          { name: "Dandora Area III", deliveryFee: 200 },
          { name: "Dandora Area IV", deliveryFee: 200 },
        ],
      },
      "Embakasi Central": {
        name: "Embakasi Central",
        locations: [
          { name: "Kayole North", deliveryFee: 200 },
          { name: "Kayole Central", deliveryFee: 190 },
          { name: "Kayole South", deliveryFee: 200 },
          { name: "Komarock", deliveryFee: 180 },
          { name: "Matopeni/Spring Valley", deliveryFee: 220 },
        ],
      },
      "Embakasi East": {
        name: "Embakasi East",
        locations: [
          { name: "Upper Savannah", deliveryFee: 250 },
          { name: "Lower Savannah", deliveryFee: 240 },
          { name: "Embakasi", deliveryFee: 200 },
          { name: "Utawala", deliveryFee: 280 },
          { name: "Mihango", deliveryFee: 220 },
        ],
      },
      "Embakasi West": {
        name: "Embakasi West",
        locations: [
          { name: "Umoja I", deliveryFee: 180 },
          { name: "Umoja II", deliveryFee: 180 },
          { name: "Mowlem", deliveryFee: 170 },
          { name: "Kariobangi South", deliveryFee: 190 },
        ],
      },
      Makadara: {
        name: "Makadara",
        locations: [
          { name: "Maringo/Hamza", deliveryFee: 130 },
          { name: "Viwandani", deliveryFee: 140 },
          { name: "Harambee", deliveryFee: 120 },
          { name: "Makongeni", deliveryFee: 130 },
        ],
      },
      Kamukunji: {
        name: "Kamukunji",
        locations: [
          { name: "Pumwani", deliveryFee: 120 },
          { name: "Eastleigh North", deliveryFee: 130 },
          { name: "Eastleigh South", deliveryFee: 130 },
          { name: "Airbase", deliveryFee: 140 },
          { name: "California", deliveryFee: 150 },
        ],
      },
      Starehe: {
        name: "Starehe",
        locations: [
          { name: "Nairobi Central (CBD)", deliveryFee: 0 },
          { name: "Ngara", deliveryFee: 120 },
          { name: "Ziwani/Kariokor", deliveryFee: 130 },
          { name: "Landimawe", deliveryFee: 140 },
          { name: "Nairobi South", deliveryFee: 110 },
        ],
      },
      Mathare: {
        name: "Mathare",
        locations: [
          { name: "Hospital", deliveryFee: 130 },
          { name: "Mabatini", deliveryFee: 150 },
          { name: "Huruma", deliveryFee: 140 },
          { name: "Ngei", deliveryFee: 160 },
          { name: "Mlango Kubwa", deliveryFee: 140 },
        ],
      },
    },
  },

  Kiambu: {
    name: "Kiambu",
    subCounties: {
      "Thika Town": {
        name: "Thika Town",
        locations: [
          { name: "Township", deliveryFee: 300 },
          { name: "Kamenu", deliveryFee: 320 },
          { name: "Hospital", deliveryFee: 310 },
          { name: "Gatuanyaga", deliveryFee: 350 },
          { name: "Ngoliba", deliveryFee: 340 },
        ],
      },
      Ruiru: {
        name: "Ruiru",
        locations: [
          { name: "Biashara", deliveryFee: 250 },
          { name: "Gatongora", deliveryFee: 280 },
          { name: "Kahawa Sukari", deliveryFee: 230 },
          { name: "Kahawa Wendani", deliveryFee: 240 },
          { name: "Kiuu", deliveryFee: 300 },
        ],
      },
      Juja: {
        name: "Juja",
        locations: [
          { name: "Murera", deliveryFee: 280 },
          { name: "Theta", deliveryFee: 290 },
          { name: "Juja", deliveryFee: 270 },
          { name: "Witeithie", deliveryFee: 300 },
          { name: "Kalimoni", deliveryFee: 320 },
        ],
      },
      "Kiambu Town": {
        name: "Kiambu Town",
        locations: [
          { name: "Tinganga", deliveryFee: 350 },
          { name: "Ndumberi", deliveryFee: 320 },
          { name: "Riabai", deliveryFee: 340 },
          { name: "Township", deliveryFee: 300 },
        ],
      },
      Limuru: {
        name: "Limuru",
        locations: [
          { name: "Limuru Town", deliveryFee: 400 },
          { name: "Bibirioni", deliveryFee: 420 },
          { name: "Ndeiya", deliveryFee: 450 },
        ],
      },
      Kikuyu: {
        name: "Kikuyu",
        locations: [
          { name: "Kikuyu Town", deliveryFee: 250 },
          { name: "Kinoo", deliveryFee: 220 },
          { name: "Karai", deliveryFee: 270 },
          { name: "Muguga", deliveryFee: 300 },
        ],
      },
    },
  },

  Kajiado: {
    name: "Kajiado",
    subCounties: {
      "Kajiado North": {
        name: "Kajiado North",
        locations: [
          { name: "Rongai", deliveryFee: 200 },
          { name: "Nkaimurunya", deliveryFee: 250 },
          { name: "Olkeri", deliveryFee: 280 },
          { name: "Ngong", deliveryFee: 220 },
          { name: "Embulbul", deliveryFee: 300 },
        ],
      },
      "Kajiado East": {
        name: "Kajiado East",
        locations: [
          { name: "Kaputiei North", deliveryFee: 400 },
          { name: "Kitengela", deliveryFee: 250 },
          { name: "Oloosirkon/Sholinke", deliveryFee: 450 },
          { name: "Kenyawa-Poka", deliveryFee: 500 },
        ],
      },
      "Kajiado West": {
        name: "Kajiado West",
        locations: [
          { name: "Keekonyokie", deliveryFee: 600 },
          { name: "Iloodokilani", deliveryFee: 650 },
          { name: "Magadi", deliveryFee: 700 },
          { name: "Ewuaso Oo Nkidong'i", deliveryFee: 750 },
        ],
      },
      "Kajiado Central": {
        name: "Kajiado Central",
        locations: [
          { name: "Kajiado Town", deliveryFee: 550 },
          { name: "Entonet/Lenkisem", deliveryFee: 600 },
        ],
      },
    },
  },

  Machakos: {
    name: "Machakos",
    subCounties: {
      "Machakos Town": {
        name: "Machakos Town",
        locations: [
          { name: "Machakos Central", deliveryFee: 400 },
          { name: "Mumbuni North", deliveryFee: 420 },
          { name: "Mumbuni South", deliveryFee: 430 },
          { name: "Mutituni", deliveryFee: 450 },
        ],
      },
      "Athi River": {
        name: "Athi River",
        locations: [
          { name: "Athi River", deliveryFee: 300 },
          { name: "Kinanie", deliveryFee: 350 },
          { name: "Syokimau/Mulolongo", deliveryFee: 280 },
        ],
      },
      Mavoko: {
        name: "Mavoko",
        locations: [
          { name: "Mlolongo", deliveryFee: 270 },
          { name: "Athi River Industrial", deliveryFee: 290 },
        ],
      },
    },
  },

  Mombasa: {
    name: "Mombasa",
    subCounties: {
      Mvita: {
        name: "Mvita",
        locations: [
          { name: "Mji Wa Kale/Makadara", deliveryFee: 300 },
          { name: "Tudor", deliveryFee: 320 },
          { name: "Tononoka", deliveryFee: 310 },
          { name: "Shimanzi/Ganjoni", deliveryFee: 330 },
        ],
      },
      Changamwe: {
        name: "Changamwe",
        locations: [
          { name: "Port Reitz", deliveryFee: 350 },
          { name: "Kipevu", deliveryFee: 340 },
          { name: "Airport", deliveryFee: 360 },
          { name: "Changamwe", deliveryFee: 330 },
        ],
      },
      Jomvu: {
        name: "Jomvu",
        locations: [
          { name: "Jomvu Kuu", deliveryFee: 380 },
          { name: "Mikanjuni", deliveryFee: 390 },
          { name: "Miritini", deliveryFee: 370 },
        ],
      },
      Likoni: {
        name: "Likoni",
        locations: [
          { name: "Shika Adabu", deliveryFee: 350 },
          { name: "Bofu", deliveryFee: 360 },
          { name: "Mtongwe", deliveryFee: 380 },
          { name: "Likoni", deliveryFee: 340 },
        ],
      },
      Nyali: {
        name: "Nyali",
        locations: [
          { name: "Frere Town", deliveryFee: 320 },
          { name: "Ziwa La Ng'ombe", deliveryFee: 330 },
          { name: "Mkomani", deliveryFee: 310 },
          { name: "Kongowea", deliveryFee: 340 },
          { name: "Kadzandani", deliveryFee: 350 },
        ],
      },
    },
  },

  Kisumu: {
    name: "Kisumu",
    subCounties: {
      "Kisumu Central": {
        name: "Kisumu Central",
        locations: [
          { name: "Railways", deliveryFee: 400 },
          { name: "Migosi", deliveryFee: 420 },
          { name: "Shaurimoyo Kaloleni", deliveryFee: 410 },
          { name: "Market Milimani", deliveryFee: 400 },
        ],
      },
      "Kisumu East": {
        name: "Kisumu East",
        locations: [
          { name: "Kajulu", deliveryFee: 450 },
          { name: "Kolwa East", deliveryFee: 440 },
          { name: "Manyatta B", deliveryFee: 430 },
          { name: "Nyalenda A", deliveryFee: 420 },
        ],
      },
      "Kisumu West": {
        name: "Kisumu West",
        locations: [
          { name: "South West Kisumu", deliveryFee: 430 },
          { name: "Central Kisumu", deliveryFee: 400 },
          { name: "Kisumu North", deliveryFee: 420 },
        ],
      },
    },
  },

  Nakuru: {
    name: "Nakuru",
    subCounties: {
      "Nakuru Town East": {
        name: "Nakuru Town East",
        locations: [
          { name: "Biashara", deliveryFee: 450 },
          { name: "Kivumbini", deliveryFee: 470 },
          { name: "Flamingo", deliveryFee: 460 },
          { name: "Nakuru East", deliveryFee: 480 },
        ],
      },
      "Nakuru Town West": {
        name: "Nakuru Town West",
        locations: [
          { name: "Nakuru West", deliveryFee: 450 },
          { name: "Shairi", deliveryFee: 460 },
          { name: "Rhoda", deliveryFee: 470 },
        ],
      },
      Gilgil: {
        name: "Gilgil",
        locations: [
          { name: "Gilgil", deliveryFee: 500 },
          { name: "Malewa West", deliveryFee: 520 },
        ],
      },
    },
  },

  Eldoret: {
    name: "Uasin Gishu",
    subCounties: {
      Soy: {
        name: "Soy",
        locations: [
          { name: "Eldoret CBD", deliveryFee: 500 },
          { name: "Langas", deliveryFee: 520 },
          { name: "Kapsoya", deliveryFee: 510 },
        ],
      },
      Turbo: {
        name: "Turbo",
        locations: [
          { name: "Turbo", deliveryFee: 550 },
          { name: "Ngenyilel", deliveryFee: 570 },
        ],
      },
    },
  },
};

module.exports = { kenyaLocationData };