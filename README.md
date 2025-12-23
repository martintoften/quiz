# Christmas Quiz

A retro-styled quiz game built with React, TypeScript, and Supabase.

## Scripts

### Create Quiz from JSON

A Kotlin script to create quizzes from JSON files and push them to Supabase.

#### Prerequisites

- Kotlin installed (`brew install kotlin` on macOS)
- `.env` file with Supabase credentials in project root

#### Usage

```bash
# From a JSON file
kotlin scripts/create-quiz.main.kts scripts/rebus-quiz.json

# From stdin
cat quiz.json | kotlin scripts/create-quiz.main.kts
```

#### JSON Format

```json
{
  "title": "My Quiz",
  "questions": [
    {
      "questionText": "What is 2+2?",
      "questionType": "multiple_choice",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": "4",
      "category": "Math"
    },
    {
      "questionText": "Capital of Norway?",
      "questionType": "text",
      "correctAnswer": "Oslo",
      "category": "Geography"
    }
  ]
}
```

#### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `questionText` | Yes | The question text |
| `questionType` | No | `multiple_choice` (default) or `text` |
| `options` | For MC | Array of options for multiple choice |
| `correctAnswer` | Yes | The correct answer |
| `category` | No | Category displayed above the question |
| `imageUrl` | No | URL to an image for the question |

#### Output

The script outputs the created quiz ID and game code:

```
Creating quiz: My Quiz
Questions: 2

Creating quiz in Supabase...
Quiz created with ID: abc123

Creating 2 questions...

Quiz created successfully!
Title:     My Quiz
Game Code: XYZ789
Quiz ID:   abc123
Questions: 2
```
