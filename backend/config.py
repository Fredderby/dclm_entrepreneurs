import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_ID = os.getenv("PROJECT_ID")
    PRIVATE_KEY_ID = os.getenv("PRIVATE_KEY_ID")
    
    # ✅ STRONG CLEANING — fixes all formatting issues
    PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")
    PRIVATE_KEY = PRIVATE_KEY.replace("'", "").replace('"', '').replace("\\ ", " ")
    PRIVATE_KEY = PRIVATE_KEY.replace("\\n", "\n").replace("\\\\n", "\n").strip()
    
    CLIENT_EMAIL = os.getenv("CLIENT_EMAIL")
    CLIENT_ID = os.getenv("CLIENT_ID")
    CLIENT_X509_CERT_URL = os.getenv("CLIENT_X509_CERT_URL")
    SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
    SUBMISSIONS_SHEET = "Submissions"

    @property
    def google_credentials(self):
        return {
            "type": "service_account",
            "project_id": self.PROJECT_ID,
            "private_key_id": self.PRIVATE_KEY_ID,
            "private_key": self.PRIVATE_KEY,
            "client_email": self.CLIENT_EMAIL,
            "client_id": self.CLIENT_ID,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": self.CLIENT_X509_CERT_URL
        }

settings = Settings()