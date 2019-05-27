SERVERNAME = "pierce"

start:
	pm2 start server/app.js --name="$(SERVERNAME)"

reload:
	git pull origin master --rebase
	pm2 reload $(SERVERNAME)"
