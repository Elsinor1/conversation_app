from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_openai import ChatOpenAI
from users.models import User
from conversations.models import Theme, Scenario
from .models import Chat

class ConversationBot:
    """
    Default chatbot for conversation
    """

    def start_chat(self, theme: Theme, scenario: Scenario, user:User):
        """
        Starts a chat with the user about given theme and scenario. Takes in account User's language level. 
        """

        # Creates new chat record in DB
        chat = Chat.objects.create(
            user=user,
            theme=theme,
            scenario=scenario
        )

        model = ChatOpenAI(model="gtp-3.5-turbo", temperature=0.6)
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", f"You are a great language teacher. You will start conversation with your student with theme: {theme.title} with this scenario {scenario.title}, described as {scenario.description}. You will be: {scenario.teacher_role} and he will be {scenario.student_role}. Now start chat with an introduction."),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{question}"),
            ]
        )
        chain = prompt | model


        chain_with_history = RunnableWithMessageHistory(
            chain,
            lambda session_id: SQLChatMessageHistory(
                session_id=session_id, connection_string="sqlite:///sqlite.db"
            ),
            input_messages_key="question",
            history_messages_key="history"
        )

        # This is where we configure the session id
        config = {"configurable": {"session_id": "<SQL_SESSION_ID>"}}


    def reply(self, chat_id):
        """
        Continues a chat with given user.
        """
        pass



)


# This is where we configure the session id
config = {"configurable": {"session_id": "<SQL_SESSION_ID>"}}

chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)