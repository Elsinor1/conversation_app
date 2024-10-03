from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages.ai import AIMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_openai import ChatOpenAI
from users.models import User
from conversations.models import Theme, Scenario
from .models import Chat
from django.conf import settings



class ConversationBot:
    """
    Default chatbot for conversation
    """

    def __init__(self):
        """
        Defines basic parameters of the chatbot
        """
        self.model = ChatOpenAI(model="gtp-3.5-turbo", temperature=0.6)
        self.db_path = settings.DATABASES['default']['NAME']


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

        chain = prompt | model
        chain_with_history = RunnableWithMessageHistory(
            chain,
            lambda session_id: SQLChatMessageHistory(
                session_id=session_id, connection_string=self.db_path
            ),
            input_messages_key="human_message",
            history_messages_key="history"
        )

        # This is where we configure the session id
        config = {"configurable": {"session_id": session_id}}

        # Invoke the chat
        try:
            response = chain_with_history.invoke({"human_message": human_message}, config=config)
            return response
        except Exception:
            return None

    def start_chat(self, theme: Theme, scenario: Scenario, user: User)-> str:
        """
        Starts a chat with the user about given theme and scenario. Takes in account User's language level. 
        """

        # Creates new chat record in DB
        chat = Chat.objects.create(
            user=user,
            theme=theme,
            scenario=scenario
        )
        # Introduction for the chatbot, description of the theme, scenario and roles of AI and user
        system_message = f"You are a great language teacher. You will start conversation with your student with theme: {theme.title} with this scenario {scenario.title}, described as {scenario.description}. You will be: {scenario.teacher_role} and he will be {scenario.student_role}."
        # Initial request from the user to start the conversation
        human_message = "Introduce yourself, please"
        response = self.get_response(session_id=chat.id, human_message=human_message, system_message=system_message)
        
        if response:
            return response.content
        else:
            return None

    def continue_chat(self, chat: Chat, human_message: str)-> str:
        """
        Continues a chat with user passgin human reply to the chatbot
        """
        response = self.get_response(session_id=chat.id, human_message=human_message)
        
        if response:
            return response.content
        else:
            return None
    
    def delete_chat(self, chat: Chat):
        """
        Deletes a chat
        """
        pass
