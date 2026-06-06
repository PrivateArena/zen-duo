export const LEVELS = [
  {
    id: 1,
    title: "Level 1: Pets & Sounds",
    icon: "🐶",
    lessons: [
      {
        id: "l1_1",
        title: "Meet the Animals",
        challenges: [
          {
            type: "matching",
            instruction: "Match the animal to its picture!",
            pairs: {
              "Dog": "🐶",
              "Cat": "🐱",
              "Bird": "🐦",
              "Fish": "🐟"
            }
          },
          {
            type: "choice",
            instruction: "Which one is 'Cat'?",
            options: [
              { text: "Dog", emoji: "🐶" },
              { text: "Cat", emoji: "🐱" },
              { text: "Fish", emoji: "🐟" }
            ],
            answer: "Cat"
          },
          {
            type: "yes-no",
            instruction: "Is this a Dog?",
            emoji: "🐶",
            audioText: "Dog",
            answer: "yes"
          },
          {
            type: "builder",
            instruction: "Put the words in order to make 'The cat runs'!",
            promptText: "Con mèo chạy",
            targetText: "The cat runs",
            blocks: ["cat", "The", "runs", "dog", "flies"]
          },
          {
            type: "speaking",
            instruction: "Say 'Dog' into the mic!",
            word: "Dog",
            emoji: "🐶"
          }
        ]
      },
      {
        id: "l1_2",
        title: "Animal Action",
        challenges: [
          {
            type: "matching",
            instruction: "Match actions to their icons!",
            pairs: {
              "Fly": "🪶",
              "Run": "🏃",
              "Swim": "🏊",
              "Sleep": "😴"
            }
          },
          {
            type: "yes-no",
            instruction: "Can a Fish fly?",
            emoji: "🐟",
            audioText: "Fish fly",
            answer: "no"
          },
          {
            type: "builder",
            instruction: "Translate the action!",
            promptText: "Con chim bay",
            targetText: "The bird flies",
            blocks: ["The", "bird", "flies", "swims", "cat"]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Level 2: Yummy Foods",
    icon: "🍎",
    lessons: [
      {
        id: "l2_1",
        title: "Tasty Fruits",
        challenges: [
          {
            type: "matching",
            instruction: "Match the delicious food!",
            pairs: {
              "Apple": "🍎",
              "Banana": "🍌",
              "Milk": "🥛",
              "Water": "💧"
            }
          },
          {
            type: "choice",
            instruction: "Find the 'Apple'!",
            options: [
              { text: "Banana", emoji: "🍌" },
              { text: "Apple", emoji: "🍎" },
              { text: "Milk", emoji: "🥛" }
            ],
            answer: "Apple"
          },
          {
            type: "fill-blank",
            instruction: "Fill in the blank!",
            sentenceBefore: "The yummy",
            sentenceAfter: "is red.",
            options: ["apple", "milk", "water"],
            answer: "apple"
          },
          {
            type: "builder",
            instruction: "Build the sentence!",
            promptText: "Tôi uống nước",
            targetText: "I drink water",
            blocks: ["I", "water", "drink", "eat", "apple"]
          },
          {
            type: "speaking",
            instruction: "Say 'Apple' into the mic!",
            word: "Apple",
            emoji: "🍎"
          }
        ]
      },
      {
        id: "l2_2",
        title: "Healthy Eating",
        challenges: [
          {
            type: "drag-sort",
            instruction: "Sort the items into the right buckets!",
            buckets: [
              { id: "fruits", name: "Fruits", emoji: "🍎" },
              { id: "drinks", name: "Drinks", emoji: "🥛" }
            ],
            items: [
              { text: "Apple", emoji: "🍎", bucket: "fruits" },
              { text: "Milk", emoji: "🥛", bucket: "drinks" },
              { text: "Banana", emoji: "🍌", bucket: "fruits" },
              { text: "Water", emoji: "💧", bucket: "drinks" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Level 3: My Sweet Home",
    icon: "🏠",
    lessons: [
      {
        id: "l3_1",
        title: "Everyday Objects",
        challenges: [
          {
            type: "matching",
            instruction: "Match home objects!",
            pairs: {
              "Book": "📖",
              "Pen": "✏️",
              "Chair": "🪑",
              "Table": "🪵"
            }
          },
          {
            type: "yes-no",
            instruction: "Do we sit on a Chair?",
            emoji: "🪑",
            audioText: "sit on a chair",
            answer: "yes"
          },
          {
            type: "fill-blank",
            instruction: "Put the object in the sentence!",
            sentenceBefore: "A book is on the",
            sentenceAfter: ".",
            options: ["table", "pen", "fly"],
            answer: "table"
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Level 4: Sky & Colors",
    icon: "🌈",
    lessons: [
      {
        id: "l4_1",
        title: "Beautiful Colors",
        challenges: [
          {
            type: "matching",
            instruction: "Match colors!",
            pairs: {
              "Red": "🟥",
              "Blue": "🟦",
              "Yellow": "🟨",
              "Green": "🟩"
            }
          },
          {
            type: "choice",
            instruction: "What color is the sun?",
            options: [
              { text: "Red", emoji: "🟥" },
              { text: "Yellow", emoji: "🟨" },
              { text: "Blue", emoji: "🟦" }
            ],
            answer: "Yellow"
          },
          {
            type: "yes-no",
            instruction: "Is the sky green?",
            emoji: "🟦",
            audioText: "green sky",
            answer: "no"
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Level 5: Numbers 1–10",
    icon: "🔢",
    lessons: [
      {
        id: "l5_1",
        title: "Count to Five",
        challenges: [
          {
            type: "matching",
            instruction: "Match the number to objects!",
            pairs: {
              "One": "☝️",
              "Two": "✌️",
              "Three": "🤟",
              "Five": "✋"
            }
          },
          {
            type: "yes-no",
            instruction: "Are there 5 fingers on one hand?",
            emoji: "✋",
            audioText: "five fingers",
            answer: "yes"
          }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Level 6: Hello World",
    icon: "👋",
    lessons: [
      {
        id: "l6_1",
        title: "Greetings",
        challenges: [
          {
            type: "choice",
            instruction: "How do you say hello?",
            options: [
              { text: "Hello", emoji: "👋" },
              { text: "Bye", emoji: "🏃" },
              { text: "Sleep", emoji: "😴" }
            ],
            answer: "Hello"
          },
          {
            type: "yes-no",
            instruction: "Do we wave hello?",
            emoji: "👋",
            audioText: "wave hello",
            answer: "yes"
          }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Level 7: My Family",
    icon: "👨‍👩‍👧",
    lessons: [
      {
        id: "l7_1",
        title: "Family Members",
        challenges: [
          {
            type: "matching",
            instruction: "Match family members!",
            pairs: {
              "Mom": "👩",
              "Dad": "👨",
              "Baby": "👶",
              "Brother": "👦"
            }
          },
          {
            type: "fill-blank",
            instruction: "Fill in the blank!",
            sentenceBefore: "I love my",
            sentenceAfter: ".",
            options: ["Mom", "water", "apple"],
            answer: "Mom"
          }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Level 8: How I Feel",
    icon: "😊",
    lessons: [
      {
        id: "l8_1",
        title: "Happy & Sad",
        challenges: [
          {
            type: "choice",
            instruction: "Which mascot is happy?",
            options: [
              { text: "Happy", emoji: "😊" },
              { text: "Sad", emoji: "😢" },
              { text: "Angry", emoji: "😠" }
            ],
            answer: "Happy"
          },
          {
            type: "yes-no",
            instruction: "Do we cry when we are happy?",
            emoji: "😢",
            audioText: "cry happy",
            answer: "no"
          }
        ]
      }
    ]
  },
  {
    id: 9,
    title: "Level 9: Getting Dressed",
    icon: "👕",
    lessons: [
      {
        id: "l9_1",
        title: "Clothes We Wear",
        challenges: [
          {
            type: "matching",
            instruction: "Match clothes!",
            pairs: {
              "Shirt": "👕",
              "Pants": "👖",
              "Hat": "👒",
              "Shoes": "👟"
            }
          },
          {
            type: "yes-no",
            instruction: "Do we wear shoes on our head?",
            emoji: "👟",
            audioText: "shoes on head",
            answer: "no"
          }
        ]
      }
    ]
  },
  {
    id: 10,
    title: "Level 10: Weather & Sky",
    icon: "🌦️",
    lessons: [
      {
        id: "l10_1",
        title: "Rain & Sun",
        challenges: [
          {
            type: "choice",
            instruction: "What brings rain?",
            options: [
              { text: "Cloud", emoji: "☁️" },
              { text: "Sun", emoji: "☀️" },
              { text: "Star", emoji: "⭐" }
            ],
            answer: "Cloud"
          },
          {
            type: "drag-sort",
            instruction: "Sort the items by where they belong!",
            buckets: [
              { id: "sky", name: "Sky", emoji: "☁️" },
              { id: "ground", name: "Ground", emoji: "🌱" }
            ],
            items: [
              { text: "Cloud", emoji: "☁️", bucket: "sky" },
              { text: "Flower", emoji: "🌸", bucket: "ground" },
              { text: "Star", emoji: "⭐", bucket: "sky" },
              { text: "Grass", emoji: "🌿", bucket: "ground" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 11,
    title: "Level 11: Vroom Vroom",
    icon: "🚗",
    lessons: [
      {
        id: "l11_1",
        title: "Wheels",
        challenges: [
          {
            type: "matching",
            instruction: "Match vehicles!",
            pairs: {
              "Car": "🚗",
              "Train": "🚂",
              "Plane": "✈️",
              "Boat": "⛵"
            }
          },
          {
            type: "yes-no",
            instruction: "Does a boat swim on water?",
            emoji: "⛵",
            audioText: "boat swims on water",
            answer: "yes"
          }
        ]
      }
    ]
  },
  {
    id: 12,
    title: "Level 12: Let's Play",
    icon: "⚽",
    lessons: [
      {
        id: "l12_1",
        title: "Toy Box",
        challenges: [
          {
            type: "choice",
            instruction: "Which toy rolls?",
            options: [
              { text: "Ball", emoji: "⚽" },
              { text: "Doll", emoji: "🪆" },
              { text: "Blocks", emoji: "🧱" }
            ],
            answer: "Ball"
          },
          {
            type: "yes-no",
            instruction: "Can we play together?",
            emoji: "🤗",
            audioText: "play together",
            answer: "yes"
          }
        ]
      }
    ]
  },
  {
    id: 13,
    title: "Level 13: Nature Walk",
    icon: "🌿",
    lessons: [
      {
        id: "l13_1",
        title: "Plants & Flowers",
        challenges: [
          {
            type: "matching",
            instruction: "Match nature elements!",
            pairs: {
              "Tree": "🌳",
              "Flower": "🌹",
              "Leaf": "🍃",
              "Mushroom": "🍄"
            }
          },
          {
            type: "fill-blank",
            instruction: "Fill in the blank!",
            sentenceBefore: "The green",
            sentenceAfter: "falls from the tree.",
            options: ["leaf", "car", "ball"],
            answer: "leaf"
          }
        ]
      }
    ]
  },
  {
    id: 14,
    title: "Level 14: At School",
    icon: "🎒",
    lessons: [
      {
        id: "l14_1",
        title: "My Classroom",
        challenges: [
          {
            type: "choice",
            instruction: "What do you carry on your back?",
            options: [
              { text: "Backpack", emoji: "🎒" },
              { text: "Chair", emoji: "🪑" },
              { text: "Apple", emoji: "🍎" }
            ],
            answer: "Backpack"
          },
          {
            type: "yes-no",
            instruction: "Do we draw with a crayon?",
            emoji: "🖍️",
            audioText: "draw with a crayon",
            answer: "yes"
          }
        ]
      }
    ]
  },
  {
    id: 15,
    title: "Level 15: Shapes",
    icon: "⬛",
    lessons: [
      {
        id: "l15_1",
        title: "Circles & Squares",
        challenges: [
          {
            type: "matching",
            instruction: "Match shapes!",
            pairs: {
              "Circle": "⭕",
              "Square": "⬜",
              "Star": "⭐",
              "Heart": "❤️"
            }
          },
          {
            type: "yes-no",
            instruction: "Is a ball a circle shape?",
            emoji: "⭕",
            audioText: "ball is a circle",
            answer: "yes"
          }
        ]
      }
    ]
  },
  {
    id: 16,
    title: "Level 16: What Time Is It?",
    icon: "🕐",
    lessons: [
      {
        id: "l16_1",
        title: "Daytime",
        challenges: [
          {
            type: "choice",
            instruction: "When does the sun shine?",
            options: [
              { text: "Daytime", emoji: "☀️" },
              { text: "Nighttime", emoji: "🌙" },
              { text: "Schooltime", emoji: "🎒" }
            ],
            answer: "Daytime"
          },
          {
            type: "yes-no",
            instruction: "Do we sleep during daytime?",
            emoji: "☀️",
            audioText: "sleep in daytime",
            answer: "no"
          }
        ]
      }
    ]
  },
  {
    id: 17,
    title: "Level 17: My Body",
    icon: "💪",
    lessons: [
      {
        id: "l17_1",
        title: "Hands & Feet",
        challenges: [
          {
            type: "matching",
            instruction: "Match body parts!",
            pairs: {
              "Eye": "👁️",
              "Ear": "👂",
              "Nose": "👃",
              "Hand": "🖐️"
            }
          },
          {
            type: "yes-no",
            instruction: "Do we smell with our nose?",
            emoji: "👃",
            audioText: "smell with nose",
            answer: "yes"
          }
        ]
      }
    ]
  },
  {
    id: 18,
    title: "Level 18: Seasons & Tết",
    icon: "🌸",
    lessons: [
      {
        id: "l18_1",
        title: "Tết Holiday",
        challenges: [
          {
            type: "choice",
            instruction: "What cake do we eat during Tết?",
            options: [
              { text: "Chưng Cake", emoji: "🫔" },
              { text: "Apple Pie", emoji: "🥧" },
              { text: "Bread", emoji: "🍞" }
            ],
            answer: "Chưng Cake"
          },
          {
            type: "yes-no",
            instruction: "Do children get lucky money during Tết?",
            emoji: "🧧",
            audioText: "lucky money",
            answer: "yes"
          }
        ]
      }
    ]
  },
  {
    id: 19,
    title: "Level 19: Numbers 10–20",
    icon: "🔢",
    lessons: [
      {
        id: "l19_1",
        title: "Count to Fifteen",
        challenges: [
          {
            type: "choice",
            instruction: "Which number comes after 10?",
            options: [
              { text: "Eleven", emoji: "1️⃣" },
              { text: "Nine", emoji: "9️⃣" },
              { text: "Five", emoji: "5️⃣" }
            ],
            answer: "Eleven"
          },
          {
            type: "yes-no",
            instruction: "Is 20 larger than 10?",
            emoji: "📈",
            audioText: "twenty larger than ten",
            answer: "yes"
          }
        ]
      }
    ]
  },
  {
    id: 20,
    title: "Level 20: My World",
    icon: "🌍",
    lessons: [
      {
        id: "l20_1",
        title: "Beautiful Earth",
        challenges: [
          {
            type: "choice",
            instruction: "What color is our planet Earth from space?",
            options: [
              { text: "Blue & Green", emoji: "🌍" },
              { text: "Red & Yellow", emoji: "🪐" },
              { text: "White & Black", emoji: "🌑" }
            ],
            answer: "Blue & Green"
          },
          {
            type: "yes-no",
            instruction: "Is the earth shape a square?",
            emoji: "🌍",
            audioText: "earth shape a square",
            answer: "no"
          }
        ]
      }
    ]
  }
];
