import type { ElementType } from "react";
import {
  BookOpenText,
  Footprints,
  Gift,
  Shirt,
  ShoppingBag,
  Sparkles,
  Tag,
  User,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: ElementType;
  ad?: {
    image: string;
    alt: string;
  };
  items: { label: string; description: string }[];
}

export const secondaryNavLinks = ["Contact Us", "About Us"];

export const navItems = [
  {
    label: "New & Featured",
    icon: Sparkles,
    ad: {
      image:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
      alt: "New arrivals featured promotion",
    },
    items: [
      {
        label: "New Arrivals",
        description: "Discover our latest styles and seasonal collections.",
      },
      {
        label: "Best Sellers",
        description: "Our most popular pieces loved by customers.",
      },
      {
        label: "Style Guides",
        description: "Expert tips to help you build your perfect wardrobe.",
      },
      {
        label: "Exclusive Collections",
        description: "Limited-edition designs you won't find anywhere else.",
      },
    ],
  },
  {
    label: "Style & Inspiration",
    icon: BookOpenText,
    items: [
      {
        label: "Wardrobe Essentials",
        description: "Timeless basics every closet needs.",
      },
      {
        label: "Seasonal Trends",
        description: "Stay on top of this season's hottest looks.",
      },
      {
        label: "Outfit Ideas",
        description: "Curated outfit inspiration for every occasion.",
      },
      {
        label: "Size & Fit Guide",
        description: "Find your perfect fit with our measuring tips.",
      },
      {
        label: "Care Tips",
        description: "Keep your clothes looking fresh and lasting longer.",
      },
    ],
  },
  {
    label: "Women",
    icon: Shirt,
    ad: {
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
      alt: "Women's collection promotion",
    },
    items: [
      {
        label: "Dresses & Skirts",
        description: "From casual day dresses to elegant evening wear.",
      },
      {
        label: "Tops & Blouses",
        description: "Tees, tanks, blouses, and more for every style.",
      },
      {
        label: "Pants & Jeans",
        description: "Comfortable and stylish bottoms for any occasion.",
      },
      {
        label: "Jackets & Coats",
        description: "Outerwear to keep you warm and fashionable.",
      },
      {
        label: "Swimwear",
        description: "Bikinis, one-pieces, and cover-ups for the beach.",
      },
      {
        label: "Activewear",
        description: "Performance pieces for workouts and athleisure.",
      },
    ],
  },
  {
    label: "Men",
    icon: User,
    items: [
      {
        label: "Shirts & Polos",
        description: "Casual and dress shirts for every occasion.",
      },
      {
        label: "Pants & Chinos",
        description: "Comfortable pants from relaxed to refined fits.",
      },
      {
        label: "Jackets & Outerwear",
        description: "Layer up with stylish jackets and coats.",
      },
      {
        label: "Suits & Blazers",
        description: "Sharp tailoring for formal and business settings.",
      },
    ],
  },
  {
    label: "Shoes & Footwear",
    icon: Footprints,
    ad: {
      image:
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80",
      alt: "Shoes and footwear promotion",
    },
    items: [
      {
        label: "Sneakers & Athletic",
        description: "Comfortable kicks for everyday wear and workouts.",
      },
      {
        label: "Boots & Booties",
        description: "Stylish boots for cooler weather and statement looks.",
      },
      {
        label: "Sandals & Slides",
        description: "Breezy options for warm days and beach trips.",
      },
      {
        label: "Heels & Flats",
        description: "Dress shoes from casual flats to elegant heels.",
      },
      {
        label: "Loafers & Dress Shoes",
        description: "Polished footwear for work and formal occasions.",
      },
    ],
  },
  {
    label: "Accessories",
    icon: ShoppingBag,
    ad: {
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      alt: "Accessories promotion",
    },
    items: [
      {
        label: "Bags & Backpacks",
        description: "Totes, crossbody bags, and packs for every need.",
      },
      {
        label: "Jewelry",
        description: "Earrings, necklaces, bracelets, and more.",
      },
      {
        label: "Hats & Caps",
        description: "Sun hats, beanies, and caps to top off your look.",
      },
      {
        label: "Belts & Scarves",
        description: "Finishing touches to complete any outfit.",
      },
    ],
  },
  {
    label: "Gifts",
    icon: Gift,
    ad: {
      image:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
      alt: "Gifts promotion",
    },
    items: [
      {
        label: "Gift Cards",
        description: "The perfect present that always fits.",
      },
      {
        label: "Gifts by Price",
        description: "Thoughtful gifts for every budget.",
      },
      {
        label: "Gifts for Her",
        description: "Curated picks she'll love to receive.",
      },
      {
        label: "Gifts for Him",
        description: "Stylish gifts he'll actually want to wear.",
      },
      {
        label: "Gifts by Recipient",
        description: "Personalized suggestions for everyone on your list.",
      },
      {
        label: "Gifts by Occasion",
        description: "Celebrate birthdays, holidays, and special moments.",
      },
    ],
  },
  {
    label: "Sale",
    icon: Tag,
    ad: {
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      alt: "Sale promotion",
    },
    items: [
      {
        label: "Clearance",
        description: "Final markdowns on select styles.",
      },
      {
        label: "Weekly Deals",
        description: "New discounts added every week.",
      },
      {
        label: "Bundle & Save",
        description: "Special pricing on outfit sets and multi-packs.",
      },
      {
        label: "Last Chance",
        description: "Grab these items before they're gone for good.",
      },
    ],
  },
] satisfies NavItem[];
