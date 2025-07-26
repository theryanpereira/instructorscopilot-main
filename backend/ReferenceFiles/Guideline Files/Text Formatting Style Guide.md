# 🧭 Web Platform UI Style Guide

This document outlines the approved conventions for text formatting in the platform’s user interface. It helps maintain consistency across all buttons, labels, tooltips, inputs, and section headers.

Use this as a reference when:
- Writing or editing UI copy
- Refactoring code using Cursor or similar tools
- Reviewing PRs that touch frontend components

---

## 🧱 Summary of Style Rules

| UI Element         | Recommended Case | Notes                                      |
|--------------------|------------------|--------------------------------------------|
| Section headers     | Title Case        | Used in panels, pages, card titles         |
| Field labels        | Sentence case     | Used beside form inputs or dropdowns       |
| Tooltips/help text  | Sentence case     | Friendly, short, and instructive           |
| Placeholder text    | Hint style        | Lowercase, hint-like, no punctuation       |
| Buttons             | Title Case        | Use title case for all interactive buttons |

---

## 📌 Section Headers (Title Case)

Use for headings like panels, modals, and major screen titles.

Examples:
- Course Settings  
- Content Personalization  
- Assessment Configuration  
- Content Freshness Scanner

---

## 🧾 Field Labels (Sentence case)

Use for static text next to input fields and options.

Examples:
- Topic for course content  
- Difficulty level  
- Number of modules  
- Include concept maps  
- Student group identifier

---

## 💬 Tooltips / Help Text (Sentence case)

Helpful text shown as hover hints or supporting descriptions.

Examples:
- Select the topic you want to generate a course on.  
- Choose how complex the content should be.  
- Used to tailor exercises and analogies.  
- Only visible to instructors.  
- Refresh to apply updated content.

---

## 🖋 Placeholder Text (Hint style)

Used inside input fields before the user types anything. Lowercase, short hints. Avoid full sentences or title case.

Examples:
- enter topic name...  
- select difficulty level  
- type keywords to filter...  
- upload a student csv  
- e.g. “LangChain”, “GenAI in healthcare”

---

## 🔘 Buttons (Title Case)

Use for actions like submissions, generation, saving, etc.

Examples:
- Generate Course  
- Save Settings  
- Submit for Review  
- Update Freshness  
- Add Student Profiles  
- View Concept Map

---

## 🧠 Additional Guidelines

- Be consistent throughout each screen.
- Do not mix title case and sentence case within the same UI block.
- Use sentence case for all tooltips unless referencing a named feature.
- Avoid ALL CAPS unless used for tags like “BETA” or “NEW”.

---

_Last updated: July 2025_
