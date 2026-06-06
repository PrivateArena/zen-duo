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
            type: "listening",
            instruction: "Listen and tap the matching animal!",
            audioText: "Bird",
            options: [
              { text: "Bird", emoji: "🐦" },
              { text: "Cat", emoji: "🐱" },
              { text: "Dog", emoji: "🐶" }
            ],
            answer: "Bird"
          },
          {
            type: "builder",
            instruction: "Put the words in order to make 'The cat runs'!",
            promptText: "Con mèo chạy",
            targetText: "The cat runs",
            blocks: ["cat", "The", "runs", "dog", "flies"]
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
            type: "choice",
            instruction: "Which animal swims?",
            options: [
              { text: "Bird", emoji: "🐦" },
              { text: "Fish", emoji: "🐟" },
              { text: "Dog", emoji: "🐶" }
            ],
            answer: "Fish"
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
            type: "listening",
            instruction: "Listen and click the right drink!",
            audioText: "Water",
            options: [
              { text: "Milk", emoji: "🥛" },
              { text: "Water", emoji: "💧" },
              { text: "Apple", emoji: "🍎" }
            ],
            answer: "Water"
          },
          {
            type: "builder",
            instruction: "Build the sentence!",
            promptText: "Tôi uống nước",
            targetText: "I drink water",
            blocks: ["I", "water", "drink", "eat", "apple"]
          }
        ]
      },
      {
        id: "l2_2",
        title: "Healthy Eating",
        challenges: [
          {
            type: "choice",
            instruction: "What do you do with an apple?",
            options: [
              { text: "Eat", emoji: "😋" },
              { text: "Fly", emoji: "🪶" },
              { text: "Swim", emoji: "🏊" }
            ],
            answer: "Eat"
          },
          {
            type: "builder",
            instruction: "Assemble the sentence!",
            promptText: "Ăn quả chuối",
            targetText: "Eat the banana",
            blocks: ["Eat", "the", "banana", "milk", "water"]
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
            type: "listening",
            instruction: "Listen and select the item!",
            audioText: "Book",
            options: [
              { text: "Pen", emoji: "✏️" },
              { text: "Book", emoji: "📖" },
              { text: "Chair", emoji: "🪑" }
            ],
            answer: "Book"
          },
          {
            type: "builder",
            instruction: "Create the description!",
            promptText: "Quyển sách ở trên bàn",
            targetText: "A book on the table",
            blocks: ["A", "book", "on", "the", "table", "chair", "pen"]
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
            instruction: "What color is the sky?",
            options: [
              { text: "Red", emoji: "🟥" },
              { text: "Blue", emoji: "🟦" },
              { text: "Green", emoji: "🟩" }
            ],
            answer: "Blue"
          },
          {
            type: "builder",
            instruction: "Translate this phrase!",
            promptText: "Mặt trời màu vàng",
            targetText: "The yellow sun",
            blocks: ["The", "yellow", "sun", "sky", "blue"]
          }
        ]
      }
    ]
  }
];
