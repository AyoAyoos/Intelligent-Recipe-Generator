export const navItems = [
  {
    label: "About",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "Company", ariaLabel: "About Company", href: "/company" },
      { label: "Careers", ariaLabel: "About Careers", href: "/careers" }
    ]
  },
  {
    label: "Recipes",
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "Featured", ariaLabel: "Featured Recipes", href: "/recipes/featured" },
      { label: "My Pantry", ariaLabel: "My Pantry", href: "/pantry" },
      // Added My Cookbook link here
      { label: "My Cookbook", ariaLabel: "My Cookbook", href: "/cookbook" }
    ]
  },
  {
    label: "Contact",
    bgColor: "#271E37", 
    textColor: "#fff",
    links: [
      { label: "Support", ariaLabel: "Email us", href: "/support" }
    ]
  }
];