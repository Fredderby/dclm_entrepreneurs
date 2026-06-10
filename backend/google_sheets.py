import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Define scope
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

# ✅ READ FROM .env — matches exactly what we wrote
SERVICE_ACCOUNT_EMAIL = os.getenv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
PRIVATE_KEY = os.getenv("GOOGLE_PRIVATE_KEY")
SHEET_ID = os.getenv("GOOGLE_SHEET_ID")

# Create credentials
credentials = Credentials.from_service_account_info(
    {
        "type": "service_account",
        "client_email": SERVICE_ACCOUNT_EMAIL,
        "private_key": PRIVATE_KEY,
        "token_uri": "https://oauth2.googleapis.com/token"
    },
    scopes=SCOPES
)

# Authorize client
gc = gspread.authorize(credentials)

# Open sheet
sheet = gc.open_by_key(SHEET_ID)