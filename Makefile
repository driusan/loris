all:
	composer install --no-dev
	npm run compile
	git describe --tags --always > VERSION
