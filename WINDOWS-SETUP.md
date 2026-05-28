# Running CEMS on Windows (the easy way)

You do **not** need to install anything beforehand — no Node, no coding tools, nothing.
The script installs everything for you.

## Steps

1. **Download the project** from GitHub:
   - Open the repository page in your browser.
   - Click the green **`< > Code`** button → **Download ZIP**.
   - Find the downloaded ZIP (usually in your **Downloads** folder), right-click it → **Extract All…** → **Extract**.

2. **Open the extracted folder.** Inside it you'll see folders named `server` and `client`, and a file called **`START.bat`**.

3. **Double-click `START.bat`.**
   - If Windows shows a blue "Windows protected your PC" box, click **More info** → **Run anyway**. (This happens because the file is new, not because it's unsafe.)

4. **Wait.** The first run takes 3–10 minutes — it downloads Node.js and all the project's parts. You'll see progress messages. Two new black windows will open (the backend and the frontend) — **leave them open**.

5. Your web browser will open automatically at **http://localhost:5173** with the app running.

## Logging in (demo accounts)

| Email | Password | Role |
|---|---|---|
| `student@glauniversity.in` | `password123` | Student |
| `organizer@glauniversity.in` | `password123` | Organizer |
| `admin@glauniversity.in` | `password123` | Admin |
| `kashish@glauniversity.in` | `password123` | Student |

## To stop the app

Close the **two black server windows** that opened. That's it.

## To start it again later

Just double-click **`START.bat`** again. The second time is much faster because everything is already downloaded.

## If something goes wrong

- **"Run anyway" didn't appear / nothing happens:** right-click `START.bat` → **Run as administrator**.
- **An error message in red:** take a screenshot of the window and send it for help.
- **Browser didn't open:** wait a few seconds, then type `http://localhost:5173` into your browser yourself.
- **Internet required:** the first run must be online (it downloads Node.js and connects to the database).
