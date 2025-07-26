# 🧠 Learning Design Reference – MVP Scope

This document outlines the **learning modalities** and **content structuring techniques** intentionally supported in the **initial MVP version** of the AI Copilot for Instructors platform. The aim is to ensure that even the base content generation supports a wide range of learners with minimal complexity.

---

## ✅ Modalities & Structuring Techniques Supported (MVP)

### 🟥 1. Primary Learning Modalities

| Modality | Support Approach |
|----------|------------------|
| **Visual Learners** | Use of diagrams, charts, concept maps, and flow visuals |
| **Reading/Writing Learners** | Dense text explanations, structured headings, bullets, glossaries, summaries |

> **🎯 80/20 Rule**: Prioritize Visual and Reading/Writing formats as they cover the majority of learners with minimal overhead.

---

### 🟥 2. Content Structuring Techniques

| Technique | Description |
|----------|-------------|
| **Macro → Micro** | Start each lesson with an overview → break down into detailed subtopics |
| **Application-Based Intros** | Begin with a real-world scenario, project context, or use case |
| **Interactive Quizzes** | Short exercises or reflection points inserted after each micro-section |
| **Concept Maps** | Optional auto-generated or templated visual maps of lesson structure and key ideas |

---

        ## 🔧 MVP Implementation Examples

        Below are **basic implementation patterns** that the generation engine or lesson formatter should support by default:

        ---

                    ### 🧩 Macro → Micro Example

                    ```text
                    **Module Overview**: Retrieval-Augmented Generation (RAG)

                    This module introduces RAG, its core components, and real-world applications.

                    **Lesson 1.1: What is RAG?**
                    - Definition and origin
                    - Key components: Retriever + Generator
                    - High-level flow diagram

                    **Lesson 1.2: Why RAG?**
                    - Motivation
                    - Applications in AI chatbots
                    - Comparison with vanilla prompting


                    APPLICATION BASED INTROS
                    Imagine you're building an internal chatbot that needs access to your company's document archive. You don’t want to train a new model every time the data changes. RAG lets you "fetch before you generate", combining retrieval with generation on-the-fly.


                    VISUAL FORMAT SUPPORT(Concept Map Stub)
                    graph TD
                        A[RAG System] --> B[Retriever]
                        B --> C[Index/Vector DB]
                        A --> D[Generator]
                        D --> E[LLM API]


                    READING/WRITING STRUCTURE EXAMPLE
                    **Key Terms:**
                    - RAG = Retrieval-Augmented Generation
                    - Retriever = Component that fetches relevant chunks
                    - Generator = LLM that processes inputs + context

                    **TL;DR Summary:**
                    RAG helps inject knowledge into LLMs by retrieving relevant documents before generating answers.


                    CHECKPOINT QUIZ (Embedded)
                    **Quiz – Lesson 1.1**

                    Q: What are the two main components of a RAG system?

                    A. Generator and Optimizer  
                    B. Retriever and Generator  
                    C. Context and Memory  
                    D. Index and Decoder  
