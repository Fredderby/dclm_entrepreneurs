import os
import sys
from dotenv import load_dotenv

from google.oauth2.service_account import Credentials
import gspread

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]


def get_sheet_data():
    """Fetch all records from the Google Sheet and return (data, headers)."""
    SERVICE_ACCOUNT_EMAIL = os.getenv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    PRIVATE_KEY = os.getenv("GOOGLE_PRIVATE_KEY", "")
    SHEET_ID = os.getenv("GOOGLE_SHEET_ID")

    # Clean private key
    private_key = PRIVATE_KEY.replace('"', '').replace("'", "").replace("\\n", "\n").strip()

    creds = Credentials.from_service_account_info(
        {
            "type": "service_account",
            "client_email": SERVICE_ACCOUNT_EMAIL,
            "private_key": private_key,
            "token_uri": "https://oauth2.googleapis.com/token",
        },
        scopes=SCOPES,
    )

    gc = gspread.authorize(creds)
    sheet = gc.open_by_key(SHEET_ID).sheet1
    data = sheet.get_all_records()
    headers = sheet.row_values(1)
    return data, headers


# ---------------------------------------------------------------------------
# Debug / diagnostics — only runs when this file is executed directly
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    from google.oauth2 import service_account
    import google.auth.transport.requests
    import requests

    creds = Credentials.from_service_account_info(
        {
            "type": "service_account",
            "client_email": os.getenv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
            "private_key": os.getenv("GOOGLE_PRIVATE_KEY", "").replace('"', "").replace("'", "").replace("\\n", "\n").strip(),
            "token_uri": "https://oauth2.googleapis.com/token",
        },
        scopes=SCOPES,
    )

    creds.refresh(google.auth.transport.requests.Request())

    headers_req = {"Authorization": "Bearer " + creds.token}
    r = requests.get(
        "https://www.googleapis.com/drive/v3/files",
        headers=headers_req,
        params={"pageSize": 50, "fields": "files(id, name, mimeType)"},
    )

    print("Drive API Status:", r.status_code)
    if r.status_code == 200:
        files = r.json().get("files", [])
        print("Accessible files (" + str(len(files)) + "):")
        for f in files:
            print("  - name:", f["name"], "| id:", f["id"], "| type:", f["mimeType"])
    else:
        print("Error:", r.text)

    print()
    file_id = "1fzbttlAvu0aMAHDpx3XyZ9VMy4VrV1rS-gxBx5C814A"
    r2 = requests.get(
        "https://www.googleapis.com/drive/v3/files/" + file_id,
        headers=headers_req,
        params={"fields": "id, name, mimeType"},
    )
    print("Direct file access (" + file_id + "):")
    print("Status:", r2.status_code)
    if r2.status_code == 200:
        data = r2.json()
        print("  name:", data.get("name"), "| type:", data.get("mimeType"))
    else:
        print("Error:", r2.text)
