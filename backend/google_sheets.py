from typing import Dict, Any
from google.oauth2.service_account import Credentials
import gspread
from google.auth.transport.requests import Request
from config import settings

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

HEADERS = [
    "row_id", "synced_at", "region_division_group_name",
    "enterprise_coordinator_name", "enterprise_coordinator_contact",
    "entrepreneur_full_name", "entrepreneur_phone_whatsapp",
    "entrepreneur_business_name_type", "entrepreneur_sector",
    "entrepreneur_years_in_business", "entrepreneur_can_mentor"
]

class GoogleSheetsService:
    def __init__(self):
        self.client: gspread.Client | None = None
        self.spreadsheet: gspread.Spreadsheet | None = None
        self.submissions_sheet: gspread.Worksheet | None = None
        self._initialize_client()

    def _initialize_client(self) -> None:
        try:
            # ✅ Debug print — check if key is loaded
            print("🔑 Private key starts with:", settings.PRIVATE_KEY[:50] + "...")

            creds = Credentials.from_service_account_info(
                settings.google_credentials,
                scopes=SCOPES
            )
            req = Request()
            creds.refresh(req)

            self.client = gspread.authorize(creds)
            self.spreadsheet = self.client.open_by_key(settings.SPREADSHEET_ID)
            self._init_sheet()
            print("✅ Connected to Google Sheets successfully")

        except Exception as e:
            print(f"❌ Google Sheets connection failed: {e}")
            raise

    def _init_sheet(self) -> None:
        if not self.spreadsheet:
            raise RuntimeError("Spreadsheet not connected")

        try:
            self.submissions_sheet = self.spreadsheet.worksheet(settings.SUBMISSIONS_SHEET)
        except gspread.WorksheetNotFound:
            self.submissions_sheet = self.spreadsheet.add_worksheet(
                title=settings.SUBMISSIONS_SHEET, rows=1000, cols=len(HEADERS)
            )

        if self.submissions_sheet and not self.submissions_sheet.get_all_values():
            self.submissions_sheet.append_row(HEADERS)

    def add_row(self, data: Dict[str, Any]) -> None:
        if not self.submissions_sheet:
            raise RuntimeError("Sheet not ready — cannot add row")

        row = [
            data.get("row_id", ""),
            data.get("synced_at", ""),
            data.get("region_division_group_name", ""),
            data.get("enterprise_coordinator_name", ""),
            data.get("enterprise_coordinator_contact", ""),
            data.get("entrepreneur_full_name", ""),
            data.get("entrepreneur_phone_whatsapp", ""),
            data.get("entrepreneur_business_name_type", ""),
            data.get("entrepreneur_sector", ""),
            data.get("entrepreneur_years_in_business", ""),
            data.get("entrepreneur_can_mentor", "")
        ]
        self.submissions_sheet.append_row(row, value_input_option="RAW")

sheets_service = GoogleSheetsService()