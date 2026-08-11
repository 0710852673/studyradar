# StudyFlow Dashboard

StudyOS - AI Powered GCE O/L & A/L Study Dashboard

Build a modern, responsive web application called StudyOS. The design should feel premium, minimal, and similar to Notion, Linear, or GitHub—not like an Excel spreadsheet.

Goal

Create a personal study management system for Sri Lankan GCE O/L and GCE A/L students.

The app should help students:

Track study hours

Monitor progress

Analyze marks

Build consistency

Stay motivated with visual analytics

Predict exam readiness

The experience should feel like a fitness tracker, but for studying.

Design Style

Dark mode by default

Modern cards

Rounded corners

Smooth animations

Clean typography

Minimal colors

Mobile-first responsive

Beautiful charts

Fast UI

Do NOT make it look like an Excel sheet.

First Time Setup

When a new user signs in, display an onboarding wizard.

Step 1

Choose Exam

GCE A/L

GCE O/L

A/L Setup

Select

Exam Year

Stream

Choose exactly 3 subjects

Daily Study Goal (hours)

Weekly Goal

Target Z-Score

Examples of subjects:

Physical Science

Combined Maths

Physics

Chemistry

ICT

Commerce

Accounting

Economics

Business Studies

ICT

Technology

etc.

Only the selected 3 subjects appear throughout the dashboard.

O/L Setup

Choose

Exam Year

Compulsory subjects

Sinhala

English

Mathematics

Science

History

Religion

Then choose 3 optional subjects.

Only these 9 subjects appear everywhere.

Dashboard

Home dashboard should include:

Top cards

Today's Study Hours

Weekly Hours

Monthly Hours

Current Study Streak

Study Score

Exam Countdown

Charts

Weekly study trend

Monthly trend

Subject comparison

Daily goal completion

Subject cards

Each subject shows

Total Hours

Weekly Hours

Average

Progress Bar

Daily Study Logging

The user should be able to log study within seconds.

Select

Subject

Duration

30 min

45 min

1 hour

2 hours

Custom

Study Type

Theory

Revision

Paper

Class

Assignment

Optional Note

Save.

No complicated forms.

Study Timer

Include a built-in timer.

Modes

Stopwatch

Pomodoro

Countdown

Allow the timer to automatically log completed study sessions.

Analytics

Show

Weekly

Monthly

Yearly

Subject-wise hours

Average hours/day

Best study day

Most studied subject

Least studied subject

Consistency percentage

Daily goal completion

Marks Tracker

Each subject should have a marks page.

Store

Exam Name

Date

Marks

Total

Percentage

Display

Average

Highest

Lowest

Improvement trend

Recent exams

Use line charts.

Revision Tracker

Each lesson can have a status.

Not Started

Learning

Revision 1

Revision 2

Mastered

Progress bars should update automatically.

Study Heatmap

Create a GitHub-style contribution heatmap showing study activity across the year.

More study = darker color.

Calendar

Monthly calendar view.

Click any date to view

Study hours

Subjects studied

Notes

Papers completed

Streak System

Track

Current streak

Longest streak

Missed days

Display motivational milestones.

Achievements

Gamification.

Examples

First 10 Hours

First 100 Hours

7 Day Streak

30 Day Streak

500 Study Hours

100 Papers Completed

Forecast

Calculate

Current average study/day

Estimated total study hours before exams

Hours remaining

Whether the student is on track

Show insights like

"At your current pace, you will complete approximately 720 study hours before your exam."

Notifications

Examples

"You haven't studied Physics in 5 days."

"You completed your daily goal."

"You are behind your weekly target."

Settings

Allow users to change

Daily Goal

Weekly Goal

Subjects

Theme

Notifications

Exam Year

Future Ready

Structure the code so AI recommendations, cloud sync, leaderboards, and study groups can be added later.

Technical Requirements

React

TypeScript

Tailwind CSS

Responsive design

Reusable components

Clean architecture

Modern dashboard layout

Beautiful charts

Smooth animations

Modular code

Prioritize an exceptional user experience over adding too many features. Every action should require as few clicks as possible, and the interface should feel polished, intuitive, and enjoyable to use.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/38913383-a830-41bd-8862-e713ef9d6ab6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
