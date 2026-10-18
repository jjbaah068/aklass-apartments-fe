import livingRoom3 from "./assets/images/livingroom1.webp"; 
import bedroom2b from "./assets/images/bedroom2.webp"; 
import kitchen8 from "./assets/images/kitchen1.webp"; 
import foyer2 from "./assets/images/foyer1.webp"; 
import exterior2 from "./assets/images/carpark1.webp"; 

export type RoomKey =
  | "living"
  | "bedrooms"
  | "kitchen"
  | "bathrooms"
  | "laundry"
  | "outside"
  | "entrance"
  | "details";

export type Photo = {
  src: string;
  alt: string;
  room: RoomKey;
};

/** The five photos in the hero mosaic */
export const HERO_PHOTOS: Photo[] = [
  { src: livingRoom3, room: "living", alt: "Living room with grey velvet sofa, Smart TV and breakfast bar by the window" },
  { src: bedroom2b, room: "bedrooms", alt: "Double bedroom with grey velvet headboard and a work desk" },
  { src: kitchen8, room: "kitchen", alt: "Modern grey gloss kitchen with oven, hob and white metro tiles" },
  { src: foyer2, room: "entrance", alt: "Entrance hall with a gold console table at the foot of the stairs" },
  { src: exterior2, room: "outside", alt: "Front of the house with private driveway parking" },
];


export const TOTAL_PHOTOS = 32;