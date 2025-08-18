import { METHODS } from "http";

const adjectives = [
  "Clever",
  "Bright",
  "Swift",
  "Bold",
  "Wise",
  "Quick",
  "Sharp",
  "Smart",
  "Brave",
  "Cool",
  "Fast",
  "Keen",
  "Neat",
  "Pure",
  "True",
  "Wild",
  "Blue",
  "Red",
  "Green",
  "Gold",
  "Silver",
  "Purple",
  "Orange",
  "Pink",
  "Cosmic",
  "Stellar",
  "Lunar",
  "Solar",
  "Mystic",
  "Magic",
  "Noble",
  "Royal",
];

const nouns = [
  "Tiger",
  "Eagle",
  "Wolf",
  "Fox",
  "Bear",
  "Lion",
  "Hawk",
  "Owl",
  "Dragon",
  "Phoenix",
  "Falcon",
  "Raven",
  "Shark",
  "Dolphin",
  "Whale",
  "Penguin",
  "Scholar",
  "Genius",
  "Wizard",
  "Knight",
  "Ninja",
  "Samurai",
  "Warrior",
  "Hero",
  "Star",
  "Moon",
  "Sun",
  "Comet",
  "Galaxy",
  "Nebula",
  "Cosmos",
  "Universe",
];

export function generateUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;

  return `${adjective}${noun}${number}`;
}
const NINJA_API = process.env.NEXT_PUBLIC_NINGA_API;
console.log(NINJA_API);
export async function produceUsername(): Promise<string> {
  console.log("issue here");
  // If no API key is provided, use the local generator
  if (!NINJA_API) {
    return generateUsername();
  }

  try {
    const res = await fetch("https://api.api-ninjas.com/v1/randomuser", {
      method: "GET",
      headers: {
        "X-Api-Key": NINJA_API,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn(
        "API Ninjas request failed, falling back to local generator"
      );
      return generateUsername();
    }

    const data = await res.json();
    console.log(data.username);
    return data.username;
  } catch (error) {
    console.warn(
      "Error fetching from API Ninjas, falling back to local generator:",
      error
    );
    return generateUsername();
  }
}
