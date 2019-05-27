SERVERNAME = "pierce"

start:
	pm2 start src/server/index.js --name="$(SERVERNAME)"

reload:
	git pull --rebase origin master
	pm2 reload $(SERVERNAME)"
