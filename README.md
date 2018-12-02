# apiary-bot

## Setup

Clone this repository via Git:

```
git clone https://github.com/Arthelon/robojackets-apiary-slack-bot
```

and install the project dependencies using npm:

```
cd robojackets-apiar-slack-bot/
npm install
```

Afterwards, create a `.env` file and populate it with environment variables:

```
cp .env.default .env
```

This project is built on the `howdyai/botkit-starter-slack` project. For more setup information you can refer to their project [README](https://github.com/howdyai/botkit-starter-slack).

## Queries

Here are the list of queries you can perform by DMing or mentioning the bot in a channel:

-   did _*USER*_ pay dues this semester
-   what shirt size is _*USER*_
-   help (Displays a help message)
