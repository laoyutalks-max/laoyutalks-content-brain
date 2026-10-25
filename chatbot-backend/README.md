# LAOYU AI Assistant — recording setup

The chatbot on the website answers on its own. This folder holds the
optional recorder that saves every chat, and any contact a visitor
leaves, to a Google Sheet with a live dashboard. It is free and needs
no AI key.

## One-time setup (about 5 minutes)

1. Signed in as laoyutalks@gmail.com, create a new Google Sheet named
   **LAOYU Chatbot Log**.
2. In the Sheet: **Extensions → Apps Script**. Delete what's there,
   paste in everything from `Code.gs`, and click **Save**.
3. Pick **setup** in the function dropdown and click **Run**. Google
   asks for permission the first time: choose your account →
   **Advanced → Go to project (unsafe) → Allow**. ("Unsafe" only means
   Google hasn't reviewed your own script.)
4. Click **Deploy → New deployment**, gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**

   Click **Deploy** and copy the **Web app URL** (ends in `/exec`).
5. Paste that URL into `LOG_URL` at the top of `chatbot.js`, or send it
   to Claude to do it.

## What gets recorded

| Tab | Contents |
|---|---|
| Chats | Time, session, page, language, question, matched topic, answered (TRUE/FALSE) |
| Leads | Time, name, email, message, page, language, session, status |
| Dashboard | Totals, answered rate, questions per day (with chart), top topics, languages, pages, and every unanswered question |

The chat panel tells visitors their chats are recorded. Names and
emails are only saved when a visitor chooses "Leave my contact".

## Updating the bot's answers

Answers live in `chatbot.js`: `VIDEOS` (video titles and links) and
`KB` (topics, keywords and answers in English and 中文). The
Dashboard's **Unanswered questions** list shows what visitors ask that
the bot can't answer yet — good material for new topics and videos.

If you change `Code.gs` later, use **Deploy → Manage deployments →
Edit → Version: New version** so the website URL stays the same.
