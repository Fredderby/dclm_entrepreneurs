import os
import sys
from dotenv import load_dotenv

from google.oauth2.service_account import Credentials
import gspread
import google.auth.transport.requests
import requests

load_dotenv()

# Required Google API scopes
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"  # More secure than full drive access
]


def get_sheet_data():
    """Fetch all records from the Google Sheet and return (data, headers)."""
    SERVICE_ACCOUNT_EMAIL = os.getenv("CLIENT_EMAIL")
    PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")
    SHEET_ID = os.getenv("GOOGLE_SHEET_ID") or "1fzbttlAvu0aMAHDpx3XyZ9VMy4VrV1rS-gxBx5C814A"

    if not SERVICE_ACCOUNT_EMAIL or not PRIVATE_KEY:
        raise ValueError("Missing CLIENT_EMAIL or PRIVATE_KEY in environment variables")

    # ✅ Clean private key properly — critical fix
    private_key = (
        PRIVATE_KEY
        .replace('"', '')
        .replace("'", "")
        .replace("\\n", "\n")
        .replace("\\\\n", "\n")  # Handle double-escaped newlines
        .strip()
    )

    try:
        creds = Credentials.from_service_account_info(
            {
                "type": "service_account",
                "client_email": SERVICE_ACCOUNT_EMAIL,
                "private_key": private_key,
                "token_uri": "https://oauth2.googleapis.com/token",
            },
            scopes=SCOPES,
        )

        # ✅ Force refresh token explicitly
        request = google.auth.transport.requests.Request()
        creds.refresh(request)

        # Authorize gspread
        gc = gspread.authorize(creds)
        
        # Open sheet — use open_by_key which is more reliable
        sheet = gc.open_by_key(SHEET_ID).sheet1
        data = sheet.get_all_records()
        headers = sheet.row_values(1)
        return data, headers

    except Exception as e:
        print(f"❌ Error accessing sheet: {str(e)}")
        raise


# ---------------------------------------------------------------------------
# Debug / diagnostics - improved
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    SERVICE_ACCOUNT_EMAIL = os.getenv("CLIENT_EMAIL")
    PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")
    SHEET_ID = os.getenv("GOOGLE_SHEET_ID") or "1fzbttlAvu0aMAHDpx3XyZ9VMy4VrV1rS-gxBx5C814A"

    private_key = (
        PRIVATE_KEY
        .replace('"', '')
        .replace("'", "")
        .replace("\\n", "\n")
        .replace("\\\\n", "\n")
        .strip()
    )

    try:
        creds = Credentials.from_service_account_info(
            {
                "type": "service_account",
                "client_email": SERVICE_ACCOUNT_EMAIL,
                "private_key": private_key,
                "token_uri": "https://oauth2.googleapis.com/token",
            },
            scopes=SCOPES,
        )

        # Refresh token
        req = google.auth.transport.requests.Request()
        creds.refresh(req)
        print("✅ Authentication successful — token obtained")

        headers_req = {"Authorization": f"Bearer {creds.token}"}

        # Test Drive API access
        r = requests.get(
            "https://www.googleapis.com/drive/v3/files",
            headers=headers_req,
            params={"pageSize": 10, "fields": "files(id, name, mimeType)"},
            timeout=15
        )

        print(f"\nDrive API Status: {r.status_code}")
        if r.status_code == 200:
            files = r.json().get("files", [])
            print(f"✅ Accessible files ({len(files)}):")
            for f in files:
                print(f"  - {f['name']} | ID: {f['id']} | Type: {f['mimeType']}")
        else:
            print(f"❌ Drive API Error: {r.text}")

        # Test direct sheet access
        print(f"\nTesting direct sheet access: {SHEET_ID}")
        r2 = requests.get(
            f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}",
            headers=headers_req,
            params={"fields": "id, name"},
            timeout=15
        )
        print(f"Sheet API Status: {r2.status_code}")
        if r2.status_code == 200:
            print("✅ Sheet is accessible")
        else:
            print(f"❌ Sheet Error: {r2.text}")

    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        print("\n🔧 Possible fixes:")
        print("1. Check internet connection / proxy / firewall")
        print("2. Ensure Google APIs are enabled in Google Cloud Console")
        print("3. Share the Google Sheet with your service account email")
        print("4. Verify PRIVATE_KEY is correctly formatted (no extra quotes)")