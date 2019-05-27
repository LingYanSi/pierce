SERVERNAME = "pierce"

start:
	pm2 start server/app.js --name="$(SERVERNAME)"

reload:
	git pull --rebase origin master
	pm2 reload $(SERVERNAME)"
