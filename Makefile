fe-setup:
	docker-compose build --no-cache
fe-dev:
	docker-compose up
fe-prod:
	docker-compose -f docker-compose-frontend-prod.yml up
data-setup:
	docker-compose -f docker-compose-data.yml build --pull
data-pull:
	docker-compose -f docker-compose-data.yml up
data-prep:
	docker-compose -f docker-compose-data-prep.yml up