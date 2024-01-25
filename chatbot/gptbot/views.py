from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.shortcuts import render, redirect
from django.http import JsonResponse
import os
import time
import openai
import google.generativeai as palm
from dotenv import load_dotenv
from .models import Chat

load_dotenv()

openai_api_key = os.getenv("OPEN_AI_API_KEY")
openai.api_key = openai_api_key
palm.configure(api_key=os.getenv("GOOGLE_PALM_API_KEY"))


def generate_openai_response(user_prompt):
    try:
        response = openai.Completion.create(
            model="gpt-3.5-turbo-instruct",
            prompt=user_prompt
        )

        generated_text = response.choices[0].text
        return generated_text
    except openai.error.OpenAIError as e:
        # Handle errors from OpenAI by using Google's PaLM as a fallback
        try:
            generated_text = generate_google_PaLM_response(user_prompt)
            return generated_text
        except Exception as palm_error:
            generated_text = f"An error occurred: {str(palm_error)}"
            return generated_text
    except Exception as e:
        return f"An error occurred: {str(e)}"


def generate_google_PaLM_response(user_prompt):
    try:
        response = palm.chat(context="Speak like Shakespeare", messages=user_prompt)
        generated_text = response.last
        return generated_text
    except Exception as e:
        return f"An error occurred with Google's PaLM: {str(e)}"


@login_required
def chatbot(request):
    if request.method == "POST":
        user_prompt = request.POST.get('message')
        user = request.user

        chat_message = Chat(sender=user, message=user_prompt)
        chat_message.save()

        assistant_reply = generate_openai_response(user_prompt)
        # assistant_reply = "This is some API response!"
        time.sleep(4)
        return JsonResponse({
            "message": user_prompt,
            "response": assistant_reply
        })
    return render(request, "bot.html")


def user_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('chatbot')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})


def user_register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('chatbot')
    else:
        form = UserCreationForm()
    return render(request, 'register.html', {'form': form})


def user_logout(request):
    logout(request)
    return redirect('login')
