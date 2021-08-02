dev-build:
	docker-compose up -d --build
dev-up:
	docker-compose up
data-build:
	docker-compose -f docker-compose-data.yml build --pull
data-pull:
	docker-compose -f docker-compose-data.yml up