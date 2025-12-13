# DiskiChat API

Backend API for DiskiChat, a football application covering South African and African live matches, teams, and competitions.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: Azure MySQL (via `mysql2` driver)
-   **External API**: API-Football (v3.football.api-sports.io)
-   **Scheduler**: database-cron

## Prerequisites

-   Node.js (v18 or higher)
-   MySQL Database (Azure Database for MySQL recommended)

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
API_FOOTBALL_KEY=your_api_football_key
API_FOOTBALL_HOST=https://v3.football.api-sports.io
COUNTRY='South Africa'
AFRICA_COUNTRIES='South Africa,Nigeria,Kenya,Egypt,Morocco,Ghana,Senegal,Algeria,Cameroon'

# Database Configuration
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD="your_db_password"
DB_NAME=your_db_name
DB_PORT=3306
DB_SSL=true
```

## Setup & Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/sibusisondlovu/diskichat_app_api.git
    cd diskichat_app_api
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure your environment variables in `.env` (see above).

## Running the Application

To start the server and verify the database connection:

```bash
npm start
```

The server will start on the specified port (default 5000) and log:
> ✅ Database connected successfully
> DiskiChat API running on port 5000

## Architecture

-   `src/server.js`: Application entry point.
-   `src/app.js`: Express app configuration and middleware.
-   `src/config/`: Configuration files (Database, Env).
-   `src/routes/`: API route definitions.
-   `src/controllers/`: Request handling logic.
-   `src/services/`: Business logic and external API interactions.
-   `src/cron/`: Scheduled tasks for fetching football data.
