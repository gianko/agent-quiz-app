# Project

The AI Development Quiz App is an educational product designed to help users test and reinforce their understanding of AI software development concepts such as agent design, prompt engineering, and workflow automation. The goal is to build a small but realistic quiz platform that feels like a complete product — something that could be extended, improved, or scaled in future iterations.

## Quiz Platform

- Help users learn and test their knowledge of AI software development concepts
- Provide a smooth and engaging quiz-taking experience
- Record user progress and results over time
- Support easy expansion with new quizzes or question sets
- Demonstrate best practices in product structure, persistence, and user flow

## User Flow

1.  User arrives at quiz selection
2.  User selects a quiz category
3.  Quiz begins with first question
4.  User selects an answer
5.  System shows correct/incorrect with explanation
6.  User proceeds to next question
7.  After final question, results are displayed
8.  User can review answers or retake quiz

## Core Features

### Home & Navigation

- A clear landing page explaining what the app is and what users can do
- A list of available quiz categories (e.g., Agent Fundamentals, Prompt Engineering, Model Selection)
- Option to select and start a quiz immediately
- Simple navigation allowing users to move between home, quiz, and results views

### Quiz Experience

- Each quiz consists of multiple questions (at least 5)
- Questions are multiple choice, with one correct answer
- After answering, users immediately see whether they were correct and can read an explanation
- A progress indicator (e.g., "Question 3 of 10") keeps the user oriented
- A "Retake Quiz" button allows users to start over

### Scoring & Results

- Display total correct answers and percentage score upon quiz completion
- Show performance feedback (e.g., "Excellent," "Keep practicing," "Needs review")
- Store past scores and attempt history
- Allow users to review previous quizzes and answers

### Persistence & Data

- Quiz content and user progress are stored in a database
- Quizzes can be easily updated or expanded without code changes
- User scores and attempt history persist across sessions

### User Engagement

- Optional username or profile creation to track results
- Simple dashboard to show progress over time and quizzes completed
- Motivational messages or visual feedback after each quiz

### Content Expansion

- Ability to add new quiz categories and questions without major refactors
- Placeholder for future "Create Your Own Quiz" functionality

### Optional / Stretch Features

- Leaderboard showcasing top performers
- Daily or weekly challenge quiz
- Randomized question order for replayability
- A "Learn Mode" where users see explanations before answering

### Backend

- Mock API
- Can be a simple object like `const questions = [];`

## Technical Requirements

- Mock API
- Frontend component(s) for quiz interface
- State management for quiz progress and scoring
- Form validation and user feedback
- Basic styling (can use any CSS framework or plain CSS)
- Error handling for edge cases

> [!NOTE]
> You can access the quiz data template in the following [JSON](https://fsl-assessment-public-files.s3.us-east-1.amazonaws.com/agentic/quiz_app_agent_fundamentals.json)

## Example Scenario

### Sarah, a junior developer learning about AI:

1.  Sarah opens the quiz app and sees three available categories
2.  She selects "Agent Fundamentals" to test her knowledge
3.  The quiz presents Question 1 with four multiple choice options
4.  Sarah selects her answer and immediately sees she got it correct
5.  She reads the explanation to reinforce her understanding
6.  She continues through all 5 questions
7.  At the end, she scores 4/5 (80%) and sees "Good job! You're getting there!"
8.  She can review which question she missed and try the quiz again

## Acceptance Criteria

- Users can start, complete, and retake quizzes easily
- Scores and progress persist between sessions (localStorage acceptable for now)
- The app feels cohesive, intuitive, and consistent
- The structure supports expansion with new content and features
