# witcoin
## Deploying
```
git clone https://github.com/DenisDavidyuk/witcoin.git
cd witcoin
pip install -r requirements.txt
```
In files
- `main\fixtures\initial.json.template`
- `witcoin\server.py.template`

replace angle brackets with current values, like `<site_domain>` &rarr;
`localhost:8000` or [`witcoin.pythonanywhere.com`](http://witcoin.pythonanywhere.com/),
remove `.template` from file names.
```
python manage.py makemigrations main
python manage.py migrate
python manage.py loaddata initial.json
python manage.py runserver
```
