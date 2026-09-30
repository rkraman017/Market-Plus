import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


# =====================================================
# PATHS
# =====================================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
FRONTEND_DIR = PROJECT_DIR / "frontend"


# =====================================================
# ENVIRONMENT
# =====================================================

load_dotenv(BASE_DIR / ".env")

TWELVE_DATA_API_KEY = os.getenv(
    "TWELVE_DATA_API_KEY",
    ""
).strip()

TWELVE_DATA_URL = "https://api.twelvedata.com"


# =====================================================
# FASTAPI APP
# =====================================================

app = FastAPI(
    title="MarketPulse",
    version="1.0.0"
)


# =====================================================
# FRONTEND
# =====================================================

app.mount(
    "/static",
    StaticFiles(
        directory=str(FRONTEND_DIR)
    ),
    name="static"
)


@app.get("/")
async def home():

    return FileResponse(
        FRONTEND_DIR / "index.html"
    )


# =====================================================
# TWELVE DATA REQUEST
# =====================================================

async def twelve_data_request(
    endpoint: str,
    params: dict
):

    if not TWELVE_DATA_API_KEY:

        raise HTTPException(
            status_code=500,
            detail=(
                "Twelve Data API key is missing "
                "in backend/.env"
            )
        )


    params["apikey"] = TWELVE_DATA_API_KEY


    url = (
        f"{TWELVE_DATA_URL}"
        f"{endpoint}"
    )


    try:

        async with httpx.AsyncClient(
            timeout=20
        ) as client:

            response = await client.get(
                url,
                params=params
            )

            response.raise_for_status()

            data = response.json()


    except httpx.HTTPError as error:

        raise HTTPException(
            status_code=502,
            detail=(
                "Twelve Data connection failed: "
                f"{error}"
            )
        )


    # Twelve Data error response

    if data.get("status") == "error":

        raise HTTPException(
            status_code=400,
            detail=data.get(
                "message",
                "Twelve Data API error."
            )
        )


    if "code" in data and (
        data.get("status") == "error"
    ):

        raise HTTPException(
            status_code=400,
            detail=data.get(
                "message",
                "Twelve Data API error."
            )
        )


    return data


# =====================================================
# STOCK QUOTE
# =====================================================

@app.get("/api/quote/{symbol}")
async def get_quote(symbol: str):

    symbol = symbol.strip().upper()


    if not symbol:

        raise HTTPException(
            status_code=400,
            detail="Stock symbol is required."
        )


    data = await twelve_data_request(
        "/quote",
        {
            "symbol": symbol
        }
    )


    if not data:

        raise HTTPException(
            status_code=404,
            detail=(
                f"No stock data found "
                f"for {symbol}."
            )
        )


    return {

        "symbol":
            data.get(
                "symbol",
                symbol
            ),

        "open":
            data.get(
                "open",
                ""
            ),

        "high":
            data.get(
                "high",
                ""
            ),

        "low":
            data.get(
                "low",
                ""
            ),

        "price":
            data.get(
                "close",
                data.get(
                    "price",
                    ""
                )
            ),

        "volume":
            data.get(
                "volume",
                ""
            ),

        "latest_trading_day":
            data.get(
                "datetime",
                ""
            ),

        "previous_close":
            data.get(
                "previous_close",
                ""
            ),

        "change":
            data.get(
                "change",
                ""
            ),

        "change_percent":
            data.get(
                "percent_change",
                ""
            )
    }


# =====================================================
# HISTORICAL DATA
# =====================================================

@app.get("/api/history/{symbol}")
async def get_history(symbol: str):

    symbol = symbol.strip().upper()


    if not symbol:

        raise HTTPException(
            status_code=400,
            detail="Stock symbol is required."
        )


    data = await twelve_data_request(
        "/time_series",
        {
            "symbol": symbol,

            "interval": "1day",

            "outputsize": 250,

            "order": "ASC"
        }
    )


    values = data.get(
        "values",
        []
    )


    if not values:

        raise HTTPException(
            status_code=404,
            detail=(
                f"No historical data "
                f"found for {symbol}."
            )
        )


    result = []


    for item in values:

        try:

            result.append(

                {
                    "date":
                        item.get(
                            "datetime"
                        ),

                    "open":
                        float(
                            item["open"]
                        ),

                    "high":
                        float(
                            item["high"]
                        ),

                    "low":
                        float(
                            item["low"]
                        ),

                    "close":
                        float(
                            item["close"]
                        ),

                    "volume":
                        int(
                            float(
                                item.get(
                                    "volume",
                                    0
                                )
                            )
                        )
                }

            )

        except (
            KeyError,
            ValueError,
            TypeError
        ):

            continue


    return result


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/api/health")
async def health():

    return {

        "status":
            "ok",

        "application":
            "MarketPulse",

        "provider":
            "Twelve Data",

        "api_key_configured":
            bool(
                TWELVE_DATA_API_KEY
            )
    }