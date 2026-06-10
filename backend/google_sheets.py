import os
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly"
]

SHEET_ID = "1fzbttlAvu0aMAHDpx3XyZ9VMy4VrV1rS-gxBx5C814A"

def get_sheet_data():
    raw_key = os.getenv("PRIVATE_KEY", "")
    private_key = raw_key.replace('"', '').replace("'", "").strip()

    credentials_info = {
        "type": "service_account",
        "project_id": os.getenv("PROJECT_ID", ""),
        "private_key_id": os.getenv("PRIVATE_KEY_ID", ""),
        "private_key": private_key,
        "client_email": os.getenv("CLIENT_EMAIL", ""),
        "client_id": os.getenv("CLIENT_ID", ""),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv("CLIENT_X509_CERT_URL", "")
    }

    creds = Credentials.from_service_account_info(credentials_info, scopes=SCOPES)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SHEET_ID).sheet1
    data = sheet.get_all_records()
    headers = sheet.row_values(1)
    return data, headers