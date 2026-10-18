

/* Living rooms */
import livingRoom1_3 from "./assets/images/livingroom2.webp"; 
import livingRoom1_4 from "./assets/images/livingroom1.webp"; 
import livingRoom2_1 from "./assets/images/livingroom4.webp"; 
import livingRoom2_2 from "./assets/images/livingroom5.webp"; 

/* Bedrooms */
import bedroom1_1 from "./assets/images/bedroom1.webp"; 
import bedroom1_2 from "./assets/images/bedroom2.webp"; 
import bedroom2_4 from "./assets/images/bedroom4.webp"; 
import bedroom2_8 from "./assets/images/bedroom5.webp"; 
import bedroom3_2 from "./assets/images/bedroom6.webp"; 
import bedroom3_5 from "./assets/images/bedroom7.webp"; 
import bedroom4_1 from "./assets/images/bedroom8.webp"; 
import bedroom4_2 from "./assets/images/bedroom9.webp"; 

/* Kitchen & dining */
import kitchen8 from "./assets/images/kitchen2.webp"; 
import kitchen9 from "./assets/images/kitchen3.webp"; 
import kitchen1 from "./assets/images/kitchen4.webp";
import dining from "./assets/images/dinner.webp"; 


/* Bathrooms */
import bathroom1 from "./assets/images/toiletnshower.webp"; 
import bathroom2 from "./assets/images/toiletnshower1.webp"; 
import bathroomUp1 from "./assets/images/upstairs.webp"; 
import bathroomUp2 from "./assets/images/upstairs1.webp"; 

/* Entrance & hall */
import foyer2 from "./assets/images/foyer1.webp"; 



/* Garden & parking */
import carPark2 from "./assets/images/image1.jpg"; 



export type RoomKey = "living" | "bedrooms" | "kitchen" | "bathrooms" | "laundry" | "entrance" | "outside" | "details";

export type RoomPhoto = { src: string; alt: string };

export type Room = {
  key: RoomKey;
  tab: string;
  title: string;
  body: string;
  features: string[];
  photos: RoomPhoto[];
};

const ALL_ROOMS: Room[] = [
  {
    key: "living",
    tab: "Living rooms",
    title: "Two living rooms",
    body: "Two separate spaces to relax, each with its own Smart TV — so the group can spread out or come together. The main lounge has grey velvet seating and a breakfast bar by the window.",
    features: ["2 Smart TVs", "Grey velvet seating", "Breakfast bar"],
    photos: [
      { src: livingRoom1_3, alt: "Main living room with grey velvet sofa, Smart TV and breakfast bar by the window" },
      { src: livingRoom1_4, alt: "Main living room with wall-mounted TV and grey velvet sofa" },
      { src: livingRoom2_1, alt: "Bright second living room with large windows" },
      { src: livingRoom2_2, alt: "Second living room with doors to the garden side" },
    ],
  },
  {
    key: "bedrooms",
    tab: "Bedrooms",
    title: "Four private bedrooms",
    body: "Bright bedrooms with velvet headboards, crisp white bedding and storage. Every bedroom has its own desk, so working or studying is easy.",
    features: ["Desk in every bedroom", "Wardrobe storage", "Sleeps up to 7"],
    photos: [
      { src: bedroom2_8, alt: "Bedroom 2 — double bed with grey velvet headboard and a work desk" },
      { src: bedroom2_4, alt: "Bedroom 2 — double bed beside mirrored wardrobes" },
      { src: bedroom1_1, alt: "Bedroom 1 — two single beds with velvet headboards" },
      { src: bedroom1_2, alt: "Bedroom 1 — twin beds and wardrobe" },
      { src: bedroom3_2, alt: "Bedroom 3 — bed, grey curtains and wardrobe" },
      { src: bedroom3_5, alt: "Bedroom 3 — two beds with a desk between them" },
      { src: bedroom4_1, alt: "Bedroom 4 — bed and desk by the window" },
      { src: bedroom4_2, alt: "Bedroom 4 — shelving and wardrobe" },
    ],
  },
  {
    key: "kitchen",
    tab: "Kitchen & dining",
    title: "Fully fitted kitchen",
    body: "A modern grey gloss kitchen with everything for home cooking, plus a dining and working area for meals together.",
    features: ["Oven & microwave", "Air fryer", "Fridge / freezer"],
    photos: [
      { src: kitchen8, alt: "Grey gloss kitchen with oven, hob and white metro tiles" },
      { src: kitchen9, alt: "Kitchen worktops with microwave and appliances" },
      { src: kitchen1, alt: "Kitchen sink by the window" },
      { src: dining, alt: "Breakfast bar with stools by the window" },
    ],
  },
  {
    key: "bathrooms",
    tab: "Bathrooms",
    title: "Two bathrooms",
    body: "Two bathrooms, each with a toilet and shower, so busy mornings run smoothly for larger groups.",
    features: ["2 showers", "2 toilets", "Marble-effect walls"],
    photos: [
      { src: bathroom1, alt: "White marble-effect bathroom with shower" },
      { src: bathroom2, alt: "Bathroom with toilet and marble-effect walls" },
      { src: bathroomUp1, alt: "Upstairs shower room with ambient lighting" },
      { src: bathroomUp2, alt: "Upstairs rainfall shower head with ambient lighting" },
    ],
  },
  {
    key: "laundry",
    tab: "Laundry",
    title: "Dedicated laundry room",
    body: "Your own laundry room with a washing machine and tumble dryer — useful on longer stays and work contracts.",
    features: ["Washing machine", "Tumble dryer"],
    photos: [], // add laundry photos here when ready
  },
  {
    key: "entrance",
    tab: "Entrance & hall",
    title: "A warm welcome",
    body: "A bright porch and entrance hall, with a gold console at the foot of the stairs leading up to the landing.",
    features: ["Private entrance", "Bright hallway"],
    photos: [
      { src: foyer2, alt: "Entrance hall with a gold console table at the foot of the stairs" },

    ],
  },
  {
    key: "outside",
    tab: "Parking",
    title: "Parking",
    body: "Private driveway parking for up to three cars, with external CCTV for security.",
    features: ["Large private garden", "Designated parking", "External CCTV only"],
    photos: [
      { src: carPark2, alt: "Front of the house with private driveway parking" },
    ],
  },
];

/** Rooms with at least one photo (empty rooms are hidden from the tabs). */
export const ROOMS: Room[] = ALL_ROOMS.filter((r) => r.photos.length > 0);

export const ROOM_PHOTO_COUNT = ROOMS.reduce((n, r) => n + r.photos.length, 0);