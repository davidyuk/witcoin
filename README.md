# witcoin
## Deploying
First of all, you should install `git`, `python` (3.5 or newer), and `node.js`.
Then,
```
git clone https://github.com/davidyuk/witcoin.git
cd witcoin
pip install -r requirements.txt
```
In files
- `main\fixtures\initial.json.template`
- `witcoin\server.py.template`

replace angle brackets with current values, like `<site_domain>` &rarr;
`localhost:8000` or [`witcoin.ru`](http://witcoin.ru/),
remove `.template` from file names.
```
npm install bower -g
python manage.py bower install  # or python manage.py bower_install -- --allow-root
python manage.py makemigrations main
python manage.py migrate
python manage.py loaddata initial.json
python manage.py runserver
```
