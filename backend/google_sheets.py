import os
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
import gspread
import google.auth.transport.requests
import time

load_dotenv()

# Required Google API scopes
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"
]

def save_to_google_sheet(data_dict: dict):
    """Save a single row of data to Google Sheet — with full error handling."""
    SERVICE_ACCOUNT_EMAIL = os.getenv("CLIENT_EMAIL", "").strip()
    PRIVATE_KEY = os.getenv("PRIVATE_KEY", "").strip()
    SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "1fzbttlAvu0aMAHDpx3XyZ9VMy4VrV1rS-gxBx5C814A").strip()

    # ✅ Validate credentials exist
    if not SERVICE_ACCOUNT_EMAIL:
        raise ValueError("❌ Missing CLIENT_EMAIL in .env file")
    if not PRIVATE_KEY:
        raise ValueError("❌ Missing PRIVATE_KEY in .env file")
    if not SHEET_ID or len(SHEET_ID) < 40:
        raise ValueError("❌ Invalid or missing GOOGLE_SHEET_ID")

    # ✅ Clean private key perfectly — fixes formatting issues
    private_key = (
        PRIVATE_KEY
        .replace('"', '')
        .replace("'", "")
        .replace("\\n", "\n")
        .replace("\\\\n", "\n")
        .replace("\\ ", " ")
        .strip()
    )

    try:
        # ✅ Create credentials
        creds = Credentials.from_service_account_info(
            {
                "type": "service_account",
                "client_email": SERVICE_ACCOUNT_EMAIL,
                "private_key": private_key,
                "token_uri": "https://oauth2.googleapis.com/token",
            },
            scopes=SCOPES,
        )

        # ✅ Refresh token with timeout & retry
        request = google.auth.transport.requests.Request()
        for attempt in range(3):  # Retry up to 3 times
            try:
                creds.refresh(request)
                break
            except Exception as e:
                if attempt == 2:
                    raise Exception(f"❌ Failed to get Google token after 3 tries: {str(e)}")
                time.sleep(1)  # Wait before retry

        # ✅ Authorize and open sheet
        gc = gspread.authorize(creds)
        sheet = gc.open_by_key(SHEET_ID).sheet1

        # ✅ Exact column order — matches your database
        row = [
            data_dict.get("row_id", ""),
            data_dict.get("synced_at", ""),
            data_dict.get("region_division_group_name", ""),
            data_dict.get("enterprise_coordinator_name", ""),
            data_dict.get("enterprise_coordinator_contact", ""),
            data_dict.get("entrepreneur_full_name", ""),
            data_dict.get("entrepreneur_phone_whatsapp", ""),
            data_dict.get("entrepreneur_business_name_type", ""),
            data_dict.get("entrepreneur_sector", ""),
            data_dict.get("entrepreneur_years_in_business", ""),
            data_dict.get("entrepreneur_can_mentor", "")
        ]

        # ✅ Append row
        sheet.append_row(row, value_input_option="RAW")
        print("✅ Data saved to Google Sheet successfully")
        return True

    except gspread.exceptions.APIError as e:
        if "PERMISSION_DENIED" in str(e) or "insufficient permissions" in str(e):
            raise Exception("❌ Permission denied: Share your Google Sheet with " + SERVICE_ACCOUNT_EMAIL)
        elif "not found" in str(e) or "404" in str(e):
            raise Exception("❌ Sheet not found: Check GOOGLE_SHEET_ID is correct")
        else:
            raise Exception(f"❌ Google API Error: {str(e)}")

    except Exception as e:
        raise Exception(f"❌ Google Sheets save failed: {str(e)}")