# Django Function-Based Views (FBV) Integration Guide for QUEST

This guide explains how to connect your existing Django backend (using Function-Based Views) to this React frontend.

---

## 1. Configure React Frontend API Endpoint

In `src/api.js`, set your Django server URL:

```javascript
export const API_BASE_URL = "http://127.0.0.1:8000/api";
```

Alternatively, set an environment variable `REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api` when running React.

---

## 2. Django Setup & CORS Configuration

Install `django-cors-headers` so React can communicate with Django cross-origin:

```bash
pip install django-cors-headers djangorestframework
```

In your `settings.py`:

```python
INSTALLED_APPS = [
    ...
    'corsheaders',
    'rest_framework',
    'quiz_app', # Your app name
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Put at the top
    'django.middleware.common.CommonMiddleware',
    ...
]

# Allow React dev server
CORS_ALLOW_ALL_ORIGINS = True  # Or CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

---

## 3. Django Models (`quiz_app/models.py`)

```python
from django.db import models

class Quiz(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    difficulty = models.CharField(max_length=20, default='Medium')
    time_limit = models.IntegerField(default=15)
    created_date = models.DateField(auto_now_add=True)
    assigned = models.BooleanField(default=True)
    questions_count = models.IntegerField(default=0)
    questions_data = models.JSONField(default=list) # Stores questions array as JSON

    def __str__(self):
        return f"{self.code} - {self.title}"

class QuizAttempt(models.Model):
    attempt_id = models.CharField(max_length=100, primary_key=True)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    quiz_title = models.CharField(max_length=255)
    score = models.IntegerField()
    total = models.IntegerField()
    correct_count = models.IntegerField()
    date = models.CharField(max_length=100)
    answers_data = models.JSONField(default=dict)
    student_code = models.CharField(max_length=50)
    student_name = models.CharField(max_length=100, default='Student')

    def __str__(self):
        return f"{self.student_code} - {self.quiz_title} ({self.score}%)"
```

---

## 4. Django Function-Based Views (`quiz_app/views.py`)

Here are the complete Function-Based Views (FBV) handling all frontend requests:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Quiz, QuizAttempt

@api_view(['POST'])
def teacher_login(request):
    data = request.data
    return Response({
        "name": data.get("name", "Prof. Alex Morgan"),
        "role": "teacher",
        "code": "TCH-5510",
        "email": data.get("email", "teacher@quest.edu")
    })

@api_view(['POST'])
def student_login(request):
    data = request.data
    return Response({
        "name": data.get("name", "Jordan Lee"),
        "role": "student",
        "code": data.get("code", "STU-9482"),
        "email": "student@quest.edu"
    })

@api_view(['GET'])
def get_quizzes(request):
    quizzes = Quiz.objects.all().order_by('-created_date')
    result = []
    for q in quizzes:
        result.append({
            "id": q.id,
            "code": q.code,
            "title": q.title,
            "description": q.description,
            "difficulty": q.difficulty,
            "timeLimit": q.time_limit,
            "createdDate": str(q.created_date),
            "assigned": q.assigned,
            "questionsCount": q.questions_count,
            "questions": q.questions_data
        })
    return Response(result)

@api_view(['POST'])
def create_quiz(request):
    data = request.data
    quiz = Quiz.objects.create(
        id=data.get("id"),
        code=data.get("code"),
        title=data.get("title"),
        description=data.get("description", ""),
        difficulty=data.get("difficulty", "Medium"),
        time_limit=data.get("timeLimit", 15),
        assigned=data.get("assigned", True),
        questions_count=data.get("questionsCount", len(data.get("questions", []))),
        questions_data=data.get("questions", [])
    )
    return Response({"status": "success", "quiz_id": quiz.id}, status=status.HTTP_201_CREATED)

@api_view(['PUT', 'PATCH'])
def update_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    if "title" in data: quiz.title = data["title"]
    if "difficulty" in data: quiz.difficulty = data["difficulty"]
    if "assigned" in data: quiz.assigned = data["assigned"]
    if "questions" in data:
        quiz.questions_data = data["questions"]
        quiz.questions_count = len(data["questions"])
    quiz.save()
    return Response({"status": "updated"})

@api_view(['POST'])
def submit_attempt(request):
    data = request.data
    try:
        quiz = Quiz.objects.get(id=data.get("quizId"))
    except Quiz.DoesNotExist:
        quiz = Quiz.objects.first() # fallback

    attempt = QuizAttempt.objects.create(
        attempt_id=data.get("attemptId"),
        quiz=quiz,
        quiz_title=data.get("quizTitle"),
        score=data.get("score"),
        total=data.get("total"),
        correct_count=data.get("correctCount"),
        date=data.get("date"),
        answers_data=data.get("answers"),
        student_code=data.get("studentCode"),
        student_name=data.get("studentName", "Student")
    )
    return Response({"status": "attempt recorded", "attempt_id": attempt.attempt_id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_attempts(request):
    attempts = QuizAttempt.objects.all().order_by('-id')
    result = []
    for a in attempts:
        result.append({
            "attemptId": a.attempt_id,
            "quizId": a.quiz.id if a.quiz else "",
            "quizTitle": a.quiz_title,
            "score": a.score,
            "total": a.total,
            "correctCount": a.correct_count,
            "date": a.date,
            "answers": a.answers_data,
            "studentCode": a.student_code,
            "studentName": a.student_name
        })
    return Response(result)
```

---

## 5. Django URL Router (`quiz_app/urls.py`)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('staff/login/', views.teacher_login, name='teacher_login'),
    path('student/login/', views.student_login, name='student_login'),
    path('quizzes/', views.get_quizzes, name='get_quizzes'),
    path('quizzes/create/', views.create_quiz, name='create_quiz'),
    path('quizzes/<str:quiz_id>/update/', views.update_quiz, name='update_quiz'),
    path('attempts/', views.get_attempts, name='get_attempts'),
    path('attempts/submit/', views.submit_attempt, name='submit_attempt'),
]
```

---

## Flow Summary

1. **Teacher Action**: Teacher clicks **Generate Quiz** → Form submits to `/api/quizzes/create/` → Saved to Django DB → Frontend opens **Quiz Generated Page** (`/staff/quiz/:id/preview`).
2. **Quiz Modification**: Teacher edits questions/options → Saves → Sends `PUT /api/quizzes/<id>/update/` to Django DB.
3. **Student Attempt**: Student enters reference code → Answers questions → Submits → Posts to `/api/attempts/submit/` → Django records attempt.
4. **Real-time Teacher View**: Teacher Dashboard queries `/api/attempts/` → Live student scorecards appear instantly!
