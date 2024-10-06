from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages.ai import AIMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_openai import ChatOpenAI
from users.models import User
from conversations.models import Theme, Scenario
from users.models import LanguageLevel
from .models import Chat
from django.conf import settings
from dataclasses import dataclass
from sqlalchemy import create_engine
import uuid

@dataclass
class ChatMessage:
    """
    Stores chat objects and response from chatbot
    parameters:
        chat :users.models.Chat:
        message :str:
    """
    chat: Chat
    message: str

class ConversationBot:
    """
    Default chatbot for conversation
    """

    def __init__(self):
        """
        Defines basic parameters of the chatbot
        """
        self.model = ChatOpenAI(model="gpt-4o-mini", temperature=0.6)
        self.db_path = f'sqlite:///{settings.DATABASES['default']['NAME']}'


    def get_response(self, session_id: str, human_message: str, system_message: str = "") ->AIMessage:
        """
        Gets response from GPT based on given parameters
        """
        model = self.model
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_message),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{human_message}"),
            ]
        )
        # Create the SQLAlchemy engine 
        engine = create_engine(str(self.db_path)) 
        chain = prompt | model

        chain_with_history = RunnableWithMessageHistory(
            chain,
            lambda session_id: SQLChatMessageHistory(
                session_id=session_id, connection=engine
            ),
            input_messages_key="human_message",
            history_messages_key="history"
        )

        # Ensure session_id is a string, in case it's a UUID
        if isinstance(session_id, uuid.UUID):
            session_id = str(session_id)

        # This is where we configure the session id
        config = {"configurable": {"session_id": session_id}}

        # Invoke the chat
        try:
            response = chain_with_history.invoke({"human_message": human_message}, config=config)
            return response
        except Exception as e:
            print("Conversation bot could not get response", e)
            return None

    def start_chat(self, chat: Chat)-> ChatMessage:
        """
        Starts a conversation with the user about given theme and scenario. Takes in account User's language level. 
        Chat should use start_chat for the first message. For following messages use continue_chat method
        """

        # Introduction for the chatbot, description of the theme, scenario and roles of AI and user
        system_message = f"""You are a great {chat.language_level.language} language teacher. You will start conversation with your student with theme: {chat.theme.title} 
                            with this scenario {chat.scenario.title}, described as {chat.scenario.description}. 
                            You will be: {chat.scenario.teacher_role} and he will be {chat.scenario.student_role}. Your students language level is {chat.language_level.level}, so speak to him accordingly"""
        
        # Initial request from the user to start the conversation
        human_message = "Introduce yourself, please"
        response = self.get_response(session_id=chat.id, human_message=human_message, system_message=system_message)
        
        if response:
            return ChatMessage(chat, response.content)
        else:
            return None

    def continue_chat(self, chat: Chat, human_message: str)-> ChatMessage:
        """
        Continues a chat with user passing human reply to the chatbot
        """
        response = self.get_response(session_id=chat.id, human_message=human_message)
        
        if response:
            return ChatMessage(chat, response.content)
        else:
            return None
    
    def delete_chat(self, chat: Chat):
        """
        Deletes a chat
        """
        # TBD
        pass
